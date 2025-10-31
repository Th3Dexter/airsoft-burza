'use client'

import { useRef, useState, useEffect } from 'react'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useNotificationActions } from '@/lib/useNotificationActions'
import { Upload, X, Plus } from 'lucide-react'

export default function NewProductPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
	const [files, setFiles] = useState<File[]>([])
	const [previews, setPreviews] = useState<string[]>([])
	const [mainImageIndex, setMainImageIndex] = useState<number | null>(null)
	const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { notifyProductCreated, notifyProductError } = useNotificationActions()

  // Načtení profilu uživatele pro automatické vyplnění kontaktních informací
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          const user = data.user
          
          // Vyplnit pole podle dat z profilu
          if (user && user.email) {
            const emailInput = document.querySelector('input[name="contactEmail"]') as HTMLInputElement
            if (emailInput && !emailInput.value) {
              emailInput.value = user.email
            }
          }
          
          if (user && user.phone) {
            const phoneInput = document.querySelector('input[name="contactPhone"]') as HTMLInputElement
            if (phoneInput && !phoneInput.value) {
              phoneInput.value = user.phone
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }
    
    fetchUserProfile()
  }, [])

  // Toggle custom condition field
  useEffect(() => {
    const conditionSelect = document.querySelector('select[name="condition"]') as HTMLSelectElement
    const customWrapper = document.querySelector('#customConditionWrapper')
    
    const handleConditionChange = () => {
      if (conditionSelect.value === 'custom') {
        customWrapper?.classList.remove('hidden')
      } else {
        customWrapper?.classList.add('hidden')
      }
    }
    
    conditionSelect?.addEventListener('change', handleConditionChange)
    
    return () => {
      conditionSelect?.removeEventListener('change', handleConditionChange)
    }
  }, [])

	const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const form = e.target as HTMLFormElement
			const formData = new FormData(form)
			
			// Pokud je vybrán "Vlastní stav", použít hodnotu z customCondition pole
			const conditionValue = formData.get('condition') as string
			if (conditionValue === 'custom') {
				const customCondition = formData.get('customCondition') as string
				if (customCondition && customCondition.trim()) {
					// Uložit vlastní stav jako "custom-[text]"
					formData.set('condition', `custom-${customCondition.trim()}`)
				} else {
					notifyProductError('Vyplňte vlastní stav produktu')
					setIsSubmitting(false)
					return
				}
			}
			
			// Odeslat obrázky v původním pořadí - hlavní obrázek se označí samostatně
			for (const file of files) {
				formData.append('images', file)
			}
			
			// Odeslat index hlavního obrázku (pokud je vybrán)
			if (mainImageIndex !== null && mainImageIndex >= 0 && mainImageIndex < files.length) {
				formData.append('mainImageIndex', mainImageIndex.toString())
			}
      
      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData
      })
      
			if (response.ok) {
        notifyProductCreated()
				form.reset()
				setFiles([])
				setPreviews([])
				setMainImageIndex(null)
        // Přesměrování na stránku s inzeráty
        window.location.href = '/my-products'
      } else {
        const error = await response.json()
        notifyProductError(error.message || 'Chyba při vytváření inzerátu')
      }
    } catch (error) {
      console.error('Product creation error:', error)
      notifyProductError('Chyba při vytváření inzerátu')
    } finally {
      setIsSubmitting(false)
    }
  }

	const validateAndAddFiles = (newFiles: FileList | null) => {
		if (!newFiles || newFiles.length === 0) return
		const current = [...files]
		const currentCount = current.length
		const remainingSlots = 10 - currentCount
		const toAdd = Array.from(newFiles).slice(0, Math.max(0, remainingSlots))

		const allowedExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.heic', '.heif'])
		const allowedHeicMimes = new Set(['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'])
		const extraImageMimes = new Set(['image/x-png','image/pjpeg'])
		const isImageFile = (f: File) => {
			if (f.type && (f.type.startsWith('image/') || allowedHeicMimes.has(f.type) || extraImageMimes.has(f.type))) return true
			const name = (f.name || '').toLowerCase()
			const ext = name.slice(name.lastIndexOf('.'))
			return allowedExtensions.has(ext)
		}

		for (const file of toAdd) {
			if (!isImageFile(file)) {
				notifyProductError(`Soubor ${file.name} není obrázek (podporované: PNG, JPG, JPEG, WEBP, GIF, HEIC, HEIF)`) 
				continue
			}
			if (file.size > 5 * 1024 * 1024) {
				notifyProductError(`Obrázek ${file.name} je příliš velký (max 5MB)`)
				continue
			}
			current.push(file)
		}

		if (current.length > 10) {
			notifyProductError('Maximálně 10 obrázků')
			current.splice(10) // oříznout na 10
		}

		setFiles(current)
		// vytvořit/aktualizovat náhledy
		const objectUrls = current.map(f => URL.createObjectURL(f))
		setPreviews(prev => {
			// zrušit staré URL
			prev.forEach(url => URL.revokeObjectURL(url))
			return objectUrls
		})
	}

	const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		validateAndAddFiles(e.target.files)
		// reset input value to allow re-select same files
		if (fileInputRef.current) fileInputRef.current.value = ''
	}

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		validateAndAddFiles(e.dataTransfer.files)
	}

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
	}

	const removeFileAt = (index: number) => {
		setFiles(prev => prev.filter((_, i) => i !== index))
		setPreviews(prev => {
			const copy = [...prev]
			const [removed] = copy.splice(index, 1)
			if (removed) URL.revokeObjectURL(removed)
			return copy
		})
		// Aktualizovat index hlavního obrázku
		if (mainImageIndex !== null) {
			if (mainImageIndex === index) {
				setMainImageIndex(null)
			} else if (mainImageIndex > index) {
				setMainImageIndex(mainImageIndex - 1)
			}
		}
	}

	const setAsMainImage = (index: number) => {
		setMainImageIndex(index)
	}

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8 opacity-80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Přidat nový inzerát
            </h1>
            <p className="text-lg text-muted-foreground">
              Vyplňte údaje o vašem produktu a zveřejněte inzerát
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-slate-900 dark:text-white">
                  Základní informace
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Název produktu *
                  </label>
                  <input
                    type="text"
                    placeholder="Např. Tokyo Marui M4A1 AEG"
                    className="w-full px-4 py-3 border-2 border-border bg-card rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 dark:text-white"
                    name="title"
                    required
                  />
                </div>

                {/* Sekce (Poptávka/Nabídka) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Sekce *
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 border-border bg-card rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 dark:text-white"
                    name="listingType"
                    required
                  >
                    <option value="">Vyberte sekci</option>
                    <option value="nabizim">Nabídka</option>
                    <option value="shanim">Poptávka</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Kategorie *
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 border-border bg-card rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 dark:text-white"
                    name="category"
                    required
                  >
                    <option value="">Vyberte kategorii</option>
                    <option value="airsoft-weapons">Airsoft zbraně</option>
                    <option value="military-equipment">Military vybavení</option>
                    <option value="other">Ostatní</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Popis *
                  </label>
                  <textarea
                    placeholder="Popište váš produkt co nejdetailněji..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-border bg-card rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 dark:text-white"
                    name="description"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Cena (Kč) *
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full px-4 py-3 border-2 border-border bg-card rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 dark:text-white"
                      name="price"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Stav *
                    </label>
                    <select
                      className="w-full px-4 py-3 border-2 border-border bg-card rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 dark:text-white"
                      name="condition"
                      required
                    >
                      <option value="">Vyberte stav</option>
                      <option value="new">Nový</option>
                      <option value="light-damage">Lehké poškození</option>
                      <option value="major-damage">Větší poškození</option>
                      <option value="non-functional">Nefunkční</option>
                      <option value="custom">Vlastní stav</option>
                    </select>
                  </div>
                </div>

                {/* Custom condition field - shown when "Vlastní stav" is selected */}
                <div id="customConditionWrapper" className="hidden">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Popište vlastní stav (max 20 znaků)
                  </label>
                  <input
                    type="text"
                    name="customCondition"
                    placeholder="Např. Poškozený kryt"
                    maxLength={20}
                    className="w-full px-4 py-3 border-2 border-border bg-card rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 dark:text-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-slate-900 dark:text-white">
                  Fotografie
                </CardTitle>
              </CardHeader>
              <CardContent>
						<div className="space-y-4">
							<input
								type="file"
								accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/heic,image/heif"
								multiple
								ref={fileInputRef}
								onChange={onFileInputChange}
								className="hidden"
								name="images"
							/>
							<div
								onDrop={handleDrop}
								onDragOver={handleDragOver}
								className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center"
							>
								<Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
								<p className="text-gray-600 dark:text-gray-300 mb-2">
									Přetáhněte fotografie sem nebo klikněte pro výběr
								</p>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									Maximálně 10 fotografií, každá do 5MB. Označte hlavní obrázek kliknutím na něj.
								</p>
								<Button type="button" variant="outline" className="mt-4" onClick={() => fileInputRef.current?.click()}>
									Vybrat fotografie
								</Button>
							</div>

							{/* Preview images */}
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								{previews.length === 0 && (
									<div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
										<Plus className="h-8 w-8 text-gray-400" />
									</div>
								)}
								{previews.map((src, idx) => (
									<div 
										key={idx} 
										className={`relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition-all ${
											mainImageIndex === idx 
												? 'ring-4 ring-blue-500 ring-offset-2' 
												: 'hover:ring-2 hover:ring-gray-400'
										}`}
										onClick={() => setAsMainImage(idx)}
										title={mainImageIndex === idx ? 'Hlavní obrázek (kliknutím zrušíte)' : 'Klikněte pro nastavení jako hlavní obrázek'}
									>
										<img src={src} alt={`preview-${idx}`} className="w-full h-full object-cover" />
										{mainImageIndex === idx && (
											<div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded">
												Hlavní
											</div>
										)}
										<button 
											type="button" 
											onClick={(e) => {
												e.stopPropagation()
												removeFileAt(idx)
											}} 
											className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
										>
											<X className="h-4 w-4" />
										</button>
									</div>
								))}
							</div>
						</div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-slate-900 dark:text-white">
                  Lokace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Město *
                    </label>
                    <input
                      type="text"
                      placeholder="Např. Praha"
                      className="w-full px-4 py-3 border-2 border-border bg-card rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 dark:text-white"
                      name="location"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Kraj
                    </label>
                    <select className="w-full px-4 py-3 border-2 border-border bg-card rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 dark:text-white">
                      <option value="">Vyberte kraj</option>
                      <option value="praha">Praha</option>
                      <option value="stredocesky">Středočeský</option>
                      <option value="jihocesky">Jihočeský</option>
                      <option value="plzensky">Plzeňský</option>
                      <option value="karlovarsky">Karlovarský</option>
                      <option value="ustecky">Ústecký</option>
                      <option value="liberecky">Liberecký</option>
                      <option value="kralovehradecky">Královéhradecký</option>
                      <option value="pardubicky">Pardubický</option>
                      <option value="vysocina">Vysočina</option>
                      <option value="jihomoravsky">Jihomoravský</option>
                      <option value="olomoucky">Olomoucký</option>
                      <option value="zlinsky">Zlínský</option>
                      <option value="moravskoslezsky">Moravskoslezský</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-slate-900 dark:text-white">
                  Kontaktní informace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      placeholder="+420 123 456 789"
                      className="w-full px-4 py-3 border-2 border-border bg-card rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      placeholder="vas@email.cz"
                      className="w-full px-4 py-3 border-2 border-border bg-card rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 dark:text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" className="px-8 py-3">
                Zrušit
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="px-8 py-3 bg-slate-700 hover:bg-slate-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Zveřejňuji...' : 'Zveřejnit inzerát'}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}