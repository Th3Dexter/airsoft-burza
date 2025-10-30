'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-black dark:text-white mb-2">
            Stránka nenalezena
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Omlouváme se, ale stránka kterou hledáte neexistuje nebo byla přesunuta.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => window.history.back()}
            className="w-full bg-black hover:bg-gray-800 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zpět
          </Button>
          
          <Link href="/">
            <Button
              variant="outline"
              className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Home className="h-4 w-4 mr-2" />
              Hlavní stránka
            </Button>
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>Možná hledáte:</p>
          <div className="mt-2 space-y-1">
            <Link href="/products" className="block text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
              → Všechny produkty
            </Link>
            <Link href="/products/airsoft-weapons" className="block text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
              → Airsoft zbraně
            </Link>
            <Link href="/products/military-equipment" className="block text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
              → Military vybavení
            </Link>
            <Link href="/about" className="block text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
              → O nás
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
