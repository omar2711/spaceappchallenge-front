import type { GaiaField, GaiaSource } from '../../../api/types'

type Props = {
  gaia: GaiaField | null
  failed: boolean
  pixelScale: number // ″ por píxel
  epochs: string[]
  targetMovesFast: boolean // el objetivo tiene movimiento propio > 1″/año
}

const shiftArcsec = (s: GaiaSource, epochs: string[], pixelScale: number) => {
  const a = s.epochs[epochs[0]]?.px
  const b = s.epochs[epochs[epochs.length - 1]]?.px
  return a && b ? Math.hypot(b[0] - a[0], b[1] - a[1]) * pixelScale : 0
}

/** Leyenda de la capa Gaia y lista de las estrellas del campo que se mueven ≥ 20 mas/año. */
export default function GaiaPanel({ gaia, failed, pixelScale, epochs, targetMovesFast }: Props) {
  if (failed) return <p className="skyviewer-note">No se pudo cargar el catálogo Gaia de este campo.</p>
  if (!gaia) return <p className="skyviewer-note">Cargando estrellas de Gaia DR3…</p>
  const movers = gaia.sources.filter((s) => s.arrow)
  const fastInGaia = movers.some((s) => s.pm_total_mas_yr > 1000)

  return (
    <section className="skyviewer-panel" aria-labelledby="gaia-title">
      <h2 id="gaia-title" className="skyviewer-panel-title">
        Estrellas que se mueven (Gaia DR3)
      </h2>
      <p className="skyviewer-note">
        <span className="skyviewer-key skyviewer-key--star" /> <span className="num">{gaia.n_sources}</span>{' '}
        estrellas de Gaia más brillantes que <span className="num">G {gaia.g_limit}</span>, dibujadas donde estaban
        en cada pasada. <span className="skyviewer-key" /> La flecha es lo que avanzaron entre la primera y la última
        pasada. <span className="skyviewer-key skyviewer-key--dashed" /> Si es punteada, solo indica hacia dónde: el
        avance real es menor que un píxel.
      </p>
      {movers.length === 0 ? (
        <p className="skyviewer-note">
          Ninguna estrella del campo se mueve <span className="num">20 mas</span> o más por año.
        </p>
      ) : (
        <table className="skyviewer-table">
          <caption>Se mueven 20 mas o más por año ({movers.length})</caption>
          <thead>
            <tr>
              <th scope="col">Gaia DR3</th>
              <th scope="col">Brillo G</th>
              <th scope="col">Por año</th>
              <th scope="col">
                De {epochs[0]} a {epochs[epochs.length - 1]}
              </th>
            </tr>
          </thead>
          <tbody>
            {movers.map((s) => {
              const shift = shiftArcsec(s, epochs, pixelScale)
              return (
                <tr key={s.source_id} className={s.pm_total_mas_yr > 1000 ? 'is-hit' : undefined}>
                  <td>…{s.source_id.slice(-7)}</td>
                  <td>{s.g_mag.toFixed(1)}</td>
                  <td>{(s.pm_total_mas_yr / 1000).toFixed(s.pm_total_mas_yr > 1000 ? 2 : 3)}″/año</td>
                  <td>
                    {shift.toFixed(shift >= 1 ? 1 : 3)}″ ({Number((shift / pixelScale).toPrecision(2))} px)
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
      {targetMovesFast && !fastInGaia && (
        <p className="skyviewer-note">
          El objetivo no aparece en Gaia DR3 porque casi no emite luz visible. Su movimiento solo se ve en el
          infrarrojo de SPHEREx.
        </p>
      )}
      <p className="skyviewer-note">
        Las posiciones se calculan desde 2016 con el movimiento propio, sin contar el paralaje. Fuente: ESA/Gaia/DPAC.
      </p>
    </section>
  )
}
