import { Link, NavLink, Outlet } from 'react-router-dom'
import './site-layout.css'

const links = [
  { to: '/cielo', label: 'Cielo' },
  { to: '/luna', label: 'Luna' },
  { to: '/marte', label: 'Marte' },
  { to: '/abandonados', label: 'Abandonados' },
  { to: '/sistema-solar', label: 'Sistema solar' },
]

export default function SiteLayout() {
  return (
    <div className="site">
      <header className="site-header">
        <Link to="/" className="site-brand">◉ &nbsp; Ruta del Agua</Link>
        <nav className="site-nav" aria-label="Principal">
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to}>{label}</NavLink>
          ))}
        </nav>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        {/* Atribución en el pie común (visible en todas las rutas): la licencia
            CC BY 4.0 de las texturas de Solar System Scope exige que se vea. */}
        <p className="site-credits">
          Datos: NASA/IPAC IRSA, Gaia DR3, NASA Moon Trek y Mars Trek, NASA/JPL Horizons.
          Texturas: Three.js, NASA y Solar System Scope (CC BY 4.0).
        </p>
        HECHO EN COCHABAMBA PARA EL NASA SPACE APPS CHALLENGE 2026
      </footer>
    </div>
  )
}
