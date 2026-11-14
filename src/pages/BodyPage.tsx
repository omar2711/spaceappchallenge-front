import { useParams } from 'react-router-dom'
import { isWorldId, worlds } from '../data/bodies'
import PlaceholderPage from './PlaceholderPage'

// PLACEHOLDER: /body/moon y /body/mars las implementa otra persona.
export default function BodyPage() {
  const { id } = useParams()
  // Se valida el id contra el catálogo: una URL inventada (/body/pluton) debe
  // decir "no encontrado" y no fingir que existe una página en construcción.
  if (!isWorldId(id)) return <PlaceholderPage building={false} title="Mundo no encontrado" description="Los mundos disponibles son la Luna y Marte." />
  return <PlaceholderPage title={worlds[id].name} />
}
