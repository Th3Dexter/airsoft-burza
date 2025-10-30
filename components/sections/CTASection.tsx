import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Shield, Users, Plus, Search } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-16 lg:py-24 bg-gray-700 dark:bg-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Připojte se k největší airsoft komunitě v České republice
          </h2>
          
          <p className="text-lg text-gray-200 mb-8 max-w-3xl mx-auto">
            Začněte prodávat, nakupovat a komunikovat s tisíci airsoft nadšenci. 
            Registrace je zdarma a trvá jen pár minut.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-black hover:bg-gray-100 px-8 py-3 text-lg">
                <Plus className="h-5 w-5 mr-2" />
                Zaregistrovat se zdarma
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-3 text-lg">
                <Search className="h-5 w-5 mr-2" />
                Prohlédnout nabídky
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-gray-600 dark:bg-gray-700 rounded-lg p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-500 dark:bg-gray-600 rounded-lg mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">100% Bezpečnost</h3>
              <p className="text-slate-200 text-sm">
                Ověření uživatelů, šifrovaná komunikace a ochrana vašich dat
              </p>
            </div>
            
            <div className="bg-gray-600 dark:bg-gray-700 rounded-lg p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-500 dark:bg-gray-600 rounded-lg mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Aktivní komunita</h3>
              <p className="text-slate-200 text-sm">
                Připojte se k 2,500+ aktivním uživatelům a najděte nové přátele
              </p>
            </div>
            
            <div className="bg-gray-600 dark:bg-gray-700 rounded-lg p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-500 dark:bg-gray-600 rounded-lg mb-4">
                <Search className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Snadné vyhledávání</h3>
              <p className="text-slate-200 text-sm">
                Pokročilé filtry a rychlé vyhledávání produktů
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
