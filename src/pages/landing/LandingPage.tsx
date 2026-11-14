import { Link } from 'react-router-dom'
import './landing.css'

const earthTexture = `${import.meta.env.BASE_URL}textures/tierra.jpg`

type Card = { title: string; text: string; to?: string }

const cards: Card[] = [
  { title: 'Cielo', text: 'Explora el sistema solar en 3D con posiciones reales de NASA/JPL Horizons.', to: '/cielo' },
  { title: 'Agua', text: 'Dónde está el agua en el cielo, en la Luna y en Marte.' },
  { title: 'Luna', text: 'Seguimos el agua en nuestro vecino más cercano.' },
  { title: 'Marte', text: 'Rastros de agua pasada y presente en el planeta rojo.' },
  { title: 'Local', text: 'Qué puedes observar desde tu propia ubicación.' },
]

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-header">
        <Link to="/" className="landing-brand">◉ &nbsp; Ruta del Agua</Link>
        <Link to="/cielo" className="landing-nav-link">Explorar cielo →</Link>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-text">
            <small className="landing-eyebrow">HERRAMIENTA WEB PÚBLICA · NASA SPACE APPS 2026</small>
            <h1 className="landing-title">Seguimos el agua, del cielo a la Luna y a Marte</h1>
            <p className="landing-lead">
              El telescopio espacial SPHEREx recorre el cielo completo una y otra vez. Visto como un
              video, sus imágenes sucesivas permiten detectar objetos que se mueven o cambian de brillo.
            </p>
            <div className="landing-actions">
              <Link to="/cielo" className="landing-btn landing-btn--primary">Explorar cielo</Link>
              <a href="#como" className="landing-btn landing-btn--secondary">Cómo funciona</a>
            </div>
          </div>
          <div className="landing-globe-wrap" aria-hidden="true">
            <div className="landing-globe" style={{ backgroundImage: `url(${earthTexture})` }} />
          </div>
        </section>

        <section id="como" className="landing-how">
          <small className="landing-eyebrow">CÓMO FUNCIONA</small>
          <div className="landing-cards">
            {cards.map(({ title, text, to }) => {
              const body = (
                <>
                  <span className="landing-card-tag">{to ? 'DISPONIBLE' : 'PRÓXIMAMENTE'}</span>
                  <h2 className="landing-card-title">{title}</h2>
                  <p className="landing-card-text">{text}</p>
                </>
              )
              return to
                ? <Link key={title} to={to} className="landing-card landing-card--link">{body}</Link>
                : <article key={title} className="landing-card landing-card--soon">{body}</article>
            })}
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        HECHO EN COCHABAMBA PARA EL NASA SPACE APPS CHALLENGE 2026
      </footer>
    </div>
  )
}
