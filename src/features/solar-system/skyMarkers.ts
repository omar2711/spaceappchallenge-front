import * as T from 'three'
import type { KnownField } from '../../api/fields'
import { formatDecDms, formatRaHms } from '../sky-viewer/lib/angles'

// Los cinco objetos del reto en la esfera celeste, en su dirección real vista desde el sistema solar.
// La escena usa coordenadas eclípticas J2000 heliocéntricas con (x, y, z)ₑ → (x, z, −y) de Three.js.

export type SkyMarker = { id: string; name: string; ra: number; dec: number; coords: string; to: string }

/** Oblicuidad de la eclíptica J2000 (IAU 2006): 23.4392811°. */
export const OBLIQUITY_DEG = 23.4392811

const D2R = Math.PI / 180
const EPS = OBLIQUITY_DEG * D2R

/** Dirección unitaria en el marco de la escena para una ascensión recta y declinación ICRS (grados). */
export function skyDirection(raDeg: number, decDeg: number, out = new T.Vector3()) {
  const a = raDeg * D2R
  const d = decDeg * D2R
  // Ecuatorial (ICRS ≈ J2000) → eclíptica J2000: giro de −ε alrededor del eje x.
  const xq = Math.cos(d) * Math.cos(a)
  const yq = Math.cos(d) * Math.sin(a)
  const zq = Math.sin(d)
  const xe = xq
  const ye = Math.cos(EPS) * yq + Math.sin(EPS) * zq
  const ze = -Math.sin(EPS) * yq + Math.cos(EPS) * zq
  return out.set(xe, ze, -ye)
}

export function buildSkyMarkers(fields: KnownField[] | null): SkyMarker[] {
  return (fields ?? [])
    .filter((f) => f.kind === 'target')
    .map((f) => ({
      id: f.id,
      name: f.name,
      ra: f.center.raDeg,
      dec: f.center.decDeg,
      coords: `${formatRaHms(f.center.raDeg)} ${formatDecDms(f.center.decDeg)}`,
      to: `/cielo?ra=${f.request.raDeg}&dec=${f.request.decDeg}&fov=${f.request.fovArcmin}`,
    }))
}
