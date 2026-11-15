import type { MarsWalk } from '../../../api/types'
import { terrainEs } from '../data/marswalk'

const TITLE: Record<string, string> = {
  environment: 'Radiación y clima',
  sand: 'Movilidad: arena',
  slopes_boulders: 'Movilidad: pendientes y rocas',
}

export default function SafetyPanel({ walk }: { walk: MarsWalk | null }) {
  return (
    <div className="marsmap-panel">
      <h2 className="marsmap-panel-title">Seguridad de la misión</h2>
      {walk ? (
        walk.hazards.terrain_context.map((t) => (
          <div key={t.type}>
            <h3 className="marsmap-subtitle">{TITLE[t.type] ?? t.type}</h3>
            <p className="marsmap-note">{terrainEs(t)}</p>
          </div>
        ))
      ) : (
        <p className="marsmap-note">Se completa al cargar la caminata de Jezero.</p>
      )}
    </div>
  )
}
