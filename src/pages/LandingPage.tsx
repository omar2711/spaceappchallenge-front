import Hero from '../features/landing/Hero'
import WorldsSection from '../features/landing/WorldsSection'
import WhyWaterSection from '../features/landing/WhyWaterSection'
import ChallengeSection from '../features/landing/ChallengeSection'
import TargetsSection from '../features/landing/TargetsSection'
import RouteSection from '../features/landing/RouteSection'
import SourcesSection from '../features/landing/SourcesSection'
import FaqSection from '../features/landing/FaqSection'
import TeamSection from '../features/landing/TeamSection'
import ClosingSection from '../features/landing/ClosingSection'
import HowItWorksSection from '../features/landing/HowItWorksSection'
import CreditsSection from '../features/landing/CreditsSection'

// La landing es una sucesión de secciones; cada una es un componente en
// features/landing/ para que varias personas trabajen en paralelo sin choques.
export default function LandingPage() {
  return (
    <>
      <Hero />
      <WorldsSection />
      <WhyWaterSection />
      <ChallengeSection />
      <TargetsSection />
      <RouteSection />
      <SourcesSection />
      <FaqSection />
      <TeamSection />
      <ClosingSection />
      <HowItWorksSection />
      <CreditsSection />
    </>
  )
}
