import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getVisibility } from '../../api/b3'
import { loadFields } from '../../api/fields'
import type { Visibility } from '../../api/types'
import { todayCbba, when } from '../sky-viewer/lib/cbba'

// Lo mismo que la tarjeta "¿Se ve desde Cochabamba?" de /cielo para Epsilon Indi B: mismo endpoint
// (/visibility), mismas coordenadas (centro del campo) y misma fecha (hoy en Cochabamba).
const FIELD = 'eps_ind_b'
const SKY_LINK = '/cielo?ra=331.09668&dec=-56.80065&fov=3.998'

export default function CochabambaPanel() {
  const [date] = useState(todayCbba)
  const [state, setState] = useState<{ v?: Visibility; error?: boolean } | null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    loadFields()
      .then((fields) => {
        const f = fields.find((x) => x.id === FIELD)
        if (!f) throw new Error('No está el campo de Epsilon Indi B')
        return getVisibility(f.manifest.grid_wcs.CRVAL1, f.manifest.grid_wcs.CRVAL2, date, ctrl.signal)
      })
      .then((v) => setState({ v }))
      .catch(() => !ctrl.signal.aborted && setState({ error: true }))
    return () => ctrl.abort()
  }, [date])

  const v = state?.v
  const ev = v?.target_events
  return (
    <div className="sky-cbba" aria-live="polite">
      <p>
        Epsilon Indi B vista desde Cochabamba, noche del <span className="num">{date}</span>.
      </p>
      {!state && <p>Calculando…</p>}
      {state?.error && <p>No se pudo calcular. Revisa la conexión con el servidor.</p>}
      {v && ev && (
        <dl>
          <div>
            <dt>Altura máxima</dt>
            <dd>
              <span className="num">{ev.culmination_alt_deg.toFixed(0)}°</span> a las{' '}
              <span className="num">{when(ev.culmination)}</span>
            </dd>
          </div>
          {v.observable && v.best_time ? (
            <>
              <div>
                <dt>Mejor momento</dt>
                <dd>
                  <span className="num">{when(v.best_time.time)}</span>, a{' '}
                  <span className="num">{v.best_time.alt_deg.toFixed(0)}°</span> de altura y acimut{' '}
                  <span className="num">{v.best_time.az_deg.toFixed(0)}°</span>
                </dd>
              </div>
              <div>
                <dt>Sobre 20° con el cielo oscuro</dt>
                <dd>
                  <span className="num">{v.observable_hours.toFixed(1)} h</span>
                </dd>
              </div>
            </>
          ) : (
            <div>
              <dt>Esta noche</dt>
              <dd>No pasa de 20° de altura con el cielo oscuro.</dd>
            </div>
          )}
        </dl>
      )}
      {v && (
        <p>
          Está sobre el horizonte, pero una enana marrón es demasiado débil en luz visible para verla con un
          telescopio de aficionado.
        </p>
      )}
      <Link to={SKY_LINK}>Ver Epsilon Indi B en el visor</Link>
    </div>
  )
}
