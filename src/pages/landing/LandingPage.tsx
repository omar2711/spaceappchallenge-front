import { Link } from 'react-router-dom'
import './landing.css'

const earthTexture = `${import.meta.env.BASE_URL}textures/tierra.jpg`

// label: nombre del reto de Space Apps al que responde cada sección.
type Card = { title: string; label: string; text: string; to: string }

const cards: Card[] = [
  {
    title: 'Cielo SPHEREx',
    label: 'Planet X and SPHEREx',
    text: 'Elige un objeto o unas coordenadas y pasa sus imágenes de SPHEREx una tras otra para ver qué se mueve. También puedes ver su espectro.',
    to: '/cielo',
  },
  {
    title: 'Mapa de la Luna',
    label: 'Lunar Landing Site Navigator',
    text: 'Compara los sitios de aterrizaje del polo sur con los de Apollo: cuántas horas tienen Sol y cuántas ven la Tierra.',
    to: '/luna',
  },
  {
    title: 'Mapa de Marte',
    label: 'Interplanetary Survival Guide: Martian Map',
    text: 'Sigue el recorrido de Perseverance por el cráter Jezero, con sus paradas y las pendientes más fuertes.',
    to: '/marte',
  },
  {
    title: 'Hielo en el cielo',
    label: 'SPLICES y 3I/ATLAS',
    text: 'Dónde busca SPHEREx hielo de agua y qué vio en el cometa interestelar 3I/ATLAS.',
    to: '/hielo',
  },
  {
    title: 'Abandonados',
    label: 'Abandoned but Not Forgotten',
    text: 'El equipo que la NASA dejó en la Luna y en Marte, y qué pasó con cada pieza.',
    to: '/abandonados',
  },
  {
    title: 'Sistema solar 3D',
    label: 'Posiciones de JPL Horizons',
    text: 'Los planetas en el lugar donde están el 14 de noviembre de 2026.',
    to: '/sistema-solar',
  },
]

export default function LandingPage() {
  return (
    <div className="landing">
      <section className="landing-hero">
        <div className="landing-hero-text">
          <h1 className="landing-title">Ruta del Agua</h1>
          <p className="landing-lead">
            SPHEREx fotografía todo el cielo cada seis meses. Aquí puedes pasar esas fotos una tras otra para
            encontrar lo que se movió o cambió de brillo, y ver en el espectro de qué está hecho cada objeto.
            Después seguimos el agua hasta la Luna y Marte.
          </p>
          <div className="landing-actions">
            <Link to="/cielo" className="landing-btn landing-btn--primary">Abrir el visor del cielo</Link>
            <a href="#como" className="landing-btn landing-btn--secondary">Ver las secciones</a>
          </div>
        </div>
        <div className="landing-globe-wrap" aria-hidden="true">
          <div className="landing-globe" style={{ backgroundImage: `url(${earthTexture})` }} />
        </div>
      </section>

      <section id="como" className="landing-how">
        <h2 className="landing-section-title">Secciones</h2>
        <div className="landing-cards">
          {cards.map(({ title, label, text, to }) => (
            <Link key={to} to={to} className="landing-card">
              <h3 className="landing-card-title">{title}</h3>
              <p className="landing-card-text">{text}</p>
              <span className="landing-card-tag">Reto: {label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
