import { useMemo, useState } from 'react'
import './abandoned.css'
import { artifacts } from './data/artifacts'
import ArtifactCard from './components/ArtifactCard'
import FilterBar, { type Filter } from './components/FilterBar'

export default function AbandonedFeature() {
  const [filter, setFilter] = useState<Filter>('all')
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
          <li key={a.id}>
            <ArtifactCard artifact={a} />
          </li>
        ))}
      </ul>

      <p className="abandoned-credit">Datos: NASA (NSSDCA, science.nasa.gov, JPL). Fechas en UT.</p>
    </section>
  )
}
