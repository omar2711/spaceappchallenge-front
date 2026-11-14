import './section.css'
import './HowItWorksSection.css'

const steps = [
  { title: 'Datos abiertos de NASA', text: 'IRSA, Gaia DR3, Moon/Mars Trek.' },
  { title: 'Recortes y comparación', text: 'Recortes del cielo y comparación entre fechas.' },
  { title: 'Un visor para todos', text: 'Las coordenadas viajan en la URL.' },
]

export default function HowItWorksSection() {
  return (
    <section className="section" aria-labelledby="how-title">
      <div className="section__inner">
        <h2 id="how-title" className="section__title">Cómo funciona</h2>
        {/* <ol>: el orden de los pasos importa y los lectores de pantalla lo anuncian. */}
        <ol className="how__steps">
          {steps.map(step => (
            <li key={step.title} className="how__step">
              <h3 className="how__title">{step.title}</h3>
              <p className="how__text">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
