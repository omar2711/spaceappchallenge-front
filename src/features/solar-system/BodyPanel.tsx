import { Link } from 'react-router-dom'
import positions from '../../positions.json'
import { bodyFacts, catalog, format, worlds, type View } from '../../data/bodies'
import './BodyPanel.css'

type Props = {
  view: View
  // Si se pasa, aparece un botón para cerrar el panel (en el hero, donde el
  // panel es una ventana emergente; en el modo interactivo siempre está visible).
  onClose?: () => void
}

// Panel de información del cuerpo activo. Tres casos:
//  - Luna / Marte: datos clave + qué se sabe del agua + enlace a su página.
//  - Resto de cuerpos: radio y distancia al Sol, como el visor original.
//  - Vistas sin cuerpo (Sistema solar, Vuelo libre): una pista de uso.
export default function BodyPanel({ view, onClose }: Props) {
  const body = catalog.find(([name]) => name === view)
  const info = body ? bodyFacts[body[0]] : undefined

  return (
    // aria-live: al tocar otro cuerpo, los lectores de pantalla anuncian el cambio.
    <aside className="panel" aria-label="Datos del cuerpo seleccionado" aria-live="polite">
      <div className="panel__head">
        <h2 className="panel__title">{view}</h2>
        {onClose && <button type="button" className="panel__close" onClick={onClose} aria-label="Cerrar panel">×</button>}
      </div>

      {info ? (
        <>
          <dl className="panel__facts">
            {info.facts.map(f => (
              <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>
            ))}
          </dl>
          <p className="panel__water"><strong>Agua · </strong>{info.water}</p>
          <Link to={worlds[info.world].path} className="btn btn--primary">{info.cta}</Link>
        </>
      ) : body ? (
        <dl className="panel__facts">
          <div><dt>Radio medio</dt><dd>{format(body[1])} km</dd></div>
          <div><dt>Distancia al Sol</dt><dd>{format(Math.hypot(...positions[body[0]]))} km</dd></div>
        </dl>
      ) : (
        <p className="panel__hint">
          {view === 'Vuelo libre' ? 'W/S para avanzar y retroceder · A/D para desplazarte' : 'Selecciona un cuerpo para acercarte'}
        </p>
      )}
    </aside>
  )
}
