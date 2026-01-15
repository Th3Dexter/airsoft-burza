'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useNotifications } from '@/lib/NotificationContext'
import { 
  Users, 
  Shield, 
  CheckCircle, 
  Search,
  ArrowLeft,
  Mail,
  Calendar,
  Pause
} from 'lucide-react'
import Image from 'next/image'

interface User {
  id: string
  name: string
  email: string
  image?: string
  isVerified: boolean
  isBanned: boolean
  isAdmin: boolean
  reputation: string
  createdAt: string
  lastLoginAt?: string
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showSuccess, showError, showConfirmation } = useNotifications()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true)
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
        setFilteredUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error loading users:', error)
      showError('Chyba', 'Nepodařilo se načíst uživatele')
    } finally {
      setLoadingUsers(false)
    }
  }, [showError])

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    const userIsAdmin = (session.user as any).isAdmin || false
    setIsAdmin(userIsAdmin)
    
    if (userIsAdmin) {
      loadUsers()
    } else {
      router.push('/admin')
    }
    
    setLoading(false)
  }, [session, status, router, loadUsers])

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  const handleToggleSuspend = async (userId: string, currentStatus: boolean) => {
    const confirmed = await showConfirmation({
      title: currentStatus ? 'Obnovit účet?' : 'Pozastavit účet?',
      message: currentStatus 
        ? 'Opravdu chcete obnovit účet tohoto uživatele? Uživatel bude moci znovu přidávat inzeráty a komunikovat.'
        : 'Opravdu chcete pozastavit účet tohoto uživatele? Uživatel nebude moci přidávat inzeráty ani komunikovat, ale stále uvidí obsah stránky.',
      confirmText: currentStatus ? 'Obnovit' : 'Pozastavit',
      cancelText: 'Zrušit',
      type: 'warning'
    })

    if (!confirmed) return

    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned: !currentStatus })
      })

      if (response.ok) {
        showSuccess('Úspěch', `Účet byl ${!currentStatus ? 'pozastaven' : 'obnoven'}`)
        loadUsers()
      } else {
        showError('Chyba', 'Nepodařilo se změnit stav uživatele')
      }
    } catch (error) {
      showError('Chyba', 'Nepodařilo se změnit stav uživatele')
    }
  }

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    const confirmed = await showConfirmation({
      title: currentStatus ? 'Odebrat admin oprávnění?' : 'Udělit admin oprávnění?',
      message: currentStatus 
        ? 'Opravdu chcete odebrat administrátorské oprávnění tomuto uživateli?'
        : 'Opravdu chcete udělit administrátorské oprávnění tomuto uživateli?',
      confirmText: currentStatus ? 'Odebrat' : 'Udělit',
      cancelText: 'Zrušit',
      type: 'warning'
    })

    if (!confirmed) return

    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: !currentStatus })
      })

      if (response.ok) {
        showSuccess('Úspěch', `Admin oprávnění bylo ${!currentStatus ? 'uděleno' : 'odebráno'}`)
        loadUsers()
      } else {
        showError('Chyba', 'Nepodařilo se změnit admin status')
      }
    } catch (error) {
      showError('Chyba', 'Nepodařilo se změnit admin status')
    }
  }

  const getReputationBadge = (reputation: string) => {
    const reputationMap: { [key: string]: { label: string; variant: 'default' | 'secondary' | 'destructive' } } = {
      'VERY_GOOD': { label: 'Výborná', variant: 'default' },
      'GOOD': { label: 'Dobrá', variant: 'default' },
      'NEUTRAL': { label: 'Neutrální', variant: 'secondary' },
      'BAD': { label: 'Špatná', variant: 'destructive' },
      'VERY_BAD': { label: 'Velmi špatná', variant: 'destructive' }
    }
    return reputationMap[reputation] || { label: 'Neutrální', variant: 'secondary' }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Načítání..." />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8 opacity-80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/admin')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zpět na dashboard
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              Správa uživatelů
            </h1>
            <p className="text-lg text-muted-foreground">
              Kontrola a správa všech uživatelských účtů
            </p>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Hledat uživatele podle jména nebo emailu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-slate-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          {loadingUsers ? (
            <LoadingSpinner size="lg" text="Načítání uživatelů..." />
          ) : filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Žádní uživatelé
                </h3>
                <p className="text-muted-foreground">
                  Nebyly nalezeny žádní uživatelé
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => {
                const reputationInfo = getReputationBadge(user.reputation)
                return (
                  <Card key={user.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={user.name || 'User'}
                              width={64}
                              height={64}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                              <Users className="h-8 w-8 text-gray-500" />
                            </div>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                {user.name || 'Bez jména'}
                                {user.isVerified && (
                                  <CheckCircle className="h-5 w-5 text-blue-500" />
                                )}
                              </h3>
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <Mail className="h-4 w-4 mr-1" />
                                {user.email}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Badge variant={reputationInfo.variant}>
                                {reputationInfo.label}
                              </Badge>
                              {!!user.isAdmin && (
                                <Badge variant="default">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Admin
                                </Badge>
                              )}
                              {!!user.isBanned && (
                                <Badge variant="destructive">
                                  <Pause className="h-3 w-3 mr-1" />
                                  Pozastaven
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Registrován: {new Date(user.createdAt).toLocaleDateString('cs-CZ')}
                            </div>
                            {user.lastLoginAt && (
                              <div>
                                Poslední přihlášení: {new Date(user.lastLoginAt).toLocaleDateString('cs-CZ')}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/profile?userId=${user.id}`)}
                            >
                              Zobrazit profil
                            </Button>
                            <Button
                              size="sm"
                              variant={!!user.isBanned ? "default" : "destructive"}
                              onClick={() => handleToggleSuspend(user.id, !!user.isBanned)}
                            >
                              <Pause className="h-4 w-4 mr-1" />
                              {!!user.isBanned ? 'Obnovit' : 'Pozastavit'}
                            </Button>
                            <Button
                              size="sm"
                              variant={!!user.isAdmin ? "destructive" : "default"}
                              onClick={() => handleToggleAdmin(user.id, !!user.isAdmin)}
                            >
                              <Shield className="h-4 w-4 mr-1" />
                              {!!user.isAdmin ? 'Odebrat Admin pravomoce' : 'Udělit Admin pravomoce'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

