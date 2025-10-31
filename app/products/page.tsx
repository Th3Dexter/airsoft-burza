'use client'

import { Footer } from '@/components/layout/Footer'
import { ProductSearch } from '@/components/products/ProductSearch'
import { ProductGrid } from '@/components/products/ProductGrid'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

export default function ProductsPage() {
  const searchParams = useSearchParams()
  
  // Získání parametrů z URL
  // /products zobrazuje pouze produkty z kategorie "nabízím" (NABIZIM)
  const params = {
    category: searchParams.get('category') || '',
    listingType: 'nabizim' as const, // Vždy zobrazit jen nabídky
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
              Nabídky produktů
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Prohlédněte si všechny dostupné nabídky na naší platformě
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <ProductSearch searchParams={params} />
          </div>

          {/* Hlavní obsah s produkty */}
          <div className="w-full">
            <Suspense fallback={<LoadingSpinner size="md" text="Načítání produktů..." />}>
              <ProductGrid searchParams={params} />
            </Suspense>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}