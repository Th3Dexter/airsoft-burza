'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { useNotifications } from '@/lib/NotificationContext'
import { useNotificationActions } from '@/lib/useNotificationActions'
import {
  User,
  Bell,
  MessageCircle,
  Plus,
  Home,
  Target,
  Shield,
  Package,
  Info,
  ChevronLeft,
  ChevronRight,
  LogIn,
  UserPlus,
  Wrench
} from 'lucide-react'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const { showWarning } = useNotifications()
  const { confirmLogout, notifyLogoutSuccess } = useNotificationActions()
  const router = useRouter()

  const navigation = [
    { name: 'Domů', href: '/', icon: Home },
    { name: 'Poptávka', href: '/poptavka', icon: Target },
    { name: 'Nabídka', href: '/nabidka', icon: Package },
    { name: 'Servisy', href: '/services', icon: Wrench },
    { name: 'O nás', href: '/about', icon: Info },
  ]

  // Update body margin when sidebar state changes
  useEffect(() => {
    const body = document.body
    body.style.transition = 'margin-left 0.3s ease-in-out'
    
    if (isOpen) {
      body.style.marginLeft = '280px'
    } else {
      body.style.marginLeft = '64px'
    }
    
    // Cleanup on unmount
    return () => {
      body.style.marginLeft = '0px'
      body.style.transition = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 z-30 h-screen bg-card border-r border-border transition-all duration-300 ease-in-out ${
        isOpen ? 'w-72' : 'w-16'
      } overflow-hidden opacity-70`} style={{ backgroundImage: 'none' }}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="border-b border-border">
            <Link href="/" className="flex items-center justify-center group">
              <Image
                src="/images/logo.png"
                alt="Airsoft Burza"
                width={500}
                height={200}
                className={`object-contain transition-all duration-300 ease-in-out ${
                  isOpen ? 'h-40 w-auto' : 'h-28 w-28'
                } drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] group-hover:drop-shadow-[0_0_30px_rgba(255,255,255,1)]`}
                priority
                onError={(e) => {
                  console.log('Logo load error:', e);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </Link>
          </div>


          {/* Navigation */}
          <nav className="flex-1 py-4">
            <div className="space-y-1 px-2">
              {navigation.map((item) => {
                const IconComponent = (item as any).icon
                return (
                  <Link
                    key={item.name}
                    href={(item as any).href}
                    className={`group relative flex items-center p-3 text-foreground hover:text-muted-foreground hover:bg-military-charcoal rounded-lg transition-colors ${
                      isOpen ? 'justify-start' : 'justify-center'
                    }`}
                    title={!isOpen ? item.name : ''}
                  >
                    {IconComponent && <IconComponent className="h-5 w-5" />}
                    <span className={`ml-3 text-sm font-medium transition-all duration-300 ease-in-out ${
                      isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 absolute'
                    }`}>
                      {item.name}
                    </span>
                    {!isOpen && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.name}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* User Actions */}
          <div className="border-t border-border p-4">
            <div className="space-y-2">
              {/* Zobrazit pouze pro přihlášené uživatele */}
              {session && (
                <>
                  {/* Notifications */}
                  <Link href="/notifications">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`relative hover:bg-muted text-foreground transition-all duration-300 ease-in-out ${
                        isOpen ? 'w-full h-10 justify-start' : 'w-full h-10'
                      }`}
                      title={!isOpen ? 'Notifikace' : ''}
                    >
                      <Bell className="h-5 w-5" />
                      <span className={`ml-3 text-sm font-medium transition-all duration-300 ease-in-out ${
                        isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 absolute'
                      }`}>
                        Notifikace
                      </span>
                    </Button>
                  </Link>

                  {/* Messages */}
                  <Link href="/messages">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`relative hover:bg-muted text-foreground transition-all duration-300 ease-in-out ${
                        isOpen ? 'w-full h-10 justify-start' : 'w-full h-10'
                      }`}
                      title={!isOpen ? 'Zprávy' : ''}
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span className={`ml-3 text-sm font-medium transition-all duration-300 ease-in-out ${
                        isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 absolute'
                      }`}>
                        Zprávy
                      </span>
                    </Button>
                  </Link>

                  {/* Admin Panel - zobrazit pouze pro adminy */}
                  {(session.user as any)?.isAdmin && (
                    <Link href="/admin">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`relative hover:bg-muted text-blue-600 dark:text-blue-400 transition-all duration-300 ease-in-out ${
                          isOpen ? 'w-full h-10 justify-start' : 'w-full h-10'
                        }`}
                        title={!isOpen ? 'Administrace' : ''}
                      >
                        <Shield className="h-5 w-5" />
                        <span className={`ml-3 text-sm font-medium transition-all duration-300 ease-in-out ${
                          isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 absolute'
                        }`}>
                          Administrace
                        </span>
                      </Button>
                    </Link>
                  )}
                </>
              )}

              {/* Add Product - zobrazit pro všechny, ale s kontrolou přihlášení */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  if (session) {
                    router.push('/products/new')
                  } else {
                    showWarning(
                      'Přihlášení vyžadováno',
                      'Pro přidání inzerátu se musíte nejdříve přihlásit.'
                    )
                  }
                }}
                className={`relative hover:bg-muted text-foreground transition-all duration-300 ease-in-out ${
                  isOpen ? 'w-full h-10 justify-start' : 'w-full h-10'
                }`}
                title={!isOpen ? 'Přidat inzerát' : ''}
              >
                <Plus className="h-5 w-5" />
                <span className={`ml-3 text-sm font-medium transition-all duration-300 ease-in-out ${
                  isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 absolute'
                }`}>
                  Přidat inzerát
                </span>
              </Button>

              {/* User Menu */}
              {status === 'loading' ? (
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 mx-auto" />
              ) : session ? (
                <>
                  {/* Profile Button */}
                  <div className="relative">
                    <Link href="/profile">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`relative hover:bg-muted text-foreground transition-all duration-300 ease-in-out ${
                          isOpen ? 'w-full h-10 justify-start' : 'w-full h-10'
                        }`}
                        title={!isOpen ? 'Uživatelský profil' : ''}
                      >
                        <User className="h-5 w-5" />
                        <span className={`ml-3 text-sm font-medium transition-all duration-300 ease-in-out ${
                          isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 absolute'
                        }`}>
                          Profil
                        </span>
                      </Button>
                    </Link>
                    
                    {/* User Menu Dropdown - otevře se při kliknutí na šipku */}
                    {isOpen && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setIsUserMenuOpen(!isUserMenuOpen)
                        }}
                        title="Další možnosti"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {isUserMenuOpen && (
                      <div className="absolute left-full ml-2 w-48 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-white dark:border-gray-700">
                        <div className="px-4 py-2 border-b border-white dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{session.user?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{session.user?.email}</p>
                        </div>
                        <Link 
                          href="/my-products" 
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Moje inzeráty
                        </Link>
                        <Link 
                          href="/messages" 
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Zprávy
                        </Link>
                        {(session.user as any)?.isAdmin && (
                          <Link 
                            href="/admin" 
                            className="block px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Shield className="h-4 w-4 inline mr-2" />
                            Administrace
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Logout Button - zobrazit pouze pro přihlášené uživatele */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      const confirmed = await confirmLogout()
                      if (confirmed) {
                        await signOut({ callbackUrl: '/' })
                        notifyLogoutSuccess()
                      }
                    }}
                    className={`relative hover:bg-muted text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all duration-300 ease-in-out ${
                      isOpen ? 'w-full h-10 justify-start' : 'w-full h-10'
                    }`}
                    title={!isOpen ? 'Odhlásit se' : ''}
                  >
                    <LogIn className="h-5 w-5 rotate-180" />
                    <span className={`ml-3 text-sm font-medium transition-all duration-300 ease-in-out ${
                      isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 absolute'
                    }`}>
                      Odhlásit se
                    </span>
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => signIn()}
                    className={`relative hover:bg-muted text-foreground transition-all duration-300 ease-in-out ${
                      isOpen ? 'w-full h-10 justify-start' : 'w-full h-10'
                    }`}
                    title={!isOpen ? 'Přihlásit se' : ''}
                  >
                    <LogIn className="h-5 w-5" />
                    <span className={`ml-3 text-sm font-medium transition-all duration-300 ease-in-out ${
                      isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 absolute'
                    }`}>
                      Přihlásit se
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className={`relative hover:bg-muted text-foreground transition-all duration-300 ease-in-out ${
                      isOpen ? 'w-full h-10 justify-start' : 'w-full h-10'
                    }`}
                    title={!isOpen ? 'Registrovat se' : ''}
                  >
                    <Link href="/auth/signup">
                      <UserPlus className="h-5 w-5" />
                      <span className={`ml-3 text-sm font-medium transition-all duration-300 ease-in-out ${
                        isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 absolute'
                      }`}>
                        Registrovat se
                      </span>
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 p-2 bg-card border border-border rounded-lg shadow-lg hover:bg-military-charcoal transition-colors text-foreground"
        title={isOpen ? 'Schovat sidebar' : 'Zobrazit sidebar'}
      >
        {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </button>
    </>
  )
}