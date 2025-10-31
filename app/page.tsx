import { Suspense } from 'react'
import { HeroSection } from '@/components/sections/HeroSection'
import { StatsSection } from '@/components/sections/StatsSection'
import { FeaturedProducts } from '@/components/sections/FeaturedProducts'
import { CTASection } from '@/components/sections/CTASection'
import { Footer } from '@/components/layout/Footer'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Suspense fallback={<LoadingSpinner size="lg" text="Načítání hlavní stránky..." className="py-20" />}>
          <HeroSection />
        </Suspense>
        <Suspense fallback={<LoadingSpinner size="md" text="Načítání doporučených produktů..." className="py-10" />}>
          <FeaturedProducts />
        </Suspense>
        <Suspense fallback={<LoadingSpinner size="md" text="Načítání statistik..." className="py-10" />}>
          <StatsSection />
        </Suspense>
        <Suspense fallback={<LoadingSpinner size="md" text="Načítání..." className="py-10" />}>
          <CTASection />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
