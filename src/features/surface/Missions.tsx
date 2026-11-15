import { missionPositions as positions } from './missionPositions'
import { CircleMarker, Tooltip } from 'react-leaflet'
import { artifacts, type Artifact } from '../abandoned/data/artifacts'

type Surface = 'mars' | 'moon'
type Props = {
  body: Surface
  selected: Artifact | null
  onSelect: (item: Artifact) => void
}

export function MissionMarkers({ body, selected, onSelect }: Props) {
  return artifacts.filter(a => a.body === body).map(a => {
    const position = positions[a.id]
    if (!position) return null
    return <CircleMarker key={a.id} center={position} radius={selected?.id === a.id ? 12 : 9}
      pathOptions={{ color: '#d0d0d0', weight: 2, fillOpacity: 0.08 }}
      bubblingMouseEvents={false} eventHandlers={{ click: () => onSelect(a) }}>
      <Tooltip>{a.name} · aterrizaje histórico</Tooltip>
    </CircleMarker>
  })
}

export function MissionPanel({ body, selected, onSelect }: Props) {
  const prefix = body === 'mars' ? 'marsmap' : 'moonmap'
  return <section className={prefix + '-panel'}>
    <h2 className={prefix + '-panel-title'}>Misiones y equipo en la superficie</h2>
    <p className={prefix + '-note'}>Los anillos grises señalan aterrizajes históricos. Los vehículos móviles pudieron terminar su misión en otro lugar.</p>
    <label>Consultar misión <select value={selected?.id ?? ''} onChange={e => {
      const item = artifacts.find(a => a.id === e.target.value)
      if (item) onSelect(item)
    }}>
      <option disabled value="">Elige una misión</option>
      {artifacts.filter(a => a.body === body).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
    </select></label>
    {selected && <div aria-live="polite">
      <h3>{selected.name}</h3>
      <p>{selected.place} · {selected.sortDate}</p>
      <p>{positions[selected.id] ? selected.coords : 'La ficha local identifica la región, sin coordenadas para un marcador.'}</p>
      <p>{selected.status}</p><p>{selected.whatHappened}</p>
      <a href={selected.sourceUrl} target="_blank" rel="noreferrer">Ficha de misión de NASA</a>
    </div>}
  </section>
}
