'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useNotificationActions } from '@/lib/useNotificationActions'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ProfileSkeleton } from '@/components/ui/Skeleton'
import { User, Mail, Phone, MapPin, Edit, Shield, Star, Package, MessageCircle, Trash2, ThumbsUp, ThumbsDown, Minus } from 'lucide-react'

function ProfilePageContent() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [viewingUserId, setViewingUserId] = useState<string | null>(null)
  const [isOwnProfile, setIsOwnProfile] = useState(true)
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    bio: '',
    nickname: '',
    avatar: ''
  })
  const [products, setProducts] = useState([])
  const [stats, setStats] = useState({
    user: {
      name: '',
      email: '',
      image: '',
      phone: '',
      isVerified: false,
      registrationYear: new Date().getFullYear()
    },
    products: {
      active: 0,
      sold: 0,
      total: 0,
      totalValue: 0,
      categoryStats: []
    },
    messages: {
      sent: 0,
      received: 0,
      total: 0,
      conversations: 0
    },
    reputation: 'NEUTRAL',
    lastActivity: null
  })
  const { notifyProfileSaved, notifyProfileError, confirmDeleteProduct, notifyProductDeleted } = useNotificationActions()

  // Funkce pro zobrazení reputace
  const getReputationDisplay = (reputation: string) => {
    switch (reputation) {
      case 'VERY_GOOD':
        return {
          text: 'Velmi dobrá',
          icon: ThumbsUp,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/20'
        }
      case 'GOOD':
        return {
          text: 'Dobrá',
          icon: ThumbsUp,
          color: 'text-green-500 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/10'
        }
      case 'NEUTRAL':
        return {
          text: 'Neutrální',
          icon: Minus,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted'
        }
      case 'BAD':
        return {
          text: 'Špatná',
          icon: ThumbsDown,
          color: 'text-orange-500 dark:text-orange-400',
          bgColor: 'bg-orange-50 dark:bg-orange-900/10'
        }
      case 'VERY_BAD':
        return {
          text: 'Velmi špatná',
          icon: ThumbsDown,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/20'
        }
      default:
        return {
          text: 'Neutrální',
          icon: Minus,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted'
        }
    }
  }

  useEffect(() => {
    // Získání userId z URL parametrů - použijeme jak searchParams, tak window.location pro spolehlivost
    const userIdParamFromSearch = searchParams?.get('userId')
    let userIdParam = userIdParamFromSearch
    
    // Fallback na window.location, pokud searchParams nevrátí hodnotu
    if (!userIdParam && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      userIdParam = urlParams.get('userId')
    }
    
    const currentUserId = (session?.user as any)?.id
    
    console.log('ProfilePage - useEffect userId:', { userIdParam, userIdParamFromSearch, currentUserId, windowLocation: typeof window !== 'undefined' ? window.location.search : 'N/A' })
    
    // Pokud je v URL userId parametr, použij ho
    if (userIdParam) {
      // Zkontroluj, zda je to jiný uživatel než aktuálně přihlášený
      if (userIdParam !== currentUserId) {
        // Zobrazujeme profil jiného uživatele
        console.log('Setting viewingUserId to:', userIdParam)
        setViewingUserId(userIdParam)
        setIsOwnProfile(false)
        setIsEditing(false) // Nelze editovat profil jiného uživatele
      } else {
        // userIdParam se shoduje s currentUserId - zobrazujeme vlastní profil
        setViewingUserId(null)
        setIsOwnProfile(true)
      }
    } else {
      // Není userId parametr - zobrazujeme vlastní profil
      setViewingUserId(null)
      setIsOwnProfile(true)
    }
  }, [searchParams, session])

  useEffect(() => {
    const fetchUserData = async () => {
      // Získání userId z URL parametrů (přímo, ne z state, protože state může být ještě neaktualizovaný)
      let userIdParam = searchParams?.get('userId')
      
      // Fallback na window.location, pokud searchParams nevrátí hodnotu
      if (!userIdParam && typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search)
        userIdParam = urlParams.get('userId')
      }
      
      const currentUserId = (session?.user as any)?.id
      
      // Debug logování
      console.log('ProfilePage - fetchUserData:', { userIdParam, currentUserId, sessionReady: !!session?.user, windowLocation: typeof window !== 'undefined' ? window.location.search : 'N/A' })
      
      // Pokud není session, ale je userIdParam, počkej na session
      // Pokud není ani session ani userIdParam, nelze načíst data
      if (!session?.user && !userIdParam) {
        setIsLoading(false)
        return
      }

      // Pokud je userIdParam a není session, počkej na session (kvůli autorizaci)
      if (userIdParam && !session?.user) {
        return
      }

      try {
        // Určení, který userId použít
        // Pokud je userIdParam a je jiný než currentUserId, použij userIdParam
        // Jinak použij currentUserId (nebo null, pokud není session)
        const targetUserId = (userIdParam && userIdParam !== currentUserId) ? userIdParam : null
        
        console.log('ProfilePage - targetUserId:', targetUserId)
        
        // Sestavení URL s userId parametrem, pokud zobrazujeme profil jiného uživatele
        const statsUrl = targetUserId 
          ? `/api/user/stats?userId=${targetUserId}`
          : '/api/user/stats'
        
        // Načtení statistik z API
        const response = await fetch(statsUrl)
        if (response.ok) {
          const statsData = await response.json()
          setStats(statsData)
          
          // Nastavení uživatelských dat ze statistik
          setUserData({
            name: statsData.user.name || '',
            email: statsData.user.email || '',
            phone: statsData.user.phone || '',
            city: statsData.user.city || '',
            bio: statsData.user.bio || '',
            nickname: statsData.user.nickname || '',
            avatar: statsData.user.image || ''
          })
        } else {
          // Fallback na session data (pouze pro vlastní profil)
          if (!targetUserId && session?.user) {
            setUserData({
              name: session.user.name || '',
              email: session.user.email || '',
              phone: '',
              city: '',
              bio: '',
              nickname: '',
              avatar: session.user.image || ''
            })
          }
        }

        // Načtení inzerátů uživatele
        const productsUrl = targetUserId
          ? `/api/user/products?userId=${targetUserId}`
          : '/api/user/products'
        
        const productsResponse = await fetch(productsUrl)
        if (productsResponse.ok) {
          const productsData = await productsResponse.json()
          setProducts(productsData.products || [])
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        // Fallback na session data (pouze pro vlastní profil)
        if (!userIdParam && session?.user) {
          setUserData({
            name: session.user.name || '',
            email: session.user.email || '',
            phone: '',
            city: '',
            bio: '',
            nickname: '',
            avatar: session.user.image || ''
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [session, searchParams])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ProfileSkeleton />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Přihlášení vyžadováno
          </h1>
          <p className="text-foreground mb-6">
            Pro zobrazení profilu se musíte přihlásit.
          </p>
          <Button asChild>
            <a href="/auth/signin">Přihlásit se</a>
          </Button>
        </div>
      </div>
    )
  }

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: userData.nickname,
          phone: userData.phone,
          city: userData.city,
          bio: userData.bio
        })
      })

      if (response.ok) {
        const result = await response.json()
        notifyProfileSaved()
        setIsEditing(false)
      } else {
        const error = await response.json()
        notifyProfileError(error.message || 'Chyba při ukládání profilu')
      }
    } catch (error) {
      console.error('Profile save error:', error)
      notifyProfileError('Chyba při ukládání profilu')
    }
  }

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!isOwnProfile) return // Nelze mazat produkty jiného uživatele
    
    const confirmed = await confirmDeleteProduct(productName)
    if (confirmed) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          notifyProductDeleted()
          // Aktualizace seznamu produktů
          setProducts(prev => prev.filter((p: any) => p.id !== productId))
          // Obnovení statistik
          const statsUrl = viewingUserId 
            ? `/api/user/stats?userId=${viewingUserId}`
            : '/api/user/stats'
          const statsResponse = await fetch(statsUrl)
          if (statsResponse.ok) {
            const statsData = await statsResponse.json()
            setStats(statsData)
          }
        } else {
          const error = await response.json()
          notifyProfileError(error.message || 'Nepodařilo se smazat inzerát')
        }
      } catch (error) {
        console.error('Delete product error:', error)
        notifyProfileError('Nepodařilo se smazat inzerát')
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Profile Header */}
          <div className="mb-8">
            <div className="bg-card rounded-lg p-8 opacity-80">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  {userData.avatar ? (
                    <img 
                      src={userData.avatar} 
                      alt={userData.name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-muted-foreground">
                      {userData.name ? userData.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-card-foreground">
                      {userData.name || 'Uživatel'}
                    </h1>
                    <div className="flex items-center space-x-2">
                      <Shield className={`h-5 w-5 ${stats.user.isVerified ? 'text-green-500' : 'text-yellow-500'}`} />
                      <span className={`text-sm font-medium ${stats.user.isVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                        {stats.user.isVerified ? 'Ověřený uživatel' : 'Aktivní uživatel'}
                      </span>
                    </div>
                  </div>
                  <p className="text-card-foreground mb-4">
                    {userData.bio || 'Uživatel Airsoft Burzy'}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {userData.nickname && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        @{userData.nickname}
                      </div>
                    )}
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {userData.city || 'Město neuvedeno'}
                    </div>
                    <div className="flex items-center">
                      {(() => {
                        const rep = getReputationDisplay(stats.reputation)
                        const IconComponent = rep.icon
                        return (
                          <>
                            <IconComponent className={`h-4 w-4 mr-1 ${rep.color}`} />
                            <span className={rep.color}>{rep.text}</span>
                          </>
                        )
                      })()}
                    </div>
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-1" />
                      {stats.products.active} aktivních inzerátů
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {stats.messages.conversations} konverzací
                    </div>
                  </div>
                </div>
                {isOwnProfile && (
                  isEditing ? (
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleSaveProfile}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Uložit
                      </Button>
                      <Button 
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                        className="border-military-charcoal text-military-text hover:bg-military-charcoal"
                      >
                        Zrušit
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => setIsEditing(true)}
                      className="bg-slate-700 hover:bg-slate-800 text-white"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Upravit profil
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-card-foreground">
                    Osobní informace
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">
                        Jméno
                      </label>
                      <input
                        type="text"
                        value={userData.name?.split(' ')[0] || ''}
                        onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value + ' ' + (prev.name?.split(' ')[1] || '') }))}
                        className={`w-full px-4 py-3 border-2 border-border bg-card rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-card-foreground ${
                          isEditing ? 'bg-background' : ''
                        }`}
                        readOnly={!isEditing}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">
                        Příjmení
                      </label>
                      <input
                        type="text"
                        value={userData.name?.split(' ')[1] || ''}
                        onChange={(e) => setUserData(prev => ({ ...prev, name: (prev.name?.split(' ')[0] || '') + ' ' + e.target.value }))}
                        className={`w-full px-4 py-3 border-2 border-border bg-card rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-card-foreground ${
                          isEditing ? 'bg-background' : ''
                        }`}
                        readOnly={!isEditing}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Přezdívka <span className="text-muted-foreground">(volitelné)</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                      <input
                        type="text"
                        value={userData.nickname}
                        onChange={(e) => setUserData(prev => ({ ...prev, nickname: e.target.value }))}
                        placeholder="Zadejte přezdívku"
                        maxLength={50}
                        className={`w-full pl-10 pr-4 py-3 border-2 border-border bg-card rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-card-foreground ${
                          isEditing ? 'bg-background' : ''
                        }`}
                        readOnly={!isEditing}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Přezdívka bude zobrazena v inzerátech a zprávách. Maximálně 50 znaků.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                      <input
                        type="email"
                        value={userData.email}
                        className={`w-full pl-10 pr-4 py-3 border-2 border-border bg-card rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-card-foreground ${
                          isEditing ? 'bg-background' : ''
                        }`}
                        readOnly={true}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Telefon
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                      <input
                        type="tel"
                        value={userData.phone}
                        onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                        className={`w-full pl-10 pr-4 py-3 border-2 border-border bg-card rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-card-foreground ${
                          isEditing ? 'bg-background' : ''
                        }`}
                        readOnly={!isEditing}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Město
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                      <input
                        type="text"
                        value={userData.city}
                        onChange={(e) => setUserData(prev => ({ ...prev, city: e.target.value }))}
                        className={`w-full pl-10 pr-4 py-3 border-2 border-border bg-card rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-card-foreground ${
                          isEditing ? 'bg-background' : ''
                        }`}
                        readOnly={!isEditing}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      O sobě
                    </label>
                    <textarea
                      value={userData.bio}
                      onChange={(e) => setUserData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      className={`w-full px-4 py-3 border-2 border-border bg-card rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-card-foreground ${
                        isEditing ? 'bg-background' : ''
                      }`}
                      readOnly={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-card-foreground">
                    Moje inzeráty
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products.length > 0 ? (
                      products.slice(0, 3).map((product: any) => (
                        <div key={product.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                          <div>
                            <h3 className="font-semibold text-card-foreground">
                              {product.title}
                            </h3>
                            <p className="text-sm text-card-foreground">
                              {product.category} • {product.condition} • {product.location}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(product.createdAt).toLocaleDateString('cs-CZ')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-card-foreground">
                              {product.price.toLocaleString('cs-CZ')} Kč
                            </span>
                            {isOwnProfile && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => window.location.href = `/products/edit/${product.id}`}
                                >
                                  Upravit
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleDeleteProduct(product.id, product.title)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-card-foreground mb-4">
                          {isOwnProfile ? 'Zatím nemáte žádné inzeráty' : 'Tento uživatel zatím nemá žádné inzeráty'}
                        </p>
                        {isOwnProfile && (
                          <Button 
                            onClick={() => window.location.href = '/products/new'}
                            className="bg-slate-700 hover:bg-slate-800 text-white"
                          >
                            <Package className="h-4 w-4 mr-2" />
                            Vytvořit první inzerát
                          </Button>
                        )}
                      </div>
                    )}

                    {products.length > 3 && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => window.location.href = '/my-products'}
                      >
                        Zobrazit všechny inzeráty ({products.length})
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-card-foreground">
                    Statistiky
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-card-foreground">Aktivní inzeráty</span>
                    <span className="font-semibold text-card-foreground">{stats.products.active}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-card-foreground">Prodané produkty</span>
                    <span className="font-semibold text-card-foreground">{stats.products.sold}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-card-foreground">Celkem inzerátů</span>
                    <span className="font-semibold text-card-foreground">{stats.products.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-card-foreground">Reputace</span>
                    <div className="flex items-center">
                      {(() => {
                        const rep = getReputationDisplay(stats.reputation)
                        const IconComponent = rep.icon
                        return (
                          <>
                            <IconComponent className={`h-4 w-4 mr-1 ${rep.color}`} />
                            <span className={`font-semibold ${rep.color}`}>{rep.text}</span>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-card-foreground">Zprávy</span>
                    <span className="font-semibold text-card-foreground">{stats.messages.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-card-foreground">Členem od</span>
                    <span className="font-semibold text-card-foreground">{stats.user.registrationYear}</span>
                  </div>
                  {stats.products.totalValue > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-card-foreground">Hodnota inzerátů</span>
                      <span className="font-semibold text-card-foreground">
                        {stats.products.totalValue.toLocaleString('cs-CZ')} Kč
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Kategorie statistik */}
              {stats.products.categoryStats.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl text-card-foreground">
                      Inzeráty podle kategorií
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {stats.products.categoryStats.map((category: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-card-foreground capitalize">
                          {category.category.replace('_', ' ').toLowerCase()}
                        </span>
                        <span className="font-semibold text-card-foreground">
                          {category.count}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {isOwnProfile && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl text-card-foreground">
                      Rychlé akce
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full bg-slate-700 hover:bg-slate-800 text-white"
                      onClick={() => window.location.href = '/products/new'}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Přidat inzerát
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.location.href = '/messages'}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Zprávy ({stats.messages.conversations})
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = '/my-products'}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Moje inzeráty ({stats.products.total})
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = '/notifications'}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Notifikace
                  </Button>
                </CardContent>
              </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ProfileSkeleton />
          </div>
        </main>
        <Footer />
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  )
}
