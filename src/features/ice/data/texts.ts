// Traducciones de los textos fijos de los catálogos (el backend los escribe en inglés). Las cifras se
// citan tal cual de las fuentes; si un texto no tiene traducción, se muestra el original.

export const PRIORITY: Record<1 | 2 | 3, { label: string; color: string }> = {
  1: { label: 'protoestrella embebida', color: '#ffb36b' },
  2: { label: 'otro objeto estelar joven', color: '#d0d0d0' },
  3: { label: 'otra fuente', color: '#6e6e6e' },
}

export const CLASS_ES: Record<string, string> = {
  'Class I YSO': 'YSO clase I',
  'Flat spectrum YSO': 'YSO de espectro plano',
  'Class II YSO': 'YSO clase II',
  'Class III YSO': 'YSO clase III',
  'MS Star': 'estrella de secuencia principal',
  'C AGB': 'AGB de carbono',
  'O AGB': 'AGB de oxígeno',
  AGN: 'núcleo galáctico activo',
}

const HIGHLIGHTS_ES: Record<string, string> = {
  'Strong water-ice absorption in the 1.5-4.0 um continuum, similar to Kuiper Belt objects and distant comets.':
    'Fuerte absorción de hielo de agua en el continuo de 1.5–4.0 µm, parecida a la de objetos del cinturón de Kuiper y cometas lejanos.',
  'Extended CO2 gas coma, at least ~348,000 km across in the first analysis (SPHEREx news release).':
    'Coma extendida de gas CO₂, de al menos ~348 000 km en el primer análisis (nota de prensa de SPHEREx).',
  'Robust H2O gas emission at 2.7-2.8 um and CO2 at 4.23-4.27 um; tentative 13CO2 and CO.':
    'Emisión clara de vapor de agua a 2.7–2.8 µm y de CO₂ a 4.23–4.27 µm; ¹³CO₂ y CO, tentativos.',
  'CO2 atmosphere extending to at least ~420,000 km.': 'Atmósfera de CO₂ que se extiende al menos ~420 000 km.',
  'Production rates Q(H2O) ~ 3.2e26 and Q(CO2) ~ 1.6e27 molecules/s (as quoted from the abstract).':
    'Tasas de producción Q(H₂O) ~ 3.2×10²⁶ y Q(CO₂) ~ 1.6×10²⁷ moléculas/s (citadas del resumen).',
  "Interpretation: a CO2-rich, CO-poor, thermally processed object, closer to 1I/'Oumuamua than to 2I/Borisov.":
    'Interpretación: un objeto rico en CO₂, pobre en CO y procesado térmicamente, más parecido a 1I/ʻOumuamua que a 2I/Borisov.',
  'Much more active after perihelion: refractory dust in the coma and new gas species.':
    'Mucho más activo después del perihelio: polvo refractario en la coma y nuevas especies de gas.',
}

export const highlightEs = (h: string) => HIGHLIGHTS_ES[h] ?? h

const PERIOD_ES: Record<string, string> = {
  'Aug 2025 (pre-perihelion)': 'ago 2025 (antes del perihelio)',
  'Dec 2025 (post-perihelion)': 'dic 2025 (después del perihelio)',
}

export const periodEs = (p: string) => PERIOD_ES[p] ?? p
