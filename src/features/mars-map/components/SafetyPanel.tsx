import type { MarsWalk } from '../../../api/types'
import { terrainEs } from '../data/marswalk'

const TITLE: Record<string, string> = {
  environment: 'Radiación y clima',
  sand: 'Arena',
  slopes_boulders: 'Pendientes y rocas',
}

export default function SafetyPanel({ walk }: { walk: MarsWalk | null }) {
  return (
    <div className="marsmap-panel">
      <h2 className="marsmap-panel-title">Riesgos del terreno</h2>
      {walk ? (
        walk.hazards.terrain_context.map((t) => (
          <div key={t.type}>
            <h3 className="marsmap-subtitle">{TITLE[t.type] ?? t.type}</h3>
            <p className="marsmap-note">{terrainEs(t)}</p>
          </div>
        ))
      ) : (
        <p className="marsmap-note">Aparece cuando carga el recorrido.</p>
      )}
    </div>
  )
}
