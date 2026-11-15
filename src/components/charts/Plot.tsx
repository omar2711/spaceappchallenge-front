import type { MouseEvent, ReactNode } from 'react'
import './plot.css'
import { formatNum, linearTicks } from './ticks'

// Gráfico SVG liviano (sin librerías): puntos con barras de error, cotas inferiores, líneas y franjas
// verticales de referencia. Escala del eje Y lineal o logarítmica.

export type PlotPoint = {
  x: number
  y: number
  err?: number
  lower?: boolean // cota inferior (p. ej., saturado): se dibuja como triángulo hacia arriba
  faint?: boolean // punto de menor confianza (contaminado)
  title?: string
}

export type PlotSeries = {
  id: string
  label: string
  color: string
  points: PlotPoint[]
  line?: boolean
  /** Separación en x a partir de la cual la línea se corta (zonas sin datos). */
  gapX?: number
  marker?: 'circle' | 'diamond'
  size?: number
}

export type PlotBand = { x0: number; x1: number; label: string; tone: 'gas' | 'ice' | 'hit'; dashed?: boolean; title?: string }

type Props = {
  series: PlotSeries[]
  bands?: PlotBand[]
  xLabel: string
  yLabel: string
  xTicks?: (domain: [number, number]) => { v: number; label: string }[]
  yLog?: boolean
  height?: number
  /** Ancho interno (unidades SVG): más chico = texto más grande en contenedores angostos. */
  width?: number
  ariaLabel: string
  footer?: ReactNode
  /** Pie de figura: "Fig. · objeto, detector, fechas". */
  caption?: string
  onPlotClick?: (x: number, y: number) => void
}

const M = { l: 62, r: 14, t: 26, b: 42 }

function logTicks([a, b]: [number, number]) {
  const out = []
  for (let e = Math.floor(Math.log10(a)); e <= Math.ceil(Math.log10(b)); e++) {
    for (const m of [1, 2, 5]) {
      const v = m * 10 ** e
      if (v >= a && v <= b) out.push({ v, label: m === 1 ? formatNum(v) : '' })
    }
  }
  return out
}

function extent(values: number[], pad = 0.06): [number, number] {
  let lo = Math.min(...values)
  let hi = Math.max(...values)
  if (!isFinite(lo) || !isFinite(hi)) return [0, 1]
  if (lo === hi) {
    lo -= Math.abs(lo) * 0.1 || 1
    hi += Math.abs(hi) * 0.1 || 1
  }
  const d = (hi - lo) * pad
  return [lo - d, hi + d]
}

export default function Plot({
  series,
  bands = [],
  xLabel,
  yLabel,
  xTicks,
  yLog,
  height = 300,
  width = 640,
  ariaLabel,
  footer,
  caption,
  onPlotClick,
}: Props) {
  const H = height
  const W = width
  const pts = series.flatMap((s) => s.points)
  const xDom = extent(pts.map((p) => p.x), 0.03)
  let yDom: [number, number]
  if (yLog) {
    const ys = pts.flatMap((p) => [p.y - (p.err ?? 0), p.y + (p.err ?? 0), p.y]).filter((v) => v > 0)
    const lo = Math.min(...ys)
    const hi = Math.max(...ys)
    yDom = ys.length ? [lo / 1.4, hi * 1.4] : [1, 10]
  } else {
    yDom = extent(pts.flatMap((p) => [p.y - (p.err ?? 0), p.y + (p.err ?? 0)]))
  }

  const sx = (x: number) => M.l + ((x - xDom[0]) / (xDom[1] - xDom[0])) * (W - M.l - M.r)
  const sy = (y: number) => {
    const t = yLog
      ? (Math.log10(Math.max(y, yDom[0])) - Math.log10(yDom[0])) / (Math.log10(yDom[1]) - Math.log10(yDom[0]))
      : (y - yDom[0]) / (yDom[1] - yDom[0])
    return H - M.b - t * (H - M.t - M.b)
  }
  const clampY = (v: number) => Math.max(M.t, Math.min(H - M.b, v))

  const xt = (xTicks ?? linearTicks)(xDom)
  const yt = yLog ? logTicks(yDom) : linearTicks(yDom)

  const click = (e: MouseEvent<SVGSVGElement>) => {
    if (!onPlotClick) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * W
    const y = ((e.clientY - r.top) / r.height) * H
    const fx = xDom[0] + ((x - M.l) / (W - M.l - M.r)) * (xDom[1] - xDom[0])
    const fy = yDom[0] + ((H - M.b - y) / (H - M.t - M.b)) * (yDom[1] - yDom[0])
    onPlotClick(fx, fy)
  }

  return (
    <figure className="plot">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} onClick={onPlotClick ? click : undefined}>
        {bands.map((b, i) => {
          const x0 = sx(Math.max(b.x0, xDom[0]))
          const x1 = sx(Math.min(b.x1, xDom[1]))
          if (x1 <= x0) return null
          return (
            <g key={i} className={`plot-band plot-band--${b.tone}${b.dashed ? ' plot-band--dashed' : ''}`}>
              <title>{b.title ?? b.label}</title>
              <rect x={x0} y={M.t} width={Math.max(x1 - x0, 2)} height={H - M.t - M.b} />
              <text x={(x0 + x1) / 2} y={M.t - 6 - (i % 2) * 11} textAnchor="middle">
                {b.label}
              </text>
            </g>
          )
        })}

        <g className="plot-grid">
          {yt.map((t) => (
            <line key={`y${t.v}`} x1={M.l} x2={W - M.r} y1={sy(t.v)} y2={sy(t.v)} />
          ))}
        </g>
        <g className="plot-axis">
          <line x1={M.l} x2={W - M.r} y1={H - M.b} y2={H - M.b} />
          <line x1={M.l} x2={M.l} y1={M.t} y2={H - M.b} />
          {xt.map((t) => (
            <g key={`x${t.v}`}>
              <line x1={sx(t.v)} x2={sx(t.v)} y1={H - M.b} y2={H - M.b + 4} />
              <text x={sx(t.v)} y={H - M.b + 16} textAnchor="middle">
                {t.label}
              </text>
            </g>
          ))}
          {yt.map((t) =>
            t.label ? (
              <text key={`yl${t.v}`} x={M.l - 6} y={sy(t.v) + 4} textAnchor="end">
                {t.label}
              </text>
            ) : null,
          )}
          <text className="plot-label" x={(M.l + W - M.r) / 2} y={H - 6} textAnchor="middle">
            {xLabel}
          </text>
          <text className="plot-label" transform={`translate(14 ${(M.t + H - M.b) / 2}) rotate(-90)`} textAnchor="middle">
            {yLabel}
          </text>
        </g>

        {series.map((s) => {
          const r = s.size ?? 3
          const line = s.line
            ? s.points
                .filter((p) => !yLog || p.y > 0)
                .map((p, i, a) => `${i && !(s.gapX && p.x - a[i - 1].x > s.gapX) ? 'L' : 'M'}${sx(p.x).toFixed(1)} ${clampY(sy(p.y)).toFixed(1)}`)
                .join(' ')
            : ''
          return (
            <g key={s.id} className="plot-series" style={{ color: s.color }}>
              {line && <path className="plot-line" d={line} />}
              {s.points.map((p, i) => {
                const cx = sx(p.x)
                const cy = clampY(sy(p.y))
                const e = p.err && p.err > 0 ? p.err : 0
                return (
                  <g key={i} className={p.faint ? 'plot-pt plot-pt--faint' : 'plot-pt'}>
                    {p.title && <title>{p.title}</title>}
                    {e > 0 && !p.lower && (
                      <line className="plot-err" x1={cx} x2={cx} y1={clampY(sy(p.y - e))} y2={clampY(sy(p.y + e))} />
                    )}
                    {p.lower ? (
                      <>
                        <line className="plot-err" x1={cx} x2={cx} y1={cy} y2={cy - 12} />
                        <path className="plot-mark" d={`M${cx - r - 1} ${cy - 10} L${cx} ${cy - 16} L${cx + r + 1} ${cy - 10} Z`} />
                        <line className="plot-err" x1={cx - r - 1} x2={cx + r + 1} y1={cy} y2={cy} />
                      </>
                    ) : s.marker === 'diamond' ? (
                      <path className="plot-mark" d={`M${cx} ${cy - r - 1} L${cx + r + 1} ${cy} L${cx} ${cy + r + 1} L${cx - r - 1} ${cy} Z`} />
                    ) : (
                      <circle className="plot-mark" cx={cx} cy={cy} r={r} />
                    )}
                  </g>
                )
              })}
            </g>
          )
        })}
      </svg>
      <figcaption className="plot-legend">
        {series.map((s) => (
          <span key={s.id} className="plot-legend-item">
            <span className="plot-swatch" style={{ background: s.color }} /> {s.label}
          </span>
        ))}
        {footer}
        {caption && <span className="fig-caption plot-caption">{caption}</span>}
      </figcaption>
    </figure>
  )
}
