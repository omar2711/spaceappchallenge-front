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
  band_um?: Pair
  ref_um?: Pair
  source?: string
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

// ---------------------------------------------------------------- Gaia y visibilidad (B3)

export type GaiaSource = {
  source_id: string
  ra: number
  dec: number
  ref_epoch: number
  pmra: number
  pmdec: number
  parallax: number | null
  g_mag: number
  pm_total_mas_yr: number
  arrow: boolean // movimiento propio ≥ 20 mas/año
  epochs: Record<string, { ra: number; dec: number; px: Pair }>
}

export type GaiaField = {
  field: string
  catalog: string
  g_limit: number
  center: { ra: number; dec: number }
  radius_deg: number
  image_size_px: Pair
  epochs: { id: string; date_mid: string }[]
  notes: string
  n_sources: number
  sources: GaiaSource[]
}

export type Visibility = {
  site: { name: string; lat: number; lon: number; elevation_m: number; utc_offset_hours: number; source?: string }
  target: { ra_deg: number; dec_deg: number }
  date_local: string
  window_local: [string, string]
  sun: { sunset: string | null; sunrise: string | null; night_start: string | null; night_end: string | null; night_definition: string }
  target_events: {
    rise: string | null
    set: string | null
    culmination: string | null
    culmination_alt_deg: number
    always_up: boolean
    never_up: boolean
  }
  best_time: { time: string; alt_deg: number; az_deg: number; moon_alt_deg: number } | null
  observable: boolean
  observable_hours: number
  criterion: string
  moon_illuminated_fraction: number
  curve: { step_min: number; time_local: string[]; alt_deg: number[]; az_deg: number[]; sun_alt_deg: number[] }
  notes: string
}

// ---------------------------------------------------------------- Luna (B3)

export type MoonSite = {
  id: string
  name: string
  group: 'apollo' | 'artemis3_candidate'
  lat: number
  lon: number // este positivo, −180..180
  position_type: 'lunar_module' | 'reference_feature_center'
  position_uncertainty_km: number
  place?: string
  reference_feature?: string
  landing_date_utc?: string
  crew_on_surface?: string
  history?: string
  note?: string
  source: string
}

export type MoonSites = { title: string; frame: string; sources: Record<string, string>; sites: MoonSite[] }

export type MoonWindow = { start: string | null; end: string | null; hours: number; open_start: boolean; open_end: boolean }

export type MoonVisibility = {
  site: Pick<MoonSite, 'id' | 'name' | 'group' | 'lat' | 'lon' | 'position_type'>
  start_utc: string
  end_utc: string
  days: number
  step_min: number
  summary: {
    sunlit_hours: number
    sunlit_fraction: number
    earth_visible_hours: number
    earth_visible_fraction: number
    sun_and_earth_hours: number
    sun_up_at_start: boolean
    earth_up_at_start: boolean
    hours_to_sunset: number | null
    hours_to_sunrise: number | null
    hours_to_earthset: number | null
    hours_to_earthrise: number | null
    max_sun_elevation_deg: number
    earth_elevation_range_deg: Pair
  }
  windows: { sunlit: MoonWindow[]; earth_visible: MoonWindow[]; sun_and_earth: MoonWindow[] }
  series: {
    time_utc: string[]
    hours_from_start: number[]
    sun_elevation_deg: number[]
    sun_azimuth_deg: number[]
    earth_elevation_deg: number[]
    earth_azimuth_deg: number[]
  }
  model: { ephemeris: string; horizon: string; sunlit_definition: string; earth_visible_definition: string; validation: string }
}

// ---------------------------------------------------------------- Marte (B3)

export type MarsRoutePoint = { lat: number; lon: number; elevation_m: number; sol: number; odometry_km: number }

export type MarsStop = {
  id: string
  title: string
  sol: number
  date: string
  rock_type: string | null
  lat: number
  lon: number
  elevation_m: number
  odometry_km: number
  why_water: string
  position_source: string
}

export type MarsSteepSegment = {
  type: 'steep_slope'
  lat: number
  lon: number
  sol: number
  grade_percent: number
  segment_m: number
  source: string
}

export type MarsWalk = {
  title: string
  summary: string
  crater: { name: string; lat: number; lon: number; diameter_km: number; source: string }
  frame: string
  route: { n_points: number; length_km: number; sols: Pair; points: MarsRoutePoint[]; source: string; simplification: string }
  stops: MarsStop[]
  hazards: {
    steep_segments: MarsSteepSegment[]
    terrain_context: { type: string; text: string }[]
    steep_threshold_percent: number
  }
  layers: { id: string; kind: string; name: string; url_template: string; tile_scheme: string; verified: { ok: boolean } }[]
  sources: Record<string, string>
  generated_at: string
}

// ---------------------------------------------------------------- hielo: SPLICES y 3I/ATLAS (estáticos)

export type SplicesRegion = { id: string; name: string; ra: number; dec: number; radius_arcmin: number; n_sources: number }

/** Fila de SPLICES en el orden de `columns`: id, ra, dec, name, class, ml_class, selection, k, w2, w3, ice_priority, regions. */
export type SplicesRow = [
  string,
  number,
  number,
  string | null,
  string | null,
  string | null,
  string | null,
  number | null,
  number | null,
  number | null,
  1 | 2 | 3,
  string[],
]

export type SplicesCatalog = {
  catalog: string
  citation: string
  access: string
  important: string
  regions: SplicesRegion[]
  allsky: string
  n_sources: number
  columns: string[]
  rows: SplicesRow[]
  generated_at: string
}

export type AtlasCatalog = {
  name: string
  type: string
  processed_by_us: boolean
  spherex_observations: {
    summary: string
    periods: { label: string; survey_weeks: string[]; n_spectral_images: number }[]
    n_spectral_images_total: number
    count_source: string
  }
  irsa: {
    page: string
    observation_table_votable: string
    observation_table_note: string
    download_scripts: Record<string, string>
    irsa_viewer: string
  }
  spherex_results: { title: string; reference: string; url: string; highlights: string[] }[]
  news: { title: string; url: string }[]
  ruta_del_agua: string
  sources_checked: string
  generated_at: string
}
