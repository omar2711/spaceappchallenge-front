const RAD = Math.PI / 180

/** Separación angular entre dos posiciones (grados), fórmula de haversine. */
export function separationDeg(ra1: number, dec1: number, ra2: number, dec2: number): number {
  const dRa = (ra2 - ra1) * RAD
  const dDec = (dec2 - dec1) * RAD
  const a = Math.sin(dDec / 2) ** 2 + Math.cos(dec1 * RAD) * Math.cos(dec2 * RAD) * Math.sin(dRa / 2) ** 2
  return (2 * Math.asin(Math.min(1, Math.sqrt(a)))) / RAD
}

const pad = (n: number, w: number, d = 0) => n.toFixed(d).padStart(w + (d ? d + 1 : 0), '0')

/** 133.7598 → "08h55m02.35s" */
export function formatRaHms(raDeg: number): string {
  let s = (((raDeg % 360) + 360) % 360) / 15 * 3600
  const h = Math.floor(s / 3600)
  s -= h * 3600
  const m = Math.floor(s / 60)
  s -= m * 60
  return `${pad(h, 2)}h${pad(m, 2)}m${pad(s, 2, 2)}s`
}

/** -7.24219 → "−07°14′31.9″" */
export function formatDecDms(decDeg: number): string {
  const sign = decDeg < 0 ? '−' : '+'
  let s = Math.abs(decDeg) * 3600
  const d = Math.floor(s / 3600)
  s -= d * 3600
  const m = Math.floor(s / 60)
  s -= m * 60
  return `${sign}${pad(d, 2)}°${pad(m, 2)}′${pad(s, 2, 1)}″`
}
