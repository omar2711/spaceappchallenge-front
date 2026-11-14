import './section.css'
import './WhyWaterSection.css'

// Los cuatro rastros que SPHEREx distingue bien (texto del equipo, sin cifras añadidas).
const traces = ['Hidrógeno', 'Agua', 'CO₂', 'CO']

export default function WhyWaterSection() {
  return (
    <section className="section section--alt" aria-labelledby="why-title">
      <div className="section__inner">
        <h2 id="why-title" className="section__title">Por qué seguir el agua</h2>
        <p className="section__lead">
          SPHEREx es especialmente sensible a objetos ricos en hidrógeno, agua, CO₂ y CO.
          Esa pista decide dónde aterrizar en la Luna y dónde buscar vida pasada en Marte.
        </p>
        <ul className="why__traces" aria-label="Rastros que detecta SPHEREx">
          {traces.map(t => <li key={t} className="why__trace">{t}</li>)}
        </ul>
      </div>
    </section>
  )
}
