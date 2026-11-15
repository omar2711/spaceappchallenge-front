import { Link } from 'react-router-dom'
import './landing.css'

const earthTexture = `${import.meta.env.BASE_URL}textures/tierra.jpg`

type Card = { title: string; label: string; text: string; to: string }

const cards: Card[] = [
  {
    title: 'Cielo SPHEREx',
    label: 'PLANET X AND SPHEREX',
    text: 'Mira un parche de cielo como un video y detecta objetos en movimiento.',
    to: '/cielo',
  },
  {
    title: 'Mapa de Marte',
    label: 'INTERPLANETARY SURVIVAL GUIDE: MARTIAN MAP',
    text: 'Un mapa con capas de datos y una ruta segura para un astronauta.',
    to: '/marte',
  },
  {
    title: 'Abandonados',
    label: 'ABANDONED BUT NOT FORGOTTEN',
    text: 'Historias sobre el equipo que la NASA dejó en la Luna y Marte.',
    to: '/abandonados',
  },
  {
    title: 'Sistema solar 3D',
    label: 'EXPLORADOR 3D',
    text: 'Recorre el sistema solar con posiciones reales de NASA/JPL Horizons.',
    to: '/sistema-solar',
  },
]

export default function LandingPage() {
  return (
    <div className="landing">
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
          {cards.map(({ title, label, text, to }) => (
            <Link key={to} to={to} className="landing-card">
              <span className="landing-card-tag">{label}</span>
              <h2 className="landing-card-title">{title}</h2>
              <p className="landing-card-text">{text}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
