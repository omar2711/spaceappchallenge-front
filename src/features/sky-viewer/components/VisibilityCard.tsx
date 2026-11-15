import { useEffect, useState } from 'react'
import { getVisibility } from '../../../api/b3'
import type { Visibility } from '../../../api/types'
import Plot from '../../../components/charts/Plot'

// ¿Se ve desde Cochabamba? GET /visibility para el centro del campo, con la noche elegida.

const hhmm = (iso?: string | null) => (iso ? iso.slice(11, 16) : '—')
const dayLabel = (iso?: string | null) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '')
const when = (iso?: string | null) => (iso ? `${hhmm(iso)} (${dayLabel(iso)})` : '—')

/** Fecha de hoy en Cochabamba (UTC−4), YYYY-MM-DD. */
const todayCbba = () => new Date(Date.now() - 4 * 3600000).toISOString().slice(0, 10)

const toMinutes = (iso: string, t0: number) => (Date.parse(`${iso}:00Z`) - t0) / 60000

export default function VisibilityCard({ ra, dec, name }: { ra: number; dec: number; name: string }) {
  const [date, setDate] = useState(todayCbba)
  const [state, setState] = useState<{ key: string; data?: Visibility; error?: boolean } | null>(null)
  const [attempt, setAttempt] = useState(0)
  const key = `${ra},${dec},${date},${attempt}`

  useEffect(() => {
    const ctrl = new AbortController()
    getVisibility(ra, dec, date, ctrl.signal)
      .then((data) => setState({ key, data }))
      .catch(() => !ctrl.signal.aborted && setState({ key, error: true }))
    return () => ctrl.abort()
  }, [ra, dec, date, key])

  const cur = state?.key === key ? state : null
  const v = cur?.data

  let body
  if (!cur) body = <p className="skyviewer-note" role="status">Calculando la noche en Cochabamba…</p>
  else if (cur.error || !v)
    body = (
      <div className="skyviewer-error-box">
        <p className="skyviewer-error">No se pudo calcular la visibilidad.</p>
        <button type="button" className="skyviewer-btn" onClick={() => setAttempt((a) => a + 1)}>
          Reintentar
        </button>
      </div>
    )
  else {
    const t0 = Date.parse(`${v.curve.time_local[0]}:00Z`)
    const xs = v.curve.time_local.map((t) => toMinutes(t, t0))
    const ev = v.target_events
    const night =
      v.sun.night_start && v.sun.night_end
        ? [{ x0: toMinutes(v.sun.night_start, t0), x1: toMinutes(v.sun.night_end, t0), label: 'noche', tone: 'gas' as const }]
        : []
    body = (
      <>
        <p className={`skyviewer-callout${v.observable ? ' skyviewer-callout--hit' : ''}`}>
          {v.observable ? (
            <>
              <strong>Sí se ve</strong> esta noche: {v.observable_hours.toFixed(1)} h por encima de 20° con el cielo
              oscuro. Mejor momento: <strong>{when(v.best_time?.time)}</strong>, a {v.best_time?.alt_deg.toFixed(0)}°
              de altura (acimut {v.best_time?.az_deg.toFixed(0)}°).
            </>
          ) : ev.never_up || ev.culmination_alt_deg < 0 ? (
            <>
              <strong>No se ve desde Cochabamba</strong>: nunca sube sobre el horizonte (máximo{' '}
              {ev.culmination_alt_deg.toFixed(0)}°).
            </>
          ) : (
            <>
              <strong>No se ve bien esta noche</strong>: no pasa de 20° de altura con el cielo oscuro (culmina a{' '}
              {ev.culmination_alt_deg.toFixed(0)}° a las {when(ev.culmination)}).
            </>
          )}
        </p>
        <Plot
          series={[
            {
              id: 'alt',
              label: name,
              color: '#c1ebdf',
              line: true,
              size: 0,
              points: xs.map((x, i) => ({ x, y: v.curve.alt_deg[i] })),
            },
            {
              id: 'sun',
              label: 'Sol',
              color: '#ffb36b',
              line: true,
              size: 0,
              points: xs.map((x, i) => ({ x, y: v.curve.sun_alt_deg[i] })),
            },
          ]}
          bands={night}
          xLabel="Hora local (UTC−4)"
          yLabel="Altura (°)"
          xTicks={() =>
            Array.from({ length: 9 }, (_, i) => ({
              v: i * 180,
              label: v.curve.time_local[Math.min(i * 36, v.curve.time_local.length - 1)]?.slice(11, 16) ?? '',
            }))
          }
          height={220}
          ariaLabel={`Altura de ${name} sobre el horizonte de Cochabamba`}
        />
        <p className="skyviewer-note">
          Sale {when(ev.rise)} · culmina {when(ev.culmination)} a {ev.culmination_alt_deg.toFixed(0)}° · se pone{' '}
          {when(ev.set)}. Noche (Sol bajo −12°): {when(v.sun.night_start)} → {when(v.sun.night_end)}. Luna iluminada{' '}
          {(v.moon_illuminated_fraction * 100).toFixed(0)}%
          {v.best_time && `, a ${v.best_time.moon_alt_deg.toFixed(0)}° de altura en el mejor momento`}.
        </p>
        <p className="skyviewer-note">
          Altura geométrica sin refracción; {v.site.name} ({Math.abs(v.site.lat).toFixed(2)}°S,{' '}
          {Math.abs(v.site.lon).toFixed(2)}°O, {v.site.elevation_m} m). SPHEREx observa desde el espacio: esto es
          solo para buscarlo con un telescopio desde casa.
        </p>
      </>
    )
  }

  return (
    <section className="skyviewer-panel" aria-labelledby="cbba-title">
      <h2 id="cbba-title" className="skyviewer-panel-title">
        ¿SE VE DESDE COCHABAMBA?
      </h2>
      <label className="skyviewer-inline skyviewer-date">
        Noche del
        <input
          type="date"
          className="skyviewer-input"
          value={date}
          onChange={(e) => e.target.value && setDate(e.target.value)}
        />
      </label>
      {body}
    </section>
  )
}
