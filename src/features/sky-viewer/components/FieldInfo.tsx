import { WISE0855_CHALLENGE } from '../../../api/fields'
import type { SkySeries } from '../../../api/sky'
import { formatDecDms, formatRaHms, separationDeg } from '../lib/angles'

const KIND: Record<SkySeries['field']['kind'], string> = {
  target: 'Objetivo del desafío',
  preset: 'Campo de demo',
  custom: 'Campo generado para tus coordenadas',
}

const day = (iso: string) => iso.slice(0, 10)

export default function FieldInfo({ series }: { series: SkySeries }) {
  const m = series.manifest
  const center = { ra: m.grid_wcs.CRVAL1, dec: m.grid_wcs.CRVAL2 }
  const pm = Math.hypot(m.proper_motion_mas_yr.pmra, m.proper_motion_mas_yr.pmdec) / 1000 // ″/año
  const isWise = series.field.id === 'wise0855'
  const wiseShift = isWise
    ? separationDeg(WISE0855_CHALLENGE.raDeg, WISE0855_CHALLENGE.decDeg, center.ra, center.dec) * 60
    : 0

  return (
    <div className="skyviewer-panel skyviewer-fieldinfo">
      <p className="skyviewer-eyebrow">{KIND[series.field.kind]}</p>
      <h2 className="skyviewer-field-name">{series.field.name}</h2>
      <p className="skyviewer-conv">
        Centro del campo: {formatRaHms(center.ra)} {formatDecDms(center.dec)} · {m.fov_arcmin.toFixed(1)}′ ·{' '}
        {m.image_size_px[0]}×{m.image_size_px[1]} px de {m.pixel_scale_arcsec}″
      </p>
      <p className="skyviewer-note">
        {m.epochs.length} pasadas de SPHEREx:{' '}
        {m.epochs.map((e) => `${e.id} (${day(e.date_start)} → ${day(e.date_end)})`).join(' · ')}
        {pm > 0.05 && <> · Movimiento propio: {pm.toFixed(2)}″/año</>}
      </p>
      {isWise && (
        <p className="skyviewer-callout">
          <strong>¿Por qué no usamos las coordenadas del enunciado?</strong> El enunciado da{' '}
          {WISE0855_CHALLENGE.display?.ra} {WISE0855_CHALLENGE.display?.dec}, la posición medida por WISE hacia
          2010. WISE 0855 se mueve {pm.toFixed(1)}″ por año, así que desde entonces se desplazó{' '}
          {wiseShift.toFixed(1)}′: el campo está centrado en su posición de 2025–2026, cuando la observó SPHEREx.
        </p>
      )}
      {series.field.kind === 'custom' && (
        <p className="skyviewer-note">
          Campo sin movimiento propio conocido: la cruz marca la posición pedida en todas las pasadas.
        </p>
      )}
    </div>
  )
}
