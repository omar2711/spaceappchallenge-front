import './section.css'
import './CreditsSection.css'

// Los créditos de texturas se trasladan del visor original: la licencia
// CC BY 4.0 de Solar System Scope exige atribución visible.
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
              NASA/IPAC IRSA, Gaia DR3, NASA Moon Trek y Mars Trek,{' '}
              <a href="https://ssd.jpl.nasa.gov/horizons/">NASA/JPL Horizons</a>{' '}
              (posiciones heliocéntricas · eclíptica J2000).
            </dd>
          </div>
          <div>
            <dt>Texturas</dt>
            <dd>
              <a href="https://threejs.org/examples/textures/planets/">Tierra / Three.js</a>,{' '}
              <a href="https://svs.gsfc.nasa.gov/4720/">Luna / NASA</a>,{' '}
              <a href="https://www.solarsystemscope.com/textures/">Sol, planetas y anillos / Solar System Scope (CC BY 4.0)</a>.
              Orientación de las superficies ilustrativa.
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
