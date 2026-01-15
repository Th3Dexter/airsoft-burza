import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-gray-600 dark:text-gray-300">
          Načítám...
        </p>
      </div>
    </div>
  )
}

