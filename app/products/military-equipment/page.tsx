'use client'

import { Footer } from '@/components/layout/Footer'
import { ProductSearch } from '@/components/products/ProductSearch'
import { ProductGrid } from '@/components/products/ProductGrid'
import { useSearchParams } from 'next/navigation'

export default function MilitaryEquipmentPage() {
  const searchParams = useSearchParams()
  
  // Získání parametrů z URL s nastavenou kategorií na "military-equipment"
  const params = {
    category: 'military-equipment',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    condition: searchParams.get('condition') || '',
    location: searchParams.get('location') || '',
    sort: searchParams.get('sort') || 'newest',
    page: searchParams.get('page') || '1'
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black dark:text-white mb-4">
              Military vybavení
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Taktické vesty, boty, rukavice a další military vybavení
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <ProductSearch searchParams={params} />
          </div>

          {/* Hlavní obsah s produkty */}
          <div className="w-full">
            <ProductGrid searchParams={params} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}