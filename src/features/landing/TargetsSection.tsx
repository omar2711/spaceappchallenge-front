import { Link } from 'react-router-dom'
import { targets } from '../../data/targets'
import './section.css'
import './TargetsSection.css'

export default function TargetsSection() {
  return (
    <section id="objetivos" className="section section--alt" aria-labelledby="targets-title">
      <div className="section__inner">
        <h2 id="targets-title" className="section__title">Prueba con un objetivo oficial</h2>
        {/* Cada objetivo es un <Link> real a /sky?target=<id>: abrir el visor ya
            enfocado en él es un clic, y el enlace se puede copiar y compartir. */}
        <ul className="targets__list">
          {targets.map(t => (
            <li key={t.id}>
              <Link to={`/sky?target=${t.id}`} className="btn btn--ghost">{t.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
