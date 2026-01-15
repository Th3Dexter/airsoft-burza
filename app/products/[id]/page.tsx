'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  MapPin, 
  Clock, 
  User, 
  CheckCircle, 
  Package, 
  ArrowLeft,
  Share2,
  ChevronLeft,
  ChevronRight,
  X,
  Mail,
  Phone
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  title: string
  description: string
  price: number
  mainImage?: string | null
  images: string[]
  location: string
  condition: string
  category: string
  listingType: string
  createdAt: string
  userId: string
  userName: string
  userEmail?: string
  userPhone?: string
  userImage: string
  userNickname: string
  userIsVerified: boolean
  userReputation: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0)
  const [copySuccess, setCopySuccess] = useState(false)

  // Načtení produktu
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Zkontrolovat, jestli uživatel už zobrazil tento produkt (ochrana proti spamu)
        const viewKey = `product_view_${productId}`
        const lastView = localStorage.getItem(viewKey)
        const now = Date.now()
        const oneHour = 60 * 60 * 1000 // 1 hodina v milisekundách
        
        // Pokud uživatel zobrazil produkt v poslední hodině, neinkrementovat
        const shouldIncrement = !lastView || (now - parseInt(lastView)) > oneHour
        
        const response = await fetch(`/api/products/${productId}${shouldIncrement ? '?trackView=true' : ''}`)
        if (response.ok) {
          const data = await response.json()
          // Validace a očištění obrázků
          if (data.images) {
            let images = data.images
            // Pokud je images string, zkusme ho parsovat
            if (typeof images === 'string') {
              try {
                images = JSON.parse(images)
              } catch (e) {
                images = []
              }
            }
            // Zkontrolovat, že images je pole a obsahuje validní stringy
            if (Array.isArray(images)) {
              data.images = images.filter(img => img && typeof img === 'string' && img.trim().length > 0)
            } else {
              data.images = []
            }
          } else {
            data.images = []
          }
          setProduct(data)
          
          // Uložit čas zobrazení do localStorage
          if (shouldIncrement) {
            localStorage.setItem(viewKey, now.toString())
          }
        } else if (response.status === 404) {
          setError('Produkt nebyl nalezen')
        } else {
          setError('Chyba při načítání produktu')
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        setError('Chyba při načítání produktu')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  // Příprava všech obrázků (mainImage + images) - musí být před dalšími hooks
  const allImages: string[] = product 
    ? (() => {
        const images: string[] = []
        if (product.mainImage && product.mainImage.trim()) {
          images.push(product.mainImage)
        }
        if (product.images && Array.isArray(product.images)) {
          product.images.forEach(img => {
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

  // Resetovat lightbox při změně produktu
  useEffect(() => {
    setLightboxOpen(false)
    setLightboxImageIndex(0)
    document.body.style.overflow = 'unset'
  }, [productId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto mb-4"></div>
          <p className="text-foreground">Načítání produktu...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {error || 'Produkt nebyl nalezen'}
              </h1>
              <p className="text-foreground mb-6">
                Zkuste se vrátit na seznam produktů
              </p>
              <Button asChild>
                <Link href="/products">Zpět na produkty</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const conditionMap: { [key: string]: string } = {
    'Nový': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Lehké poškození': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Větší poškození': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'Nefunkční': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  const listingTypeLabel = product.listingType === 'NABIZIM' ? 'Nabídka' : 'Poptávka'
  const listingTypeColor = product.listingType === 'NABIZIM' ? 'bg-blue-500' : 'bg-purple-500'

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

  // Funkce pro sdílení odkazu
  const handleShare = async () => {
    try {
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Back button */}
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zpět
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side - Images */}
            <div>
              <Card>
                <CardContent className="p-0">
                  {/* Main image */}
                  <div 
                    className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden cursor-pointer relative"
                    onClick={() => {
                      // Najít index aktuálně zobrazeného obrázku v allImages
                      const currentImage = product.mainImage && product.mainImage.trim() 
                        ? product.mainImage 
                        : (product.images && Array.isArray(product.images) && product.images.length > 0
                            ? (product.images[selectedImageIndex] || product.images[0])
                            : null)
                      if (currentImage) {
                        const index = allImages.indexOf(currentImage)
                        if (index >= 0) {
                          openLightbox(index)
                        }
                      }
                    }}
                  >
                    {(() => {
                      // Použít mainImage pokud existuje, jinak images[selectedImageIndex] nebo images[0]
                      const mainImageSrc = product.mainImage && product.mainImage.trim() 
                        ? product.mainImage 
                        : (product.images && Array.isArray(product.images) && product.images.length > 0
                            ? (product.images[selectedImageIndex] || product.images[0])
                            : null)
                      
                      return mainImageSrc ? (
                        <Image
                          src={mainImageSrc}
                          alt={product.title}
                          width={600}
                          height={600}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-24 w-24 text-gray-400" />
                        </div>
                      )
                    })()}
                  </div>

                  {/* Thumbnail images */}
                  {allImages.length > 1 && (
                    <div className="p-4 grid grid-cols-4 gap-2">
                      {allImages.map((image, index) => {
                        // Zjistit, jestli je aktuálně zobrazený obrázek
                        const currentMainImage = product.mainImage && product.mainImage.trim() 
                          ? product.mainImage 
                          : (product.images && Array.isArray(product.images) && product.images.length > 0
                              ? (product.images[selectedImageIndex] || product.images[0])
                              : null)
                        const isSelected = image === currentMainImage
                        
                        return (
                          <button
                            key={index}
                            onClick={() => {
                              // Otevřít lightbox s tímto obrázkem
                              openLightbox(index)
                              // Také aktualizovat selectedImageIndex pro zobrazení hlavního obrázku
                              if (product.images && product.images.includes(image)) {
                                setSelectedImageIndex(product.images.indexOf(image))
                              } else if (product.mainImage && product.mainImage.trim() === image) {
                                // Pokud je to mainImage, zobrazit první z images jako náhled
                                if (product.images && product.images.length > 0) {
                                  setSelectedImageIndex(0)
                                }
                              }
                            }}
                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-blue-500 ring-2 ring-blue-300'
                                : 'border-transparent hover:border-gray-300'
                            }`}
                          >
                            <Image
                              src={image}
                              alt={`${product.title} - obrázek ${index + 1}`}
                              width={150}
                              height={150}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          </button>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Kontaktní informace prodejce */}
              <Card className="mt-8">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    Kontakt na prodejce
                  </h4>
                  <div className="space-y-2">
                    {product.userEmail && (
                      <div className="flex items-center text-sm text-foreground">
                        <Mail className="h-4 w-4 mr-2" />
                        <a href={`mailto:${product.userEmail}`} className="hover:underline">
                          {product.userEmail}
                        </a>
                      </div>
                    )}
                    {product.userPhone && (
                      <div className="flex items-center text-sm text-foreground">
                        <Phone className="h-4 w-4 mr-2" />
                        <a href={`tel:${product.userPhone}`} className="hover:underline">
                          {product.userPhone}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right side - Product Info */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={listingTypeColor}>
                    {listingTypeLabel}
                  </Badge>
                  <Badge variant="secondary">
                    {product.category}
                  </Badge>
                  <Badge className={conditionMap[product.condition] || ''}>
                    {product.condition}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  {product.title}
                </h1>
                <div className="flex items-center text-2xl font-bold text-foreground mb-4">
                  {formatPrice(product.price)}
                </div>
              </div>

              {/* Seller Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
                        {product.userImage ? (
                          <Image
                            src={product.userImage}
                            alt={product.userName}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">
                            {product.userNickname || product.userName}
                          </h3>
                          {product.userIsVerified && (
                            <CheckCircle className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-foreground">
                          {product.userName}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/messages?userId=${product.userId}&productId=${product.id}`}>
                        Kontaktovat prostřednictvím webu
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Product Details */}
              <Card>
                <CardHeader className="pb-3">
                  <h2 className="text-xl font-semibold text-foreground">
                    Detaily produktu
                  </h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm text-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{product.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>
                      Zveřejněno {new Date(product.createdAt).toLocaleDateString('cs-CZ')}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader className="pb-3">
                  <h2 className="text-xl font-semibold text-foreground">
                    Popis
                  </h2>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">
                    {product.description}
                  </p>
                </CardContent>
              </Card>

              {/* Actions */}
              <Button 
                className="w-full bg-slate-700 hover:bg-slate-800 text-white"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                {copySuccess ? 'Zkopírováno!' : 'Sdílet'}
              </Button>
            </div>
          </div>
        </div>
      </main>

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
              alt={`${product.title} - obrázek ${lightboxImageIndex + 1}`}
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

      <Footer />
    </div>
  )
}

