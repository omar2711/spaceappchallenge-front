// Formato de horas y fechas de Cochabamba (UTC−4). Lo usan la tarjeta "¿Se ve desde Cochabamba?" y el
// panel de Cochabamba del sistema solar, para que muestren exactamente lo mismo.

export const hhmm = (iso?: string | null) => (iso ? iso.slice(11, 16) : '—')
export const dayLabel = (iso?: string | null) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '')
export const when = (iso?: string | null) => (iso ? `${hhmm(iso)} (${dayLabel(iso)})` : '—')

/** Fecha de hoy en Cochabamba (UTC−4), YYYY-MM-DD. */
export const todayCbba = () => new Date(Date.now() - 4 * 3600000).toISOString().slice(0, 10)
