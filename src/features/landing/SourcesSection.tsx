import './section.css'
import './SourcesSection.css'

// Solo texto y enlaces a la fuente oficial (sin logos de NASA, que tienen reglas
// de uso propias). Los enlaces deben revisarse antes de publicar: apuntan a las
// páginas principales de cada proyecto, no a un recurso concreto.
const sources = [
  { name: 'SPHEREx', line: 'Sensible a objetos ricos en hidrógeno, agua, CO₂ y CO.', href: 'https://spherex.caltech.edu/' },
  { name: 'Gaia', line: 'Su catálogo DR3 es la capa de referencia sobre el cielo.', href: 'https://www.cosmos.esa.int/web/gaia' },
  { name: 'Moon Trek / Mars Trek', line: 'Mapas de la Luna y de Marte de la NASA.', href: 'https://trek.nasa.gov/' },
  { name: 'Perseverance', line: 'Explora el cráter Jezero, de ≈45 km de ancho.', href: 'https://science.nasa.gov/mission/mars-2020-perseverance/' },
]

export default function SourcesSection() {
  return (
    <section id="datos" className="section section--alt" aria-labelledby="sources-title">
      <div className="section__inner">
        <h2 id="sources-title" className="section__title">Datos y misiones</h2>
        <ul className="sources__grid">
          {sources.map(s => (
            <li key={s.name} className="sources__card">
              <h3 className="sources__name">{s.name}</h3>
              <p className="sources__line">{s.line}</p>
              {/* El nombre accesible incluye el destino: "Fuente" a secas, repetido
                  cuatro veces, no le diría nada a quien navega por enlaces. */}
              <a href={s.href} className="sources__link" aria-label={`Fuente de ${s.name}`}>Fuente →</a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
