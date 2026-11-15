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
        D{detector}: curva no utilizable — {translateNote(lc.variability.note) || 'sin datos suficientes'}.
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
        color: '#7fb3ff',
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
        color: '#c1ebdf',
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
            {v.significant ? 'Variabilidad significativa' : 'Sin variabilidad significativa'} en D{detector}
          </strong>
          {v.amplitude_mag != null && <> · amplitud {v.amplitude_mag.toFixed(2)} mag</>}
          {v.p_value != null && <> · p = {v.p_value.toPrecision(2)}</>}
          {lower && (
            <>
              <br />
              El objetivo está <strong>saturado</strong>: cada flujo es una <strong>cota inferior</strong> (▲). El
              cambio entre pasadas es real como tendencia, pero la amplitud no es una medida fiable.
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
        />
        <p className="skyviewer-note">
          {lc.per_epoch.map((e) => `${e.epoch}: ${sig(e.flux, 4)} ± ${sig(e.err, 2)} mJy`).join(' · ')}.
          {excluded > 0 && ` ${excluded} exposiciones excluidas (contaminadas o mezcladas).`} Cada exposición cae en
          otra longitud de onda dentro del detector ({lc.wavelength_um[0].toFixed(2)}–{lc.wavelength_um[1].toFixed(2)}{' '}
          µm); el backend las lleva a una misma referencia con la forma del espectro antes de comparar.
        </p>
      </>
    )
  }

  return (
    <section className="skyviewer-panel" aria-labelledby="lc-title">
      <h2 id="lc-title" className="skyviewer-panel-title">
        CURVA DE LUZ · ¿CAMBIA DE BRILLO?
      </h2>
      {variableIn.length > 0 && (
        <div className="skyviewer-modes skyviewer-lc-dets">
          <span className="skyviewer-note">Variable en:</span>
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
