import { KIND_LABEL, moonLayers } from '../data/layers'

export type LayerState = { on: boolean; opacity: number }

type Props = {
  state: Record<string, LayerState>
  onChange: (id: string, patch: Partial<LayerState>) => void
}

// Mismo panel que el de Marte, con las capas de la Luna. Se duplica en lugar de
// generalizar el de Marte para no editar el trabajo de /marte; si ambos se
// vuelven a tocar a menudo, conviene unificarlos en un componente compartido.
export default function LayerPanel({ state, onChange }: Props) {
  return (
    <fieldset className="moonmap-panel">
      <legend className="moonmap-panel-title">Capas</legend>
      {moonLayers.map((l) => (
        <div key={l.id} className="moonmap-layer">
          <label className="moonmap-check">
            <input
              type="checkbox"
              checked={state[l.id].on}
              onChange={(e) => onChange(l.id, { on: e.target.checked })}
            />
            <span>{l.title}</span>
          </label>
          <span className="moonmap-tag">{KIND_LABEL[l.kind]}</span>
          <label className="moonmap-range">
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
