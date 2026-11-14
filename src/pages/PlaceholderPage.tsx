import { Link } from 'react-router-dom'
import './placeholder.css'

// building=false reutiliza el mismo diseño para errores (404) sin el aviso "En construcción".
type Props = { title: string; description?: string; building?: boolean }

// Plantilla común de las páginas que otras personas del equipo implementarán.
// Mantenerla compartida garantiza que, mientras no estén listas, todas se vean
// coherentes y ninguna ruta del menú termine en una pantalla en blanco.
export default function PlaceholderPage({ title, description, building = true }: Props) {
  return (
    <section className="placeholder">
      <h1>{title}</h1>
      {building && <p className="placeholder__badge" role="status">En construcción</p>}
      {description && <p className="placeholder__text">{description}</p>}
      <Link to="/" className="placeholder__back">← Volver al inicio</Link>
    </section>
  )
}
