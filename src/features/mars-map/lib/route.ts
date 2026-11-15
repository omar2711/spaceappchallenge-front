import type { Obstacle } from '../data/obstacles'

export const MARS_RADIUS_KM = 3389.5
// Leaflet dibuja los círculos asumiendo la Tierra (R = 6371000 m): este factor los escala a Marte.
const LEAFLET_EARTH_RADIUS_M = 6371000

export type LatLng = [number, number]
const rad = (d: number) => (d * Math.PI) / 180

export function marsKmToLeafletMeters(km: number): number {
  return km * 1000 * (LEAFLET_EARTH_RADIUS_M / (MARS_RADIUS_KM * 1000))
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = rad(b[0] - a[0])
  const dLon = rad(b[1] - a[1])
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2
  return 2 * MARS_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

export function routeDistanceKm(points: LatLng[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) total += haversineKm(points[i - 1], points[i])
  return total
}

// Plano local en km centrado en el obstáculo; el tramo es la recta lat/lon que dibuja el mapa.
// No maneja el cruce del antimeridiano (±180°).
export function segmentCrossesObstacle(a: LatLng, b: LatLng, o: Obstacle): boolean {
  const k = (MARS_RADIUS_KM * Math.PI) / 180
  const cosLat = Math.cos(rad(o.center[0]))
  const toXY = (p: LatLng) =>
    [(p[1] - o.center[1]) * k * cosLat, (p[0] - o.center[0]) * k] as const
  const [ax, ay] = toXY(a)
  const [bx, by] = toXY(b)
  const dx = bx - ax
  const dy = by - ay
  const len2 = dx * dx + dy * dy
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len2))
  return Math.hypot(ax + t * dx, ay + t * dy) <= o.radiusKm
}

// index: tramo points[index] -> points[index + 1]
export type BlockedSegment = { index: number; obstacleId: string }

export function findBlockedSegments(points: LatLng[], obstacles: Obstacle[]): BlockedSegment[] {
  const blocked: BlockedSegment[] = []
  for (let i = 0; i < points.length - 1; i++)
    for (const o of obstacles)
      if (segmentCrossesObstacle(points[i], points[i + 1], o))
        blocked.push({ index: i, obstacleId: o.id })
  return blocked
}
