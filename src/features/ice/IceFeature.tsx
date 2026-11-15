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
      <td>{r[7] != null ? r[7].toFixed(1) : '—'}</td>
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
        <small className="ice-eyebrow">RUTA DEL AGUA · HIELO EN EL CIELO</small>
        <h1 className="ice-title">Hielo en el cielo</h1>
        <p className="ice-lead">
          Antes de llegar a lagos, cometas y planetas, el agua viaja congelada sobre granos de polvo frío alrededor de
          estrellas que nacen. SPHEREx busca la huella de ese hielo (agua, CO₂ y CO a 3.05, 4.27 y 4.67 µm) en millones
          de fuentes.
        </p>
      </header>

      {(splices.failed || atlas.failed) && (
        <div className="ice-error" role="alert">
          <p>No se pudieron cargar los catálogos desde la API.</p>
          <button type="button" className="ice-btn" onClick={() => setAttempt((n) => n + 1)}>
            Reintentar
          </button>
        </div>
      )}

      <section className="ice-panel" aria-labelledby="splices-title">
        <small className="ice-eyebrow">CATÁLOGO SPLICES</small>
        <h2 id="splices-title" className="ice-h2">
          ¿Dónde mira SPHEREx para encontrar hielo?
        </h2>
        {!cat ? (
          !splices.failed && <p className="ice-note">Cargando el catálogo (~250 kB)…</p>
        ) : (
          <>
            <p className="ice-callout">
              <strong>Ojo:</strong> SPLICES lista fuentes donde es <strong>probable</strong> ver absorción de hielo en
              los espectros de SPHEREx; no contiene hielo medido. La prioridad de colores es nuestra: 1 = protoestrella
              embebida, 2 = otro objeto estelar joven, 3 = otra fuente. En los espectros que medimos en nuestros campos
              ninguna banda de hielo llega a 3σ: puedes comprobarlo en el espectro de cada campo del visor.
            </p>
            <SplicesMap catalog={cat} active={region} onRegion={setRegion} />
            <p className="ice-note">
              {cat.n_sources} fuentes: las del catálogo dentro de 30′ de cada uno de nuestros campos y las{' '}
              {cat.rows.filter((r) => r[11].includes(ALLSKY)).length} protoestrellas embebidas más brillantes de todo el
              cielo (K &lt; 9). Catálogo completo: ~8.9 millones de fuentes. Fuente: {cat.citation}.
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
                Todo el cielo: protoestrellas brillantes
              </button>
            </div>

            <h3 className="ice-h3">
              {reg ? `${reg.name}: ${reg.n_sources} fuentes a menos de ${reg.radius_arcmin}′` : 'Protoestrellas embebidas brillantes'}
            </h3>
            {field && (
              <p className="ice-note">
                <Link className="ice-link" to={skyLink(field.request.raDeg, field.request.decDeg, field.request.fovArcmin)}>
                  Abrir el campo de {field.name} en el visor →
                </Link>{' '}
                (cubre solo los {field.fovArcmin.toFixed(0)}′ centrales).
              </p>
            )}
            {rows.length === 0 ? (
              <p className="ice-note">
                Ninguna fuente de SPLICES cerca: un buen control, este campo no es una región de formación estelar.
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
                  {rows.length > MAX_ROWS && `Se muestran las ${MAX_ROWS} de mayor prioridad (de ${rows.length}). `}
                  «Ver en SPHEREx» abre el visor en esa posición: si no es uno de nuestros campos, el servidor genera
                  uno nuevo con imágenes reales (1–3 min la primera vez).
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
