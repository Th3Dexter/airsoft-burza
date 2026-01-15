'use client'

import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import { HelpCircle } from 'lucide-react'

export default function FAQPage() {
  const faqItems = [
    {
      question: 'Jak mohu vytvořit inzerát?',
      answer: 'Přihlaste se do svého účtu a klikněte na "Přidat inzerát" v sidebaru. Vyplňte všechny požadované informace a přidejte fotografie.'
    },
    {
      question: 'Je používání platformy zdarma?',
      answer: 'Ano, základní používání je zdarma. Můžete vytvářet inzeráty, komunikovat s uživateli a prodávat zboží bez poplatků.'
    },
    {
      question: 'Jak mohu kontaktovat prodávajícího?',
      answer: 'Klikněte na tlačítko "Kontaktovat" u inzerátu, který vás zajímá. Otevře se zpráva, kterou můžete odeslat.'
    },
    {
      question: 'Co dělat, když narazím na podezřelý inzerát?',
      answer: 'Okamžitě nás kontaktujte na support@airsoftburza.cz s odkazem na inzerát. Prošetříme situaci a případně inzerát odstraníme.'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* FAQ */}
          <div>
            <h1 className="text-4xl font-bold text-foreground text-center mb-8">
              Často kladené otázky (FAQ)
            </h1>
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <HelpCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {item.question}
                        </h3>
                        <p className="text-muted-foreground">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
