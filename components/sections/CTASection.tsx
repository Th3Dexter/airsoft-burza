'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Shield, Users, Plus, Search } from 'lucide-react'
import { useSession } from 'next-auth/react'

export function CTASection() {
  const { data: session } = useSession()
  const isLoggedIn = !!session

  return (
    <section className="py-16 lg:py-24 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 opacity-80">
        <div className="text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Připojte se k největší airsoft komunitě v České republice
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            Prodávejte a nakupujte airsoft vybavení. Vytvářejte inzeráty, prohlížejte nabídky a propojte se s dalšími hráči.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {!isLoggedIn && (
              <Link href="/auth/signup">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-3 text-lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Zaregistrovat se zdarma
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            )}
            <Link href="/products">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-3 text-lg">
                <Search className="h-5 w-5 mr-2" />
                Prohlédnout nabídky
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-card rounded-lg p-6 text-center border border-border">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-muted rounded-lg mb-4">
                <Shield className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Ověření uživatelů</h3>
              <p className="text-muted-foreground text-sm">
                Ověřené profily pro transparentní komunikaci mezi účastníky trhu
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 text-center border border-border">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-muted rounded-lg mb-4">
                <Users className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Aktivní tržiště</h3>
              <p className="text-muted-foreground text-sm">
                Stovky aktivních inzerátů napříč celou Českou republikou
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 text-center border border-border">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-muted rounded-lg mb-4">
                <Search className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Kategorie produktů</h3>
              <p className="text-muted-foreground text-sm">
                Airsoft zbraně, military vybavení a další doplňky
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
