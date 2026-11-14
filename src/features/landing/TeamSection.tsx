import { members, repoUrl, teamName } from '../../data/team'
import './section.css'
import './TeamSection.css'

// Iniciales del primer nombre y del primer apellido (nombres compuestos como
// "Renny Mihail Salazar Ferrufino" → "RS"): en el avatar caben dos letras.
const initials = (full: string) => {
  const p = full.split(' ')
  return (p[0][0] + p[Math.floor(p.length / 2)][0]).toUpperCase()
}

// Sección sin --alt a propósito: sigue a "Por qué seguir el agua" (que sí es --alt)
// y dos bandas iguales seguidas se fundirían en un solo bloque, perdiendo el ritmo
// de fondos alternos. Sus tarjetas pasan a --surface para no desaparecer contra
// el fondo base.
export default function TeamSection() {
  return (
    <section id="equipo" className="section" aria-labelledby="team-title">
      <div className="section__inner">
        <h2 id="team-title" className="section__title">Equipo {teamName}</h2>
        <ul className="team__grid">
          {members.map(name => (
            <li key={name} className="team__card">
              {/* Avatar decorativo: el nombre ya está en el texto. */}
              <span className="team__avatar" aria-hidden="true">{initials(name)}</span>
              <span className="team__name">{name}</span>
            </li>
          ))}
        </ul>
        <a href={repoUrl} className="btn btn--ghost team__repo">Ver el repositorio en GitHub →</a>
      </div>
    </section>
  )
}
