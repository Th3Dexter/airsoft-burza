'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { 
  Users, 
  Package, 
  MessageSquare, 
  Shield, 
  Settings,
  AlertTriangle
} from 'lucide-react'

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeProducts: 0,
    totalProducts: 0,
    pendingReports: 0
  })

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    // Použít isAdmin z session
    setIsAdmin((session.user as any).isAdmin || false)
    setLoading(false)
  }, [session, status, router])

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }, [])

  useEffect(() => {
    if (isAdmin && !loading) {
      loadStats()
    }
  }, [isAdmin, loading, loadStats])

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Načítání..." />
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Přístup zamítnut
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Nemáte oprávnění k přístupu do této sekce.
              </p>
              <Button onClick={() => router.push('/')}>
                Zpět na hlavní stránku
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8 opacity-80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              Administrátorský panel
            </h1>
            <p className="text-lg text-muted-foreground">
              Správa uživatelů, inzerátů a celého webu
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Celkem uživatelů
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.totalUsers}
                    </p>
                  </div>
                  <Users className="h-12 w-12 text-blue-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Aktivní inzeráty
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.activeProducts}
                    </p>
                  </div>
                  <Package className="h-12 w-12 text-green-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Celkem inzerátů
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.totalProducts}
                    </p>
                  </div>
                  <Package className="h-12 w-12 text-purple-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Nahlášené problémy
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.pendingReports}
                    </p>
                  </div>
                  <AlertTriangle className="h-12 w-12 text-orange-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Správa uživatelů
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Správa uživatelských účtů, změna oprávnění, blokování
                </p>
                <Button asChild className="w-full">
                  <Link href="/admin/users">Spravovat uživatele</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Správa inzerátů
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Kontrola, úprava a mazání inzerátů
                </p>
                <Button asChild className="w-full">
                  <Link href="/admin/products">Spravovat inzeráty</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Správa konverzací
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Kontrola konverzací a zpráv mezi uživateli
                </p>
                <Button asChild className="w-full">
                  <Link href="/admin/messages">Spravovat konverzace</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Servisy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Správa servisů a recenzí
                </p>
                <Button asChild className="w-full">
                  <Link href="/admin/services">Spravovat servisy</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Nahlášené problémy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Prohlížení a řešení nahlášených problémů
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin/reports">Prohlížet problémy</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

