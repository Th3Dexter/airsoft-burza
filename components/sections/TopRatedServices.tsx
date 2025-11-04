'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  MapPin,
  Mail,
  Phone,
  Star,
  Wrench
} from 'lucide-react'

interface Service {
  id: string
  name: string
  description: string
  location: string
  contactEmail?: string
  contactPhone?: string
  image?: string
  rating?: number
  reviewCount?: number
}

export function TopRatedServices() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isCancelled = false
    
    const fetchServices = async () => {
      try {
        // Načíst top 3 nejlépe hodnocené servisy
        const response = await fetch('/api/services?sort=rating-high')
        if (response.ok && !isCancelled) {
          const data = await response.json()
          // Zobrazit pouze servisy s hodnocením
          const ratedServices = (data.services || []).filter((s: Service) => s.rating !== undefined && s.rating > 0)
          setServices(ratedServices.slice(0, 3))
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching services:', error)
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchServices()
    
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
              Nejlépe hodnocené servisy
            </h2>
            <p className="text-lg text-muted-foreground">
              Načítání nejlépe hodnocených servisů...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700 animate-pulse">
                  <div className="w-full h-48 bg-gray-300 dark:bg-gray-600"></div>
                </div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-4 animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (services.length === 0) {
    return (
      <section className="py-16 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 opacity-80">
          <div className="text-center">
            <Wrench className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Zatím žádné hodnocené servisy
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Buďte první, kdo ohodnotí servis!
            </p>
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
            Nejlípe hodnocené servisy
          </h2>
          <p className="text-lg text-muted-foreground">
            Objevte servisy s nejlepším hodnocením od našich uživatelů
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
              {/* Obrázek servisu */}
              <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700">
                {service.image ? (
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Wrench className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>

              <CardContent className="p-4 flex-1 flex flex-col">
                {/* Název servisu */}
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {service.name}
                </h3>

                {/* Místo */}
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {service.location}
                </div>

                {/* Kontakt */}
                <div className="space-y-1 mb-3">
                  {service.contactEmail && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 mr-1" />
                      <span className="truncate">{service.contactEmail}</span>
                    </div>
                  )}
                  {service.contactPhone && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 mr-1" />
                      {service.contactPhone}
                    </div>
                  )}
                </div>

                {/* Popis */}
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
                  {service.description}
                </p>

                {/* Hodnocení */}
                {service.rating !== undefined && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="ml-1 text-sm font-medium text-foreground">
                        {service.rating.toFixed(1)}
                      </span>
                    </div>
                    {service.reviewCount !== undefined && service.reviewCount > 0 && (
                      <span className="text-sm text-muted-foreground">
                        ({service.reviewCount} hodnocení)
                      </span>
                    )}
                  </div>
                )}

                {/* Tlačítka */}
                <div className="mt-auto pt-3 border-t border-border">
                  <Button asChild className="w-full">
                    <Link href={`/services/${service.id}`}>
                      Zobrazit detaily
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button asChild variant="outline">
            <Link href="/services">Zobrazit všechny servisy</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

