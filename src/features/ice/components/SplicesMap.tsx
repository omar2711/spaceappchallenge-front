import type { SplicesCatalog } from '../../../api/types'
import { PRIORITY } from '../data/texts'

// Mapa de todo el cielo (proyección rectangular: AR crece hacia la izquierda, como se ve el cielo).

const W = 720
const H = 360
const x = (ra: number) => ((360 - ra) / 360) * W
const y = (dec: number) => ((90 - dec) / 180) * H

type Props = { catalog: SplicesCatalog; active: string | null; onRegion: (id: string) => void }

export default function SplicesMap({ catalog, active, onRegion }: Props) {
  // Las prioridades bajas primero: las protoestrellas quedan encima.
  const rows = [...catalog.rows].sort((a, b) => b[10] - a[10])
  return (
    <figure className="ice-map">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Mapa del cielo con ${catalog.n_sources} fuentes de SPLICES`}>
        <rect width={W} height={H} className="ice-map-bg" />
        {[-60, -30, 0, 30, 60].map((d) => (
          <line key={`d${d}`} x1={0} x2={W} y1={y(d)} y2={y(d)} className={d === 0 ? 'ice-map-eq' : 'ice-map-grid'} />
        ))}
        {[0, 60, 120, 180, 240, 300].map((r) => (
          <g key={`r${r}`}>
            <line x1={x(r)} x2={x(r)} y1={0} y2={H} className="ice-map-grid" />
            <text x={x(r) - 3} y={H - 6} textAnchor="end">
              {r / 15}h
            </text>
          </g>
        ))}
        {[-60, -30, 30, 60].map((d) => (
          <text key={`t${d}`} x={4} y={y(d) - 3}>
            {d > 0 ? `+${d}` : d}°
          </text>
        ))}
        {rows.map((r) => (
          <circle key={r[0]} cx={x(r[1])} cy={y(r[2])} r={r[10] === 1 ? 1.8 : 1.2} fill={PRIORITY[r[10]].color} opacity={0.8} />
        ))}
        {catalog.regions.map((g) => (
          <g
            key={g.id}
            className={g.id === active ? 'ice-map-region is-active' : 'ice-map-region'}
            onClick={() => onRegion(g.id)}
          >
            <title>
              {g.name}: {g.n_sources} fuentes en {g.radius_arcmin}′
            </title>
            <circle cx={x(g.ra)} cy={y(g.dec)} r={7} />
          </g>
        ))}
      </svg>
      <figcaption className="ice-legend">
        {([1, 2, 3] as const).map((p) => (
          <span key={p}>
            <span className="ice-dot" style={{ background: PRIORITY[p].color }} /> {PRIORITY[p].label}
          </span>
        ))}
        <span>
          <span className="ice-dot ice-dot--ring" /> nuestros campos (clic para ver sus fuentes)
        </span>
      </figcaption>
    </figure>
  )
}
