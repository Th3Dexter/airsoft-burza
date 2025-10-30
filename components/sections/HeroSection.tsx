import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Search, Shield, Users, ArrowRight, Plus } from 'lucide-react'

export function HeroSection() {
  return (
                <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                Největší airsoft komunita v ČR
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black dark:text-white mb-6 leading-tight">
                Najděte své
                <span className="block text-gray-700 dark:text-gray-300">
                  ideální vybavení
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl leading-relaxed">
                Platforma pro prodej a nákup airsoftových zbraní a military vybavení.
                Bezpečná komunikace a ověření uživatelů.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Link href="/products">
                            <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-8 py-3 text-lg">
                    <Search className="h-5 w-5 mr-2" />
                    Prohlédnout nabídky
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/products/new">
                            <Button size="lg" variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-8 py-3 text-lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Přidat inzerát
                  </Button>
                </Link>
              </div>

            </div>

            {/* Right Content - Features Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4">
                              <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">100% Bezpečnost</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Ověření uživatelů, šifrovaná komunikace a ochrana vašich dat
                </p>
              </div>

                          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4">
                              <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">Aktivní komunita</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Připojte se k 2,500+ aktivním uživatelům a najděte nové přátele
                </p>
              </div>

                          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4">
                              <Search className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">Snadné vyhledávání</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Pokročilé filtry a rychlé vyhledávání produktů
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
