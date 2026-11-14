import './section.css'
import './CreditsSection.css'

// Los créditos de texturas se trasladan del visor original: la licencia
// CC BY 4.0 de Solar System Scope exige atribución visible.
// Cada enlace va en su propia línea (lista) y no incrustado en un párrafo:
// así cada uno tiene un objetivo táctil de 44px en vez de 16px de texto en línea.
export default function CreditsSection() {
  return (
    <section id="creditos" className="section section--alt section--compact" aria-labelledby="credits-title">
      <div className="section__inner">
        <h2 id="credits-title" className="section__title">Créditos</h2>
        {/* Tres columnas (Equipo / Datos / Texturas): los créditos son consulta,
            no lectura; en columnas ocupan una fracción de la altura anterior. */}
        <dl className="credits__list">
          <div>
            <dt>Equipo</dt>
            <dd>SPECTRIA</dd>
          </div>
          <div>
            <dt>Datos</dt>
            <dd>
              <ul className="credits__links">
                <li>NASA/IPAC IRSA</li>
                <li>Gaia DR3</li>
                <li>NASA Moon Trek y Mars Trek</li>
                <li>
                  <a href="https://ssd.jpl.nasa.gov/horizons/">NASA/JPL Horizons</a>
                </li>
              </ul>
              <p className="credits__note">Posiciones heliocéntricas · eclíptica J2000.</p>
            </dd>
          </div>
          <div>
            <dt>Texturas</dt>
            <dd>
              <ul className="credits__links">
                <li><a href="https://threejs.org/examples/textures/planets/">Tierra / Three.js</a></li>
                <li><a href="https://svs.gsfc.nasa.gov/4720/">Luna / NASA</a></li>
                <li><a href="https://www.solarsystemscope.com/textures/">Sol, planetas y anillos / Solar System Scope (CC BY 4.0)</a></li>
              </ul>
              <p className="credits__note">Orientación de las superficies ilustrativa.</p>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
