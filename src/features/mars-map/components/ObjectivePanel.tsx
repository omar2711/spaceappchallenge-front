import type { MarsWalk } from '../../../api/types'

type Props = {
  walk: MarsWalk | null
  walkSelected: boolean
  onWalk: () => void
}

const WALK = 'jezero'

export default function ObjectivePanel({ walk, walkSelected, onWalk }: Props) {
  return (
    <div className="marsmap-panel">
      <label className="marsmap-panel-title" htmlFor="marsmap-objective">
        Lugar
      </label>
      <select
        id="marsmap-objective"
        className="marsmap-select"
        value={walkSelected ? WALK : ''}
        disabled={!walk}
        onChange={(e) => {
          if (e.target.value === WALK) onWalk()
        }}
      >
        <option value="">{walk ? 'Elige un lugar…' : 'Cargando el recorrido…'}</option>
        {walk && <option value={WALK}>Cráter {walk.crater.name} (Perseverance)</option>}
      </select>
      {walkSelected && walk && (
        <p className="marsmap-note">
          Buscamos rocas que el agua cambió o dejó, siguiendo el camino real de Perseverance. Cráter{' '}
          {walk.crater.name}, de <span className="num">{walk.crater.diameter_km} km</span>, en{' '}
          <span className="num">
            {walk.crater.lat.toFixed(2)}° N, {walk.crater.lon.toFixed(2)}° E
          </span>
          .
        </p>
      )}
    </div>
  )
}
