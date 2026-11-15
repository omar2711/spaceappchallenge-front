import * as T from 'three'
import type { MarsWalk, MoonSite } from '../../api/types'
import { GROUP_LABEL } from '../moon-map/data/sites'

// Marcadores sobre la superficie de la Luna y Marte, con los datos que ya usan /luna y /marte.

export type SurfaceBody = 'Luna' | 'Marte'

export type SurfaceMarker = {
  id: string
  body: SurfaceBody
  lat: number
  lon: number // grados, positivo al este
  name: string
  kind: string
  accent: boolean
  to: string
}

// Jezero según la consigna (centro del cráter); se usa si la API de /marte no responde.
const JEZERO = { lat: 18.38, lon: 77.58 }

export function buildMarkers(sites: MoonSite[] | null, walk: MarsWalk | null): SurfaceMarker[] {
  const out: SurfaceMarker[] = (sites ?? []).map((s) => ({
    id: s.id,
    body: 'Luna',
    lat: s.lat,
    lon: s.lon,
    name: s.name,
    kind: s.group === 'apollo' ? `${GROUP_LABEL[s.group]}, alunizaje de ${s.landing_date_utc?.slice(0, 4) ?? ''}` : GROUP_LABEL[s.group],
    accent: s.group !== 'apollo',
    to: `/luna?sitio=${encodeURIComponent(s.id)}`,
  }))
  out.push({
    id: 'jezero',
    body: 'Marte',
    lat: walk?.crater.lat ?? JEZERO.lat,
    lon: walk?.crater.lon ?? JEZERO.lon,
    name: `Cráter ${walk?.crater.name ?? 'Jezero'}`,
    kind: walk ? `recorrido de Perseverance, ${walk.route.length_km.toFixed(1)} km` : 'recorrido de Perseverance',
    accent: true,
    to: '/marte',
  })
  return out
}

const D2R = Math.PI / 180

/**
 * Punto de la superficie en el marco local de la esfera de Three.js (SphereGeometry con textura
 * equirectangular: la longitud −180° está en el borde izquierdo y 0° en el centro, mirando a +x).
 */
export function surfacePoint(latDeg: number, lonDeg: number, r: number, out = new T.Vector3()) {
  const lat = latDeg * D2R
  const phi = (lonDeg + 180) * D2R
  return out.set(-Math.cos(phi) * Math.cos(lat) * r, Math.sin(lat) * r, Math.sin(phi) * Math.cos(lat) * r)
}

/** Ruta de Perseverance como línea sobre la esfera de Marte (a escala real mide menos de 0.5°). */
export function routeLine(walk: MarsWalk, r: number) {
  const pts = walk.route.points.map((p) => surfacePoint(p.lat, p.lon, r * 1.0008))
  const geo = new T.BufferGeometry().setFromPoints(pts)
  return new T.Line(geo, new T.LineBasicMaterial({ color: '#ffb36b' }))
}
