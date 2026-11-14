import { Link } from 'react-router-dom'
import { worlds } from '../../data/bodies'
import './section.css'
import './WorldsSection.css'

// Las tarjetas son <Link> completos (toda la tarjeta es clicable y un solo
// elemento enfocable), en vez de un título con un botón suelto dentro.
const cards = [
  { to: '/sky', title: 'Cielo', text: 'Sigue en el cielo los objetos ricos en agua que detecta SPHEREx.' },
  { to: worlds.moon.path, title: worlds.moon.name, text: 'Descubre dónde aterrizar siguiendo el agua.' },
  { to: worlds.mars.path, title: worlds.mars.name, text: 'Busca dónde pudo haber vida pasada.' },
]

export default function WorldsSection() {
  return (
    <section id="tres-mundos" className="section" aria-labelledby="worlds-title">
      <div className="section__inner">
        <h2 id="worlds-title" className="section__title">Tres mundos, un solo hilo</h2>
        <ul className="worlds__grid">
          {cards.map(card => (
            <li key={card.to}>
              <Link to={card.to} className="worlds__card">
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
