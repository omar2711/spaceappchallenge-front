import { sig } from '../../../components/charts/ticks'
import { useState } from 'react'
import Plot, { type PlotBand, type PlotSeries } from '../../../components/charts/Plot'
import type { BandMeasurement, ReferenceBand, Spectrum } from '../../../api/types'
import { formatDecDms, formatRaHms } from '../lib/angles'
import { MOLECULE, prettyLabel, translateNote } from '../lib/notes'

const EPOCH_COLORS: Record<string, string> = {
  S1: '#f2f2f2',
  S2: '#ffb36b',
  S3: '#8a8a8a',
  S4: '#c9c9c9',
  combined: '#f2f2f2',
}
const colorOf = (epoch: string) => EPOCH_COLORS[epoch] ?? '#f2f2f2'
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
      title: `${prettyLabel(r.label)} ${r.wavelength_um} µm${r.phase ? ` (${r.phase})` : ''} · ${r.source ?? ''}${
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
          <strong>Agua y metano en {targetName}.</strong> SPHEREx mide absorción en{' '}
          {hits
            .filter((m) => m.molecule === 'H2O' || m.molecule === 'CH4')
            .map((m, i) => (
              <span key={m.name}>
                {i > 0 && ', '}
                <span className="num">
                  {prettyLabel(m.name)} {m.absorption_sigma?.toFixed(1)}σ
                </span>
              </span>
            ))}
          . Es lo que se espera en la atmósfera de una enana marrón fría. Ese agua está en forma de gas, no de hielo.
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
        caption={`Fig. · Espectro de ${targetName}, ${selected ? epochLabel(selected.epoch).toLowerCase() : 'pasadas superpuestas'}, 0.75 a 5 µm`}
        footer={
          <>
            <span className="plot-legend-item">
              <span className="skyviewer-legend plot-band-key plot-band-key--gas" /> banda de referencia
            </span>
            <span className="plot-legend-item">
              <span className="skyviewer-legend plot-band-key plot-band-key--hit" /> absorción medida de 3σ o más
            </span>
            {anyLower && <span className="plot-legend-item">▲ saturado: el valor real es mayor</span>}
          </>
        }
      />
      <p className="skyviewer-note">
        Las franjas grises marcan dónde absorben el agua, el metano, el CO₂ y el CO según la literatura. Son una
        referencia, no una detección. Las naranjas tienen absorción medida de 3σ o más en este espectro. Las
        punteadas tienen una posición que no pudimos verificar.
        {measured?.note && <> {translateNote(measured.note)}</>}
      </p>

      {measurements.length > 0 && (
        <table className="skyviewer-table">
          <caption>Bandas medidas ({epochLabel(measured.epoch).toLowerCase()})</caption>
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
                <td className="txt">{m.molecule ? (MOLECULE[m.molecule] ?? m.molecule) : "—"}</td>
                <td>
                  {m.value === null
                    ? translateNote(m.note) || 'sin datos'
                    : m.significant
                      ? `absorción, ${m.absorption_sigma?.toFixed(1)}σ`
                      : `nada claro${m.absorption_sigma != null ? `, ${m.absorption_sigma.toFixed(1)}σ` : ''}`}
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
        Espectro
      </h2>
      {picked ? (
        <>
          <p className="skyviewer-job-stage">
            {picked.label ?? 'Posición elegida'}:{' '}
            <span className="num">
              {formatRaHms(picked.ra)} {formatDecDms(picked.dec)}
            </span>{' '}
            <button type="button" className="skyviewer-btn" onClick={onClearPick}>
              {baseSpectra ? `Volver a ${targetName}` : 'Quitar'}
            </button>
          </p>
          {picked.state === 'loading' && (
            <p className="skyviewer-empty" role="status">
              Midiendo el espectro… <span className="num">{picked.elapsedS} s</span>. Suele tardar 1 s en los campos de
              ejemplo y de 3 a 6 s en los grandes.
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
                Medido en un círculo de <span className="num">12″</span> en <span className="num">{picked.nExposures}</span>{' '}
                exposiciones
                {picked.flags &&
                  ` (${Object.entries(picked.flags)
                    .map(([k, v]) => `${v} ${FLAG_TEXT[k] ?? k}`)
                    .join(', ')})`}
                . La posición queda fija aunque el objeto se mueva.
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
            ? 'Haz clic en la imagen para medir el espectro de cualquier punto del campo.'
            : 'Medir con un clic solo funciona en los campos de la lista, porque el servidor guarda sus exposiciones. En este campo nuevo solo hay imágenes.'}
        </p>
      )}
      {canPick && (!!baseSpectra?.length || !!picked) && (
        <p className="skyviewer-note">Haz clic en la imagen para medir el espectro de otro punto.</p>
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
