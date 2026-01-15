'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, Filter, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ServiceSearchProps {
  searchParams?: {
    search?: string
    location?: string
    sort?: string
    page?: string
  }
}

const locations = [
  { value: 'praha', label: 'Praha' },
  { value: 'brno', label: 'Brno' },
  { value: 'ostrava', label: 'Ostrava' },
  { value: 'plzen', label: 'Plzeň' },
  { value: 'hradec-kralove', label: 'Hradec Králové' },
  { value: 'ceske-budejovice', label: 'České Budějovice' },
  { value: 'olomouc', label: 'Olomouc' },
  { value: 'liberec', label: 'Liberec' },
  { value: 'pardubice', label: 'Pardubice' },
  { value: 'zlín', label: 'Zlín' }
]

const sortOptions = [
  { value: 'newest', label: 'Nejnovější' },
  { value: 'oldest', label: 'Nejstarší' },
  { value: 'name-asc', label: 'Název: A-Z' },
  { value: 'name-desc', label: 'Název: Z-A' },
  { value: 'rating-high', label: 'Hodnocení: nejvyšší' },
  { value: 'rating-low', label: 'Hodnocení: nejnižší' }
]

export function ServiceSearch({ searchParams: propSearchParams }: ServiceSearchProps = {}) {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(urlSearchParams.get('search') || '')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    location: urlSearchParams.get('location') || '',
    sort: urlSearchParams.get('sort') || 'newest'
  })
  
  // Získání parametrů z URL nebo props
  const searchParams = propSearchParams || {
    search: urlSearchParams.get('search') || '',
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
      location: '',
      sort: 'newest'
    })
    
    const currentPath = window.location.pathname
    router.push(currentPath)
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  const hasActiveFilters = filters.location !== '' || filters.sort !== 'newest'

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
              placeholder="Hledat servisy podle názvu, popisu..."
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

      {/* Collapsible Filters */}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location Filter */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-foreground">Lokace</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {locations.map((location) => (
                  <label key={location.value} className="flex items-center">
                    <input
                      type="radio"
                      name="location"
                      value={location.value}
                      checked={filters.location === location.value}
                      onChange={(e) => updateFilter('location', e.target.checked ? location.value : '')}
                      className="h-4 w-4 text-foreground focus:ring-primary border-border"
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





