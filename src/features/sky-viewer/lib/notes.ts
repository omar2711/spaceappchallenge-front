// Traducción al español de las notas fijas que escribe el backend (analysis/spectra.py, lightcurve.py).
// Una nota desconocida se muestra tal cual, en inglés, para no inventar texto.

const NOTES: Record<string, string> = {
  'no data in window': 'sin datos en esa ventana',
  'no data in band or continuum windows': 'sin datos en la banda o en el continuo',
  'In a brown dwarf this window traces gas-phase absorption (CH4/H2O/CO), not ice.':
    'En una enana marrón esta ventana mide absorción de gas (CH₄/H₂O/CO), no hielo.',
  'M dwarf: no methane expected (control).': 'Enana M: no se espera metano (control).',
  'Stellar photosphere: no ice expected (control).': 'Fotosfera estelar: no se espera hielo (control).',
  'Brown-dwarf indices: for a star or young stellar object they mostly trace the continuum slope (e.g. warm dust), not CH4/H2O gas.':
    'Índices de enana marrón: en una estrella o un objeto joven miden sobre todo la pendiente del continuo (p. ej., polvo tibio), no gas de CH₄/H₂O.',
  'Ice absorption depth against a log-log continuum; significant only if >= 3 sigma.':
    'Profundidad de absorción de hielo contra un continuo log-log; significativa solo si ≥ 3σ.',
  'Not a brown dwarf: indices are reported for completeness only.':
    'No es una enana marrón: los índices se muestran solo para completar.',
  'Circumstellar dust/ice possible in young stars; check per-epoch spectra.':
    'Polvo/hielo circunestelar posible en estrellas jóvenes; mira los espectros de cada pasada.',
  'Combines epochs of a variable target: use the per-epoch spectra for shapes.':
    'Combina pasadas de un objeto variable: para la forma del espectro usa cada pasada por separado.',
  'constant within errors': 'constante dentro de los errores',
  'significant variability': 'variabilidad significativa',
  'fewer than 2 epochs': 'menos de 2 pasadas',
  'all exposures blended with another source in the aperture':
    'todas las exposiciones están mezcladas con otra fuente dentro de la apertura',
  'based on saturated (lower-limit) fluxes, amplitude unreliable':
    'basada en flujos saturados (cotas inferiores): la amplitud no es fiable',
}

/** Traduce una nota del backend; las compuestas con "; " se traducen por partes. */
export function translateNote(note?: string | null): string {
  if (!note) return ''
  if (NOTES[note]) return NOTES[note]
  return note
    .split('; ')
    .map((part) => NOTES[part] ?? part)
    .join('; ')
}

/** Nombres legibles de las moléculas de las bandas. */
export const MOLECULE: Record<string, string> = {
  H2O: 'agua (H₂O)',
  CH4: 'metano (CH₄)',
  'H2O ice': 'hielo de agua',
  'CO2 ice': 'hielo de CO₂',
  CO: 'CO',
}

export const prettyLabel = (s: string) =>
  s.replace(/H2O/g, 'H₂O').replace(/CH4/g, 'CH₄').replace(/CO2/g, 'CO₂').replace(/ ice/g, ' hielo')
