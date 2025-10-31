import type { Metadata } from 'next'
import { Inter, Orbitron } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import { Sidebar } from '@/components/layout/Sidebar'
import { LoadingProvider } from '@/components/providers/LoadingProvider'
import { PageTransition } from '@/components/ui/PageTransition'
import { CookieConsent } from '@/components/cookies/CookieConsent'
import { AnimatedBackground } from '@/components/AnimatedBackground'

const inter = Inter({ subsets: ['latin'] })
const orbitron = Orbitron({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Airsoft Burza - Prodej a nákup airsoftových zbraní',
  description: 'Moderní platforma pro prodej a nákup airsoftových zbraní a military vybavení. Bezpečná komunikace mezi uživateli.',
  keywords: 'airsoft, zbraně, military, vybavení, prodej, nákup, burza',
  authors: [{ name: 'Airsoft Burza' }],
  creator: 'Airsoft Burza',
  publisher: 'Airsoft Burza',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://airsoft-burza.cz'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Airsoft Burza - Prodej a nákup airsoftových zbraní',
    description: 'Moderní platforma pro prodej a nákup airsoftových zbraní a military vybavení.',
    url: 'https://airsoft-burza.cz',
    siteName: 'Airsoft Burza',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Airsoft Burza',
      },
    ],
    locale: 'cs_CZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Airsoft Burza - Prodej a nákup airsoftových zbraní',
    description: 'Moderní platforma pro prodej a nákup airsoftových zbraní a military vybavení.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col relative`}>
        <AnimatedBackground />
        <Providers>
          <LoadingProvider>
            <div className="relative z-10">
              <Sidebar />
              <main className="flex-1">
                <PageTransition>
                  {children}
                </PageTransition>
              </main>
            </div>
            {/* Cookie Consent Banner */}
            <CookieConsent />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </LoadingProvider>
        </Providers>
      </body>
    </html>
  )
}
