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
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
                      <h2 className="text-3xl lg:text-4xl font-bold text-black dark:text-white mb-4">
            Prohlédněte si naše kategorie
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Najděte přesně to, co hledáte v našich pečlivě organizovaných kategoriích
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <Link key={category.name} href={category.href}>
                            <Card className="group cursor-pointer h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                        <IconComponent className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors" />
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl font-semibold text-black dark:text-white mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {category.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-4 text-sm">
                                  <div className="flex items-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-full">
                        <Package className="h-4 w-4 mr-1" />
                        <span className="font-medium">{category.stats.products} produktů</span>
                      </div>
                      <div className="flex items-center text-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                        <span className="font-medium">{category.stats.new} nových</span>
                      </div>
                    </div>

                    {/* Popular Items */}
                    <div className="space-y-2">
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Populární:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {category.popular.map((item, index) => (
                          <span
                            key={index}
                                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Hover Effect */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
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
                        <button className="inline-flex items-center px-6 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors">
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
