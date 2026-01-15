'use client'

import { Suspense } from 'react'
import { LoadingSpinner } from './LoadingSpinner'

interface LoadingWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  text?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingWrapper({ 
  children, 
  fallback, 
  text = 'Načítání...', 
  size = 'md' 
}: LoadingWrapperProps) {
  const defaultFallback = <LoadingSpinner size={size} text={text} className="py-10" />
  
  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  )
}
