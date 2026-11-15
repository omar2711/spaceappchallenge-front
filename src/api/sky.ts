import { ApiError, dataUrl, getData, getJson, postJson } from './client'
import { loadFields, matchField, type KnownField } from './fields'
import type { Analysis, CustomStatus, Manifest, Pair } from './types'

// Contrato entre la UI de /cielo y los datos reales de SPHEREx (backend Ruta del Agua).
// 1) Si las coordenadas corresponden a un campo ya calculado (objetivo o preset), se usa su manifest.
// 2) Si no, POST /custom genera el campo (1–3 min la primera vez; la caché es instantánea) y se
//    consulta GET /custom/{job_id} hasta que esté listo.

export type SkyRequest = {
  raDeg: number // Ascensión recta, grados decimales (0–360)
  decDeg: number // Declinación, grados decimales (−90 a +90)
  fovArcmin: number // Campo de visión, minutos de arco (campos nuevos: 1–6)
}

export type SkyFrame = {
  id: string
  epoch: string // pasada: S1, S2…
  epochUT: string // fecha media de la pasada en ese detector (ISO 8601, UT)
  imageUrl: string
  targetPx: Pair // posición esperada del objetivo (coordenadas WebP, origen arriba a la izquierda)
  nImages: number // exposiciones combinadas
  saturatedExposures: number
  wavelengthAtTargetUm?: Pair
}

export type DetectorSeries = { id: number; wavelengthUm: Pair; frames: SkyFrame[] }

export type SkySeries = {
  request: SkyRequest
  source: 'live'
  field: { id: string; name: string; kind: 'target' | 'preset' | 'custom'; known?: KnownField }
  manifest: Manifest
  imageSize: Pair
  detectors: DetectorSeries[]
  analysis: Analysis | null
  analysisBase: string | null // carpeta (relativa a /data) de los archivos de analysis.json
}

/** El trabajo de /custom terminó con error (por ejemplo, SPHEREx no observó esa posición). */
export class SkyJobError extends Error {
  readonly status: CustomStatus
  constructor(status: CustomStatus) {
    super(status.message || status.error || 'Error al generar el campo')
    this.name = 'SkyJobError'
    this.status = status
  }
}

type Options = { onProgress?: (s: CustomStatus) => void; signal?: AbortSignal }

const POLL_MS = 2000

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(t)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })

const dirOf = (path: string) => path.replace(/[^/]+$/, '')

async function loadAnalysis(path: string): Promise<Analysis | null> {
  try {
    return await getData<Analysis>(path)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null // no todos los campos tienen análisis
    throw e
  }
}

function buildSeries(
  request: SkyRequest,
  field: SkySeries['field'],
  manifestPath: string,
  manifest: Manifest,
  analysisPath: string,
  analysis: Analysis | null,
): SkySeries {
  const base = dirOf(manifestPath)
  const dateOf = (epoch: string) => manifest.epochs.find((e) => e.id === epoch)?.date_mid ?? ''
  const detectors = manifest.detectors.map((d) => ({
    id: d.id,
    wavelengthUm: d.wavelength_um,
    frames: d.frames.map((f) => ({
      id: `${field.id}-${f.epoch}-D${d.id}`,
      epoch: f.epoch,
      epochUT: f.date_mid ?? dateOf(f.epoch),
      imageUrl: dataUrl(`${base}${f.file}`),
      targetPx: f.target_px,
      nImages: f.n_images,
      saturatedExposures: f.saturated_exposures ?? 0,
      wavelengthAtTargetUm: f.wavelength_at_target_um,
    })),
  }))
  return {
    request,
    source: 'live',
    field,
    manifest,
    imageSize: manifest.image_size_px,
    detectors,
    analysis,
    analysisBase: analysis ? dirOf(analysisPath) : null,
  }
}

export async function getSkySeries(req: SkyRequest, opts: Options = {}): Promise<SkySeries> {
  const fields = await loadFields()
  const known = matchField(fields, req.raDeg, req.decDeg)
  if (known) {
    const analysis = await loadAnalysis(known.analysisPath)
    return buildSeries(req, { id: known.id, name: known.name, kind: known.kind, known }, known.manifestPath,
      known.manifest, known.analysisPath, analysis)
  }

  // Campo nuevo: generar (o reutilizar de la caché del servidor) y esperar.
  let status = await postJson<CustomStatus>(
    '/custom',
    { ra: req.raDeg, dec: req.decDeg, fov_arcmin: req.fovArcmin },
    opts.signal,
  )
  while (status.state === 'pending' || status.state === 'processing') {
    opts.onProgress?.(status)
    await sleep(POLL_MS, opts.signal)
    status = await getJson<CustomStatus>(`/custom/${status.job_id}`, undefined, opts.signal)
  }
  opts.onProgress?.(status)
  if (status.state !== 'ready' || !status.manifest) throw new SkyJobError(status)
  const manifestPath = status.manifest
  const manifest = await getData<Manifest>(manifestPath)
  const analysisPath = manifestPath.replace(/manifest\.json$/, 'analysis.json')
  const analysis = await loadAnalysis(analysisPath)
  return buildSeries(req, { id: status.job_id, name: manifest.name, kind: 'custom' }, manifestPath, manifest,
    analysisPath, analysis)
}
