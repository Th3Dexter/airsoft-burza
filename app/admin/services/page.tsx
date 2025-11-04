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
  Wrench, 
  Search,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Filter,
  Star,
  MessageSquare,
  User,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Service {
  id: string
  name: string
  description: string
  location: string
  contactEmail: string
  contactPhone?: string
  image?: string
  additionalImages?: string[] | null
  rating?: number
  reviewCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  userId: string
  userName?: string
  userEmail?: string
}

interface Review {
  id: string
  serviceId: string
  userId: string
  ratingSpeed: number
  ratingQuality: number
  ratingCommunication: number
  ratingPrice: number
  ratingOverall: number
  comment?: string
  images?: string[] | null
  createdAt: string
  userName?: string
  userImage?: string
}

export default function AdminServicesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showSuccess, showError, showConfirmation } = useNotifications()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all')
  const [loadingServices, setLoadingServices] = useState(false)
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set())
  const [reviewsMap, setReviewsMap] = useState<Record<string, Review[]>>({})
  const [loadingReviews, setLoadingReviews] = useState<Set<string>>(new Set())

  const loadServices = useCallback(async () => {
    setLoadingServices(true)
    try {
      const response = await fetch('/api/admin/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
        setFilteredServices(data.services || [])
      }
    } catch (error) {
      console.error('Error loading services:', error)
      showError('Chyba', 'Nepodařilo se načíst servisy')
    } finally {
      setLoadingServices(false)
    }
  }, [showError])

  const loadReviews = async (serviceId: string) => {
    if (reviewsMap[serviceId]) return

    setLoadingReviews(prev => new Set(prev).add(serviceId))
    try {
      const response = await fetch(`/api/services/${serviceId}/reviews`)
      if (response.ok) {
        const data = await response.json()
        // API už vrací userName a userImage, takže použijeme přímo
        setReviewsMap(prev => ({
          ...prev,
          [serviceId]: data.reviews || []
        }))
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoadingReviews(prev => {
        const newSet = new Set(prev)
        newSet.delete(serviceId)
        return newSet
      })
    }
  }

  const toggleService = (serviceId: string) => {
    const isExpanded = expandedServices.has(serviceId)
    const newExpanded = new Set(expandedServices)
    
    if (isExpanded) {
      newExpanded.delete(serviceId)
    } else {
      newExpanded.add(serviceId)
      loadReviews(serviceId)
    }
    
    setExpandedServices(newExpanded)
  }

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    const userIsAdmin = (session.user as any).isAdmin || false
    setIsAdmin(userIsAdmin)
    
    if (userIsAdmin) {
      loadServices()
    } else {
      router.push('/admin')
    }
    
    setLoading(false)
  }, [session, status, router, loadServices])

  useEffect(() => {
    let filtered = services

    // Filtrování podle stavu
    if (filter === 'active') {
      filtered = filtered.filter(s => !!s.isActive)
    } else if (filter === 'pending') {
      filtered = filtered.filter(s => !s.isActive)
    } else if (filter === 'inactive') {
      filtered = filtered.filter(s => !s.isActive)
    }

    // Filtrování podle vyhledávání
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.userName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredServices(filtered)
  }, [searchTerm, filter, services])

  const handleApproveService = async (serviceId: string, approve: boolean) => {
    const confirmed = await showConfirmation({
      title: approve ? 'Schválit servis?' : 'Zamítnout servis?',
      message: approve 
        ? 'Opravdu chcete schválit tento servis? Bude se zobrazovat v sekci servisy.'
        : 'Opravdu chcete zamítnout tento servis? Nebude se zobrazovat v sekci servisy.',
      confirmText: approve ? 'Schválit' : 'Zamítnout',
      cancelText: 'Zrušit',
      type: 'warning'
    })

    if (!confirmed) return

    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: approve })
      })

      if (response.ok) {
        showSuccess('Úspěch', `Servis byl ${approve ? 'schválen' : 'zamítnut'}`)
        loadServices()
      } else {
        showError('Chyba', 'Nepodařilo se změnit stav servisu')
      }
    } catch (error) {
      showError('Chyba', 'Nepodařilo se změnit stav servisu')
    }
  }

  const handleDeleteService = async (serviceId: string, serviceName: string) => {
    const confirmed = await showConfirmation({
      title: 'Smazat servis?',
      message: `Opravdu chcete smazat servis "${serviceName}"? Tato akce je nevratná a smaže i všechny recenze.`,
      confirmText: 'Smazat',
      cancelText: 'Zrušit',
      type: 'danger'
    })

    if (!confirmed) return

    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showSuccess('Úspěch', 'Servis byl smazán')
        loadServices()
      } else {
        showError('Chyba', 'Nepodařilo se smazat servis')
      }
    } catch (error) {
      showError('Chyba', 'Nepodařilo se smazat servis')
    }
  }

  const handleDeleteReview = async (reviewId: string, serviceId: string) => {
    const confirmed = await showConfirmation({
      title: 'Smazat recenzi?',
      message: 'Opravdu chcete smazat tuto recenzi? Tato akce je nevratná.',
      confirmText: 'Smazat',
      cancelText: 'Zrušit',
      type: 'danger'
    })

    if (!confirmed) return

    try {
      const response = await fetch(`/api/admin/services/reviews/${reviewId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showSuccess('Úspěch', 'Recenze byla smazána')
        // Obnovit recenze
        setReviewsMap(prev => {
          const newMap = { ...prev }
          delete newMap[serviceId]
          return newMap
        })
        loadReviews(serviceId)
      } else {
        showError('Chyba', 'Nepodařilo se smazat recenzi')
      }
    } catch (error) {
      showError('Chyba', 'Nepodařilo se smazat recenzi')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
              <Wrench className="h-8 w-8 text-blue-600" />
              Správa servisů
            </h1>
            <p className="text-lg text-muted-foreground">
              Kontrola a správa všech servisů a recenzí
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
                    placeholder="Hledat servisy..."
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
                    <option value="active">Schválené</option>
                    <option value="pending">Čekající na schválení</option>
                    <option value="inactive">Zamítnuté</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services List */}
          {loadingServices ? (
            <LoadingSpinner size="lg" text="Načítání servisů..." />
          ) : filteredServices.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Žádné servisy
                </h3>
                <p className="text-muted-foreground">
                  Nebyly nalezeny žádné servisy odpovídající filtrům
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredServices.map((service) => {
                const isExpanded = expandedServices.has(service.id)
                const reviews = reviewsMap[service.id] || []
                const isLoadingReviews = loadingReviews.has(service.id)

                return (
                  <Card key={service.id}>
                    <CardContent className="p-6">
                      {/* Service Header */}
                      <div className="flex items-start gap-4 mb-4">
                        {/* Image */}
                        <div className="flex-shrink-0">
                          {service.image ? (
                            <Image
                              src={service.image}
                              alt={service.name}
                              width={120}
                              height={120}
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-30 h-30 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <Wrench className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Service Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-semibold text-foreground mb-1">
                                {service.name}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {service.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {service.isActive ? (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                  Schválen
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                                  Čeká na schválení
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {service.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {service.contactEmail}
                            </div>
                            {service.contactPhone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {service.contactPhone}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {service.userName || 'Neznámý uživatel'} ({service.userEmail})
                            </div>
                            {service.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                {service.rating.toFixed(1)} ({service.reviewCount} recenzí)
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                            >
                              <Link href={`/services/${service.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                Zobrazit
                              </Link>
                            </Button>
                            {!service.isActive && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleApproveService(service.id, true)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Schválit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleApproveService(service.id, false)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Zamítnout
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteService(service.id, service.name)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Smazat
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleService(service.id)}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Recenze ({service.reviewCount || 0})
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Reviews */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <h4 className="text-lg font-semibold text-foreground mb-3">Recenze</h4>
                          {isLoadingReviews ? (
                            <div className="py-4 text-center">
                              <LoadingSpinner size="sm" text="Načítání recenzí..." />
                            </div>
                          ) : reviews.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              Žádné recenze
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {reviews.map((review) => (
                                <Card key={review.id}>
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          {review.userImage ? (
                                            <Image
                                              src={review.userImage}
                                              alt={review.userName || 'Uživatel'}
                                              width={24}
                                              height={24}
                                              className="rounded-full"
                                            />
                                          ) : (
                                            <User className="h-4 w-4 text-muted-foreground" />
                                          )}
                                          <span className="font-medium text-foreground">
                                            {review.userName || 'Neznámý uživatel'}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                                          <span>Rychlost: {review.ratingSpeed}/5</span>
                                          <span>Kvalita: {review.ratingQuality}/5</span>
                                          <span>Komunikace: {review.ratingCommunication}/5</span>
                                          <span>Cena: {review.ratingPrice}/5</span>
                                          <span className="font-medium">Celkem: {review.ratingOverall}/5</span>
                                        </div>
                                        {review.comment && (
                                          <p className="text-sm text-foreground mb-2">
                                            {review.comment}
                                          </p>
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                          {formatDate(review.createdAt)}
                                        </span>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDeleteReview(review.id, service.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
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

