import type { DetectorSeries } from '../../../api/sky'

type Props = {
  detectors: DetectorSeries[]
  value: number
  recommended: number
  recommendedReason?: string
  onChange: (id: number) => void
}

const um = (x: number) => x.toFixed(2)

export default function DetectorBar({ detectors, value, recommended, recommendedReason, onChange }: Props) {
  return (
    <div className="skyviewer-detbar">
      <div role="group" aria-label="Detector de SPHEREx" className="skyviewer-modes">
        {detectors.map((d) => (
          <button
            key={d.id}
            type="button"
            className={`skyviewer-mode skyviewer-det${d.id === recommended ? ' is-recommended' : ''}`}
            aria-pressed={value === d.id}
            disabled={d.frames.length === 0}
            title={`Detector ${d.id}: ${um(d.wavelengthUm[0])}–${um(d.wavelengthUm[1])} µm`}
            onClick={() => onChange(d.id)}
          >
            D{d.id}
            <span className="skyviewer-det-range">
              {um(d.wavelengthUm[0])}–{um(d.wavelengthUm[1])} µm
            </span>
            {d.id === recommended && <span className="skyviewer-sr"> (recomendado)</span>}
          </button>
        ))}
      </div>
      <p className="skyviewer-note">
        Cada detector ve otro rango de longitud de onda, así que el video compara siempre el mismo detector entre
        pasadas.{' '}
        {recommendedReason && <>El subrayado naranja marca el recomendado: {recommendedReason}</>}
      </p>
    </div>
  )
}
