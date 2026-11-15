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
      <h2 className="marsmap-panel-title">Tu ruta</h2>
      <p className="marsmap-note">
        Haz clic en el mapa para ir marcando puntos. Con el teclado, mueve el mapa con las flechas y usa «Agregar
        punto en el centro».
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
        Distancia: <span className="num">{points.length > 1 ? `${distanceKm.toFixed(1)} km` : '0 km'}</span>
      </p>
      <p className="marsmap-note">
        Medida en línea recta entre puntos sobre una esfera de 3389.5 km de radio, sin contar el relieve.
      </p>
      {blockedCount > 0 && (
        <p className="marsmap-warning" role="alert">
          {blockedCount === 1
            ? 'Un tramo de tu ruta pasa por una pendiente fuerte. Está pintado en naranja.'
            : `${blockedCount} tramos de tu ruta pasan por pendientes fuertes. Están pintados en naranja.`}
        </p>
      )}
      {points.length > 0 && (
        <ol className="marsmap-points">
          {points.map((p, i) => (
            <li key={i}>
              {pointName(i, points.length)} ·{' '}
              <span className="num">
                {p[0].toFixed(2)}°, {p[1].toFixed(2)}°
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
