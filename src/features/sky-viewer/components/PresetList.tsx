import { useEffect, useState } from 'react'
import { getSkyTargets, type SkyTarget } from '../../../api/sky'

export default function PresetList({ onPick }: { onPick: (p: SkyTarget) => void }) {
  const [targets, setTargets] = useState<SkyTarget[]>([])
  const [error, setError] = useState(false)
  useEffect(() => {
    let active = true
    getSkyTargets().then(t => { if (active) setTargets(t) }).catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [])
  return <div className="skyviewer-panel">
    <h2 className="skyviewer-panel-title">OBSERVACIONES REALES</h2>
    <ul className="skyviewer-presets">{targets.map(p => <li key={p.id}>
      <button type="button" className="skyviewer-btn" onClick={() => onPick(p)}>{p.name}</button>
    </li>)}</ul>
    <p className="skyviewer-note" role="status">{error ? 'No se pudo cargar el catálogo. Recarga la página para reintentar.' : targets.length ? 'Selecciona un objetivo para abrir sus pasadas SPHEREx.' : 'Cargando catálogo…'}</p>
  </div>
}
