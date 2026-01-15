'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { NotificationProvider } from '@/lib/NotificationContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}

