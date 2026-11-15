import { separationDeg } from '../features/sky-viewer/lib/angles'
import { getData } from './client'
import type { CustomPreset, Manifest, PresetsFile, TargetIndex } from './types'

// Campos ya calculados en el backend: los 5 objetivos del desafío (public-data/targets) y los
// campos de demo (public-data/custom/presets.json). Se cargan una vez (índices + manifests, livianos).

export type FieldAlias = { label: string; raDeg: number; decDeg: number; display?: { ra: string; dec: string } }

export type KnownField = {
  id: string
  kind: 'target' | 'preset'
  name: string
  description?: string
  manifestPath: string // relativo a /data
  analysisPath: string // relativo a /data (puede no existir en los presets)
  manifest: Manifest
  center: { raDeg: number; decDeg: number } // centro real del campo (grid_wcs.CRVAL)
  fovArcmin: number
  /** Lo que se envía para seleccionarlo. En los presets, los parámetros exactos que aciertan la caché. */
  request: { raDeg: number; decDeg: number; fovArcmin: number }
  /** Otras coordenadas con las que se reconoce (catálogo, enunciado). */
  aliases: FieldAlias[]
}

/** Coordenadas del enunciado del desafío para WISE 0855 (posición de la época WISE, ~2010). */
export const WISE0855_CHALLENGE: FieldAlias = {
  label: 'Coordenadas del enunciado (época WISE, ~2010)',
  raDeg: (8 + 55 / 60 + 10.831 / 3600) * 15,
  decDeg: -(7 + 14 / 60 + 42.53 / 3600),
  display: { ra: '08h55m10.831s', dec: '−07°14′42.53″' },
}

const ALIAS_TOLERANCE_DEG = 0.5 / 60 // 0.5′

let catalog: Promise<KnownField[]> | null = null

export function loadFields(): Promise<KnownField[]> {
  if (!catalog) {
    catalog = buildCatalog()
    catalog.catch(() => (catalog = null)) // reintentar en la próxima llamada si falló
  }
  return catalog
}

async function buildCatalog(): Promise<KnownField[]> {
  const [index, presets] = await Promise.all([
    getData<TargetIndex>('targets/index.json'),
    getData<PresetsFile>('custom/presets.json'),
  ])
  const targets = await Promise.all(
    index.targets.map(async (t) => {
      const manifestPath = `targets/${t.manifest}`
      const m = await getData<Manifest>(manifestPath)
      const aliases: FieldAlias[] = [
        { label: `Catálogo (${m.ref_coord.epoch})`, raDeg: m.ref_coord.ra_deg, decDeg: m.ref_coord.dec_deg },
      ]
      if (t.target_id === 'wise0855') aliases.push(WISE0855_CHALLENGE)
      const center = { raDeg: m.grid_wcs.CRVAL1, decDeg: m.grid_wcs.CRVAL2 }
      return {
        id: t.target_id,
        kind: 'target' as const,
        name: m.name,
        manifestPath,
        analysisPath: `targets/${t.target_id}/analysis.json`,
        manifest: m,
        center,
        fovArcmin: m.fov_arcmin,
        request: { raDeg: round5(center.raDeg), decDeg: round5(center.decDeg), fovArcmin: Math.round(m.fov_arcmin) },
        aliases,
      }
    }),
  )
  const demo = await Promise.all(presets.presets.map(async (p) => presetField(p)))
  return [...targets, ...demo]
}

// Traducción de las descripciones de presets.json (el backend las escribe en inglés); si no hay, se usa la original.
const PRESET_DESCRIPTION_ES: Record<string, string> = {
  'Young star with a protoplanetary disk (Taurus); XZ Tau is the companion to the east':
    'Estrella joven con disco protoplanetario (Tauro); XZ Tau es la compañera al este.',
  'Young cluster lighting up the Orion Nebula; BN/KL infrared source appears at 2.5-5 µm (D4-D6)':
    'Cúmulo joven que ilumina la Nebulosa de Orión; la fuente infrarroja BN/KL aparece a 2.5–5 µm (D4–D6).',
  'Star-forming region; nebular emission and the embedded BN/KL object':
    'Región de formación estelar: emisión de la nebulosa y el objeto embebido BN/KL.',
}

async function presetField(p: CustomPreset): Promise<KnownField> {
  const m = await getData<Manifest>(p.manifest)
  return {
    id: p.id,
    kind: 'preset',
    name: p.name,
    description: PRESET_DESCRIPTION_ES[p.description] ?? p.description,
    manifestPath: p.manifest,
    analysisPath: p.manifest.replace(/manifest\.json$/, 'analysis.json'),
    manifest: m,
    center: { raDeg: m.grid_wcs.CRVAL1, decDeg: m.grid_wcs.CRVAL2 },
    fovArcmin: m.fov_arcmin,
    request: { raDeg: p.ra, decDeg: p.dec, fovArcmin: p.fov_arcmin },
    aliases: [],
  }
}

const round5 = (n: number) => Number(n.toFixed(5))

/**
 * Campo conocido para unas coordenadas: el centro cae dentro de medio campo, o la posición coincide
 * (±0.5′) con un alias (catálogo o enunciado). Si varios coinciden, gana el más cercano.
 */
export function matchField(fields: KnownField[], raDeg: number, decDeg: number): KnownField | null {
  let best: { f: KnownField; d: number } | null = null
  for (const f of fields) {
    const dCenter = separationDeg(raDeg, decDeg, f.center.raDeg, f.center.decDeg)
    const near = dCenter <= f.fovArcmin / 2 / 60
    const alias = f.aliases.some((a) => separationDeg(raDeg, decDeg, a.raDeg, a.decDeg) <= ALIAS_TOLERANCE_DEG)
    if ((near || alias) && (!best || dCenter < best.d)) best = { f, d: dCenter }
  }
  return best?.f ?? null
}
