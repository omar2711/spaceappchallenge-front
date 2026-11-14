import { Link } from 'react-router-dom'
import { worlds } from '../../data/bodies'
import './section.css'
import './WorldsSection.css'

// Ilustraciones decorativas hechas con CSS/SVG (sin imágenes que descargar ni
// licenciar): pesan 0 kB y heredan los tokens de color.
function SkyArt() {
  return (
    <svg className="art art--sky" viewBox="0 0 160 90" aria-hidden="true" focusable="false">
      {/* Estrellas de tres tamaños: da profundidad sin recurrir a un patrón repetido. */}
      <g className="art__star">
        <circle cx="14" cy="18" r="1.4" /><circle cx="46" cy="64" r="1" /><circle cx="70" cy="14" r="1.8" />
        <circle cx="102" cy="72" r="1.2" /><circle cx="128" cy="22" r="1.6" /><circle cx="148" cy="60" r="1" />
        <circle cx="30" cy="42" r="1" /><circle cx="88" cy="48" r="1.2" /><circle cx="118" cy="46" r="1" />
      </g>
      {/* Flecha: indica el objetivo que se sigue en el cielo. */}
      <path className="art__arrow" d="M40 70 L112 30 M112 30 L98 30 M112 30 L108 43" />
    </svg>
  )
}

const cards = [
  {
    to: '/sky', title: 'Cielo', tag: 'Principal', art: <SkyArt />,
    text: 'Objetos ricos en agua que detecta SPHEREx, con espectros y comparación entre fechas.',
  },
  {
    to: worlds.moon.path, title: worlds.moon.name, tag: 'Dónde aterrizar', art: <div className="art art--moon" aria-hidden="true" />,
    text: 'Hielo en cráteres del polo sur que nunca reciben luz solar: ahí se decide dónde aterrizar.',
  },
  {
    to: worlds.mars.path, title: worlds.mars.name, tag: 'Dónde caminar', art: <div className="art art--mars" aria-hidden="true" />,
    text: 'Depósitos de un delta donde un río desembocaba en un lago: pista de vida pasada.',
  },
]

export default function WorldsSection() {
  return (
    <section id="tres-mundos" className="section" aria-labelledby="worlds-title">
      <div className="section__inner">
        <h2 id="worlds-title" className="section__title">Tres mundos, un solo hilo</h2>
        <ul className="worlds__grid">
          {cards.map(card => (
            <li key={card.to}>
              {/* Toda la tarjeta es un <Link> (un solo elemento enfocable), no un
                  título con un botón suelto. La etiqueta va dentro del enlace: es
                  parte de su nombre accesible ("Cielo, Principal"). */}
              <Link to={card.to} className="worlds__card">
                <div className="worlds__art">{card.art}</div>
                <span className="worlds__tag">{card.tag}</span>
                <h3 className="worlds__name">{card.title}</h3>
                <p className="worlds__text">{card.text}</p>
                <span className="worlds__cta">Explorar →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
