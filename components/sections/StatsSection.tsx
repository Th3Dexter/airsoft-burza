'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { 
  Package, 
  TrendingUp, 
  Calendar,
  Eye,
  Users,
  Activity
} from 'lucide-react'

interface StatsData {
  totalActive: number
  newLast24h: number
  newLast7d: number
  newLast30d: number
  totalViews: number
  avgViews: number
  activeSellers: number
}

export function StatsSection() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    // Aktualizovat statistiky každých 5 minut
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <section className="py-16 lg:py-24 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 opacity-80">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Statistiky inzerátů
            </h2>
            <p className="text-lg text-muted-foreground">
              Načítání statistik...
            </p>
          </div>
        </div>
      </section>
    )
  }

  const statsData = stats || {
    totalActive: 0,
    newLast24h: 0,
    newLast7d: 0,
    newLast30d: 0,
    totalViews: 0,
    avgViews: 0,
    activeSellers: 0,
  }

  const statCards = [
    {
      title: 'Celkem aktivních inzerátů',
      value: statsData.totalActive.toLocaleString('cs-CZ'),
      icon: Package,
      description: 'Aktuálně dostupné nabídky',
      color: 'text-accent'
    },
    {
      title: 'Nových za 24h',
      value: statsData.newLast24h.toLocaleString('cs-CZ'),
      icon: TrendingUp,
      description: 'Přidáno dnes',
      color: 'text-accent'
    },
    {
      title: 'Nových za 7 dní',
      value: statsData.newLast7d.toLocaleString('cs-CZ'),
      icon: Calendar,
      description: 'Přidáno tento týden',
      color: 'text-accent'
    },
    {
      title: 'Nových za 30 dní',
      value: statsData.newLast30d.toLocaleString('cs-CZ'),
      icon: Activity,
      description: 'Přidáno tento měsíc',
      color: 'text-accent'
    },
    {
      title: 'Celkem zobrazení',
      value: statsData.totalViews.toLocaleString('cs-CZ'),
      icon: Eye,
      description: 'Všechna zobrazení',
      color: 'text-accent'
    },
    {
      title: 'Průměrně zobrazení/inzerát',
      value: statsData.avgViews.toLocaleString('cs-CZ'),
      icon: Eye,
      description: 'Průměr na inzerát',
      color: 'text-accent'
    },
    {
      title: 'Aktivních prodejců',
      value: statsData.activeSellers.toLocaleString('cs-CZ'),
      icon: Users,
      description: 'S aktivními inzeráty',
      color: 'text-accent'
    },
  ]

  return (
    <section className="py-16 lg:py-24 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 opacity-80">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Statistiky inzerátů
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Aktuální přehled všech inzerátů na naší platformě
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {stat.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stat.description}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}