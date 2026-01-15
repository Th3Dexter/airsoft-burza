'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useNotifications } from '@/lib/NotificationContext'
import { 
  Package, 
  Search,
  Eye,
  Trash2,
  Edit,
  EyeOff,
  ArrowLeft,
  Filter
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  title: string
  description: string
  price: number
  mainImage?: string
  images: string[]
  location: string
  isActive: boolean
  isSold: boolean
  userId: string
  userName: string
  createdAt: string
}

export default function AdminProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showSuccess, showError, showConfirmation } = useNotifications()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'sold'>('all')
  const [loadingProducts, setLoadingProducts] = useState(false)

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true)
    try {
      const response = await fetch('/api/admin/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
        setFilteredProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error loading products:', error)
      showError('Chyba', 'Nepodařilo se načíst inzeráty')
    } finally {
      setLoadingProducts(false)
    }
  }, [showError])

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    const userIsAdmin = (session.user as any).isAdmin || false
    setIsAdmin(userIsAdmin)
    
    if (userIsAdmin) {
      loadProducts()
    } else {
      router.push('/admin')
    }
    
    setLoading(false)
  }, [session, status, router, loadProducts])

  useEffect(() => {
    let filtered = products

    // Filtrování podle stavu
    if (filter === 'active') {
      filtered = filtered.filter(p => !!p.isActive && !p.isSold)
    } else if (filter === 'inactive') {
      filtered = filtered.filter(p => !p.isActive || !!p.isSold)
    } else if (filter === 'sold') {
      filtered = filtered.filter(p => !!p.isSold)
    }

    // Filtrování podle vyhledávání
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.userName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredProducts(filtered)
  }, [searchTerm, filter, products])

  const handleDeleteProduct = async (productId: string, productTitle: string) => {
    const confirmed = await showConfirmation({
      title: 'Smazat inzerát?',
      message: `Opravdu chcete smazat inzerát "${productTitle}"? Tato akce je nevratná.`,
      confirmText: 'Smazat',
      cancelText: 'Zrušit',
      type: 'danger'
    })

    if (!confirmed) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showSuccess('Úspěch', 'Inzerát byl smazán')
        loadProducts()
      } else {
        showError('Chyba', 'Nepodařilo se smazat inzerát')
      }
    } catch (error) {
      showError('Chyba', 'Nepodařilo se smazat inzerát')
    }
  }

  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        showSuccess('Úspěch', `Inzerát byl ${!currentStatus ? 'aktivován' : 'deaktivován'}`)
        loadProducts()
      } else {
        showError('Chyba', 'Nepodařilo se změnit stav inzerátu')
      }
    } catch (error) {
      showError('Chyba', 'Nepodařilo se změnit stav inzerátu')
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Načítání..." />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8 opacity-80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/admin')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zpět na dashboard
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-600" />
              Správa inzerátů
            </h1>
            <p className="text-lg text-muted-foreground">
              Kontrola a správa všech inzerátů
            </p>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex items-center gap-4 flex-1">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Hledat inzeráty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-slate-500"
                  />
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-muted-foreground" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="all">Vše</option>
                    <option value="active">Aktivní</option>
                    <option value="inactive">Neaktivní</option>
                    <option value="sold">Prodáno</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products List */}
          {loadingProducts ? (
            <LoadingSpinner size="lg" text="Načítání inzerátů..." />
          ) : filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Žádné inzeráty
                </h3>
                <p className="text-muted-foreground">
                  Nebyly nalezeny žádné inzeráty odpovídající filtrům
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const coverImage = product.mainImage || (product.images && product.images[0])
                return (
                  <Card key={product.id}>
                    {/* Image */}
                    <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700">
                      {coverImage ? (
                        <Link href={`/products/${product.id}`}>
                          <Image
                            src={coverImage}
                            alt={product.title}
                            fill
                            className="object-cover cursor-pointer"
                          />
                        </Link>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4">
                      {/* Title */}
                      <Link href={`/products/${product.id}`} className="hover:underline">
                        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                          {product.title}
                        </h3>
                      </Link>

                      {/* Price */}
                      <p className="text-xl font-bold text-foreground mb-2">
                        {formatPrice(product.price)}
                      </p>

                      {/* Info */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <span>{product.location}</span>
                        <span>Od: {product.userName}</span>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2 mb-4">
                        {!!product.isSold && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                            Prodáno
                          </span>
                        )}
                        {!product.isActive && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                            Neaktivní
                          </span>
                        )}
                        {!!product.isActive && !product.isSold && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            Aktivní
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="flex-1"
                        >
                          <Link href={`/products/${product.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Zobrazit
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(product.id, !!product.isActive)}
                        >
                          {!!product.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteProduct(product.id, product.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

