import type { CustomStatus } from '../../../api/types'

const STAGES: Record<string, string> = {
  queued: 'En cola',
  query: 'Buscando imágenes de SPHEREx en IRSA',
  download: 'Descargando recortes de IRSA',
  stack: 'Alineando y sumando por pasada y detector',
  export: 'Generando las imágenes',
  done: 'Listo',
}

type Props = { status: CustomStatus | null; elapsedS: number }

export default function JobProgress({ status, elapsedS }: Props) {
  const pct = Math.round(status?.progress ?? 0)
  const stage = status?.stage ? (STAGES[status.stage] ?? status.stage) : 'Preparando la solicitud'
  return (
    <div className="skyviewer-panel skyviewer-job" role="status" aria-live="polite">
      <h2 className="skyviewer-panel-title">Preparando un campo nuevo</h2>
      <p className="skyviewer-job-stage">
        {stage}
        {status?.message && status.stage !== 'done' && <span className="skyviewer-note"> · {status.message}</span>}
      </p>
      <div className="skyviewer-progress" aria-hidden="true">
        <div className="skyviewer-progress-bar" style={{ width: `${pct}%` }} />
      </div>
      <p className="skyviewer-note">
        <span className="num">{pct}%</span> · <span className="num">{elapsedS} s</span>. Nadie había pedido estas
        coordenadas antes, así que el servidor está bajando y sumando las imágenes de SPHEREx. La primera vez tarda
        de 1 a 3 minutos; después abren al instante.
      </p>
    </div>
  )
}
