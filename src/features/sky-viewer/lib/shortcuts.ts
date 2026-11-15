// Fuentes con nombre dentro de los campos de demo, para pedir su espectro con un botón (GET /spectrum).
// Posiciones ICRS (SIMBAD); el centro de cada preset ya coincide con su estrella principal.

export type SkyShortcut = { label: string; ra: number; dec: number }

const BN_KL: SkyShortcut = { label: 'BN/KL', ra: 83.8088, dec: -5.37298 }

export const FIELD_SHORTCUTS: Record<string, SkyShortcut[]> = {
  hl_tau: [{ label: 'HL Tau', ra: 67.9105, dec: 18.2327 }],
  trapezium: [{ label: 'θ¹ Ori C', ra: 83.8186, dec: -5.3897 }, BN_KL],
  m42: [BN_KL],
}
