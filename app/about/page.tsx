import { Footer } from '@/components/layout/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-black dark:text-white mb-6">
              O nás
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Připravuje se
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}