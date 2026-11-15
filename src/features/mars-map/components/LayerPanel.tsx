import { KIND_LABEL, marsLayers } from '../data/layers'

export type LayerState = { on: boolean; opacity: number }

type Props = {
  state: Record<string, LayerState>
  onChange: (id: string, patch: Partial<LayerState>) => void
}

export default function LayerPanel({ state, onChange }: Props) {
  return (
    <fieldset className="marsmap-panel">
      <legend className="marsmap-panel-title">Capas</legend>
      {marsLayers.map((l) => (
        <div key={l.id} className="marsmap-layer">
          <label className="marsmap-check">
            <input
              type="checkbox"
              checked={state[l.id].on}
              onChange={(e) => onChange(l.id, { on: e.target.checked })}
            />
            <span>{l.title}</span>
          </label>
          <span className="marsmap-tag">{KIND_LABEL[l.kind]}</span>
          <label className="marsmap-range">
            <span>
              Opacidad <span className="num">{Math.round(state[l.id].opacity * 100)} %</span>
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={state[l.id].opacity}
              disabled={!state[l.id].on}
              aria-label={`Opacidad de ${l.title}`}
              onChange={(e) => onChange(l.id, { opacity: Number(e.target.value) })}
            />
          </label>
        </div>
      ))}
    </fieldset>
  )
}
