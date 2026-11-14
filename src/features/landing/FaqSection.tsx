import './section.css'
import './FaqSection.css'

// Respuestas construidas solo con lo que el proyecto ya afirma (cifras de SPHEREx
// del equipo y el hilo del agua); revisar con el equipo antes de publicar.
const faqs = [
  {
    q: '¿Qué es SPHEREx?',
    a: 'Un telescopio espacial de la NASA que mide la luz infrarroja del cielo en 102 bandas, de 0.75 a 5.0 µm. Es especialmente sensible a objetos ricos en hidrógeno, agua, CO₂ y CO.',
  },
  {
    q: '¿Qué es un espectro?',
    a: 'La luz de un objeto repartida por longitudes de onda. Cada banda aporta un punto; las huellas del agua, el CO₂ o el CO aparecen como cambios en bandas concretas.',
  },
  {
    q: '¿Por qué el agua?',
    a: 'Porque esa pista decide dónde aterrizar en la Luna y dónde buscar vida pasada en Marte.',
  },
  {
    q: '¿Qué es el campo de visión?',
    a: 'El tamaño de la región del cielo que se ve en el recorte. En el visor se puede ajustar para acercarse a un objeto o ver su entorno.',
  },
]

export default function FaqSection() {
  return (
    <section id="faq" className="section" aria-labelledby="faq-title">
      <div className="section__inner">
        <h2 id="faq-title" className="section__title">Preguntas frecuentes</h2>
        {/* <details>/<summary> nativos: teclado (Enter/Espacio), estado expandido
            y lectores de pantalla funcionan sin JavaScript ni ARIA manual, que es
            la forma más fiable de hacer un desplegable accesible. */}
        <div className="faq__list">
          {faqs.map(f => (
            <details key={f.q} className="faq__item">
              <summary className="faq__q">{f.q}</summary>
              <p className="faq__a">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
