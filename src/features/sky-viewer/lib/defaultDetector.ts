import type { DetectorSeries } from '../../../api/sky'

// Detector que se muestra primero en cada campo (decisión de interfaz, basada en los resultados del
// backend: docs/pipeline_fase5.md y docs/analysis_*.md). La persona puede cambiarlo siempre.
export const DEFAULT_DETECTOR: Record<string, { detector: number; reason: string }> = {
  wise0855: {
    detector: 6,
    reason: 'WISE 0855 solo es visible a 4.4–5.0 µm (D6); en D1–D5 hay una estrella de fondo fija en su lugar.',
  },
  rw_aur: { detector: 1, reason: 'La variabilidad de RW Aur se ve con más claridad cerca de 1 µm (D1).' },
  r_dra: { detector: 1, reason: 'El ciclo de la variable Mira R Dra se ve mejor en D1.' },
  eps_ind_b: { detector: 5, reason: 'eps Ind B es más brillante a ~4 µm (D5): mejor señal para seguir su movimiento.' },
  barnard: { detector: 2, reason: 'Barnard tiene buena señal en D2; su movimiento se ve en todos los detectores.' },
  m42: { detector: 4, reason: 'A 2.4–3.8 µm (D4) aparece el objeto infrarrojo BN/KL, oculto en el visible.' },
  trapezium: { detector: 2, reason: 'El cúmulo del Trapecio se ve bien en el infrarrojo cercano (D2).' },
  hl_tau: { detector: 3, reason: 'HL Tau y su vecina XZ Tau con buena señal en D3.' },
}

const GENERIC = 3

/** Detector inicial: el configurado para el campo o, si no, D3 (si existe) o el primero con datos. */
export function defaultDetectorFor(fieldId: string, detectors: DetectorSeries[]): number {
  const available = detectors.filter((d) => d.frames.length > 0).map((d) => d.id)
  const preferred = DEFAULT_DETECTOR[fieldId]?.detector
  if (preferred && available.includes(preferred)) return preferred
  return available.includes(GENERIC) ? GENERIC : (available[0] ?? 1)
}
