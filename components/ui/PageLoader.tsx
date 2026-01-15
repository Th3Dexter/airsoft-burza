'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function PageLoader() {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingKey, setLoadingKey] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    // Zobrazit loader pouze na velmi krátkou dobu pro vizuální feedback
    setIsLoading(true)
    setLoadingKey(prev => prev + 1)
    
    // Okamžité skrytí - Next.js router je rychlý, nepotřebujeme simulovat zpoždění
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 50) // Minimální zpoždění pouze pro vizuální feedback

    return () => {
      clearTimeout(timer)
      setIsLoading(false)
    }
  }, [pathname])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/90 dark:bg-gray-950/90 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-700 dark:border-gray-800 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        
        {/* Loading text */}
        <div className="text-sm text-gray-400 dark:text-gray-400 animate-pulse">
          Načítání...
        </div>
      </div>
    </div>
  )
}
