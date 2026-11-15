import { sig } from '../../../components/charts/ticks'
import { useState } from 'react'
import Plot, { type PlotBand, type PlotSeries } from '../../../components/charts/Plot'
import type { BandMeasurement, ReferenceBand, Spectrum } from '../../../api/types'
import { formatDecDms, formatRaHms } from '../lib/angles'
import { MOLECULE, prettyLabel, translateNote } from '../lib/notes'

const EPOCH_COLORS: Record<string, string> = {
  S1: '#7fb3ff',
  S2: '#c1ebdf',
  S3: '#ffb36b',
  S4: '#e58fd8',
  combined: '#eaf2f4',
}
const colorOf = (epoch: string) => EPOCH_COLORS[epoch] ?? '#eaf2f4'
const epochLabel = (e: string) => (e === 'combined' ? 'Combinado' : e)

const OVERLAY = 'overlay'

const overlaps = (a?: [number, number], b?: [number, number]) => !!a && !!b && a[0] <= b[1] && b[0] <= a[1]

/** Bandas de referencia como franjas; las que tienen absorción medida ≥ 3σ en este espectro se resaltan. */
function toBands(refs: ReferenceBand[], hits: BandMeasurement[]): PlotBand[] {
  return refs.map((r) => {
    const range = r.range_um ?? [r.wavelength_um - 0.02, r.wavelength_um + 0.02]
    const hit = hits.some((m) => overlaps(m.band_um, range))
    return {
      x0: range[0],
      x1: range[1],
      label: prettyLabel(r.label),
      tone: hit ? 'hit' : r.phase === 'ice' ? 'ice' : 'gas',
      dashed: !r.verified,
      title: `${prettyLabel(r.label)} ${r.wavelength_um} µm${r.phase ? ` (${r.phase})` : ''} — ${r.source ?? ''}${
        r.verified ? '' : ' · posición no verificada'
      }${hit ? ' · absorción medida ≥ 3σ en este espectro' : ''}`,
    }
  })
}

type Props = {
  spectra: Spectrum[]
  referenceBands: ReferenceBand[]
  targetName: string
  /** Variable: por defecto se superponen las pasadas (el combinado mezcla estados de brillo distintos). */
  variable?: boolean
}

/** Espectro (por pasada, combinado o superpuesto) con bandas de referencia y mediciones de bandas. */
export function SpectrumView({ spectra, referenceBands, targetName, variable }: Props) {
  const hasOverlay = spectra.filter((s) => s.epoch !== 'combined').length > 1
  const [choice, setChoice] = useState(variable && hasOverlay ? OVERLAY : 'combined')
  const [log, setLog] = useState(false)

  const combined = spectra.find((s) => s.epoch === 'combined') ?? spectra[spectra.length - 1]
  const selected = choice === OVERLAY ? null : (spectra.find((s) => s.epoch === choice) ?? combined)
  const shown = selected ? [selected] : spectra.filter((s) => s.epoch !== 'combined')
  const measured = selected ?? combined // las bandas se miden sobre el espectro elegido o el combinado
  const measurements = measured?.band_measurements ?? []
  const hits = measurements.filter((m) => m.significant)

  const series: PlotSeries[] = shown.map((s) => ({
    id: s.epoch,
    label: `${epochLabel(s.epoch)}${s.n_exposures ? ` · ${s.n_exposures} exp.` : ''}`,
    color: colorOf(s.epoch),
    line: true,
    gapX: 0.25,
    size: 2.6,
    points: s.points
      .filter((p) => !log || p.flux > 0)
      .map((p) => ({
        x: p.wavelength_um,
        y: p.flux,
        err: p.err,
        lower: p.lower_limit,
        title: `${p.wavelength_um.toFixed(3)} µm · ${sig(p.flux, 3)} ± ${sig(p.err, 2)} mJy${
          p.lower_limit ? ' (cota inferior: saturado)' : ''
        }`,
      })),
  }))
  const anyLower = shown.some((s) => s.points.some((p) => p.lower_limit))

  const molecules = new Set(hits.map((m) => m.molecule))
  const waterAndMethane = molecules.has('H2O') && molecules.has('CH4')
  const interpretations = [...new Set(measurements.map((m) => m.interpretation).filter(Boolean))] as string[]

  if (!combined) return <p className="skyviewer-note">No hay espectro para esta posición.</p>

  return (
    <div className="skyviewer-spectrum">
      <div className="skyviewer-modes" role="group" aria-label="Pasada del espectro">
        {spectra.map((s) => (
          <button
            key={s.epoch}
            type="button"
            className="skyviewer-mode skyviewer-chip"
            aria-pressed={choice === s.epoch}
            onClick={() => setChoice(s.epoch)}
          >
            {epochLabel(s.epoch)}
          </button>
        ))}
        {hasOverlay && (
          <button
            type="button"
            className="skyviewer-mode skyviewer-chip"
            aria-pressed={choice === OVERLAY}
            onClick={() => setChoice(OVERLAY)}
          >
            Superponer pasadas
          </button>
        )}
        <label className="skyviewer-inline">
          <input type="checkbox" checked={log} onChange={(e) => setLog(e.target.checked)} />
          Escala log
        </label>
      </div>

      {waterAndMethane && (
        <p className="skyviewer-callout skyviewer-callout--hit">
          <strong>Agua y metano en {targetName}.</strong> SPHEREx mide absorción de{' '}
          {hits
            .filter((m) => m.molecule === 'H2O' || m.molecule === 'CH4')
            .map((m) => `${prettyLabel(m.name)} (${m.absorption_sigma?.toFixed(1)}σ)`)
            .join(', ')}
          : la firma de la atmósfera de una enana marrón fría, en gas, no en hielo.
        </p>
      )}

      <Plot
        series={series}
        bands={toBands(referenceBands, hits)}
        xLabel="Longitud de onda (µm)"
        yLabel="Flujo (mJy)"
        yLog={log}
        height={320}
        ariaLabel={`Espectro de ${targetName}`}
        footer={
          <>
            <span className="plot-legend-item">
              <span className="skyviewer-legend plot-band-key plot-band-key--gas" /> banda de referencia
            </span>
            <span className="plot-legend-item">
              <span className="skyviewer-legend plot-band-key plot-band-key--hit" /> absorción medida ≥ 3σ
            </span>
            {anyLower && <span className="plot-legend-item">▲ cota inferior (saturado)</span>}
          </>
        }
      />
      <p className="skyviewer-note">
        Las franjas marcan <strong>dónde absorben</strong> el agua, el metano, el CO₂ y el CO según la literatura
        (referencia, no detección). Solo las resaltadas en verde tienen absorción medida ≥ 3σ en este espectro.
        Franjas punteadas: posición no verificada.
        {measured?.note && <> {translateNote(measured.note)}</>}
      </p>

      {measurements.length > 0 && (
        <table className="skyviewer-table">
          <caption>Mediciones de bandas ({epochLabel(measured.epoch)})</caption>
          <thead>
            <tr>
              <th scope="col">Banda</th>
              <th scope="col">Molécula</th>
              <th scope="col">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {measurements.map((m) => (
              <tr key={m.name} className={m.significant ? 'is-hit' : undefined}>
                <td>{prettyLabel(m.name)}</td>
                <td>{m.molecule ? (MOLECULE[m.molecule] ?? m.molecule) : '—'}</td>
                <td>
                  {m.value === null
                    ? translateNote(m.note) || 'sin datos'
                    : m.significant
                      ? `absorción detectada · ${m.absorption_sigma?.toFixed(1)}σ`
                      : `no significativa${m.absorption_sigma != null ? ` · ${m.absorption_sigma.toFixed(1)}σ` : ''}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {interpretations.map((t) => (
        <p key={t} className="skyviewer-note">
          {translateNote(t)}
        </p>
      ))}
    </div>
  )
}

export type PickedSpectrum = {
  ra: number
  dec: number
  label?: string
  state: 'loading' | 'ready' | 'error'
  spectra?: Spectrum[]
  referenceBands?: ReferenceBand[]
  nExposures?: number
  flags?: Record<string, number>
  error?: string
  elapsedS: number
}

const FLAG_TEXT: Record<string, string> = {
  ok: 'buenas',
  saturated: 'saturadas',
  contaminated: 'contaminadas',
  edge: 'en el borde',
  blended: 'mezcladas',
}

type PanelProps = {
  targetName: string
  baseSpectra: Spectrum[] | null
  referenceBands: ReferenceBand[]
  variable: boolean
  canPick: boolean
  picked: PickedSpectrum | null
  onClearPick: () => void
  shortcuts?: { label: string; ra: number; dec: number }[]
  onShortcut?: (s: { label: string; ra: number; dec: number }) => void
}

export default function SpectrumPanel({
  targetName,
  baseSpectra,
  referenceBands,
  variable,
  canPick,
  picked,
  onClearPick,
  shortcuts = [],
  onShortcut,
}: PanelProps) {
  return (
    <section className="skyviewer-panel" aria-labelledby="spectrum-title">
      <h2 id="spectrum-title" className="skyviewer-panel-title">
        ESPECTRO · 0.75–5 µm
      </h2>
      {picked ? (
        <>
          <p className="skyviewer-job-stage">
            {picked.label ?? 'Posición elegida'}: {formatRaHms(picked.ra)} {formatDecDms(picked.dec)}{' '}
            <button type="button" className="skyviewer-btn" onClick={onClearPick}>
              {baseSpectra ? `Volver a ${targetName}` : 'Quitar'}
            </button>
          </p>
          {picked.state === 'loading' && (
            <p className="skyviewer-empty" role="status">
              Calculando el espectro en el servidor… {picked.elapsedS} s (≈1 s en los campos de demo, 3–6 s en los
              campos grandes)
            </p>
          )}
          {picked.state === 'error' && (
            <p className="skyviewer-error" role="alert">
              {picked.error}
            </p>
          )}
          {picked.state === 'ready' && picked.spectra && (
            <>
              <p className="skyviewer-note">
                Fotometría forzada (apertura de 12″) en {picked.nExposures} exposiciones
                {picked.flags &&
                  ` (${Object.entries(picked.flags)
                    .map(([k, v]) => `${v} ${FLAG_TEXT[k] ?? k}`)
                    .join(', ')})`}
                . Posición fija: no sigue movimiento propio.
              </p>
              <SpectrumView
                key={`${picked.ra},${picked.dec}`}
                spectra={picked.spectra}
                referenceBands={picked.referenceBands ?? referenceBands}
                targetName={picked.label ?? 'la posición elegida'}
              />
            </>
          )}
        </>
      ) : baseSpectra && baseSpectra.length > 0 ? (
        <SpectrumView spectra={baseSpectra} referenceBands={referenceBands} targetName={targetName} variable={variable} />
      ) : (
        <p className="skyviewer-note">
          {canPick
            ? 'Haz clic sobre la imagen para medir el espectro de cualquier fuente del campo.'
            : 'El espectro por clic está disponible en los objetivos y los campos de demo: el servidor solo guarda en caché sus exposiciones. Este campo nuevo muestra solo imágenes.'}
        </p>
      )}
      {canPick && (!!baseSpectra?.length || !!picked) && (
        <p className="skyviewer-note">Haz clic sobre la imagen para medir el espectro de otra posición del campo.</p>
      )}
      {canPick && shortcuts.length > 0 && (
        <div className="skyviewer-modes">
          {shortcuts.map((s) => (
            <button key={s.label} type="button" className="skyviewer-btn" onClick={() => onShortcut?.(s)}>
              Espectro de {s.label}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
