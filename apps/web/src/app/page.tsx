import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/home/HeroSection'
import { CategoriesSection } from '@/components/home/CategoriesSection'
import { FeaturedEvents } from '@/components/home/FeaturedEvents'
import { HowItWorks } from '@/components/home/HowItWorks'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { OrganizerCTA } from '@/components/home/OrganizerCTA'
import { StatsSection } from '@/components/home/StatsSection'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <CategoriesSection />
        <FeaturedEvents />
        <HowItWorks />
        <TestimonialsSection />
        <OrganizerCTA />
      </main>
      <Footer />
    </>
  )
}
