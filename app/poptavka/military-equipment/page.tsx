"use client"
import { Footer } from '@/components/layout/Footer'
import { ProductSearch } from '@/components/products/ProductSearch'
import { ProductGrid } from '@/components/products/ProductGrid'
import { useSearchParams } from 'next/navigation'

export default function ShanimMilitaryEquipmentPage() {
	const searchParams = useSearchParams()
	const params = {
		category: 'military-equipment',
		listingType: 'shanim' as const,
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
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-black dark:text-white mb-1">Poptávka: Military vybavení</h1>
						<p className="text-sm text-gray-600 dark:text-gray-300">Poptávky na oblečení, boty, batohy a taktické vybavení</p>
					</div>

					<div className="mb-8">
						<ProductSearch searchParams={params} />
					</div>

					<div className="w-full">
						<ProductGrid searchParams={params} />
					</div>
				</div>
			</main>
			<Footer />
		</div>
	)
}
