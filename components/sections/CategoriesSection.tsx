import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { 
  Target, 
  Shield, 
  Package, 
  ArrowRight,
  Eye
} from 'lucide-react'

const categories = [
  {
    name: 'Airsoft zbraně',
    description: 'Pistole, pušky, samopaly a příslušenství pro airsoft',
    href: '/products/airsoft-weapons',
    icon: Target,
    stats: { products: 1247, new: 23 },
    popular: ['M4A1', 'AK-47', 'Glock 17', 'MP5']
  },
  {
    name: 'Military vybavení',
    description: 'Oblečení, boty, batohy a taktické vybavení',
    href: '/products/military-equipment',
    icon: Shield,
    stats: { products: 892, new: 15 },
    popular: ['Taktické vesty', 'Combat boty', 'Rukavice', 'Helmy']
  },
  {
    name: 'Ostatní',
    description: 'Doplňky, náhradní díly a speciální vybavení',
    href: '/products/other',
    icon: Package,
    stats: { products: 456, new: 8 },
    popular: ['Náhradní díly', 'Optika', 'Nabíječky', 'Pouzdra']
  }
]

export function CategoriesSection() {
  return (
    <section className="py-16 lg:py-24 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 opacity-80">
        <div className="text-center mb-16">
                      <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Prohlédněte si naše kategorie
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Najděte přesně to, co hledáte v našich pečlivě organizovaných kategoriích
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <Link key={category.name} href={category.href}>
                            <Card className="group cursor-pointer h-full bg-card border border-border hover:shadow-lg transition-all duration-300 hover:border-primary">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-lg bg-muted group-hover:bg-primary transition-colors">
                        <IconComponent className="h-6 w-6 text-muted-foreground group-hover:text-primary-foreground" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {category.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-4 text-sm">
                                  <div className="flex items-center text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                        <Package className="h-4 w-4 mr-1" />
                        <span className="font-medium">{category.stats.products} produktů</span>
                      </div>
                      <div className="flex items-center text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                        <span className="font-medium">{category.stats.new} nových</span>
                      </div>
                    </div>

                    {/* Popular Items */}
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground font-medium">
                        Populární:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {category.popular.map((item, index) => (
                          <span
                            key={index}
                                        className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs font-medium"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Hover Effect */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center text-muted-foreground text-sm font-medium group-hover:translate-x-1 transition-transform">
                        <span>Prohlédnout kategorii</span>
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Link href="/products">
                        <button className="inline-flex items-center px-6 py-3 bg-primary hover:bg-[#1e251e] text-primary-foreground hover:text-white font-medium rounded-lg transition-colors">
              <Eye className="h-5 w-5 mr-2" />
              Zobrazit všechny produkty
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
