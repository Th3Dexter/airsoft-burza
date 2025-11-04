'use client'

import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    products: [
      { name: 'Airsoft zbraně', href: '/products/airsoft-weapons' },
      { name: 'Military vybavení', href: '/products/military-equipment' },
      { name: 'Ostatní', href: '/products/other' },
      { name: 'Všechny produkty', href: '/products' },
    ],
    support: [
      { name: 'FAQ', href: '/support' },
    ],
    company: [
      { name: 'O nás', href: '/about' },
    ],
    legal: [
      { name: 'Zásady ochrany osobních údajů', href: '/privacy' },
      { name: 'Cookies', href: '/cookies' },
      { name: 'Nahlásit problém', href: '/report' },
    ],
  }

  return (
    <footer className="bg-background text-foreground border-t border-border mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <Image
                src="/images/logo.png"
                alt="Airsoft Burza"
                width={250}
                height={80}
                className="h-12 w-auto object-contain"
                priority
              />
            </div>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Platforma pro prodej a nákup airsoftových zbraní a military vybavení.
              Bezpečná komunikace a ověření uživatelů.
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Produkty
            </h3>
            <ul className="space-y-2">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* FAQ */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              FAQ
            </h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Společnost
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-muted-foreground text-sm">
              © {currentYear} Airsoft Burza. Všechna práva vyhrazena.
            </div>
            <div className="flex flex-wrap gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
