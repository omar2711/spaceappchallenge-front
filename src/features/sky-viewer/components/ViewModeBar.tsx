export type ViewMode = 'normal' | 'blink' | 'diff'

const modes: { value: ViewMode; label: string; help: string }[] = [
  { value: 'normal', label: 'Normal', help: 'Las imágenes en orden, como un video.' },
  { value: 'blink', label: 'Blink (A/B)', help: 'Alterna entre dos frames: lo que se mueve «salta».' },
  { value: 'diff', label: 'Diferencia', help: 'Resalta lo que cambió respecto al frame anterior.' },
]

type Props = {
  mode: ViewMode
  onModeChange: (m: ViewMode) => void
  count: number
  blinkA: number
  blinkB: number
  onBlinkChange: (a: number, b: number) => void
}

export default function ViewModeBar({ mode, onModeChange, count, blinkA, blinkB, onBlinkChange }: Props) {
  const current = modes.find((m) => m.value === mode)
  const options = Array.from({ length: count }, (_, i) => (
    <option key={i} value={i}>
      {i + 1}
    </option>
  ))

  return (
    <div className="skyviewer-modebar">
      <div role="group" aria-label="Modo de vista" className="skyviewer-modes">
        {modes.map((m) => (
          <button
            key={m.value}
            type="button"
            className="skyviewer-mode"
            aria-pressed={mode === m.value}
            onClick={() => onModeChange(m.value)}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="skyviewer-note">{current?.help}</p>
      {mode === 'blink' && (
        <div className="skyviewer-blink">
          <label className="skyviewer-inline">
            Frame A
            <select
              className="skyviewer-select"
              value={blinkA}
              onChange={(e) => onBlinkChange(Number(e.target.value), blinkB)}
            >
              {options}
            </select>
          </label>
          <label className="skyviewer-inline">
            Frame B
            <select
              className="skyviewer-select"
              value={blinkB}
              onChange={(e) => onBlinkChange(blinkA, Number(e.target.value))}
            >
              {options}
            </select>
          </label>
        </div>
      )}
    </div>
  )
}
