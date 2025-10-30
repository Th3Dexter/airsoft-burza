'use client'

import { useState } from 'react'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useNotificationActions } from '@/lib/useNotificationActions'
import { Upload, X, Plus } from 'lucide-react'

export default function NewProductPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { notifyProductCreated, notifyProductError } = useNotificationActions()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const form = e.target as HTMLFormElement
      const formData = new FormData(form)
      
      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        notifyProductCreated()
        form.reset()
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

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Přidat nový inzerát
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
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
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Kategorie *
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-border bg-card rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 dark:text-white" required>
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
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Stav *
                    </label>
                    <select className="w-full px-4 py-3 border-2 border-border bg-card rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 dark:text-white" required>
                      <option value="">Vyberte stav</option>
                      <option value="new">Jako nový</option>
                      <option value="excellent">Výborný stav</option>
                      <option value="good">Dobrý stav</option>
                      <option value="fair">Použitelný stav</option>
                    </select>
                  </div>
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
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Přetáhněte fotografie sem nebo klikněte pro výběr
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Maximálně 10 fotografií, každá do 5MB
                    </p>
                    <Button type="button" variant="outline" className="mt-4">
                      Vybrat fotografie
                    </Button>
                  </div>

                  {/* Preview images */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Placeholder for uploaded images */}
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <Plus className="h-8 w-8 text-gray-400" />
                    </div>
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