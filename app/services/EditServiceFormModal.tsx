'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { X } from 'lucide-react'
import { useNotifications } from '@/lib/NotificationContext'

interface Service {
  id: string
  name: string
  description: string
  location: string
  contactEmail?: string
  contactPhone?: string
  image?: string
  additionalImages?: string[] | null
  userId: string
}

interface EditServiceFormModalProps {
  service: Service
  onClose: () => void
  onSuccess: () => void
}

export function EditServiceFormModal({ service, onClose, onSuccess }: EditServiceFormModalProps) {
  const { showSuccess, showError } = useNotifications()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [preview, setPreview] = useState<string | null>(service.image || null)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([])
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([])
  const additionalFileInputRef = useRef<HTMLInputElement | null>(null)
  const [keepImages, setKeepImages] = useState<string[]>([])
  const [deleteImages, setDeleteImages] = useState<string[]>([])

  // Načtení existujících additionalImages při otevření formuláře
  useEffect(() => {
    if (service.additionalImages && service.additionalImages.length > 0) {
      setKeepImages(service.additionalImages)
    }
  }, [service])

  const handleMainFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      // Omezení na max 10 obrázků celkem
      const maxFiles = 10
      const totalFiles = keepImages.length + selectedFiles.length
      if (totalFiles > maxFiles) {
        showError('Příliš mnoho obrázků', `Celkem můžete mít maximálně ${maxFiles} dodatečných obrázků`)
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

  const handleRemoveAdditionalImage = (imagePath: string) => {
    setKeepImages(keepImages.filter(img => img !== imagePath))
    setDeleteImages([...deleteImages, imagePath])
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

      if (keepImages.length > 0) {
        formData.append('keepImages', JSON.stringify(keepImages))
      }

      if (deleteImages.length > 0) {
        formData.append('deleteImages', JSON.stringify(deleteImages))
      }

      const response = await fetch(`/api/services/${service.id}`, {
        method: 'PATCH',
        body: formData,
      })

      if (response.ok) {
        showSuccess('Servis upraven', 'Váš servis byl úspěšně upraven')
        setTimeout(() => {
          onSuccess()
        }, 1000)
      } else {
        const data = await response.json()
        showError('Chyba', data.message || 'Chyba při úpravě servisu')
      }
    } catch (error) {
      console.error('Chyba:', error)
      showError('Chyba', 'Chyba při úpravě servisu')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Upravit profil servisu</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
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
                  onChange={handleMainFileChange}
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
                  Vybrat nový obrázek
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
                defaultValue={service.name}
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
                defaultValue={service.location}
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
                defaultValue={service.contactEmail}
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
                defaultValue={service.contactPhone}
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
                defaultValue={service.description}
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
              
              {/* Existující fotky */}
              {keepImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {keepImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                        <Image
                          src={img}
                          alt={`Existing ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAdditionalImage(img)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Nové fotky */}
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
                Přidat dodatečné obrázky
              </Button>
            </div>

            {/* Tlačítka */}
            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Zrušit
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Ukládám...' : 'Uložit změny'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

