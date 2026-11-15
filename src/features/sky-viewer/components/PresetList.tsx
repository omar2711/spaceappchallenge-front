import { WISE0855_CHALLENGE, type KnownField } from '../../../api/fields'
import { formatDecDms, formatRaHms } from '../lib/angles'

type Props = {
  fields: KnownField[] | null
  failed: boolean
  activeId?: string
  onPick: (f: KnownField) => void
  onRetry: () => void
}

type GroupProps = { title: string; items: KnownField[]; activeId?: string; onPick: Props['onPick'] }

function Group({ title, items, activeId, onPick }: GroupProps) {
  return (
    <>
      <h3 className="skyviewer-group-title">{title}</h3>
      <ul className="skyviewer-presets">
        {items.map((f) => (
          <li key={f.id} className="skyviewer-preset">
            <button
              type="button"
              className="skyviewer-btn skyviewer-preset-btn"
              aria-pressed={activeId === f.id}
              onClick={() => onPick(f)}
            >
              <span className="skyviewer-preset-name">{f.name}</span>
              <span className="skyviewer-preset-coords">
                {formatRaHms(f.request.raDeg)} {formatDecDms(f.request.decDeg)}
              </span>
            </button>
            {f.description && <span className="skyviewer-note skyviewer-preset-desc">{f.description}</span>}
            {f.id === 'wise0855' && (
              <span className="skyviewer-note skyviewer-preset-desc">
                En el enunciado:{' '}
                <span className="num">
                  {WISE0855_CHALLENGE.display?.ra} {WISE0855_CHALLENGE.display?.dec}
                </span>
                , donde estaba hacia 2010.
              </span>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}

export default function PresetList({ fields, failed, activeId, onPick, onRetry }: Props) {
  return (
    <div className="skyviewer-panel">
      <h2 className="skyviewer-panel-title">Objetos</h2>
      {failed ? (
        <div className="skyviewer-error-box">
          <p className="skyviewer-error">No se pudo cargar la lista de objetos.</p>
          <button type="button" className="skyviewer-btn" onClick={onRetry}>
            Reintentar
          </button>
        </div>
      ) : !fields ? (
        <p className="skyviewer-note" role="status">
          Cargando la lista… Si el servidor estaba dormido, tarda unos 30 s.
        </p>
      ) : (
        <>
          <Group
            title="Los cinco del reto"
            items={fields.filter((f) => f.kind === 'target')}
            activeId={activeId}
            onPick={onPick}
          />
          <Group
            title="Otros campos"
            items={fields.filter((f) => f.kind === 'preset')}
            activeId={activeId}
            onPick={onPick}
          />
          <p className="skyviewer-note">
            Las coordenadas son el centro de cada campo. Ya están calculados, así que abren al instante.
          </p>
        </>
      )}
    </div>
  )
}
