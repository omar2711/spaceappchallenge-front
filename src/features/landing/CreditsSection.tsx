import './section.css'
import './CreditsSection.css'

// Los créditos de texturas se trasladan del visor original: la licencia
// CC BY 4.0 de Solar System Scope exige atribución visible.
// Cada enlace va en su propia línea (lista) y no incrustado en un párrafo:
// así cada uno tiene un objetivo táctil de 44px en vez de 16px de texto en línea.
export default function CreditsSection() {
  return (
    <section className="section section--alt" aria-labelledby="credits-title">
      <div className="section__inner">
        <h2 id="credits-title" className="section__title">Créditos</h2>
        <dl className="credits__list">
          <div>
            <dt>Equipo</dt>
            {/* PLACEHOLDER: reemplazar por el nombre real del equipo. */}
            <dd>[NOMBRE DEL EQUIPO]</dd>
          </div>
          <div>
            <dt>Datos</dt>
            <dd>
              <ul className="credits__links">
                <li>NASA/IPAC IRSA</li>
                <li>Gaia DR3</li>
                <li>NASA Moon Trek y Mars Trek</li>
                <li>
                  <a href="https://ssd.jpl.nasa.gov/horizons/">NASA/JPL Horizons</a> · posiciones heliocéntricas, eclíptica J2000
                </li>
              </ul>
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
