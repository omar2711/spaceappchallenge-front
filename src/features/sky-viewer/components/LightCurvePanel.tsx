import Plot, { type PlotSeries } from '../../../components/charts/Plot'
import { sig } from '../../../components/charts/ticks'
import { linearTicks } from '../../../components/charts/ticks'
import type { LightCurve } from '../../../api/types'
import { translateNote } from '../lib/notes'

const MJD_UNIX = 40587 // MJD del 1970-01-01
const mjdToDate = (mjd: number) => new Date((mjd - MJD_UNIX) * 86400000)
const ymd = (mjd: number) => mjdToDate(mjd).toISOString().slice(0, 10)

const dateTicks = (dom: [number, number]) =>
  linearTicks(dom, 5).map((t) => ({ v: t.v, label: mjdToDate(t.v).toISOString().slice(0, 7) }))

const FLAG_TEXT: Record<string, string> = {
  ok: 'buena',
  saturated: 'saturada (cota inferior)',
  contaminated: 'contaminada por una fuente vecina',
  edge: 'en el borde',
  blended: 'mezclada con otra fuente',
}

type Props = {
  curves: LightCurve[]
  detector: number
  onDetector: (id: number) => void
}

/** Curva de luz del objetivo en el detector elegido (fotometría forzada por exposición + media por pasada). */
export default function LightCurvePanel({ curves, detector, onDetector }: Props) {
  const lc = curves.find((c) => c.detector === detector)
  const variableIn = curves.filter((c) => c.usable !== false && c.variability.significant).map((c) => c.detector)

  let body
  if (!lc) {
    body = <p className="skyviewer-note">No hay curva de luz para D{detector}.</p>
  } else if (lc.usable === false || lc.per_epoch.length === 0) {
    body = (
      <p className="skyviewer-note">
        No se puede usar la curva de D{detector}: {translateNote(lc.variability.note) || 'faltan datos'}.
      </p>
    )
  } else {
    const used = lc.points.filter((p) => p.flux_corrected !== null)
    const excluded = lc.points.length - used.length
    const v = lc.variability
    const lower = !!v.lower_limit
    const series: PlotSeries[] = [
      {
        id: 'exp',
        label: 'cada exposición (corregida por la forma del espectro)',
        color: '#8a8a8a',
        size: 2.2,
        points: used.map((p) => ({
          x: p.mjd,
          y: p.flux_corrected as number,
          err: p.err,
          lower: p.flag === 'saturated',
          title: `${ymd(p.mjd)} · ${p.wavelength_um.toFixed(3)} µm · ${sig((p.flux_corrected as number), 4)} mJy · ${
            FLAG_TEXT[p.flag] ?? p.flag
          }`,
        })),
      },
      {
        id: 'epoch',
        label: 'media por pasada',
        color: '#ffb36b',
        marker: 'diamond',
        size: 5,
        line: true,
        points: lc.per_epoch.map((e) => ({
          x: e.mjd ?? 0,
          y: e.flux,
          err: e.err,
          lower: e.lower_limit,
          title: `${e.epoch}${e.mjd ? ` · ${ymd(e.mjd)}` : ''} · ${sig(e.flux, 4)} ± ${sig(e.err, 2)} mJy · ${e.n} exp.${
            e.lower_limit ? ' · cota inferior (saturado)' : ''
          }`,
        })),
      },
    ]
    body = (
      <>
        <p className={`skyviewer-callout${v.significant && !lower ? ' skyviewer-callout--hit' : ''}`}>
          <strong>
            {v.significant ? 'Cambia de brillo' : 'No cambia de brillo de forma clara'} en D{detector}
          </strong>
          {v.amplitude_mag != null && (
            <>
              {' '}
              · amplitud <span className="num">{v.amplitude_mag.toFixed(2)} mag</span>
            </>
          )}
          {v.p_value != null && (
            <>
              {' '}
              · <span className="num">p = {v.p_value.toPrecision(2)}</span>
            </>
          )}
          {lower && (
            <>
              <br />
              El objetivo está saturado, así que cada valor (▲) es menor que el real. Que el brillo sube o baja entre
              pasadas sí es fiable; cuánto, no.
            </>
          )}
        </p>
        <Plot
          series={series}
          xLabel="Fecha (UT)"
          yLabel={`Flujo D${detector} (${lc.units})`}
          xTicks={dateTicks}
          height={260}
          ariaLabel={`Curva de luz en D${detector}`}
          caption={`Fig. · Curva de luz en D${detector}, ${lc.per_epoch.map((e) => e.epoch).join(', ')}`}
        />
        <p className="skyviewer-note">
          {lc.per_epoch.map((e, i) => (
            <span key={e.epoch}>
              {i > 0 && ' · '}
              {e.epoch}: <span className="num">{sig(e.flux, 4)} ± {sig(e.err, 2)} mJy</span>
            </span>
          ))}
          .{excluded > 0 && ` Dejamos fuera ${excluded} exposiciones contaminadas o mezcladas con otra fuente.`} Cada
          exposición mide una longitud de onda algo distinta dentro del detector (
          <span className="num">
            {lc.wavelength_um[0].toFixed(2)}–{lc.wavelength_um[1].toFixed(2)} µm
          </span>
          ), así que el servidor las corrige con la forma del espectro antes de compararlas.
        </p>
      </>
    )
  }

  return (
    <section className="skyviewer-panel" aria-labelledby="lc-title">
      <h2 id="lc-title" className="skyviewer-panel-title">
        Curva de luz
      </h2>
      {variableIn.length > 0 && (
        <div className="skyviewer-modes skyviewer-lc-dets">
          <span className="skyviewer-note">Cambia de brillo en:</span>
          {variableIn.map((d) => (
            <button
              key={d}
              type="button"
              className="skyviewer-mode skyviewer-chip"
              aria-pressed={d === detector}
              onClick={() => onDetector(d)}
            >
              D{d}
            </button>
          ))}
        </div>
      )}
      {body}
    </section>
  )
}
