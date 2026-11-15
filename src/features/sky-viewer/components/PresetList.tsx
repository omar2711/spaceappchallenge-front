import { isVerified, presets, type Preset } from '../data/presets'

type Props = { onPick: (p: Preset) => void }

export default function PresetList({ onPick }: Props) {
  return (
    <div className="skyviewer-panel">
      <h2 className="skyviewer-panel-title">Objetivos de prueba</h2>
      <ul className="skyviewer-presets">
        {presets.map((p) => {
          const verified = isVerified(p)
          return (
            <li key={p.id} className="skyviewer-preset">
              <button
                type="button"
                className="skyviewer-btn"
                disabled={!verified}
                onClick={() => onPick(p)}
              >
                {p.name}
              </button>
              {!verified && <span className="skyviewer-note">coordenadas por verificar</span>}
            </li>
          )
        })}
      </ul>
      <p className="skyviewer-note">Las coordenadas de WISE 0855 son las del desafío.</p>
    </div>
  )
}
