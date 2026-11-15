import * as T from 'three'
import catalog from './data/starfield.json'

// Ecuador J2000 a eclíptica J2000; Three usa (x, z, -y).
function direction(ra: number, dec: number) {
  const rad = Math.PI / 180, obliquity = 23.439291 * rad
  const x = Math.cos(dec * rad) * Math.cos(ra * rad)
  const y = Math.cos(dec * rad) * Math.sin(ra * rad), z = Math.sin(dec * rad)
  return [x, z * Math.cos(obliquity) - y * Math.sin(obliquity), -(y * Math.cos(obliquity) + z * Math.sin(obliquity))]
}

export function createStarfield() {
  const sky = new T.Group()
  // Se dibujan en pocos lotes; el tamaño aparente indica brillo relativo dentro del catálogo.
  const buckets: number[][] = [[], [], [], []]
  for (const [ra, dec, magnitude] of catalog.hipparcos) {
    buckets[magnitude < 2 ? 0 : magnitude < 4 ? 1 : 2].push(...direction(ra, dec))
  }
  for (const [ra, dec] of catalog.gaia) buckets[3].push(...direction(ra, dec))
  buckets.forEach((xyz, index) => {
    const geometry = new T.BufferGeometry()
    geometry.setAttribute('position', new T.Float32BufferAttribute(xyz, 3))
    const material = new T.PointsMaterial({ color: [0xffefcc, 0xe7edff, 0xa6b2ca, 0x88a4b8][index],
      size: [3.2, 2.2, 1.35, 1][index], sizeAttenuation: false, depthWrite: false })
    const points = new T.Points(geometry, material)
    points.scale.setScalar(2e10)
    points.renderOrder = -10
    sky.add(points)
  })
  return sky
}

export const starCount = { hipparcos: catalog.hipparcos.length, gaia: catalog.gaia.length }

