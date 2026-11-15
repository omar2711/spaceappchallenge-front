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
        Objetivo científico y lugar
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
        <option value="">{walk ? 'Elige un objetivo…' : 'Cargando la caminata…'}</option>
        {walk && <option value={WALK}>Seguir el agua · cráter {walk.crater.name} (Perseverance)</option>}
      </select>
      {walkSelected && walk && (
        <p className="marsmap-note">
          Buscar rocas que el agua alteró o depositó, siguiendo la ruta real de Perseverance · Lugar: cráter{' '}
          {walk.crater.name} ({walk.crater.diameter_km} km) · Lat {walk.crater.lat.toFixed(2)}°, Lon{' '}
          {walk.crater.lon.toFixed(2)}°
        </p>
      )}
    </div>
  )
}
