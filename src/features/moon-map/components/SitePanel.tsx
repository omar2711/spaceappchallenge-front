import { Link } from 'react-router-dom'
import type { MoonSite } from '../../../api/types'
import { ABANDONED_CARD, formatLatLon, GROUP_LABEL, historyEs, noteEs } from '../data/sites'

type Props = {
  sites: MoonSite[] | null
  failed: boolean
  onRetry: () => void
  selected: MoonSite | null
  onSelect: (site: MoonSite) => void
  onSouthPole: () => void
}

function Group({ title, items, selected, onSelect }: { title: string; items: MoonSite[] } & Pick<Props, 'selected' | 'onSelect'>) {
  return (
    <>
      <h3 className="moonmap-subtitle">{title}</h3>
      <ul className="moonmap-sites">
        {items.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              className="moonmap-btn moonmap-site-btn"
              aria-pressed={selected?.id === s.id}
              onClick={() => onSelect(s)}
            >
              <span>{s.name}</span>
              <span className="moonmap-site-region">{s.landing_date_utc?.slice(0, 4) ?? `±${s.position_uncertainty_km} km`}</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

// La lista de sitios son <button> reales: es la alternativa por teclado a tocar
// los marcadores del mapa, que un lector de pantalla o el teclado no alcanzan.
export default function SitePanel({ sites, failed, onRetry, selected, onSelect, onSouthPole }: Props) {
  return (
    <div className="moonmap-panel">
      <h2 className="moonmap-panel-title">Sitios de aterrizaje</h2>
      {failed ? (
        <div className="moonmap-error">
          <p className="moonmap-note">No se pudieron cargar los sitios.</p>
          <button type="button" className="moonmap-btn" onClick={onRetry}>
            Reintentar
          </button>
        </div>
      ) : !sites ? (
        <p className="moonmap-note" role="status">
          Cargando los sitios… Si el servidor estaba dormido, tarda unos 30 s.
        </p>
      ) : (
        <>
          <Group title="Alunizajes Apollo" items={sites.filter((s) => s.group === 'apollo')} selected={selected} onSelect={onSelect} />
          <Group
            title="Regiones candidatas de Artemis III"
            items={sites.filter((s) => s.group === 'artemis3_candidate')}
            selected={selected}
            onSelect={onSelect}
          />
        </>
      )}

      <button type="button" className="moonmap-btn" onClick={onSouthPole}>
        Ir al polo sur
      </button>

      {selected ? (
        <dl className="moonmap-detail" aria-live="polite">
          <h3 className="moonmap-subtitle">{selected.name}</h3>
          <div>
            <dt>Tipo</dt>
            <dd>{GROUP_LABEL[selected.group]}</dd>
          </div>
          {selected.place && (
            <div>
              <dt>Lugar</dt>
              <dd>{selected.place}</dd>
            </div>
          )}
          <div>
            <dt>Coordenadas</dt>
            <dd>
              <span className="num">{formatLatLon(selected.lat, selected.lon)}</span> (
              <span className="num">±{selected.position_uncertainty_km} km</span>,{' '}
              {selected.position_type === 'lunar_module' ? 'módulo lunar' : `centro de ${selected.reference_feature}`})
            </dd>
          </div>
          {selected.landing_date_utc && (
            <div>
              <dt>Alunizaje</dt>
              <dd>
                <span className="num">{selected.landing_date_utc} UT</span> · {selected.crew_on_surface}
              </dd>
            </div>
          )}
          {historyEs(selected) && (
            <div>
              <dt>Historia</dt>
              <dd>{historyEs(selected)}</dd>
            </div>
          )}
          {noteEs(selected) && (
            <div>
              <dt>Nota</dt>
              <dd>{noteEs(selected)}</dd>
            </div>
          )}
          {selected.group === 'apollo' && (
            <div>
              <dt>Lo que quedó allí</dt>
              <dd>
                <Link
                  className="moonmap-link"
                  to={ABANDONED_CARD[selected.id] ? `/abandonados#${ABANDONED_CARD[selected.id]}` : '/abandonados'}
                >
                  {ABANDONED_CARD[selected.id]
                    ? 'Ver lo que dejaron en este sitio'
                    : 'Ver lo que quedó en la Luna'}
                </Link>
              </dd>
            </div>
          )}
          <div>
            <dt>Fuente</dt>
            <dd>
              <a className="moonmap-link" href={selected.source} target="_blank" rel="noopener noreferrer">
                {new URL(selected.source).hostname}
              </a>
            </dd>
          </div>
        </dl>
      ) : (
        <p className="moonmap-note">Elige un sitio para verlo en el mapa y saber cuándo tiene Sol y Tierra a la vista.</p>
      )}

      {/* El mapa usa proyección global (no hay capas polares en Moon Trek): cerca
          de los polos la imagen se ve estirada, y conviene decirlo. */}
      <p className="moonmap-note">
        Cerca de los polos el mapa se ve estirado. Es por la proyección, no por el terreno.
      </p>
    </div>
  )
}
