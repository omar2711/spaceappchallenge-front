import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadFields, type KnownField } from '../../api/fields'
import { getAtlas, getSplices } from '../../api/ice'
import type { AtlasCatalog, SplicesCatalog, SplicesRow } from '../../api/types'
import './ice.css'
import AtlasCard from './components/AtlasCard'
import SplicesMap from './components/SplicesMap'
import { CLASS_ES, PRIORITY } from './data/texts'

const ALLSKY = 'allsky_bright_embedded'
const MAX_ROWS = 40

const skyLink = (ra: number, dec: number, fov: number) => `/cielo?ra=${ra}&dec=${dec}&fov=${fov}`

type Load<T> = { data?: T; failed?: boolean }

function useLoad<T>(fn: () => Promise<T>, attempt: number): Load<T> {
  const [state, setState] = useState<Load<T> & { attempt?: number }>({})
  useEffect(() => {
    let cancelled = false
    fn()
      .then((data) => !cancelled && setState({ data, attempt }))
      .catch(() => !cancelled && setState({ failed: true, attempt }))
    return () => {
      cancelled = true
    }
  }, [fn, attempt])
  return state
}

export default function IceFeature() {
  const [attempt, setAttempt] = useState(0)
  const splices = useLoad<SplicesCatalog>(getSplices, attempt)
  const atlas = useLoad<AtlasCatalog>(getAtlas, attempt)
  const fields = useLoad<KnownField[]>(loadFields, attempt)
  const [region, setRegion] = useState<string>('hl_tau')

  const cat = splices.data
  const rows = useMemo(() => {
    if (!cat) return []
    return cat.rows
      .filter((r) => r[11].includes(region))
      .sort((a, b) => a[10] - b[10] || (a[7] ?? 99) - (b[7] ?? 99))
  }, [cat, region])
  const reg = cat?.regions.find((g) => g.id === region)
  const field = fields.data?.find((f) => f.id === region)

  const sourceRow = (r: SplicesRow) => (
    <tr key={r[0]}>
      <td>
        <span className="ice-dot" style={{ background: PRIORITY[r[10]].color }} /> {r[3] ?? r[0]}
      </td>
      <td>{r[5] ? (CLASS_ES[r[5]] ?? r[5]) : '—'}</td>
      <td className="num">{r[7] != null ? r[7].toFixed(1) : '—'}</td>
      <td>
        <Link className="ice-link" to={skyLink(r[1], r[2], 3)}>
          Ver en SPHEREx
        </Link>
      </td>
    </tr>
  )

  return (
    <section className="ice">
      <header>
        <h1 className="ice-title">Hielo en el cielo</h1>
        <p className="ice-lead">
          Alrededor de las estrellas que se están formando, el agua está congelada sobre granos de polvo. SPHEREx busca
          la marca que deja ese hielo en la luz de millones de fuentes. El agua absorbe en{' '}
          <span className="num">3.05 µm</span>, el CO₂ en <span className="num">4.27 µm</span> y el CO en{' '}
          <span className="num">4.67 µm</span>.
        </p>
      </header>

      {(splices.failed || atlas.failed) && (
        <div className="ice-error" role="alert">
          <p>No se pudieron cargar los catálogos.</p>
          <button type="button" className="ice-btn" onClick={() => setAttempt((n) => n + 1)}>
            Reintentar
          </button>
        </div>
      )}

      <section className="ice-panel" aria-labelledby="splices-title">
        <h2 id="splices-title" className="ice-h2">
          Dónde busca SPHEREx el hielo
        </h2>
        {!cat ? (
          !splices.failed && <p className="ice-note">Cargando el catálogo SPLICES…</p>
        ) : (
          <>
            <p className="ice-callout">
              <strong>Ojo:</strong> SPLICES es una lista de fuentes donde probablemente se vea hielo en los espectros
              de SPHEREx. No es hielo medido. Los colores son nuestra prioridad: naranja para las protoestrellas
              envueltas en polvo, gris claro para otros objetos estelares jóvenes y gris oscuro para el resto. En
              nuestros campos ninguna banda de hielo llega a <span className="num">3σ</span>; lo puedes ver en el
              espectro de cada campo del visor.
            </p>
            <SplicesMap catalog={cat} active={region} onRegion={setRegion} />
            <p className="ice-note">
              Fig. · Catálogo SPLICES en todo el cielo, <span className="num">{cat.n_sources}</span> fuentes. Son las
              que están a menos de <span className="num">30′</span> de nuestros campos y las{' '}
              <span className="num">{cat.rows.filter((r) => r[11].includes(ALLSKY)).length}</span> protoestrellas más
              brillantes del cielo (<span className="num">K &lt; 9</span>). El catálogo completo tiene unos 8.9
              millones. Fuente: {cat.citation}.
            </p>

            <div className="ice-regions" role="group" aria-label="Región">
              {cat.regions.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className="ice-chip"
                  aria-pressed={region === g.id}
                  onClick={() => setRegion(g.id)}
                >
                  {g.name} · {g.n_sources}
                </button>
              ))}
              <button type="button" className="ice-chip" aria-pressed={region === ALLSKY} onClick={() => setRegion(ALLSKY)}>
                Protoestrellas brillantes de todo el cielo
              </button>
            </div>

            <h3 className="ice-h3">
              {reg ? `${reg.name}: ${reg.n_sources} fuentes a menos de ${reg.radius_arcmin}′` : 'Protoestrellas brillantes'}
            </h3>
            {field && (
              <p className="ice-note">
                <Link className="ice-link" to={skyLink(field.request.raDeg, field.request.decDeg, field.request.fovArcmin)}>
                  Abrir el campo de {field.name} en el visor
                </Link>{' '}
                Solo cubre los <span className="num">{field.fovArcmin.toFixed(0)}′</span> del centro.
              </p>
            )}
            {rows.length === 0 ? (
              <p className="ice-note">
                No hay fuentes de SPLICES cerca. Tiene sentido: aquí no se están formando estrellas.
              </p>
            ) : (
              <>
                <div className="ice-tablewrap">
                  <table className="ice-table">
                    <thead>
                      <tr>
                        <th scope="col">Fuente</th>
                        <th scope="col">Clase</th>
                        <th scope="col">Brillo K</th>
                        <th scope="col">Imágenes</th>
                      </tr>
                    </thead>
                    <tbody>{rows.slice(0, MAX_ROWS).map(sourceRow)}</tbody>
                  </table>
                </div>
                <p className="ice-note">
                  {rows.length > MAX_ROWS && `Mostramos las ${MAX_ROWS} de mayor prioridad de ${rows.length}. `}
                  «Ver en SPHEREx» abre el visor en esa posición. Si no es uno de nuestros campos, el servidor prepara
                  uno nuevo, que la primera vez tarda de 1 a 3 minutos.
                </p>
              </>
            )}
          </>
        )}
      </section>

      {atlas.data && <AtlasCard atlas={atlas.data} />}
    </section>
  )
}
