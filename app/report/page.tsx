'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useNotifications } from '@/lib/NotificationContext'
import { AlertTriangle, ArrowLeft, Send } from 'lucide-react'

export default function ReportPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { showSuccess, showError } = useNotifications()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: 'BUG',
    title: '',
    description: '',
    email: session?.user?.email || '',
    url: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        showSuccess('Nahlášení odesláno', data.message)
        setFormData({
          type: 'BUG',
          title: '',
          description: '',
          email: session?.user?.email || '',
          url: ''
        })
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else {
        const data = await response.json()
        showError('Chyba', data.message || 'Nepodařilo se odeslat nahlášení')
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      showError('Chyba', 'Nepodařilo se odeslat nahlášení')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zpět
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              Nahlásit problém
            </h1>
            <p className="text-lg text-muted-foreground">
              Pomozte nám zlepšit web. Nahlásit můžete chybu, návrh na vylepšení nebo jiný problém.
            </p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Formulář nahlášení</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-foreground mb-2">
                    Typ problému *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="BUG">Chyba (Bug)</option>
                    <option value="FEATURE">Návrh na vylepšení</option>
                    <option value="SECURITY">Bezpečnostní problém</option>
                    <option value="OTHER">Ostatní</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                    Název problému *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    maxLength={200}
                    placeholder="Krátký popis problému"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-slate-500"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.title.length}/200 znaků
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                    Popis problému *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    maxLength={5000}
                    rows={8}
                    placeholder="Podrobný popis problému, co se stalo, jaké byly očekávané výsledky, atd."
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-slate-500 resize-y"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.description.length}/5000 znaků
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email (volitelné)
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="vas@email.cz"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-slate-500"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Pokud chcete být informováni o vyřešení problému
                  </p>
                </div>

                {/* URL */}
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-foreground mb-2">
                    URL stránky (volitelné)
                  </label>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleChange}
                    placeholder="https://example.com/page"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-slate-500"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL stránky, kde se problém vyskytuje
                  </p>
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Odesílání...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Odeslat nahlášení
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Zrušit
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

