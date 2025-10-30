'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Heart,
  MessageCircle,
  MapPin,
  Clock,
  Star,
  Eye,
  Package
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export function FeaturedProducts() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=6')
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || [])
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (isLoading) {
    return (
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Doporučené inzeráty
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Načítání nejnovějších inzerátů...
            </p>
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
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Zatím žádné inzeráty
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
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
    <section className="py-16 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Doporučené inzeráty
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Prohlédněte si nejnovější inzeráty na naší platformě
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any) => (
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
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      Nové
                    </span>
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
                    <span>Od: {product.userNickname || product.userName}</span>
                    {product.userIsVerified && (
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

        <div className="text-center mt-8">
          <Button asChild variant="outline">
            <Link href="/products">Zobrazit všechny inzeráty</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}