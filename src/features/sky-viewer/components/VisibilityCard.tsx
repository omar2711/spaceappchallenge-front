import { useEffect, useState } from 'react'
import { getVisibility } from '../../../api/b3'
import type { Visibility } from '../../../api/types'
import Plot from '../../../components/charts/Plot'
import { todayCbba, when } from '../lib/cbba'

// ¿Se ve desde Cochabamba? GET /visibility para el centro del campo, con la noche elegida.

const toMinutes = (iso: string, t0: number) => (Date.parse(`${iso}:00Z`) - t0) / 60000

// Enanas marrones: están sobre el horizonte, pero no se pueden ver con un telescopio de aficionado.
const BROWN_DWARF_NOTE: Record<string, string> = {
  eps_ind_b:
    'Una enana marrón es demasiado débil en luz visible para verla con un telescopio de aficionado. En el caso de Epsilon Indi B, su estrella Epsilon Indi A está a unos 24′ y se ve a simple vista en un cielo oscuro.',
  wise0855: 'Una enana marrón es demasiado débil en luz visible para verla con un telescopio de aficionado.',
}

type Props = { ra: number; dec: number; name: string; fieldId?: string }

export default function VisibilityCard({ ra, dec, name, fieldId }: Props) {
  const brownDwarf = fieldId ? BROWN_DWARF_NOTE[fieldId] : undefined
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
  if (!cur) body = <p className="skyviewer-note" role="status">Calculando…</p>
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
              <strong>{brownDwarf ? 'Está sobre el horizonte.' : 'Sí se ve.'}</strong> Pasa <span className="num">{v.observable_hours.toFixed(1)} h</span> a más de{' '}
              <span className="num">20°</span> de altura con el cielo oscuro. El mejor momento es a las{' '}
              <strong className="num">{when(v.best_time?.time)}</strong>, a{' '}
              <span className="num">{v.best_time?.alt_deg.toFixed(0)}°</span> de altura y acimut{' '}
              <span className="num">{v.best_time?.az_deg.toFixed(0)}°</span>.
            </>
          ) : ev.never_up || ev.culmination_alt_deg < 0 ? (
            <>
              <strong>No se ve desde Cochabamba.</strong> Nunca sube sobre el horizonte; lo más alto que llega es{' '}
              <span className="num">{ev.culmination_alt_deg.toFixed(0)}°</span>.
            </>
          ) : (
            <>
              <strong>Esta noche no se ve bien.</strong> Con el cielo oscuro no pasa de{' '}
              <span className="num">20°</span>. Llega a <span className="num">{ev.culmination_alt_deg.toFixed(0)}°</span>{' '}
              a las <span className="num">{when(ev.culmination)}</span>.
            </>
          )}
        </p>
        <Plot
          series={[
            {
              id: 'alt',
              label: name,
              color: '#ffb36b',
              line: true,
              size: 0,
              points: xs.map((x, i) => ({ x, y: v.curve.alt_deg[i] })),
            },
            {
              id: 'sun',
              label: 'Sol',
              color: '#8a8a8a',
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
          caption={`Fig. · Altura de ${name} y del Sol vista desde Cochabamba, noche del ${date}`}
        />
        <p className="skyviewer-note">
          Sale a las <span className="num">{when(ev.rise)}</span>, llega a lo más alto a las{' '}
          <span className="num">{when(ev.culmination)}</span> y se pone a las <span className="num">{when(ev.set)}</span>.
          Es de noche cerrada (Sol a más de <span className="num">12°</span> bajo el horizonte) entre las{' '}
          <span className="num">{when(v.sun.night_start)}</span> y las <span className="num">{when(v.sun.night_end)}</span>.
          La Luna está iluminada al <span className="num">{(v.moon_illuminated_fraction * 100).toFixed(0)}%</span>
          {v.best_time && (
            <>
              {' '}
              y en el mejor momento está a <span className="num">{v.best_time.moon_alt_deg.toFixed(0)}°</span> de altura
            </>
          )}
          .
        </p>
        <p className="skyviewer-note">
          Calculado para {v.site.name} (
          <span className="num">
            {Math.abs(v.site.lat).toFixed(2)}°S {Math.abs(v.site.lon).toFixed(2)}°O, {v.site.elevation_m} m
          </span>
          ) sin contar la refracción.{' '}
          {brownDwarf ?? 'SPHEREx observa desde el espacio; esto sirve para buscarlo con un telescopio desde aquí.'}
        </p>
      </>
    )
  }

  return (
    <section className="skyviewer-panel" aria-labelledby="cbba-title">
      <h2 id="cbba-title" className="skyviewer-panel-title">
        ¿Se ve desde Cochabamba?
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
