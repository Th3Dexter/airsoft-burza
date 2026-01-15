'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Notification, NotificationType } from '@/components/ui/Notification'
import { NotificationContainer } from '@/components/ui/NotificationContainer'
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog'

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void
  showSuccess: (title: string, message?: string) => void
  showError: (title: string, message?: string) => void
  showWarning: (title: string, message?: string) => void
  showInfo: (title: string, message?: string) => void
  showConfirmation: (options: ConfirmationOptions) => Promise<boolean>
}

interface ConfirmationOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'warning' | 'danger' | 'info'
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [confirmation, setConfirmation] = useState<ConfirmationOptions & { isOpen: boolean; resolve?: (value: boolean) => void }>({
    isOpen: false,
    title: '',
    message: '',
  })

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications(prev => [...prev, { ...notification, id }])
  }, [])

  const showSuccess = useCallback((title: string, message?: string) => {
    showNotification({ type: 'success', title, message })
  }, [showNotification])

  const showError = useCallback((title: string, message?: string) => {
    showNotification({ type: 'error', title, message })
  }, [showNotification])

  const showWarning = useCallback((title: string, message?: string) => {
    showNotification({ type: 'warning', title, message })
  }, [showNotification])

  const showInfo = useCallback((title: string, message?: string) => {
    showNotification({ type: 'info', title, message })
  }, [showNotification])

  const showConfirmation = useCallback((options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmation({
        ...options,
        isOpen: true,
        resolve,
      })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    if (confirmation.resolve) {
      confirmation.resolve(true)
    }
    setConfirmation(prev => ({ ...prev, isOpen: false, resolve: undefined }))
  }, [confirmation.resolve])

  const handleCancel = useCallback(() => {
    if (confirmation.resolve) {
      confirmation.resolve(false)
    }
    setConfirmation(prev => ({ ...prev, isOpen: false, resolve: undefined }))
  }, [confirmation.resolve])

  const value: NotificationContextType = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirmation,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
      <ConfirmationDialog
        isOpen={confirmation.isOpen}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        type={confirmation.type}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
