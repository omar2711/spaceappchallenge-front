import { catalog, type View } from '../../data/bodies'
import './solar-system.css'

type Props = {
  view: View
  onGo: (view: View) => void
  // Si WebGL no está disponible mostramos un aviso en lugar de un lienzo vacío.
  error: boolean
}

// Controles del visor. Vive aparte de la escena para que cada página decida
// cuándo mostrarlos (en el hero solo aparecen en modo interactivo).
export default function SceneHud({ view, onGo, error }: Props) {
  return (
    <div className="hud">
      <div className="hud__top">
        <select className="hud__select" aria-label="Ir a un destino" value="" onChange={e => onGo(e.target.value as View)}>
          <option value="" disabled>Ir a un destino ↓</option>
          {catalog.map(([name]) => <option key={name}>{name}</option>)}
        </select>
      </div>
      {error && <p className="hud__error" role="alert">El visor requiere WebGL. Activa la aceleración gráfica para abrir el mapa.</p>}
      <div className="hud__bottom">
        <nav className="hud__nav" aria-label="Vistas del visor">
          {(['Sistema solar', 'Tierra', 'Luna', 'Marte', 'Vuelo libre'] as View[]).map(name =>
            <button key={name} aria-pressed={view === name} onClick={() => onGo(name)}>{name}</button>)}
        </nav>
        <div className="hud__meta"><span>14 NOV 2026 · 00:00 TDB</span></div>
      </div>
    </div>
  )
}
