import { landingSites, type LandingSite } from '../data/sites'

type Props = {
  selected: LandingSite | null
  onSelect: (site: LandingSite) => void
  onSouthPole: () => void
}

// La lista de sitios son <button> reales: es la alternativa por teclado a tocar
// los marcadores del mapa, que un lector de pantalla o el teclado no alcanzan.
export default function SitePanel({ selected, onSelect, onSouthPole }: Props) {
  return (
    <div className="moonmap-panel">
      <h2 className="moonmap-panel-title">Sitios de aterrizaje</h2>
      <p className="moonmap-note">
        <span className="moonmap-tag">DATOS DE EJEMPLO</span>
      </p>

      <ul className="moonmap-sites">
        {landingSites.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              className="moonmap-btn moonmap-site-btn"
              aria-pressed={selected?.id === s.id}
              onClick={() => onSelect(s)}
            >
              <span>{s.name}</span>
              <span className="moonmap-site-region">{s.region}</span>
            </button>
          </li>
        ))}
      </ul>

      <button type="button" className="moonmap-btn" onClick={onSouthPole}>
        Ir al polo sur
      </button>

      {selected ? (
        <dl className="moonmap-detail" aria-live="polite">
          <h3 className="moonmap-subtitle">{selected.name}</h3>
          <div><dt>Región</dt><dd>{selected.region}</dd></div>
          <div><dt>Coordenadas</dt><dd>Lat {selected.center[0]}°, Lon {selected.center[1]}°</dd></div>
          <div><dt>Agua</dt><dd>{selected.water}</dd></div>
          <div><dt>Pendiente</dt><dd>{selected.slope}</dd></div>
          <div><dt>Iluminación</dt><dd>{selected.light}</dd></div>
        </dl>
      ) : (
        <p className="moonmap-note">Elige un sitio para verlo en el mapa.</p>
      )}

      {/* El mapa usa proyección global (no hay capas polares en Moon Trek): cerca
          de los polos la imagen se ve estirada, y conviene decirlo. */}
      <p className="moonmap-note">
        Cerca de los polos el mapa se ve estirado: es un efecto de la proyección, no del terreno.
      </p>
    </div>
  )
}
