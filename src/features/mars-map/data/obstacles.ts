// Zonas a evitar al trazar una ruta. Ya no hay formaciones inventadas: las zonas salen de las
// pendientes fuertes medidas en la ruta real de Perseverance (ver data/marswalk.ts, hazardZones).
export type Obstacle = { id: string; center: [number, number]; radiusKm: number }
