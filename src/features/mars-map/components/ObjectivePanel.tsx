import { objectives, type Objective } from '../data/objectives'

type Props = { selected: Objective | null; onSelect: (o: Objective | null) => void }

export default function ObjectivePanel({ selected, onSelect }: Props) {
  return (
    <div className="marsmap-panel">
      <label className="marsmap-panel-title" htmlFor="marsmap-objective">
        Objetivo científico y lugar
      </label>
      <select
        id="marsmap-objective"
        className="marsmap-select"
        value={selected?.id ?? ''}
        onChange={(e) => onSelect(objectives.find((o) => o.id === e.target.value) ?? null)}
      >
        <option value="">Elige un objetivo…</option>
        {objectives.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
      {selected && (
        <p className="marsmap-note">
          <span className="marsmap-tag">DATOS DE EJEMPLO</span>
          <br />
          {selected.goal} · Lugar: {selected.place} · Lat {selected.center[0]}°, Lon{' '}
          {selected.center[1]}°
        </p>
      )}
    </div>
  )
}
