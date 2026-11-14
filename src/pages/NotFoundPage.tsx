import PlaceholderPage from './PlaceholderPage'

// Ruta comodín: sin ella, una URL desconocida mostraría una página vacía.
export default function NotFoundPage() {
  return <PlaceholderPage building={false} title="Página no encontrada" description="La dirección no existe." />
}
