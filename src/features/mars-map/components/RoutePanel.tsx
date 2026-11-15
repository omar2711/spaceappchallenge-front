import type { LatLng } from '../lib/route'

type Props = {
  points: LatLng[]
  distanceKm: number
  blockedCount: number // número de tramos que cruzan un obstáculo
  onAddCenter: () => void
  onUndo: () => void
  onClear: () => void
}

const pointName = (i: number, n: number) =>
  i === 0 ? 'Inicio' : i === n - 1 ? 'Destino' : `Punto ${i + 1}`

export default function RoutePanel({
  points,
  distanceKm,
  blockedCount,
  onAddCenter,
  onUndo,
  onClear,
}: Props) {
  return (
    <div className="marsmap-panel">
      <h2 className="marsmap-panel-title">Ruta</h2>
      <p className="marsmap-note">
        Haz clic en el mapa para marcar inicio, puntos intermedios y destino. Con teclado, mueve el
        mapa con las flechas y usa «Agregar punto en el centro».
      </p>
      <div className="marsmap-actions">
        <button type="button" className="marsmap-btn" onClick={onAddCenter}>
          Agregar punto en el centro
        </button>
        <button type="button" className="marsmap-btn" onClick={onUndo} disabled={!points.length}>
          Deshacer último
        </button>
        <button type="button" className="marsmap-btn" onClick={onClear} disabled={!points.length}>
          Limpiar ruta
        </button>
      </div>
      <p className="marsmap-distance" aria-live="polite">
        Distancia total: {points.length > 1 ? `${distanceKm.toFixed(1)} km` : '—'}
      </p>
      <p className="marsmap-note">
        En línea recta entre puntos, sobre una esfera de 3389.5 km de radio; no considera el relieve.
      </p>
      {blockedCount > 0 && (
        <p className="marsmap-warning" role="alert">
          {blockedCount === 1
            ? '⚠ 1 tramo de la ruta pasa por una pendiente fuerte medida en Jezero. Se resalta en rojo.'
            : `⚠ ${blockedCount} tramos de la ruta pasan por pendientes fuertes medidas en Jezero. Se resaltan en rojo.`}
        </p>
      )}
      {points.length > 0 && (
        <ol className="marsmap-points">
          {points.map((p, i) => (
            <li key={i}>
              {pointName(i, points.length)} · {p[0].toFixed(2)}°, {p[1].toFixed(2)}°
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
