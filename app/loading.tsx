import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-gray-400 dark:text-gray-400">
          Načítám...
        </p>
      </div>
    </div>
  )
}

