// DATOS DE EJEMPLO: formaciones rocosas. Posiciones y radios inventados para probar la
// detección de cruces; NO representan formaciones reales.
export const OBSTACLES_LABEL = 'DATOS DE EJEMPLO: formaciones rocosas'

export type Obstacle = { id: string; center: [number, number]; radiusKm: number }

export const obstacles: Obstacle[] = [
  { id: 'ej-gale', center: [-5.6, 137.0], radiusKm: 20 },
  { id: 'ej-valles', center: [-13.5, -60.0], radiusKm: 80 },
  { id: 'ej-olympus', center: [18.0, -134.5], radiusKm: 60 },
]
