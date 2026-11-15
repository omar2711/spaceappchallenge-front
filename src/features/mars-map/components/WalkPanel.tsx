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
        <p className="marsmap-note">No se pudo cargar el recorrido.</p>
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
          Cargando el recorrido de Perseverance… Si el servidor estaba dormido, tarda unos 30 s.
        </p>
      </div>
    )

  const r = walk.route
  const climb = r.points[r.points.length - 1].elevation_m - r.points[0].elevation_m
  return (
    <div className="marsmap-panel">
      <h2 className="marsmap-panel-title">Recorrido de Perseverance en Jezero</h2>
      <p className="marsmap-note">{SUMMARY_ES}</p>
      <p className="marsmap-distance">
        <span className="num">{r.length_km.toFixed(1)} km</span> · soles{' '}
        <span className="num">
          {r.sols[0]}–{r.sols[1]}
        </span>{' '}
        · sube <span className="num">{climb.toFixed(0)} m</span>
      </p>
      <button type="button" className="marsmap-btn" onClick={onShowWalk}>
        Ver el recorrido en el mapa
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
                  </span>
                  <span className="marsmap-note">{t.rock && `roca ${t.rock}`}
                  </span>
                </span>
              </button>
              {activeStop === s.id && (
                <p className="marsmap-note marsmap-stop-why">
                  {t.why} <br />
                  <span className="num">
                    {s.lat.toFixed(4)}° N, {s.lon.toFixed(4)}° E · {s.elevation_m.toFixed(0)} m
                  </span>
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
            color: '#d0d0d0',
            line: true,
            size: 0,
            points: r.points.map((p) => ({ x: p.odometry_km, y: p.elevation_m })),
          },
          {
            id: 'stops',
            label: 'paradas',
            color: '#ffb36b',
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
        caption={`Fig. · Perfil de altura del recorrido de Perseverance en Jezero, soles ${r.sols[0]} a ${r.sols[1]}`}
      />
      <h3 className="marsmap-subtitle">Pendientes de más del {walk.hazards.steep_threshold_percent} %</h3>
      <ul className="marsmap-hazards">
        {walk.hazards.steep_segments.map((h, i) => (
          <li key={i}>
            Sol <span className="num">{h.sol}</span>: <span className="num">{Math.abs(h.grade_percent).toFixed(1)} %</span>{' '}
            {h.grade_percent > 0 ? 'de subida' : 'de bajada'} en <span className="num">{h.segment_m.toFixed(0)} m</span>
          </li>
        ))}
      </ul>
      <p className="marsmap-note">
        Las calculamos con las alturas oficiales de los puntos de paso, que están a 150 m o más uno de otro. Una
        pendiente más corta no aparece. En el mapa dejamos {HAZARD_MARGIN_KM * 1000} m de margen alrededor de cada
        una; si tu ruta pasa por ahí, el tramo se pinta en naranja. Fuente: puntos de paso de Mars 2020, NASA/JPL.
      </p>
    </div>
  )
}
