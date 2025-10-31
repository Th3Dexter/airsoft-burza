'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, Filter, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ProductSearchProps {
  searchParams?: {
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

const conditions = [
  { value: 'new', label: 'Nové' },
  { value: 'like-new', label: 'Jako nové' },
  { value: 'good', label: 'Dobrý stav' },
  { value: 'fair', label: 'Použitelné' },
  { value: 'poor', label: 'Špatný stav' }
]

const locations = [
  { value: 'praha', label: 'Praha' },
  { value: 'brno', label: 'Brno' },
  { value: 'ostrava', label: 'Ostrava' },
  { value: 'plzen', label: 'Plzeň' },
  { value: 'hradec-kralove', label: 'Hradec Králové' },
  { value: 'ceske-budejovice', label: 'České Budějovice' },
  { value: 'olomouc', label: 'Olomouc' },
  { value: 'liberec', label: 'Liberec' }
]

const sortOptions = [
  { value: 'newest', label: 'Nejnovější' },
  { value: 'oldest', label: 'Nejstarší' },
  { value: 'price-low', label: 'Cena: od nejnižší' },
  { value: 'price-high', label: 'Cena: od nejvyšší' },
  { value: 'name-asc', label: 'Název: A-Z' },
  { value: 'name-desc', label: 'Název: Z-A' }
]

export function ProductSearch({ searchParams: propSearchParams }: ProductSearchProps = {}) {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(urlSearchParams.get('search') || '')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    minPrice: urlSearchParams.get('minPrice') || '',
    maxPrice: urlSearchParams.get('maxPrice') || '',
    condition: urlSearchParams.get('condition') || '',
    location: urlSearchParams.get('location') || '',
    sort: urlSearchParams.get('sort') || 'newest'
  })
  
  // Získání parametrů z URL nebo props
  const searchParams = propSearchParams || {
    category: urlSearchParams.get('category') || '',
    search: urlSearchParams.get('search') || '',
    minPrice: urlSearchParams.get('minPrice') || '',
    maxPrice: urlSearchParams.get('maxPrice') || '',
    condition: urlSearchParams.get('condition') || '',
    location: urlSearchParams.get('location') || '',
    sort: urlSearchParams.get('sort') || 'newest',
    page: urlSearchParams.get('page') || '1'
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(urlSearchParams)
    
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim())
    } else {
      params.delete('search')
    }
    params.delete('page') // Reset to first page
    
    const currentPath = window.location.pathname
    router.push(`${currentPath}?${params.toString()}`)
  }

  const clearSearch = () => {
    setSearchQuery('')
    const params = new URLSearchParams(urlSearchParams)
    params.delete('search')
    params.delete('page')
    
    const currentPath = window.location.pathname
    router.push(currentPath)
  }

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    const params = new URLSearchParams(urlSearchParams)
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page') // Reset to first page
    
    const currentPath = window.location.pathname
    router.push(`${currentPath}?${params.toString()}`)
  }

  const clearAllFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      condition: '',
      location: '',
      sort: 'newest'
    })
    
    const currentPath = window.location.pathname
    router.push(currentPath)
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  const hasActiveFilters = Object.values(filters).some(value => value && value !== 'newest')

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-card rounded-lg shadow-sm border-2 border-border p-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hledat produkty, značky, modely..."
              className="w-full pl-10 pr-4 py-3 border-2 border-border bg-card rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <Button type="submit" className="px-6">
            <Search className="h-4 w-4 mr-2" />
            Hledat
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={toggleFilters}
            className="px-4"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtry
            {showFilters ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
          </Button>
        </form>
      </div>

      {/* Collapsible Filters Table */}
      {showFilters && (
        <div className="bg-card rounded-lg shadow-sm border-2 border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Filtry</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-700"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Vymazat filtry
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Price Range Filter */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-foreground">Cena</h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Od (Kč)
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm border-2 border-border bg-card rounded focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Do (Kč)
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    placeholder="∞"
                    className="w-full px-3 py-2 text-sm border-2 border-border bg-card rounded focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Condition Filter */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-foreground">Stav</h4>
              <div className="space-y-2">
                {conditions.map((condition) => (
                  <label key={condition.value} className="flex items-center">
                    <input
                      type="checkbox"
                      value={condition.value}
                      checked={filters.condition === condition.value}
                      onChange={(e) => updateFilter('condition', e.target.checked ? condition.value : '')}
                      className="h-4 w-4 text-foreground focus:ring-primary border-border rounded"
                    />
                    <span className="ml-2 text-sm text-foreground">
                      {condition.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-foreground">Lokace</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {locations.map((location) => (
                  <label key={location.value} className="flex items-center">
                    <input
                      type="checkbox"
                      value={location.value}
                      checked={filters.location === location.value}
                      onChange={(e) => updateFilter('location', e.target.checked ? location.value : '')}
                      className="h-4 w-4 text-foreground focus:ring-primary border-border rounded"
                    />
                    <span className="ml-2 text-sm text-foreground">
                      {location.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort Filter */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-foreground">Řazení</h4>
              <div className="space-y-2">
                {sortOptions.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="sort"
                      value={option.value}
                      checked={filters.sort === option.value}
                      onChange={(e) => updateFilter('sort', e.target.value)}
                      className="h-4 w-4 text-foreground focus:ring-primary border-border"
                    />
                    <span className="ml-2 text-sm text-foreground">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
