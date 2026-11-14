import { Link } from 'react-router-dom'
import './section.css'
import './ClosingSection.css'

// El ejemplo usa el origen real del sitio, así el fragmento se puede copiar y
// funciona tal cual en cualquier despliegue (local, preview o producción).
const embedUrl = `${window.location.origin}${import.meta.env.BASE_URL}sky`
const snippet = `<iframe src="${embedUrl}" title="Ruta del Agua · visor del cielo" width="100%" height="600" loading="lazy"></iframe>`

export default function ClosingSection() {
  return (
    <section id="cierre" className="section" aria-labelledby="closing-title">
      <div className="section__inner closing">
        <h2 id="closing-title" className="section__title">Sigue el agua tú mismo</h2>
        <Link to="/sky" className="btn btn--primary">Abrir el visor</Link>

        <div className="closing__embed">
          <h3 className="closing__subtitle">Incrusta el visor</h3>
          <p className="closing__text">Copia este fragmento en tu página para mostrar el visor del cielo.</p>
          {/* tabIndex=0: un bloque con scroll horizontal debe poder enfocarse para
              desplazarlo con el teclado. */}
          <pre className="closing__code" tabIndex={0}><code>{snippet}</code></pre>
        </div>
      </div>
    </section>
  )
}
