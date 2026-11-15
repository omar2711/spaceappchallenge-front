// Tipos del contrato de la API Ruta del Agua (reflejan las respuestas reales del backend).
// Fuente: spaceappchallenge-back/docs/API_FRONTEND.md, pipeline/manifest.schema.json y analysis/analysis.schema.json.

export type Pair = [number, number]

// ---------------------------------------------------------------- índice y presets

export type TargetIndexEntry = {
  target_id: string
  name: string
  kind: string
  ra_deg: number
  dec_deg: number
  manifest: string // relativo a /data/targets/
  epochs: string[]
  detectors: number[]
}

export type TargetIndex = { generated_at: string; targets: TargetIndexEntry[] }

export type CustomPreset = {
  id: string
  name: string
  description: string
  job_id: string
  ra: number
  dec: number
  fov_arcmin: number
  max_exposures_per_group: number
  manifest: string // relativo a /data/
}

export type PresetsFile = { generated_at: string; note: string; presets: CustomPreset[] }

// ---------------------------------------------------------------- manifest (B1)

export type ManifestFrame = {
  epoch: string
  file: string // WebP relativo a la carpeta del manifest
  fits: string
  n_images: number
  target_px: Pair // coordenadas WebP: origen arriba a la izquierda, y hacia abajo
  flags_fraction: number
  saturated_exposures?: number
  wavelength_at_target_um?: Pair
  date_mid?: string
}

export type ManifestDetector = { id: number; wavelength_um: Pair; frames: ManifestFrame[] }

export type ManifestEpoch = { id: string; date_start: string; date_end: string; date_mid: string }

export type GridWcs = {
  CTYPE1: string
  CTYPE2: string
  CRVAL1: number
  CRVAL2: number
  CRPIX1: number
  CRPIX2: number
  CDELT1: number
  CDELT2: number
  NAXIS1: number
  NAXIS2: number
}

export type Manifest = {
  target_id: string
  name: string
  kind: 'high_proper_motion_star' | 'brown_dwarf' | 'variable_star' | 'custom'
  ref_coord: { ra_deg: number; dec_deg: number; epoch: string; source?: string }
  proper_motion_mas_yr: { pmra: number; pmdec: number }
  fov_arcmin: number
  pixel_scale_arcsec: number
  image_size_px: Pair
  grid_wcs: GridWcs
  epochs: ManifestEpoch[]
  detectors: ManifestDetector[]
  stretch: { method: string; per_detector_limits: Record<string, Pair> }
  source: { collections: string[]; generated_at: string; max_exposures_per_group?: number }
  notes: string
}

// ---------------------------------------------------------------- análisis (B2)

export type DiffCaveat = 'wavelength_mismatch' | 'saturated_target' | 'few_reference_stars' | 'moving_target'

export type DifferenceImage = {
  detector: number
  from: string
  to: string
  file: string // relativo a la carpeta del objetivo
  range: Pair
  units: string
  flux_scale: number
  caveats: DiffCaveat[]
  target_residual: { flux: number; err: number; fraction_of_target: number | null; significant: boolean }
  dipole?: {
    separation_px: number
    position_angle_deg: number
    expected_shift_px: number
    expected_position_angle_deg: number
  }
}

export type DeepImage = { detector: number; file: string; epochs: string[] }

export type LightCurvePoint = {
  mjd: number
  epoch?: string
  wavelength_um: number
  flux: number
  err: number
  flux_corrected: number | null
  flag: 'ok' | 'saturated' | 'contaminated' | 'edge' | 'blended'
}

export type LightCurve = {
  detector: number
  wavelength_um: Pair
  units: string
  usable?: boolean
  points: LightCurvePoint[]
  per_epoch: { epoch: string; mjd?: number; flux: number; err: number; n: number; lower_limit?: boolean }[]
  variability: {
    amplitude_mag?: number | null
    p_value?: number | null
    significant: boolean
    lower_limit?: boolean
    note?: string
  }
}

export type SpectrumPoint = { wavelength_um: number; flux: number; err: number; n?: number; lower_limit?: boolean }

export type BandMeasurement = {
  name: string
  type: 'ratio' | 'depth'
  molecule?: string
  value: number | null
  err: number | null
  absorption_sigma?: number | null
  significant: boolean
  interpretation?: string
  note?: string
}

export type Spectrum = {
  epoch: string // "S1", ... o "combined"
  label?: string
  units: string
  n_exposures?: number
  points: SpectrumPoint[]
  band_measurements?: BandMeasurement[]
  position?: { ra_deg: number; dec_deg: number; label?: string; target_px?: Pair }
  note?: string
}

export type ReferenceBand = {
  label: string
  phase?: string
  wavelength_um: number
  range_um?: Pair
  source?: string
  verified: boolean
}

export type Analysis = {
  target_id: string
  difference_images: DifferenceImage[]
  deep_images: DeepImage[]
  light_curves: LightCurve[]
  spectra: Spectrum[]
  reference_bands: ReferenceBand[]
  notes: string
}

// ---------------------------------------------------------------- campos libres (POST /custom)

export type CustomState = 'pending' | 'processing' | 'ready' | 'error'

export type CustomStatus = {
  job_id: string
  state: CustomState
  progress?: number
  stage?: string
  message?: string
  manifest?: string | null
  manifest_url?: string
  error?: string | null
  ra: number
  dec: number
  fov_arcmin: number
  max_exposures_per_group: number
}

export type SpectrumResponse = {
  field: string
  ra: number
  dec: number
  label: string | null
  target_px: Pair
  n_exposures: number
  flags: Record<string, number>
  spectra: Spectrum[]
  reference_bands: ReferenceBand[]
  elapsed_s: number
}
