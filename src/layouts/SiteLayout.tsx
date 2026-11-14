import { Link, NavLink, Outlet } from 'react-router-dom'
import './site-layout.css'

const links = [
  { to: '/cielo', label: 'Cielo' },
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
        HECHO EN COCHABAMBA PARA EL NASA SPACE APPS CHALLENGE 2026
      </footer>
    </div>
  )
}
