import type { GaiaSource, Pair } from '../../../api/types'

// Estrellas Gaia DR3 sobre la imagen: posición propagada a la fecha de la pasada que se ve, y flechas
// de movimiento propio para las que se mueven ≥ 20 mas/año. Coordenadas = píxeles web del campo.

type Props = { sources: GaiaSource[]; epoch: string; epochs: string[]; size: Pair }

const REAL_MIN_PX = 1 // desde 1 px de recorrido real se dibuja el recorrido; por debajo, solo la dirección
const DIR_ARROW_PX = 2.5 // largo de la flecha que solo indica la dirección

export default function GaiaOverlay({ sources, epoch, epochs, size }: Props) {
  const c = (p: Pair): Pair => [p[0] + 0.5, p[1] + 0.5]
  return (
    <svg className="skyviewer-overlay skyviewer-gaia" viewBox={`0 0 ${size[0]} ${size[1]}`} aria-hidden="true">
      <defs>
        <marker id="gaia-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" />
        </marker>
      </defs>
      {sources.map((s) => {
        const here = s.epochs[epoch]?.px
        if (!here) return null
        const [x, y] = c(here)
        const r = Math.max(0.6, Math.min(1.8, (20 - s.g_mag) / 6))
        if (!s.arrow) return <circle key={s.source_id} className="skyviewer-gaia-star" cx={x} cy={y} r={r} />
        const path = epochs.map((e) => s.epochs[e]?.px).filter(Boolean) as Pair[]
        const first = c(path[0])
        const last = c(path[path.length - 1])
        const moved = Math.hypot(last[0] - first[0], last[1] - first[1])
        let tip: Pair = last
        let start: Pair = first
        if (moved < REAL_MIN_PX) {
          // Dirección del movimiento propio: este = izquierda (CDELT1 < 0), norte = arriba.
          const n = Math.hypot(s.pmra, s.pmdec) || 1
          start = [x, y]
          tip = [x - (s.pmra / n) * DIR_ARROW_PX, y - (s.pmdec / n) * DIR_ARROW_PX]
        }
        return (
          <g key={s.source_id} className={moved < REAL_MIN_PX ? 'skyviewer-gaia-mover is-scaled' : 'skyviewer-gaia-mover'}>
            <line x1={start[0]} y1={start[1]} x2={tip[0]} y2={tip[1]} markerEnd="url(#gaia-head)" />
            <circle cx={x} cy={y} r={r} />
          </g>
        )
      })}
    </svg>
  )
}
