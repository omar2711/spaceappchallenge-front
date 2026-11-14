import Hero from '../features/landing/Hero'
import WorldsSection from '../features/landing/WorldsSection'
import WhyWaterSection from '../features/landing/WhyWaterSection'
import TeamSection from '../features/landing/TeamSection'

// La landing es una sucesión de secciones; cada una es un componente en
// features/landing/ para que varias personas trabajen en paralelo sin choques.
export default function LandingPage() {
  return (
    <>
      <Hero />
      <WorldsSection />
      <WhyWaterSection />
      <TeamSection />
    </>
  )
}
