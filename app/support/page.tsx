'use client'

import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Mail, MessageCircle, Phone, HelpCircle } from 'lucide-react'

export default function SupportPage() {
  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      description: 'Odpovíme do 24 hodin',
      contact: 'support@airsoftburza.cz',
      action: 'Napsat email'
    },
    {
      icon: MessageCircle,
      title: 'Zprávy',
      description: 'Rychlá komunikace',
      contact: 'Přes platformu',
      action: 'Odeslat zprávu'
    },
    {
      icon: Phone,
      title: 'Telefon',
      description: 'Po-Pá 9:00-17:00',
      contact: '+420 123 456 789',
      action: 'Zavolat'
    }
  ]

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
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Podpora
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Potřebujete pomoc? Jsme tu pro vás. Kontaktujte nás jakýmkoliv způsobem.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground text-center mb-8">
              Kontaktní způsoby
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {contactMethods.map((method, index) => (
                <Card key={index} className="text-center card-hover">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <method.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {method.title}
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      {method.description}
                    </p>
                    <p className="text-foreground font-medium mb-4">
                      {method.contact}
                    </p>
                    <Button className="w-full">
                      {method.action}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground text-center mb-8">
              Často kladené otázky
            </h2>
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

          {/* Additional Help */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Nenašli jste odpověď?
              </h3>
              <p className="text-muted-foreground mb-6">
                Kontaktujte nás přímo a my vám rádi pomůžeme s jakýmkoliv problémem.
              </p>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Mail className="h-5 w-5 mr-2" />
                Kontaktovat podporu
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
