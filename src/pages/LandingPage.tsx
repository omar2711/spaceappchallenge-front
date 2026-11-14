import Hero from '../features/landing/Hero'

// La landing es una sucesión de secciones; cada una es un componente en
// features/landing/ para que varias personas trabajen en paralelo sin choques.
export default function LandingPage() {
  return (
    <>
      <Hero />
    </>
  )
}
