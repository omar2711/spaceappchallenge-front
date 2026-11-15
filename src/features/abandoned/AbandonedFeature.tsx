import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import './abandoned.css'
import { artifacts } from './data/artifacts'
import ArtifactCard from './components/ArtifactCard'
import FilterBar, { type Filter } from './components/FilterBar'

export default function AbandonedFeature() {
  const [filter, setFilter] = useState<Filter>('all')
  // Enlaces desde /luna (p. ej. /abandonados#apollo-12-lm): lleva la ficha a la vista y la resalta.
  const { hash } = useLocation()
  const target = decodeURIComponent(hash.slice(1))
  useEffect(() => {
    if (!target) return
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [target])
  const shown = useMemo(
    () => (filter === 'all' ? artifacts : artifacts.filter((a) => a.body === filter)),
    [filter],
  )

  return (
    <section className="abandoned">
      <header className="abandoned-intro">
        <small className="abandoned-eyebrow">DESAFÍO · ABANDONED BUT NOT FORGOTTEN</small>
        <h1 className="abandoned-title">Abandonados, pero no olvidados</h1>
        <p className="abandoned-lead">
          Aquí hay una selección de naves y equipo que la NASA dejó en la Luna, en Marte y más
          allá. Mira dónde quedaron y qué pasó con cada uno. Cada ficha enlaza a su fuente.
        </p>
      </header>

      <FilterBar value={filter} onChange={setFilter} shown={shown.length} total={artifacts.length} />

      <ul className="abandoned-list">
        {shown.map((a) => (
          <li key={a.id} id={a.id} className={a.id === target ? 'abandoned-item--target' : undefined}>
            <ArtifactCard artifact={a} />
          </li>
        ))}
      </ul>

      <p className="abandoned-credit">
        Datos: NASA (NSSDCA, science.nasa.gov, JPL). Fechas en UT.
        <br />
        Desafío oficial: Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment
        on the Moon and Mars
      </p>
    </section>
  )
}
