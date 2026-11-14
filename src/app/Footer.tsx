import { Link } from 'react-router-dom'
import { repoUrl, teamName } from '../data/team'
import { worlds } from '../data/bodies'
import './footer.css'

// Vive en el Layout (no en la landing) para que todas las rutas, incluidas las
// páginas que otras personas implementan, terminen con los mismos créditos.
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <nav className="footer__nav" aria-label="Pie de página">
          <Link to="/">Inicio</Link>
          <Link to="/sky">Cielo</Link>
          <Link to={worlds.moon.path}>Luna</Link>
          <Link to={worlds.mars.path}>Marte</Link>
          <a href={repoUrl}>Repositorio</a>
        </nav>
        {/* Atribución mínima, también aquí: la licencia CC BY 4.0 de las texturas
            pide que se vea en el sitio, y el pie se ve en todas las páginas. */}
        <p className="footer__credits">
          Datos: NASA/IPAC IRSA, Gaia DR3, NASA Moon Trek y Mars Trek, NASA/JPL Horizons.
          Texturas: Three.js, NASA y Solar System Scope (CC BY 4.0).
        </p>
        <p className="footer__legal">NASA Space Apps Challenge 2026 · Equipo {teamName}</p>
      </div>
    </footer>
  )
}
