import { useState, type FormEvent } from 'react'
import type { SkyRequest } from '../../../api/sky'
import { formatDeg, parseDec, parseFov, parseRA, type ParseResult } from '../lib/parseCoords'

export type FormValues = { ra: string; dec: string; fov: string }

type Props = {
  values: FormValues
  onChange: (patch: Partial<FormValues>) => void
  onSubmit: (req: SkyRequest) => void
  busy: boolean
}

type Key = keyof FormValues

type FieldProps = {
  id: string
  label: string
  value: string
  result: ParseResult
  showError: boolean
  hint?: string
  conversion?: string
  placeholder: string
  onChange: (v: string) => void
  onBlur: () => void
}

function Field({ id, label, value, result, showError, hint, conversion, placeholder, onChange, onBlur }: FieldProps) {
  const error = showError && !result.ok ? result.error : null
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : conversion ? `${id}-conv` : null]
    .filter(Boolean)
    .join(' ')
  return (
    <div className="skyviewer-field">
      <label className="skyviewer-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="skyviewer-input"
        type="text"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
      {hint && (
        <p id={`${id}-hint`} className="skyviewer-hint">
          {hint}
        </p>
      )}
      {error ? (
        <p id={`${id}-error`} className="skyviewer-error">
          {error}
        </p>
      ) : (
        conversion && (
          <p id={`${id}-conv`} className="skyviewer-conv">
            {conversion}
          </p>
        )
      )}
    </div>
  )
}

export default function CoordForm({ values, onChange, onSubmit, busy }: Props) {
  const [touched, setTouched] = useState<Record<Key, boolean>>({ ra: false, dec: false, fov: false })
  const [submitted, setSubmitted] = useState(false)

  const ra = parseRA(values.ra)
  const dec = parseDec(values.dec)
  const fov = parseFov(values.fov)

  const touch = (k: Key) => setTouched((t) => ({ ...t, [k]: true }))
  const show = (k: Key) => submitted || touched[k]

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (ra.ok && dec.ok && fov.ok) {
      onSubmit({ raDeg: ra.deg, decDeg: dec.deg, fovArcmin: fov.deg })
      return
    }
    setSubmitted(true)
    // Lleva el foco al primer campo con error (después de que se pinte el mensaje).
    const form = e.currentTarget
    requestAnimationFrame(() => form.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus())
  }

  return (
    <form className="skyviewer-panel" onSubmit={handleSubmit} noValidate>
      <h2 className="skyviewer-panel-title">Parche de cielo</h2>

      <Field
        id="skyviewer-ra"
        label="Ascensión recta (RA)"
        value={values.ra}
        result={ra}
        showError={show('ra')}
        hint="Formatos: 08h55m10.831s · 08 55 10.831 · 133.795. Con h/m/s o espacios = horas; número decimal = grados."
        conversion={ra.ok ? `= ${formatDeg(ra.deg)} (${(ra.deg / 15).toFixed(5)} h)` : undefined}
        placeholder="08h55m10.831s"
        onChange={(v) => onChange({ ra: v })}
        onBlur={() => touch('ra')}
      />
      <Field
        id="skyviewer-dec"
        label="Declinación (Dec)"
        value={values.dec}
        result={dec}
        showError={show('dec')}
        hint="Formatos: -07d14m42.53s · -07 14 42.53 · -7.245. Siempre en grados."
        conversion={dec.ok ? `= ${formatDeg(dec.deg)}` : undefined}
        placeholder="-07d14m42.53s"
        onChange={(v) => onChange({ dec: v })}
        onBlur={() => touch('dec')}
      />
      <Field
        id="skyviewer-fov"
        label="Campo de visión (arcmin)"
        value={values.fov}
        result={fov}
        showError={show('fov')}
        hint="Entre 1 y 6 arcmin (los objetivos del desafío usan su campo de 4′)."
        placeholder="3"
        onChange={(v) => onChange({ fov: v })}
        onBlur={() => touch('fov')}
      />

      <button type="submit" className="skyviewer-btn skyviewer-btn--primary" disabled={busy}>
        {busy ? 'Cargando…' : 'Ver imágenes'}
      </button>
    </form>
  )
}
