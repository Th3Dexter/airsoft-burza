import { Users, Package, Shield, Star } from 'lucide-react'

const stats = [
  {
    icon: Users,
    value: '0',
    label: 'Aktivních uživatelů',
    description: 'Ověření prodejci a kupci'
  },
  {
    icon: Package,
    value: '0',
    label: 'Prodaných produktů',
    description: 'Úspěšné transakce'
  },
  {
    icon: Star,
    value: '0/5',
    label: 'Hodnocení',
    description: 'Spokojenost uživatelů'
  }
]

const trustFeatures = [
  {
    icon: Shield,
    title: 'Ověření uživatelů',
    description: 'Všichni prodejci jsou ověřeni a mají hodnocení od ostatních uživatelů'
  },
  {
    icon: Shield,
    title: 'Bezpečná komunikace',
    description: 'Všechny zprávy jsou šifrované a komunikace probíhá přímo na platformě'
  },
  {
    icon: Package,
    title: 'Garance kvality',
    description: 'Každý produkt je kontrolován a má detailní popis včetně fotografií'
  }
]

export function StatsSection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-black dark:text-white mb-4">
            Důvěřují nám tisíce uživatelů
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Naše platforma je největší airsoft burza v České republice
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                  <IconComponent className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="text-4xl font-bold text-black dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.description}
                </div>
              </div>
            )
          })}
        </div>

        {/* Trust Features */}
        <div className="mt-16 pt-16 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-black dark:text-white mb-4">
              Bezpečnost a důvěryhodnost
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Vaše bezpečnost je naší prioritou
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {trustFeatures.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                    <IconComponent className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-black dark:text-white mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
