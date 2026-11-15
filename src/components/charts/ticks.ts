// Marcas de eje "bonitas" (1, 2, 5 × 10ⁿ) y formato compacto de números para los gráficos.

function niceStep(span: number, n: number) {
  const raw = span / n
  const mag = 10 ** Math.floor(Math.log10(raw))
  const f = raw / mag
  return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * mag
}

export function linearTicks([a, b]: [number, number], n = 5) {
  if (!(b > a)) return [{ v: a, label: formatNum(a) }]
  const step = niceStep(b - a, n)
  const out = []
  for (let v = Math.ceil(a / step) * step; v <= b + step * 1e-9; v += step) out.push({ v, label: formatNum(v) })
  return out
}

export function formatNum(v: number) {
  const a = Math.abs(v)
  if (a === 0) return '0'
  if (a >= 1e6) return `${Number((v / 1e6).toPrecision(3))}M`
  if (a >= 1e4) return `${Number((v / 1e3).toPrecision(3))}k`
  if (a < 1e-2) return v.toExponential(0)
  return String(Number(v.toPrecision(3)))
}

/** n cifras significativas sin notación exponencial para valores comunes (660, no 6.6e+2). */
export const sig = (v: number, n: number) => {
  const r = Number(v.toPrecision(n))
  return Math.abs(r) >= 1e6 || (r !== 0 && Math.abs(r) < 1e-3) ? r.toExponential(n - 1) : String(r)
}
