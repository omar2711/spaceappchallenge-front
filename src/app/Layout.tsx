import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { worlds } from '../data/bodies'
import Footer from './Footer'
import './layout.css'

// Layout común: barra superior + el contenido de la ruta en <Outlet/>.
export default function Layout() {
  const { pathname } = useLocation()

  // React Router no devuelve el scroll arriba al cambiar de ruta (el navegador
  // solo lo hace en cargas completas). Sin esto, entrar a /sky desde el final
  // de la landing abriría la página a mitad de scroll.
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  return (
    <>
      <header className="topbar">
        <Link to="/" className="topbar__logo"><span aria-hidden="true">◉</span>Ruta del Agua</Link>
        <nav className="topbar__nav" aria-label="Principal">
          <NavLink to="/sky" className="topbar__link">Cielo</NavLink>
          <NavLink to={worlds.moon.path} className="topbar__link">Luna</NavLink>
          <NavLink to={worlds.mars.path} className="topbar__link">Marte</NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
