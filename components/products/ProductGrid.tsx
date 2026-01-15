'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  MapPin, 
  Clock, 
  Eye,
  Grid3X3,
  List,
  Package
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface Product {
  mainImage?: string | null
  id: string
  title: string
  description: string
  price: number
  images: string[]
  location: string
  condition: string
  rating?: number
  reviews?: number
  isNew?: boolean
  category: string
  userName?: string
  userIsVerified?: boolean
  viewCount?: number
  createdAt: string
}

interface ProductGridProps {
  searchParams: {
    category?: string
    listingType?: 'nabizim' | 'shanim'
    search?: string
    minPrice?: string
    maxPrice?: string
    condition?: string
    location?: string
    sort?: string
    page?: string
  }
}

export function ProductGrid({ searchParams }: ProductGridProps) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Načítání dat z API
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      
      try {
        // Vytvoření query parametrů
        const params = new URLSearchParams()
        
        if (searchParams.category) params.append('category', searchParams.category)
        if (searchParams.listingType) params.append('listingType', searchParams.listingType)
        if (searchParams.search) params.append('search', searchParams.search)
        if (searchParams.minPrice) params.append('minPrice', searchParams.minPrice)
        if (searchParams.maxPrice) params.append('maxPrice', searchParams.maxPrice)
        if (searchParams.condition) params.append('condition', searchParams.condition)
        if (searchParams.location) params.append('location', searchParams.location)
        if (searchParams.sort) params.append('sort', searchParams.sort)
        if (searchParams.page) params.append('page', searchParams.page)
        
        // Načtení dat z API
        const response = await fetch(`/api/products?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || [])
          setCurrentPage(data.pagination?.page || 1)
          setTotalPages(data.pagination?.totalPages || 1)
        } else {
          console.error('Chyba při načítání produktů:', response.statusText)
          setProducts([])
        }
      } catch (error) {
        console.error('Chyba při načítání produktů:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    
    loadProducts()
  }, [searchParams])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48"></div>
          <div className="flex gap-2">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700 animate-pulse">
                <div className="w-full h-64 bg-gray-300 dark:bg-gray-600"></div>
              </div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-4 animate-pulse"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Zjistit, zda jsou aktivní filtry nebo vyhledávání (kromě defaultní kategorie)
  // Kategorie sama o sobě není "filtr", ale součást URL struktury
  const hasActiveFilters = !!(
    searchParams.search ||
    searchParams.minPrice ||
    searchParams.maxPrice ||
    searchParams.condition ||
    searchParams.location ||
    (searchParams.sort && searchParams.sort !== 'newest')
  )

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {hasActiveFilters 
            ? 'Žádné inzeráty neodpovídají zadaným parametrům vyhledávání' 
            : 'Zatím žádné inzeráty'}
        </h3>
        <p className="text-foreground mb-6">
          {hasActiveFilters 
            ? 'Zkuste změnit filtry nebo vyhledávací termín' 
            : 'Buďte první, kdo přidá inzerát na platformu'}
        </p>
        {!hasActiveFilters && (
          <Button asChild>
            <Link href="/products/new">Přidat první inzerát</Link>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header s počtem a přepínačem zobrazení */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-foreground">
          Zobrazeno {products.length} produktů
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid/List zobrazení */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        : 'space-y-4'
      }>
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full relative">
            {/* Obrázek - fixní výška */}
            <div className="relative w-full h-64 bg-gray-200 dark:bg-gray-700">
              {/* Štítky vpravo nahoře na obrázku */}
              <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
                {/* Placeholder pro budoucí štítky - lze přidat podle potřeby */}
                {product.isNew && (
                  <Badge variant="secondary" className="text-xs">
                    Nové
                  </Badge>
                )}
              </div>
              {(() => {
                const cover = (product as any).mainImage && typeof (product as any).mainImage === 'string' && (product as any).mainImage.trim().length > 0
                  ? (product as any).mainImage
                  : (product.images && Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string'
                      ? product.images[0]
                      : null)
                return cover ? (
                <Link href={`/products/${product.id}`}>
                <Image
                    src={cover}
                  alt={product.title}
                  width={400}
                    height={256}
                    className="w-full h-64 object-cover cursor-pointer"
                    unoptimized
                />
                </Link>
              ) : (
                <div className="w-full h-64 flex items-center justify-center">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
                )
              })()}
            </div>
            
            {/* Obsah - flex-grow pro stejnou výšku */}
            <CardContent className="p-4 flex flex-col flex-grow">
              {/* Název - fixní výška s line-clamp */}
              <Link href={`/products/${product.id}`} className="hover:underline mb-2">
                <h3 className="font-semibold text-foreground text-lg line-clamp-2 min-h-[3.5rem]">
                  {product.title}
                </h3>
              </Link>
              
              {/* Popis - fixní výška s line-clamp */}
              <p className="text-sm text-foreground mb-3 line-clamp-2 min-h-[2.5rem]">
                {product.description}
              </p>
              
              {/* Cena - fixní pozice */}
              <div className="mb-3">
                <span className="text-xl font-bold text-foreground">
                  {formatPrice(product.price)}
                </span>
              </div>
              
              {/* Lokace a datum - fixní pozice */}
              <div className="flex items-center justify-between text-xs text-foreground mb-3">
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {product.location}
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(product.createdAt).toLocaleString('cs-CZ', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              
              {/* Prodejce a počet zobrazení - na stejné úrovni */}
              <div className="flex items-center justify-between text-sm text-foreground mb-3">
                <div className="flex items-center">
                  <span>Od: {product.userName || 'Neznámý prodejce'}</span>
                  {product.userIsVerified && (
                    <span className="ml-2 text-green-600 dark:text-green-400">✓</span>
                  )}
                </div>
                {/* Počet zobrazení - vpravo na stejné úrovni jako prodejce */}
                <div className="text-xs text-foreground">
                  Zobrazeno: {product.viewCount || 0}×
                </div>
              </div>
              
              {/* Spacer pro flex-grow */}
              <div className="flex-grow"></div>
            </CardContent>
            
            {/* Footer s tlačítkem - fixní pozice */}
            <CardFooter className="p-4 pt-0 mt-auto">
              <Button 
                className="w-full" 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  router.push(`/products/${product.id}`)
                }}
              >
                  <Eye className="h-4 w-4 mr-2" />
                Zobrazit podrobnosti
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Stránkování */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => {
              const newPage = currentPage - 1
              const url = new URL(window.location.href)
              url.searchParams.set('page', newPage.toString())
              window.location.href = url.toString()
            }}
          >
            Předchozí
          </Button>
          
          <span className="text-sm text-foreground">
            Stránka {currentPage} z {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => {
              const newPage = currentPage + 1
              const url = new URL(window.location.href)
              url.searchParams.set('page', newPage.toString())
              window.location.href = url.toString()
            }}
          >
            Další
          </Button>
        </div>
      )}
    </div>
  )
}