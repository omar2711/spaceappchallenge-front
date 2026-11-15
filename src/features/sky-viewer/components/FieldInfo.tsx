import { WISE0855_CHALLENGE } from '../../../api/fields'
import type { SkySeries } from '../../../api/sky'
import { formatDecDms, formatRaHms, separationDeg } from '../lib/angles'

const KIND: Record<SkySeries['field']['kind'], string> = {
  target: 'Objetivo del reto',
  preset: 'Campo de ejemplo',
  custom: 'Campo nuevo, generado para tus coordenadas',
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
      <h2 className="skyviewer-field-name">{series.field.name}</h2>
      <p className="skyviewer-note skyviewer-kind">{KIND[series.field.kind]}</p>
      <p className="skyviewer-coords">
        Centro: <span className="num">{formatRaHms(center.ra)} {formatDecDms(center.dec)}</span> · campo de{' '}
        <span className="num">{m.fov_arcmin.toFixed(1)}′</span> ·{' '}
        <span className="num">
          {m.image_size_px[0]}×{m.image_size_px[1]}
        </span>{' '}
        píxeles de <span className="num">{m.pixel_scale_arcsec}″</span>
      </p>
      <p className="skyviewer-note">
        {m.epochs.length} pasadas:{' '}
        {m.epochs.map((e, i) => (
          <span key={e.id}>
            {i > 0 && ' · '}
            {e.id} <span className="num">{day(e.date_start)}</span> a <span className="num">{day(e.date_end)}</span>
          </span>
        ))}
        {pm > 0.05 && (
          <>
            {' '}
            · se mueve <span className="num">{pm.toFixed(2)}″</span> por año
          </>
        )}
      </p>
      {isWise && (
        <p className="skyviewer-callout">
          <strong>¿Por qué el campo no está en las coordenadas del enunciado?</strong> El enunciado da{' '}
          <span className="num">
            {WISE0855_CHALLENGE.display?.ra} {WISE0855_CHALLENGE.display?.dec}
          </span>
          , que es donde la vio WISE hacia 2010. WISE 0855 se mueve <span className="num">{pm.toFixed(1)}″</span> por
          año, así que desde entonces avanzó <span className="num">{wiseShift.toFixed(1)}′</span>. Centramos el campo
          donde estaba en 2025 y 2026, cuando la fotografió SPHEREx.
        </p>
      )}
      {series.field.kind === 'custom' && (
        <p className="skyviewer-note">
          No sabemos si algo se mueve en este campo, así que la cruz marca la posición pedida en todas las pasadas.
        </p>
      )}
    </div>
  )
}
