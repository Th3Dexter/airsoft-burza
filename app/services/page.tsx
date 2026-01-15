'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ServiceSearch } from '@/components/services/ServiceSearch'
import { MapPin, Mail, Phone, Star, Wrench, Edit } from 'lucide-react'
import Image from 'next/image'
import { useNotifications } from '@/lib/NotificationContext'
import { EditServiceFormModal } from './EditServiceFormModal'

interface Service {
  id: string
  name: string
  description: string
  location: string
  contact: string
  contactEmail?: string
  contactPhone?: string
  image?: string
  additionalImages?: string[] | null
  rating?: number
  reviewCount?: number
  createdAt: string
  userId: string
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const { showWarning } = useNotifications()

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true)
      try {
        // Vytvoření query parametrů z URL
        const params = new URLSearchParams()
        if (searchParams.get('search')) params.append('search', searchParams.get('search') || '')
        if (searchParams.get('location')) params.append('location', searchParams.get('location') || '')
        if (searchParams.get('sort')) params.append('sort', searchParams.get('sort') || 'newest')

        const response = await fetch(`/api/services?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setServices(data.services || [])
        }
      } catch (error) {
        console.error('Chyba při načítání servisů:', error)
      } finally {
        setLoading(false)
      }
    }

    loadServices()
  }, [searchParams])

  const handleOpenForm = () => {
    if (!session) {
      showWarning('Přihlášení vyžadováno', 'Pro přidání servisu se musíte nejdříve přihlásit.')
      return
    }
    setShowForm(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 py-8">
          <LoadingSpinner size="lg" text="Načítání servisů..." />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Servisy
                </h1>
                <p className="text-lg text-foreground">
                  Najděte si nejlepší servis pro vás a vaší zbraň.
                </p>
              </div>
              
              {/* Tlačítko pro přidání servisu */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
                <p className="text-sm text-foreground text-right md:text-left">
                  Chcete aby váš servis byl zde na platformě? Podejte žádost zde
                </p>
                <Button onClick={handleOpenForm} className="w-full md:w-auto">
                  Přidat servis
                </Button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            <ServiceSearch 
              searchParams={{
                search: searchParams.get('search') || '',
                location: searchParams.get('location') || '',
                sort: searchParams.get('sort') || 'newest'
              }}
            />
          </div>

          {/* Services Grid */}
          {services.length === 0 ? (
            (() => {
              // Zjistit, zda jsou aktivní filtry nebo vyhledávání
              const hasActiveFilters = !!(
                searchParams.get('search') ||
                searchParams.get('location') ||
                (searchParams.get('sort') && searchParams.get('sort') !== 'newest')
              )

              return (
                <div className="text-center py-12">
                  <Wrench className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {hasActiveFilters 
                      ? 'Žádné servisy neodpovídají zadaným parametrům vyhledávání' 
                      : 'Zatím žádné servisy'}
                  </h3>
                  <p className="text-foreground">
                    {hasActiveFilters 
                      ? 'Zkuste změnit filtry nebo vyhledávací text' 
                      : 'Buďte první, kdo přidá servis na platformu'}
                  </p>
                </div>
              )
            })()
          ) : (
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
                      {!service.contactEmail && !service.contactPhone && service.contact && (
                        <div className="text-sm text-muted-foreground">
                          {service.contact}
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
                    <div className="mt-auto pt-3 border-t border-border space-y-2">
                      <Button asChild className="w-full">
                        <Link href={`/services/${service.id}`}>
                          Zobrazit detaily
                        </Link>
                      </Button>
                      {session && session.user && (session.user as any).id === service.userId && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setEditingService(service)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Upravit profil servisu
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Formulář pro přidání servisu */}
      {showForm && (
        <ServiceFormModal 
          onClose={() => setShowForm(false)} 
          onSuccess={() => {
            setShowForm(false)
            // Znovu načíst servisy
            window.location.reload()
          }}
        />
      )}

      {/* Formulář pro úpravu servisu */}
      {editingService && (
        <EditServiceFormModal 
          service={editingService}
          onClose={() => setEditingService(null)} 
          onSuccess={() => {
            setEditingService(null)
            // Znovu načíst servisy
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}

// Komponenta pro formulář přidání servisu
function ServiceFormModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { showSuccess, showError } = useNotifications()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([])
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([])
  const additionalFileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleAdditionalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      // Omezení na max 10 obrázků
      const maxFiles = 10
      if (selectedFiles.length > maxFiles) {
        showError('Příliš mnoho obrázků', `Můžete nahrát maximálně ${maxFiles} dodatečných obrázků`)
        return
      }
      
      setAdditionalFiles(selectedFiles)
      const newPreviews: string[] = []
      selectedFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          newPreviews.push(reader.result as string)
          if (newPreviews.length === selectedFiles.length) {
            setAdditionalPreviews(newPreviews)
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const form = e.target as HTMLFormElement
      const formData = new FormData(form)

      if (file) {
        formData.append('image', file)
      }

      additionalFiles.forEach((file) => {
        formData.append('additionalImages', file)
      })

      const response = await fetch('/api/services', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        showSuccess('Servis přidán', data.message || 'Váš servis byl úspěšně přidán a čeká na schválení administrátorem')
        setTimeout(() => {
          onSuccess()
        }, 1000)
      } else {
        const data = await response.json()
        showError('Chyba', data.message || 'Chyba při vytváření servisu')
      }
    } catch (error) {
      console.error('Chyba:', error)
      showError('Chyba', 'Chyba při vytváření servisu')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Přidat nový servis</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hlavní fotka */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Hlavní fotka servisu
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                />
                {preview && (
                  <div className="relative w-32 h-32">
                    <Image
                      src={preview}
                      alt="Preview"
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Vybrat obrázek
                </Button>
              </div>
            </div>

            {/* Název */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Název servisu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                placeholder="Např. Airsoft Service Praha"
              />
            </div>

            {/* Lokace */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Místo servisu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                required
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                placeholder="Např. Praha, Brno"
              />
            </div>

            {/* Kontakt - Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Kontaktní email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="contactEmail"
                required
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                placeholder="info@servis.cz"
              />
            </div>

            {/* Kontakt - Telefon */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Kontaktní telefon
              </label>
              <input
                type="tel"
                name="contactPhone"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                placeholder="+420 123 456 789"
              />
            </div>

            {/* Popis */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Popis servisu <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                required
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                placeholder="Popište vaše služby, specializace, atd."
              />
            </div>

            {/* Dodatečné fotky */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Dodatečné fotky (max 10)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleAdditionalFileChange}
                className="hidden"
                ref={additionalFileInputRef}
              />
              {additionalPreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {additionalPreviews.map((preview, idx) => (
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
                onClick={() => additionalFileInputRef.current?.click()}
              >
                Vybrat dodatečné obrázky
              </Button>
            </div>

            {/* Tlačítka */}
            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Zrušit
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Odesílám...' : 'Odeslat žádost'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

