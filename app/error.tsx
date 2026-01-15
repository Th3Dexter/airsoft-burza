'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-black dark:text-white mb-2">
            Něco se pokazilo
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Omlouváme se za nepříjemnosti. Došlo k neočekávané chybě.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full bg-black hover:bg-gray-800 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Zkusit znovu
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Zpět na hlavní stránku
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              Technické detaily (pouze pro vývoj)
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-700 dark:text-gray-300 overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

