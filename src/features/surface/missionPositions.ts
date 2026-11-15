type Positions = Partial<Record<string, [number, number]>>

// Coordenadas de llegada transcritas de las fichas locales, con este positivo.
// En misiones móviles la posición corresponde al aterrizaje.
export const missionPositions: Positions = {
  'surveyor-3': [-3, -23.41],
  'apollo-12-lm': [-3.0128, -23.4219],
  'apollo-15-lm': [26.13239, 3.63330],
  'viking-1': [22.483, -47.94],
  'pathfinder-sojourner': [19.33, -33.55],
  insight: [4.5, 135.9],
}

