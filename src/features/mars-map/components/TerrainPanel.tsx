import type { MarsWalk } from '../../../api/types'
import { haversineKm, type LatLng } from '../lib/route'
import { stopEs } from '../data/marswalk'

function terrainAt(center: LatLng, walk: MarsWalk) {
  const grades: number[] = []
  const points = walk.route.points
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i]
    const start: LatLng = [a.lat, a.lon], end: LatLng = [b.lat, b.lon]
    if (haversineKm(center, start) > 0.5 || haversineKm(center, end) > 0.5) continue
    const meters = haversineKm(start, end) * 1000
    if (meters > 0) grades.push(100 * Math.abs(b.elevation_m - a.elevation_m) / meters)
  }
  return grades.length ? { maximum: Math.max(...grades), count: grades.length } : null
}

export default function TerrainPanel({ walk, onStop }: { walk: MarsWalk; onStop: (id: string) => void }) {
  const rows = walk.stops.map(stop => ({ stop, terrain: terrainAt([stop.lat, stop.lon], walk) }))
    .sort((a, b) => (a.terrain?.maximum ?? Infinity) - (b.terrain?.maximum ?? Infinity))
  return <section className="marsmap-panel">
    <h2 className="marsmap-panel-title">Dónde estudiar un aterrizaje en Jezero</h2>
    <p>La primera fila con datos tiene la menor pendiente máxima estimada a lo largo de la ruta. Un tramo más llano merece un estudio de terreno más detallado.</p>
    <table><caption>Relieve en un radio de 500 m</caption>
      <thead><tr><th>Lugar</th><th>Máxima</th><th>Tramos</th></tr></thead>
      <tbody>{rows.map(({ stop, terrain }) => <tr key={stop.id}>
        <th scope="row"><button className="marsmap-btn" onClick={() => onStop(stop.id)}>{stopEs(stop).title}</button>
          <small>{stop.id === 'landing' ? 'Aterrizaje histórico' : 'Lugar de estudio'}</small></th>
        <td>{terrain ? terrain.maximum.toFixed(1) + ' %' : 'Sin datos'}</td><td>{terrain?.count ?? 0}</td>
      </tr>)}</tbody>
    </table>
    <p className="marsmap-note">Para cada par de puntos consecutivos dentro del radio, dividimos el desnivel absoluto por la distancia horizontal. La ruta simplificada puede ocultar pendientes cortas. Faltan mediciones de rocas, arena y relieve en toda la elipse de aterrizaje para evaluar la seguridad.</p>
    <a href={walk.sources.waypoints} target="_blank" rel="noreferrer">Posiciones y elevaciones de Perseverance · NASA/JPL</a>
  </section>
}
