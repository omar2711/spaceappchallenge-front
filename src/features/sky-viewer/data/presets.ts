// Objetivos de prueba. Donde no hay coordenadas verificadas se usa TBD: NO se inventan valores.
export const TBD = '[por completar]'

export type Preset = { id: string; name: string; ra: string; dec: string }

export const presets: Preset[] = [
  // Dato oficial del desafío.
  { id: 'wise-0855', name: 'WISE 0855', ra: '08h55m10.831s', dec: '-07d14m42.53s' },
  { id: 'barnards-star', name: "Barnard's Star", ra: TBD, dec: TBD },
  { id: 'epsilon-indi-b', name: 'Epsilon Indi B', ra: TBD, dec: TBD },
  { id: 'rw-aurigae', name: 'RW Aurigae', ra: TBD, dec: TBD },
  { id: 'r-draconis', name: 'R Draconis', ra: TBD, dec: TBD },
]

export const isVerified = (p: Preset) => p.ra !== TBD && p.dec !== TBD
