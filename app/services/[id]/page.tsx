'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useNotifications } from '@/lib/NotificationContext'
import { 
  MapPin, 
  Mail, 
  Phone,
  Star,
  ArrowLeft,
  Wrench,
  CheckCircle,
  Clock,
  User,
  Send,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

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
  createdAt: string
  updatedAt: string
  userId: string
  userName?: string
  userEmail?: string
  userImage?: string
  userIsVerified: boolean
  userReputation: string
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
  comment: string | null
  images: string[] | null
  createdAt: string
  updatedAt: string
  userName: string
  userImage: string | null
  userReviewCount: number
}

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const serviceId = params.id as string
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [avgRatings, setAvgRatings] = useState<{
    speed: number
    quality: number
    communication: number
    price: number
    overall: number
  } | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0)

  // Načtení servisu
  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(`/api/services/${serviceId}`)
        if (response.ok) {
          const data = await response.json()
          // Parsování additionalImages z JSON
          const serviceData = {
            ...data,
            additionalImages: data.additionalImages ? 
              (typeof data.additionalImages === 'string' ? JSON.parse(data.additionalImages) : data.additionalImages) : 
              null
          }
          setService(serviceData)
        } else if (response.status === 404) {
          setError('Servis nebyl nalezen')
        } else {
          setError('Chyba při načítání servisu')
        }
      } catch (error) {
        console.error('Chyba při načítání servisu:', error)
        setError('Chyba při načítání servisu')
      } finally {
        setLoading(false)
      }
    }

    if (serviceId) {
      fetchService()
    }
  }, [serviceId])

  // Načtení recenzí
  useEffect(() => {
    const fetchReviews = async () => {
      if (!serviceId) return
      
      try {
        const response = await fetch(`/api/services/${serviceId}/reviews`)
        if (response.ok) {
          const data = await response.json()
          const reviewsData = data.reviews || []
          
          // Parsování images z JSON
          const parsedReviews = reviewsData.map((review: any) => ({
            ...review,
            images: review.images ? 
              (typeof review.images === 'string' ? JSON.parse(review.images) : review.images) : 
              null
          }))
          
          setReviews(parsedReviews)

          // Výpočet průměrných hodnocení
          if (parsedReviews.length > 0) {
            const avgSpeed = parsedReviews.reduce((sum: number, r: Review) => sum + r.ratingSpeed, 0) / parsedReviews.length
            const avgQuality = parsedReviews.reduce((sum: number, r: Review) => sum + r.ratingQuality, 0) / parsedReviews.length
            const avgCommunication = parsedReviews.reduce((sum: number, r: Review) => sum + r.ratingCommunication, 0) / parsedReviews.length
            const avgPrice = parsedReviews.reduce((sum: number, r: Review) => sum + r.ratingPrice, 0) / parsedReviews.length
            const avgOverall = parsedReviews.reduce((sum: number, r: Review) => sum + r.ratingOverall, 0) / parsedReviews.length

            setAvgRatings({
              speed: avgSpeed,
              quality: avgQuality,
              communication: avgCommunication,
              price: avgPrice,
              overall: avgOverall
            })
          }
        }
      } catch (error) {
        console.error('Chyba při načítání recenzí:', error)
      } finally {
        setReviewsLoading(false)
      }
    }

    if (serviceId) {
      fetchReviews()
    }
  }, [serviceId])

  const getReputationBadge = (reputation: string) => {
    const reputationMap: { [key: string]: { label: string; variant: 'default' | 'secondary' | 'destructive' } } = {
      'VERY_GOOD': { label: 'Výborná', variant: 'default' },
      'GOOD': { label: 'Dobrá', variant: 'default' },
      'NEUTRAL': { label: 'Neutrální', variant: 'secondary' },
      'BAD': { label: 'Špatná', variant: 'destructive' },
      'VERY_BAD': { label: 'Velmi špatná', variant: 'destructive' }
    }
    return reputationMap[reputation] || { label: 'Neutrální', variant: 'secondary' }
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.round(rating)
            ? 'text-yellow-500 fill-yellow-500'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  const handleReviewSuccess = () => {
    setShowReviewForm(false)
    // Znovu načíst servis a recenze
    window.location.reload()
  }

  // Příprava všech obrázků (hlavní + dodatečné)
  const allImages: string[] = service 
    ? (() => {
        const images: string[] = []
        if (service.image && service.image.trim()) {
          images.push(service.image)
        }
        if (service.additionalImages && Array.isArray(service.additionalImages)) {
          service.additionalImages.forEach(img => {
            if (img && typeof img === 'string' && img.trim() && !images.includes(img)) {
              images.push(img)
            }
          })
        }
        return images
      })()
    : []

  // Klávesové zkratky pro navigaci v lightboxu
  useEffect(() => {
    if (!lightboxOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && lightboxImageIndex > 0) {
        setLightboxImageIndex(prev => prev - 1)
      } else if (e.key === 'ArrowRight' && lightboxImageIndex < allImages.length - 1) {
        setLightboxImageIndex(prev => prev + 1)
      } else if (e.key === 'Escape') {
        setLightboxOpen(false)
        document.body.style.overflow = 'unset'
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, lightboxImageIndex, allImages.length])

  // Resetovat lightbox při změně servisu
  useEffect(() => {
    setLightboxOpen(false)
    setLightboxImageIndex(0)
    document.body.style.overflow = 'unset'
  }, [serviceId])

  // Funkce pro otevření lightboxu
  const openLightbox = (index: number) => {
    setLightboxImageIndex(index)
    setLightboxOpen(true)
    document.body.style.overflow = 'hidden' // Zabraň scrollování pozadí
  }

  // Funkce pro zavření lightboxu
  const closeLightbox = () => {
    setLightboxOpen(false)
    document.body.style.overflow = 'unset'
  }

  // Funkce pro přepínání obrázků
  const goToPreviousImage = () => {
    if (lightboxImageIndex > 0) {
      setLightboxImageIndex(prev => prev - 1)
    }
  }

  const goToNextImage = () => {
    if (lightboxImageIndex < allImages.length - 1) {
      setLightboxImageIndex(prev => prev + 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 py-8">
          <LoadingSpinner size="lg" text="Načítání servisu..." />
        </main>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="text-center py-12">
              <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {error || 'Servis nebyl nalezen'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Servis, který hledáte, neexistuje nebo byl odstraněn.
              </p>
              <Button onClick={() => router.push('/services')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zpět na seznam servisů
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const reputationInfo = getReputationBadge(service.userReputation)
  const formattedDate = new Date(service.createdAt).toLocaleDateString('cs-CZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Back button */}
          <Button 
            variant="ghost" 
            onClick={() => router.push('/services')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zpět na seznam servisů
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Service Image */}
              <Card>
                <CardContent className="p-0">
                  <div 
                    className={`relative w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-t-lg ${service.image ? 'cursor-pointer' : ''}`}
                    onClick={() => service.image && allImages.length > 0 && openLightbox(0)}
                  >
                    {service.image ? (
                      <Image
                        src={service.image}
                        alt={service.name}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Wrench className="h-24 w-24 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {/* Dodatečné fotky */}
                  {service.additionalImages && service.additionalImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 p-4">
                      {service.additionalImages.map((img, idx) => {
                        // Index v allImages: pokud je hlavní obrázek, začínáme od 1, jinak od 0
                        const imageIndex = service.image ? idx + 1 : idx
                        return (
                          <div 
                            key={idx} 
                            className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 cursor-pointer"
                            onClick={() => openLightbox(imageIndex)}
                          >
                            <Image
                              src={img}
                              alt={`${service.name} ${idx + 2}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Service Details */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground mb-2">
                        {service.name}
                      </h1>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {service.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Přidáno {formattedDate}
                        </div>
                      </div>
                    </div>
                    {service.rating !== undefined && (
                      <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <span className="text-lg font-semibold text-foreground">
                          {service.rating.toFixed(1)}
                        </span>
                        {service.reviewCount > 0 && (
                          <span className="text-sm text-muted-foreground">
                            ({service.reviewCount})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Popis servisu
                      </h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {service.description}
                      </p>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="text-lg font-semibold text-foreground mb-4">
                        Kontaktní informace
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <a 
                            href={`mailto:${service.contactEmail}`}
                            className="text-foreground hover:text-primary transition-colors"
                          >
                            {service.contactEmail}
                          </a>
                        </div>
                        {service.contactPhone && (
                          <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-muted-foreground" />
                            <a 
                              href={`tel:${service.contactPhone}`}
                              className="text-foreground hover:text-primary transition-colors"
                            >
                              {service.contactPhone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Owner Info */}
              {service.userName && (
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-foreground">
                      Vlastník servisu
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      {service.userImage ? (
                        <Image
                          src={service.userImage}
                          alt={service.userName}
                          width={64}
                          height={64}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                          <User className="h-8 w-8 text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">
                            {service.userName}
                          </h4>
                          {service.userIsVerified && (
                            <CheckCircle className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <Badge variant={reputationInfo.variant} className="mt-1">
                          {reputationInfo.label}
                        </Badge>
                      </div>
                    </div>
                    <Link href={`/profile?userId=${service.userId}`}>
                      <Button variant="outline" className="w-full">
                        Zobrazit profil
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Contact Card */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-foreground">
                    Kontaktovat servis
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" asChild>
                    <a href={`mailto:${service.contactEmail}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Poslat email
                    </a>
                  </Button>
                  {service.contactPhone && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`tel:${service.contactPhone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        Zavolat
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Rating Info */}
              {service.rating !== undefined && service.reviewCount > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-6 w-6 ${
                              i < Math.round(service.rating!)
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {service.rating.toFixed(1)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        z {service.reviewCount} hodnocení
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-8 space-y-6">
            {/* Average Ratings Overview */}
            {avgRatings && reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-bold text-foreground">
                    Celkové hodnocení
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Rychlost servisu</p>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {renderStars(avgRatings.speed)}
                      </div>
                      <p className="text-lg font-semibold text-foreground">
                        {avgRatings.speed.toFixed(1)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Kvalita servisu</p>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {renderStars(avgRatings.quality)}
                      </div>
                      <p className="text-lg font-semibold text-foreground">
                        {avgRatings.quality.toFixed(1)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Komunikace</p>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {renderStars(avgRatings.communication)}
                      </div>
                      <p className="text-lg font-semibold text-foreground">
                        {avgRatings.communication.toFixed(1)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Cena</p>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {renderStars(avgRatings.price)}
                      </div>
                      <p className="text-lg font-semibold text-foreground">
                        {avgRatings.price.toFixed(1)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-primary/10 rounded-lg border-2 border-primary">
                      <p className="text-sm text-muted-foreground mb-2">Celkové hodnocení</p>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {renderStars(avgRatings.overall)}
                      </div>
                      <p className="text-lg font-bold text-foreground">
                        {avgRatings.overall.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews List */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">
                Recenze ({reviews.length})
              </h2>
              {session && session.user && (
                <Button onClick={() => setShowReviewForm(true)}>
                  Napsat recenzi
                </Button>
              )}
            </div>

            {reviewsLoading ? (
              <LoadingSpinner size="md" text="Načítání recenzí..." />
            ) : reviews.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Zatím žádné recenze
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Buďte první, kdo napíše recenzi
                  </p>
                  {session && session.user && (
                    <Button onClick={() => setShowReviewForm(true)}>
                      Napsat první recenzi
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        {review.userImage ? (
                          <Image
                            src={review.userImage}
                            alt={review.userName}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">
                              {review.userName}
                            </h4>
                            <span className="text-sm text-muted-foreground">
                              ({review.userReviewCount} recenzí)
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {renderStars(review.ratingOverall)}
                            <span className="ml-2 text-sm font-medium text-foreground">
                              {review.ratingOverall}/5
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(review.createdAt).toLocaleDateString('cs-CZ', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Detailní hodnocení */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-4 bg-muted rounded-lg">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Rychlost</p>
                          <div className="flex items-center gap-1">
                            {renderStars(review.ratingSpeed)}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Kvalita</p>
                          <div className="flex items-center gap-1">
                            {renderStars(review.ratingQuality)}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Komunikace</p>
                          <div className="flex items-center gap-1">
                            {renderStars(review.ratingCommunication)}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Cena</p>
                          <div className="flex items-center gap-1">
                            {renderStars(review.ratingPrice)}
                          </div>
                        </div>
                      </div>

                      {/* Komentář */}
                      {review.comment && (
                        <p className="text-foreground whitespace-pre-wrap mb-4">
                          {review.comment}
                        </p>
                      )}

                      {/* Obrázky */}
                      {review.images && review.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                          {review.images.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                              <Image
                                src={img}
                                alt={`Recenze ${idx + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Lightbox pro zobrazení obrázku v plné velikosti */}
      {lightboxOpen && allImages.length > 0 && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Zavírací tlačítko */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-60"
            aria-label="Zavřít"
          >
            <X className="h-8 w-8" />
          </button>

          {/* Obrázek */}
          <div 
            className="relative max-w-7xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={allImages[lightboxImageIndex]}
              alt={`${service?.name || 'Servis'} - obrázek ${lightboxImageIndex + 1}`}
              width={1200}
              height={1200}
              className="max-w-full max-h-[90vh] object-contain"
              unoptimized
            />

            {/* Levá šipka - zobrazit pouze pokud existuje předchozí obrázek */}
            {lightboxImageIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToPreviousImage()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all z-60"
                aria-label="Předchozí obrázek"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
            )}

            {/* Pravá šipka - zobrazit pouze pokud existuje další obrázek */}
            {lightboxImageIndex < allImages.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToNextImage()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all z-60"
                aria-label="Další obrázek"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            )}

            {/* Indikátor pozice */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm z-60">
              {lightboxImageIndex + 1} / {allImages.length}
            </div>
          </div>
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewFormModal
          serviceId={serviceId}
          serviceName={service?.name || ''}
          onClose={() => setShowReviewForm(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  )
}

// Review Form Component
function ReviewFormModal({ 
  serviceId, 
  serviceName,
  onClose, 
  onSuccess 
}: { 
  serviceId: string
  serviceName: string
  onClose: () => void
  onSuccess: () => void 
}) {
  const { showSuccess, showError, showWarning } = useNotifications()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    ratingSpeed: 0,
    ratingQuality: 0,
    ratingCommunication: 0,
    ratingPrice: 0,
    ratingOverall: 0,
    comment: ''
  })
  const [previews, setPreviews] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles)
      const newPreviews: string[] = []
      selectedFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          newPreviews.push(reader.result as string)
          if (newPreviews.length === selectedFiles.length) {
            setPreviews(newPreviews)
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleStarClick = (ratingType: string, value: number) => {
    setFormData(prev => ({ ...prev, [ratingType]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.ratingOverall === 0) {
      showWarning('Nezadané hodnocení', 'Prosím zadejte celkové hodnocení')
      return
    }

    setIsSubmitting(true)

    try {
      const fd = new FormData()
      fd.append('ratingSpeed', formData.ratingSpeed.toString())
      fd.append('ratingQuality', formData.ratingQuality.toString())
      fd.append('ratingCommunication', formData.ratingCommunication.toString())
      fd.append('ratingPrice', formData.ratingPrice.toString())
      fd.append('ratingOverall', formData.ratingOverall.toString())
      fd.append('comment', formData.comment)
      
      files.forEach((file) => {
        fd.append('images', file)
      })

      const response = await fetch(`/api/services/${serviceId}/reviews`, {
        method: 'POST',
        body: fd,
      })

      if (response.ok) {
        showSuccess('Recenze přidána', 'Vaše recenze byla úspěšně přidána')
        setTimeout(() => {
          onSuccess()
        }, 1000)
      } else {
        const data = await response.json()
        showError('Chyba', data.message || 'Chyba při vytváření recenze')
      }
    } catch (error) {
      console.error('Chyba:', error)
      showError('Chyba', 'Chyba při vytváření recenze')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderRatingStars = (ratingType: string, currentValue: number) => {
    return [...Array(5)].map((_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => handleStarClick(ratingType, i + 1)}
        className="focus:outline-none"
      >
        <Star
          className={`h-6 w-6 transition-colors ${
            i < currentValue
              ? 'text-yellow-500 fill-yellow-500'
              : 'text-gray-300 hover:text-yellow-300'
          }`}
        />
      </button>
    ))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Napsat recenzi pro {serviceName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Rychlost servisu <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-1">
                  {renderRatingStars('ratingSpeed', formData.ratingSpeed)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Kvalita servisu <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-1">
                  {renderRatingStars('ratingQuality', formData.ratingQuality)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Komunikace <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-1">
                  {renderRatingStars('ratingCommunication', formData.ratingCommunication)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cena <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-1">
                  {renderRatingStars('ratingPrice', formData.ratingPrice)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Celkové hodnocení <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-1">
                  {renderRatingStars('ratingOverall', formData.ratingOverall)}
                </div>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Komentář
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                placeholder="Napište svůj komentář k servisu..."
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Fotografie
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
              />
              {previews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {previews.map((preview, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                      <Image
                        src={preview}
                        alt={`Preview ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Vybrat obrázky
              </Button>
            </div>

            {/* Submit buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Zrušit
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Odesílám...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Odeslat recenzi
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


