import './section.css'
import './ChallengeSection.css'

// Una sola lista de filas alimenta la tabla: quien edite el contenido toca datos,
// no marcado. Los siete requisitos son los que definió el equipo; la columna
// derecha solo nombra la capacidad (sin detalles técnicos que aún no existen).
const rows = [
  { ask: 'Coordenadas en la URL', does: 'Cada vista se comparte con un enlace: las coordenadas viajan en la URL.' },
  { ask: 'Campo de visión ajustable', does: 'El usuario ajusta el campo de visión del recorte del cielo.' },
  { ask: 'Espectros', does: 'Muestra el espectro del objetivo seleccionado.' },
  { ask: 'Capa Gaia', does: 'Superpone la capa de Gaia DR3 al recorte.' },
  { ask: 'Flags de contaminación', does: 'Señala los flags de contaminación de las mediciones.' },
  { ask: 'Sumar y restar épocas', does: 'Compara fechas sumando y restando épocas.' },
  { ask: 'Fácil de actualizar con nuevos datos', does: 'Se actualiza con datos nuevos sin rehacer el visor.' },
]

export default function ChallengeSection() {
  return (
    <section id="reto" className="section" aria-labelledby="challenge-title">
      <div className="section__inner">
        <h2 id="challenge-title" className="section__title">El reto y nuestra respuesta</h2>
        {/* <table> real (no una cuadrícula de divs): es un dato de dos columnas y
            los lectores de pantalla lo recorren fila por fila con sus cabeceras. */}
        <table className="challenge__table">
          <caption className="sr-only">Lo que pide el reto y lo que hace Ruta del Agua</caption>
          <thead>
            <tr>
              <th scope="col">Lo que pide el reto</th>
              <th scope="col">Lo que hace Ruta del Agua</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.ask}>
                <th scope="row">{row.ask}</th>
                <td>{row.does}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
