'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, usePathname } from 'next/navigation'
import { useNotificationActions } from '@/lib/useNotificationActions'

export function AuthSuccessHandler() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { notifyLoginSuccess } = useNotificationActions()
  const hasNotifiedRef = useRef(false)
  const prevSessionRef = useRef<any>(null)

  useEffect(() => {
    // Detekce úspěšného přihlášení - pouze na hlavní stránce
    if (pathname !== '/') return

    // Detekce změny session z null/loading na přihlášeného uživatele
    const wasNotAuthenticated = !prevSessionRef.current?.user
    const isNowAuthenticated = status === 'authenticated' && session?.user

    if (wasNotAuthenticated && isNowAuthenticated && !hasNotifiedRef.current) {
      // Zkontrolovat, jestli jsme přišli z auth stránky nebo z OAuth callbacku
      const referrer = typeof window !== 'undefined' ? document.referrer : ''
      const isFromAuth = referrer.includes('/auth/signin') || 
                        referrer.includes('/auth/signup') ||
                        referrer.includes('/api/auth')
      
      // Zkontrolovat URL parametry (NextAuth může přidat parametry po OAuth callbacku)
      const hasAuthParams = searchParams?.has('callbackUrl') || 
                           searchParams?.has('error') ||
                           (typeof window !== 'undefined' && window.location.search.includes('callback'))

      if (isFromAuth || hasAuthParams) {
        notifyLoginSuccess()
        hasNotifiedRef.current = true
      }
    }

    prevSessionRef.current = session
  }, [session, status, pathname, searchParams, notifyLoginSuccess])

  return null
}
