'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  text = 'Načítání...', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {/* Spinner */}
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin`}></div>
        <div className={`absolute top-0 left-0 ${sizeClasses[size]} border-4 border-transparent border-t-blue-600 rounded-full animate-spin`}></div>
      </div>
      
      {/* Loading text */}
      {text && (
        <div className={`${textSizeClasses[size]} text-gray-600 dark:text-gray-300 animate-pulse`}>
          {text}
        </div>
      )}
    </div>
  )
}