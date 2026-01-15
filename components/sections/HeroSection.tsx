import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Search, Shield, Users, ArrowRight, Plus } from 'lucide-react'

export function HeroSection() {
  return (
                <section className="py-20 lg:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 opacity-80">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-card text-muted-foreground text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-foreground rounded-full mr-2"></span>
                Největší airsoft komunita v ČR
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Najděte své
                <span className="block text-muted-foreground">
                  ideální vybavení
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
                Prodej a nákup airsoftových zbraní, military vybavení a doplňků. 
                Kompletní marketplace pro airsoft komunitu v České a Slovenské republice.
              </p>


            </div>

            {/* Right Content - Features Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-card rounded-lg p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
                            <div className="inline-flex items-center justify-center w-10 h-10 bg-muted rounded-lg mb-4">
                              <Shield className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Ověření uživatelů</h3>
                <p className="text-muted-foreground text-sm">
                  Ověřené účty pro důvěryhodnou komunikaci mezi prodejci a kupujícími
                </p>
              </div>

                          <div className="bg-card rounded-lg p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
                            <div className="inline-flex items-center justify-center w-10 h-10 bg-muted rounded-lg mb-4">
                              <Users className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Aktivní tržiště</h3>
                <p className="text-muted-foreground text-sm">
                  Desítky nových inzerátů každý den - od zbraní až po military vybavení
                </p>
              </div>

                          <div className="bg-card rounded-lg p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
                            <div className="inline-flex items-center justify-center w-10 h-10 bg-muted rounded-lg mb-4">
                              <Search className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Snadné vyhledávání</h3>
                <p className="text-muted-foreground text-sm">
                  Podle kategorie, ceny, stavu a lokace
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
