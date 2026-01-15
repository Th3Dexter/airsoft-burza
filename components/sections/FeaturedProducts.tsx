'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  MapPin,
  Clock,
  Eye,
  Package
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export function FeaturedProducts() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isCancelled = false
    
    const fetchProducts = async () => {
      try {
        // Načíst poslední 3 přidané inzeráty (seřazené podle data, jen nabídky)
        const response = await fetch('/api/products?limit=3&sort=newest&listingType=nabizim')
        if (response.ok && !isCancelled) {
          const data = await response.json()
          setProducts(data.products || [])
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching products:', error)
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchProducts()
    
    return () => {
      isCancelled = true
    }
  }, [])

  if (isLoading) {
    return (
      <section className="py-16 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 opacity-80">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Právě přidané inzeráty
          </h2>
          <p className="text-lg text-muted-foreground">
            Načítání nejnovějších inzerátů...
          </p>
        </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
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
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section className="py-16 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 opacity-80">
          <div className="text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Zatím žádné inzeráty
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Buďte první, kdo přidá inzerát na naši platformu!
            </p>
            <Button asChild>
              <Link href="/products/new">Přidat inzerát</Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 opacity-80">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Právě přidané inzeráty
          </h2>
          <p className="text-lg text-muted-foreground">
            Prohlédněte si nejnovější přidané inzeráty na naší platformě
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any) => (
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
                  const cover = product.mainImage && typeof product.mainImage === 'string' && product.mainImage.trim().length > 0
                    ? product.mainImage
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

        <div className="text-center mt-8">
          <Button asChild variant="outline">
            <Link href="/products">Zobrazit další inzeráty</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}