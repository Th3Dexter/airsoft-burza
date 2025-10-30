'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Heart, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Star, 
  Eye,
  Grid3X3,
  List,
  Package
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface Product {
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
  seller: {
    name: string
    verified: boolean
    rating?: number
  }
  createdAt: string
}

interface ProductGridProps {
  searchParams: {
    category?: string
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

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Žádné produkty nenalezeny
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Zkuste změnit filtry nebo vyhledávací termín
        </p>
        <Button asChild>
          <Link href="/products/new">Přidat první inzerát</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header s počtem a přepínačem zobrazení */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600 dark:text-gray-300">
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
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
              {product.images && product.images.length > 0 && product.images[0] && product.images[0].startsWith('/') ? (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  width={400}
                  height={300}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-900 dark:text-white text-lg line-clamp-2">
                  {product.title}
                </h3>
                {product.isNew && (
                  <Badge variant="secondary" className="ml-2">
                    Nové
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                {product.description}
              </p>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  {formatPrice(product.price)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {product.category}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {product.location}
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(product.createdAt).toLocaleDateString('cs-CZ')}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <span>Od: {product.seller?.name || 'Neznámý prodejce'}</span>
                  {product.seller?.verified && (
                    <span className="ml-2 text-green-600 dark:text-green-400">✓</span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Button size="sm" variant="outline">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="p-4 pt-0">
              <Button asChild className="w-full">
                <Link href={`/products/${product.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  Zobrazit detail
                </Link>
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
          
          <span className="text-sm text-gray-600 dark:text-gray-300">
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