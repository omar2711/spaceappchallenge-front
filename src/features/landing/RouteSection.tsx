import './section.css'
import './RouteSection.css'

// Una frase por parada, tomada del hilo del proyecto (SPHEREx → Luna → Marte).
const stops = [
  { name: 'Cielo', text: 'SPHEREx marca dónde hay agua, CO₂ y CO.' },
  { name: 'Luna', text: 'Esa pista decide dónde aterrizar.' },
  { name: 'Marte', text: 'Y dónde buscar vida pasada.' },
]

export default function RouteSection() {
  return (
    <section id="ruta-del-agua" className="section" aria-labelledby="route-title">
      <div className="section__inner">
        <h2 id="route-title" className="section__title">La ruta del agua</h2>
        {/* <ol>: el orden Cielo → Luna → Marte ES el mensaje. La línea y las flechas
            son solo decoración CSS; el orden lo transmite la propia lista. */}
        <ol className="route__stops">
          {stops.map(stop => (
            <li key={stop.name} className="route__stop">
              <span className="route__dot" aria-hidden="true" />
              <h3 className="route__name">{stop.name}</h3>
              <p className="route__text">{stop.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
