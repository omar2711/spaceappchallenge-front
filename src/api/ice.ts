import { getData } from './client'
import type { AtlasCatalog, SplicesCatalog } from './types'

// Catálogos estáticos del backend (/data/catalogs): fuentes candidatas a hielo (SPLICES) y el cometa
// interestelar 3I/ATLAS (resultados publicados de SPHEREx, no procesados por nosotros).

export const getSplices = () => getData<SplicesCatalog>('catalogs/splices.json')
export const getAtlas = () => getData<AtlasCatalog>('catalogs/3i_atlas.json')
