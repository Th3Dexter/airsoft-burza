'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { PageLoader } from '@/components/ui/PageLoader'

interface LoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  loadingText: string
  setLoadingText: (text: string) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('Načítání...')
  const pathname = usePathname()

  // Automatické načítání při změně stránky
  useEffect(() => {
    const handleRouteChange = () => {
      setIsLoading(true)
      setLoadingText('Načítání stránky...')
      
      // Simulace načítání
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 300)

      return () => clearTimeout(timer)
    }

    handleRouteChange()
  }, [pathname])

  const setLoading = (loading: boolean) => {
    setIsLoading(loading)
  }

  const updateLoadingText = (text: string) => {
    setLoadingText(text)
  }

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, loadingText, setLoadingText: updateLoadingText }}>
      {children}
      {isLoading && <PageLoader />}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}
