'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useNotificationActions } from '@/lib/useNotificationActions'
import { Package, Plus, Edit, Trash2, Eye, EyeOff, CheckCircle, XCircle, Filter, Search } from 'lucide-react'

export default function MyProductsPage() {
  const { data: session, status } = useSession()
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, active, sold
  const [searchTerm, setSearchTerm] = useState('')
  const { confirmDeleteProduct, notifyProductDeleted, notifyProfileError } = useNotificationActions()

  useEffect(() => {
    const fetchProducts = async () => {
      if (session?.user) {
        try {
          const response = await fetch(`/api/user/products?status=${filter}`)
          if (response.ok) {
            const data = await response.json()
            setProducts(data.products || [])
            setFilteredProducts(data.products || [])
          }
        } catch (error) {
          console.error('Error fetching products:', error)
        }
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [session, filter])

  // Filtrování podle vyhledávání
  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter((product: any) =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [searchTerm, products])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Načítání inzerátů...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Přihlášení vyžadováno
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Pro zobrazení vašich inzerátů se musíte přihlásit.
          </p>
          <Button asChild>
            <a href="/auth/signin">Přihlásit se</a>
          </Button>
        </div>
      </div>
    )
  }

  const handleDeleteProduct = async (productId: string, productTitle: string) => {
    const confirmed = await confirmDeleteProduct(productTitle)
    if (confirmed) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setProducts(products.filter((p: any) => p.id !== productId))
          setFilteredProducts(filteredProducts.filter((p: any) => p.id !== productId))
          notifyProductDeleted()
        } else {
          notifyProfileError('Nepodařilo se smazat inzerát')
        }
      } catch (error) {
        console.error('Delete error:', error)
        notifyProfileError('Nepodařilo se smazat inzerát')
      }
    }
  }

  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentStatus
        })
      })
      
      if (response.ok) {
        setProducts(products.map((p: any) => 
          p.id === productId ? { ...p, isActive: !currentStatus } : p
        ))
        setFilteredProducts(filteredProducts.map((p: any) => 
          p.id === productId ? { ...p, isActive: !currentStatus } : p
        ))
      } else {
        notifyProfileError('Nepodařilo se změnit stav inzerátu')
      }
    } catch (error) {
      console.error('Toggle error:', error)
      notifyProfileError('Nepodařilo se změnit stav inzerátu')
    }
  }

  const getStatusBadge = (product: any) => {
    if (product.isSold) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle className="h-3 w-3 mr-1" />
          Prodáno
        </span>
      )
    } else if (product.isActive) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
          <Eye className="h-3 w-3 mr-1" />
          Aktivní
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
          <EyeOff className="h-3 w-3 mr-1" />
          Neaktivní
        </span>
      )
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Moje inzeráty
                </h1>
                <p className="text-slate-600 dark:text-slate-300 mt-2">
                  Spravujte své inzeráty a sledujte jejich výkonnost
                </p>
              </div>
              <Button 
                onClick={() => window.location.href = '/products/new'}
                className="mt-4 sm:mt-0 bg-slate-700 hover:bg-slate-800 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nový inzerát
              </Button>
            </div>
          </div>

          {/* Filtry a vyhledávání */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Vyhledávání */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Hledat v inzerátech..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Filtry */}
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                  size="sm"
                >
                  Vše ({products.length})
                </Button>
                <Button
                  variant={filter === 'active' ? 'default' : 'outline'}
                  onClick={() => setFilter('active')}
                  size="sm"
                >
                  Aktivní
                </Button>
                <Button
                  variant={filter === 'sold' ? 'default' : 'outline'}
                  onClick={() => setFilter('sold')}
                  size="sm"
                >
                  Prodáno
                </Button>
              </div>
            </div>
          </div>

          {/* Seznam inzerátů */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product: any) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg line-clamp-2">
                        {product.title}
                      </h3>
                      {getStatusBadge(product)}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        {product.price.toLocaleString('cs-CZ')} Kč
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {product.category}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <span>{product.condition}</span>
                      <span>{product.location}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.location.href = `/products/edit/${product.id}`}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Upravit
                      </Button>
                      
                      {!product.isSold && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(product.id, product.isActive)}
                          className={product.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                        >
                          {product.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteProduct(product.id, product.title)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {searchTerm ? 'Žádné inzeráty neodpovídají vašemu vyhledávání' : 'Zatím nemáte žádné inzeráty'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {searchTerm ? 'Zkuste změnit vyhledávací termín' : 'Vytvořte svůj první inzerát a začněte prodávat'}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => window.location.href = '/products/new'}
                  className="bg-slate-700 hover:bg-slate-800 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Vytvořit první inzerát
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
