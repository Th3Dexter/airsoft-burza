'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function PageLoader() {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingKey, setLoadingKey] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true)
      setLoadingKey(prev => prev + 1)
    }

    const handleComplete = () => {
      // Malé zpoždění pro plynulý přechod
      setTimeout(() => {
        setIsLoading(false)
      }, 150)
    }

    // Simulace načítání při změně stránky
    handleStart()
    handleComplete()

    return () => {
      handleComplete()
    }
  }, [pathname])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        
        {/* Loading text */}
        <div className="text-sm text-gray-600 dark:text-gray-300 animate-pulse">
          Načítání...
        </div>
      </div>
    </div>
  )
}
