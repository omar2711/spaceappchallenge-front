import type { MarsWalk } from '../../../api/types'
import Plot from '../../../components/charts/Plot'
import { HAZARD_MARGIN_KM, stopEs, SUMMARY_ES } from '../data/marswalk'

type Props = {
  walk: MarsWalk | null
  failed: boolean
  onRetry: () => void
  activeStop: string | null
  onStop: (id: string) => void
  onShowWalk: () => void
}

/** La caminata de la Ruta del Agua en Jezero: paradas donde el agua dejó su marca y perfil de altura. */
export default function WalkPanel({ walk, failed, onRetry, activeStop, onStop, onShowWalk }: Props) {
  if (failed)
    return (
      <div className="marsmap-panel">
        <h2 className="marsmap-panel-title">Caminata por Jezero</h2>
        <p className="marsmap-note">No se pudo cargar la caminata desde la API.</p>
        <button type="button" className="marsmap-btn" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    )
  if (!walk)
    return (
      <div className="marsmap-panel">
        <h2 className="marsmap-panel-title">Caminata por Jezero</h2>
        <p className="marsmap-note" role="status">
          Cargando la ruta de Perseverance… (si el servidor estaba dormido, puede tardar ~30 s)
        </p>
      </div>
    )

  const r = walk.route
  const climb = r.points[r.points.length - 1].elevation_m - r.points[0].elevation_m
  return (
    <div className="marsmap-panel">
      <h2 className="marsmap-panel-title">Caminata por Jezero · ruta real</h2>
      <p className="marsmap-note">{SUMMARY_ES}</p>
      <p className="marsmap-distance">
        {r.length_km.toFixed(1)} km · soles {r.sols[0]}–{r.sols[1]} · sube {climb.toFixed(0)} m
      </p>
      <button type="button" className="marsmap-btn" onClick={onShowWalk}>
        Ver la caminata en el mapa
      </button>
      <ol className="marsmap-stops">
        {walk.stops.map((s, i) => {
          const t = stopEs(s)
          return (
            <li key={s.id}>
              <button
                type="button"
                className="marsmap-btn marsmap-stop-btn"
                aria-pressed={activeStop === s.id}
                onClick={() => onStop(s.id)}
              >
                <span className="marsmap-stop-n">{i + 1}</span>
                <span>
                  <strong>{t.title}</strong>
                  <span className="marsmap-stop-meta">
                    sol {s.sol} · {t.date} · km {s.odometry_km.toFixed(1)}
                    {t.rock && ` · roca ${t.rock}`}
                  </span>
                </span>
              </button>
              {activeStop === s.id && (
                <p className="marsmap-note marsmap-stop-why">
                  💧 {t.why} <br />
                  {s.lat.toFixed(4)}° N, {s.lon.toFixed(4)}° E · {s.elevation_m.toFixed(0)} m
                </p>
              )}
            </li>
          )
        })}
      </ol>
      <Plot
        series={[
          {
            id: 'elev',
            label: 'altura del recorrido',
            color: '#ffb36b',
            line: true,
            size: 0,
            points: r.points.map((p) => ({ x: p.odometry_km, y: p.elevation_m })),
          },
          {
            id: 'stops',
            label: 'paradas',
            color: '#c1ebdf',
            marker: 'diamond',
            size: 5,
            points: walk.stops.map((s, i) => ({ x: s.odometry_km, y: s.elevation_m, title: `${i + 1}. ${stopEs(s).title}` })),
          },
        ]}
        xLabel="Distancia recorrida (km)"
        yLabel="Altura (m)"
        height={260}
        width={380}
        ariaLabel="Perfil de altura de la caminata de Perseverance"
      />
      <h3 className="marsmap-subtitle">Pendientes fuertes medidas (&gt; {walk.hazards.steep_threshold_percent} %)</h3>
      <ul className="marsmap-hazards">
        {walk.hazards.steep_segments.map((h, i) => (
          <li key={i}>
            Sol {h.sol}: {Math.abs(h.grade_percent).toFixed(1)} % {h.grade_percent > 0 ? 'de subida' : 'de bajada'} en{' '}
            {h.segment_m.toFixed(0)} m
          </li>
        ))}
      </ul>
      <p className="marsmap-note">
        Calculadas con las alturas oficiales de los puntos de paso (un punto cada ≥ 150 m): no ven pendientes más
        cortas. En el mapa, cada una tiene un margen de seguridad de {HAZARD_MARGIN_KM * 1000} m; si tu ruta pasa por
        ahí, se marca en rojo. Fuente: NASA/JPL (waypoints de Mars 2020).
      </p>
    </div>
  )
}
