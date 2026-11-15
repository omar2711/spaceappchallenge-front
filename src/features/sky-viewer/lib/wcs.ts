import type { GridWcs, Pair } from '../../../api/types'

// Proyección gnomónica (RA---TAN / DEC--TAN) del grid común de cada campo (manifest.grid_wcs).
// Píxeles "web" (como manifest.target_px): base 0, origen arriba a la izquierda, y hacia abajo.

const RAD = Math.PI / 180

/** Píxel web (x, y) → (RA, Dec) en grados. */
export function webPxToSky(g: GridWcs, px: Pair): { ra: number; dec: number } {
  const p = px[0] + 1 // FITS: base 1
  const q = g.NAXIS2 - 1 - px[1] + 1 // FITS: y hacia arriba
  const xi = g.CDELT1 * (p - g.CRPIX1) * RAD
  const eta = g.CDELT2 * (q - g.CRPIX2) * RAD
  const ra0 = g.CRVAL1 * RAD
  const dec0 = g.CRVAL2 * RAD
  const den = Math.cos(dec0) - eta * Math.sin(dec0)
  const ra = ra0 + Math.atan2(xi, den)
  const dec = Math.atan2(Math.sin(dec0) + eta * Math.cos(dec0), Math.hypot(xi, den))
  return { ra: (((ra / RAD) % 360) + 360) % 360, dec: dec / RAD }
}

/** (RA, Dec) en grados → píxel web (x, y). */
export function skyToWebPx(g: GridWcs, ra: number, dec: number): Pair {
  const a = ra * RAD
  const d = dec * RAD
  const a0 = g.CRVAL1 * RAD
  const d0 = g.CRVAL2 * RAD
  const cosc = Math.sin(d0) * Math.sin(d) + Math.cos(d0) * Math.cos(d) * Math.cos(a - a0)
  const xi = (Math.cos(d) * Math.sin(a - a0)) / cosc / RAD
  const eta = (Math.cos(d0) * Math.sin(d) - Math.sin(d0) * Math.cos(d) * Math.cos(a - a0)) / cosc / RAD
  const p = xi / g.CDELT1 + g.CRPIX1
  const q = eta / g.CDELT2 + g.CRPIX2
  return [p - 1, g.NAXIS2 - 1 - (q - 1)]
}
