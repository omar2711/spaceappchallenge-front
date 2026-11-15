import { generateMockFrames } from '../features/sky-viewer/lib/mockFrames'

// Contrato entre la UI de /cielo y los datos. Hoy responde el mock; el backend lo reemplazará
// devolviendo la misma forma (source: 'live') sin cambiar la UI.

export type SkyRequest = {
  raDeg: number // Ascensión recta, grados decimales (0–360)
  decDeg: number // Declinación, grados decimales (−90 a +90)
  fovArcmin: number // Campo de visión, minutos de arco
}

export type SkyFrame = {
  id: string
  epochUT: string // fecha/hora UT en formato ISO 8601
  bandLabel: string
  imageUrl: string
}

export type SkySeries = {
  request: SkyRequest
  frames: SkyFrame[]
  source: 'mock' | 'live'
}

export async function getSkySeries(req: SkyRequest): Promise<SkySeries> {
  // TODO: reemplazar por la llamada al backend y devolver source: 'live'.
  // NOTA (CORS): el modo "Diferencia" lee los píxeles de cada imagen con canvas. Si las
  // imageUrl vienen de otro origen, el servidor debe enviar CORS (Access-Control-Allow-Origin);
  // si no, getImageData falla. Con las dataURL del mock no hay problema.
  await new Promise((resolve) => setTimeout(resolve, 400)) // simula la espera de red
  return { request: req, frames: generateMockFrames(req), source: 'mock' }
}
