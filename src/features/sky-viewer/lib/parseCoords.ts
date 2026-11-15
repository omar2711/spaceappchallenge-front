// Valores de la interfaz para el campo de visión (FOV). NO son datos científicos:
// solo el valor inicial y los límites del formulario.
export const FOV_DEFAULT_ARCMIN = 3
export const FOV_MIN_ARCMIN = 1
export const FOV_MAX_ARCMIN = 6 // límite del backend para campos nuevos (POST /custom)

export type ParseResult = { ok: true; deg: number } | { ok: false; error: string }

const fail = (error: string): ParseResult => ({ ok: false, error })

type Kind = 'ra' | 'dec'

// Reglas de unidades:
//  - Con letras h/m/s o con espacios / dos puntos entre varios números: RA en horas.
//  - Un solo número decimal sin letras: grados.
//  - Con letras d/m/s (o °, ′, ″): grados.
//  - La declinación siempre va en grados.
function parseAngle(raw: string, kind: Kind): ParseResult {
  const label = kind === 'ra' ? 'ascensión recta' : 'declinación'
  let s = raw.trim().toLowerCase().replace(/−/g, '-')
  if (!s) return fail(`Escribe la ${label}.`)

  let sign = 1
  if (s[0] === '+' || s[0] === '-') {
    if (s[0] === '-') sign = -1
    s = s.slice(1).trim()
  }
  if (kind === 'ra' && sign === -1) {
    return fail('La ascensión recta no puede ser negativa (0 a 24 h, o 0 a 360°).')
  }

  s = s.replace(/°/g, 'd').replace(/[′']/g, 'm').replace(/[″"]/g, 's')
  if (/[^0-9.hdms:\s]/.test(s)) {
    return fail('Formato no reconocido. Usa números, h/m/s o d/m/s, espacios o dos puntos.')
  }

  const nums = s.match(/\d+(?:\.\d+)?/g) ?? []
  const units = s.replace(/\d+(?:\.\d+)?/g, '').replace(/[\s:]/g, '')
  const n = nums.length
  if (n < 1 || n > 3) {
    return fail('Formato no reconocido. Usa de 1 a 3 números (grados u horas, minutos, segundos).')
  }

  let unit: 'h' | 'd'
  if (units === '') unit = n === 1 || kind === 'dec' ? 'd' : 'h'
  else if (units === 'hms'.slice(0, n)) unit = 'h'
  else if (units === 'dms'.slice(0, n)) unit = 'd'
  else return fail('Las letras no coinciden con los números. Ejemplo: 08h55m10.831s o 08 55 10.831.')

  if (kind === 'dec' && unit === 'h') {
    return fail('La declinación se escribe en grados (d, m, s), no en horas.')
  }

  const parts = nums.map(Number)
  if (parts.slice(0, -1).some((p) => !Number.isInteger(p))) {
    return fail('Solo el último número puede llevar decimales.')
  }
  if (n >= 2 && parts[1] >= 60) return fail('Los minutos deben ser menores que 60.')
  if (n === 3 && parts[2] >= 60) return fail('Los segundos deben ser menores que 60.')

  const base = parts[0] + (parts[1] ?? 0) / 60 + (parts[2] ?? 0) / 3600

  if (kind === 'ra') {
    if (unit === 'h') {
      if (base > 24) return fail('La ascensión recta debe estar entre 0 y 24 h.')
    } else if (base > 360) {
      return fail('La ascensión recta debe estar entre 0 y 360°.')
    }
    let deg = unit === 'h' ? base * 15 : base
    if (deg >= 360) deg -= 360 // 24 h = 360° = 0°
    return { ok: true, deg }
  }

  const deg = sign * base
  if (Math.abs(deg) > 90) return fail('La declinación debe estar entre −90° y +90°.')
  return { ok: true, deg: deg || 0 } // evita -0
}

export const parseRA = (raw: string) => parseAngle(raw, 'ra')
export const parseDec = (raw: string) => parseAngle(raw, 'dec')

export function parseFov(raw: string): ParseResult {
  const s = raw.trim().replace(',', '.')
  if (!s) return fail('Escribe el campo de visión en arcmin.')
  if (!/^\d+(\.\d+)?$/.test(s)) return fail('El campo de visión debe ser un número (arcmin).')
  const v = Number(s)
  if (v < FOV_MIN_ARCMIN || v > FOV_MAX_ARCMIN) {
    return fail(`El campo de visión debe estar entre ${FOV_MIN_ARCMIN} y ${FOV_MAX_ARCMIN} arcmin.`)
  }
  return { ok: true, deg: v } // aquí "deg" guarda arcmin
}

export const formatDeg = (deg: number) => `${deg.toFixed(5)}°`
