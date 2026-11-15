import { useEffect, useState } from 'react'
import { getMoonVisibility } from '../../../api/moon'
import type { MoonSite, MoonVisibility, MoonWindow } from '../../../api/types'
import Plot from '../../../components/charts/Plot'

// ¿Cuándo hay Sol (energía) y Tierra a la vista (comunicación directa) en cada sitio? GET /moon/visibility.
// Hasta dos sitios lado a lado con la misma ventana de fechas.

const DAYS = [7, 14, 30]
const stepFor = (days: number) => (days <= 7 ? 30 : 60)
const todayUtc = () => new Date().toISOString().slice(0, 10)
const hours = (h: number) => (h >= 48 ? `${(h / 24).toFixed(1)} días` : `${h.toFixed(0)} h`)
const utc = (iso: string | null) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)} ${iso.slice(11, 16)} UT` : '')

type Load = { key: string; data?: MoonVisibility; error?: boolean }

function useVisibility(site: MoonSite | null, start: string, days: number) {
  const [state, setState] = useState<Load | null>(null)
  const key = site ? `${site.id}|${start}|${days}` : ''
  useEffect(() => {
    if (!site) return
    const ctrl = new AbortController()
    getMoonVisibility(site.id, start, days, stepFor(days), ctrl.signal)
      .then((data) => setState({ key, data }))
      .catch(() => !ctrl.signal.aborted && setState({ key, error: true }))
    return () => ctrl.abort()
  }, [site, start, days, key])
  return state?.key === key ? state : null
}

function WindowStrip({ v }: { v: MoonVisibility }) {
  const total = v.days * 24
  const t0 = Date.parse(v.start_utc)
  const pos = (w: MoonWindow) => {
    const a = w.start ? (Date.parse(w.start) - t0) / 3600000 : 0
    const b = w.end ? (Date.parse(w.end) - t0) / 3600000 : total
    return { left: `${(a / total) * 100}%`, width: `${(Math.max(b - a, 0) / total) * 100}%` }
  }
  const rows: [string, MoonWindow[], string][] = [
    ['Sol', v.windows.sunlit, 'sun'],
    ['Tierra', v.windows.earth_visible, 'earth'],
    ['Ambos', v.windows.sun_and_earth, 'both'],
  ]
  return (
    <div className="moonmap-strip" aria-label="Ventanas de Sol y Tierra">
      {rows.map(([label, ws, tone]) => (
        <div key={label} className="moonmap-strip-row">
          <span className="moonmap-strip-label">{label}</span>
          <span className="moonmap-strip-track">
            {ws.map((w, i) => (
              <span
                key={i}
                className={`moonmap-strip-seg moonmap-strip-seg--${tone}`}
                style={pos(w)}
                title={`${w.open_start ? 'desde antes' : utc(w.start)} → ${w.open_end ? 'sigue' : utc(w.end)} · ${hours(w.hours)}`}
              />
            ))}
          </span>
        </div>
      ))}
    </div>
  )
}

function SiteColumn({ site, load }: { site: MoonSite; load: Load | null }) {
  if (!load) return <p className="moonmap-note" role="status">Calculando Sol y Tierra para {site.name}…</p>
  if (load.error || !load.data) return <p className="moonmap-note">No se pudo calcular la visibilidad de {site.name}.</p>
  const v = load.data
  const s = v.summary
  const xs = v.series.hours_from_start.map((h) => h / 24)
  const next = [
    s.hours_to_sunset != null && `atardecer en ${hours(s.hours_to_sunset)}`,
    s.hours_to_sunrise != null && `amanecer en ${hours(s.hours_to_sunrise)}`,
    s.hours_to_earthset != null && `la Tierra se oculta en ${hours(s.hours_to_earthset)}`,
    s.hours_to_earthrise != null && `la Tierra sale en ${hours(s.hours_to_earthrise)}`,
  ].filter(Boolean)
  const start = Date.parse(v.start_utc)
  return (
    <div className="moonmap-col">
      <h3 className="moonmap-subtitle">{site.name}</h3>
      <dl className="moonmap-stats">
        <div>
          <dt>Sol a la vista</dt>
          <dd>
            {hours(s.sunlit_hours)} · {(s.sunlit_fraction * 100).toFixed(0)} %
          </dd>
        </div>
        <div>
          <dt>Tierra a la vista</dt>
          <dd>
            {hours(s.earth_visible_hours)} · {(s.earth_visible_fraction * 100).toFixed(0)} %
          </dd>
        </div>
        <div>
          <dt>Sol y Tierra a la vez</dt>
          <dd>{hours(s.sun_and_earth_hours)}</dd>
        </div>
        <div>
          <dt>Altura máxima del Sol</dt>
          <dd>{s.max_sun_elevation_deg.toFixed(1)}°</dd>
        </div>
      </dl>
      <p className="moonmap-note">
        Al empezar, el Sol está {s.sun_up_at_start ? 'arriba' : 'abajo'} y la Tierra{' '}
        {s.earth_up_at_start ? 'arriba' : 'abajo'}
        {next.length > 0 && ` · ${next.join(' · ')}`}. La Tierra se mueve entre{' '}
        <span className="num">{s.earth_elevation_range_deg[0].toFixed(1)}°</span> y{' '}
        <span className="num">{s.earth_elevation_range_deg[1].toFixed(1)}°</span> de altura.
      </p>
      <Plot
        series={[
          { id: 'sun', label: 'Sol', color: '#ffb36b', line: true, size: 0, points: xs.map((x, i) => ({ x, y: v.series.sun_elevation_deg[i] })) },
          { id: 'earth', label: 'Tierra', color: '#d0d0d0', line: true, size: 0, points: xs.map((x, i) => ({ x, y: v.series.earth_elevation_deg[i] })) },
        ]}
        xLabel="Fecha (UT)"
        yLabel="Altura sobre el horizonte (°)"
        xTicks={(dom) => {
          const step = v.days > 14 ? 5 : v.days > 7 ? 2 : 1
          const out = []
          for (let d = 0; d <= Math.min(dom[1], v.days); d += step) {
            const t = new Date(start + d * 86400000).toISOString()
            out.push({ v: d, label: `${t.slice(8, 10)}/${t.slice(5, 7)}` })
          }
          return out
        }}
        height={240}
        ariaLabel={`Altura del Sol y de la Tierra vistas desde ${site.name}`}
        caption={`Fig. · Altura del Sol y de la Tierra desde ${site.name}, ${v.start_utc.slice(0, 10)} a ${v.end_utc.slice(0, 10)} UTC`}
      />
      <WindowStrip v={v} />
    </div>
  )
}

type Props = { sites: MoonSite[]; selected: MoonSite | null; compare: MoonSite | null; onCompare: (s: MoonSite | null) => void }

export default function SunEarthPanel({ sites, selected, compare, onCompare }: Props) {
  const [start, setStart] = useState(todayUtc)
  const [days, setDays] = useState(30)
  const a = useVisibility(selected, start, days)
  const b = useVisibility(compare, start, days)

  return (
    <section className="moonmap-panel moonmap-sunearth" aria-labelledby="sunearth-title">
      <h2 id="sunearth-title" className="moonmap-panel-title">
        Sol y Tierra vistos desde el sitio
      </h2>
      <div className="moonmap-controls">
        <label className="moonmap-field">
          Desde (UTC)
          <input type="date" className="moonmap-input" value={start} onChange={(e) => e.target.value && setStart(e.target.value)} />
        </label>
        <label className="moonmap-field">
          Duración
          <select className="moonmap-input" value={days} onChange={(e) => setDays(Number(e.target.value))}>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d} días
              </option>
            ))}
          </select>
        </label>
        <label className="moonmap-field">
          Comparar con
          <select
            className="moonmap-input"
            value={compare?.id ?? ''}
            onChange={(e) => onCompare(sites.find((s) => s.id === e.target.value) ?? null)}
          >
            <option value="">Ninguno</option>
            {sites
              .filter((s) => s.id !== selected?.id)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </select>
        </label>
      </div>

      {!selected ? (
        <p className="moonmap-note">Elige un sitio en el mapa o en la lista.</p>
      ) : (
        <div className={compare ? 'moonmap-cols moonmap-cols--2' : 'moonmap-cols'}>
          <SiteColumn site={selected} load={a} />
          {compare && <SiteColumn site={compare} load={b} />}
        </div>
      )}

      <p className="moonmap-callout">
        <strong>Ojo: el cálculo supone un horizonte liso.</strong> Tratamos la Luna como una esfera sin montañas. En
        el polo sur, un borde de cráter puede tapar el Sol o la Tierra aunque aquí salgan sobre el horizonte, y en
        una cumbre pasa lo contrario. Usamos las efemérides JPL DE421 y comprobamos el resultado con JPL Horizons en
        el sitio del Apollo 11: la diferencia es menor a <span className="num">0.001°</span>.
      </p>
    </section>
  )
}
