'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationProps {
  notification: Notification
  onRemove: (id: string) => void
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colors = {
  success: 'bg-green-600 border-green-500',
  error: 'bg-tactical-red border-tactical-red',
  warning: 'bg-yellow-600 border-yellow-500',
  info: 'bg-blue-600 border-blue-500',
}

export function NotificationItem({ notification, onRemove }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const IconComponent = icons[notification.type]

  useEffect(() => {
    // Animace vstupu
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Auto-remove po určité době
    if (notification.duration !== 0) {
      const timer = setTimeout(() => {
        handleRemove()
      }, notification.duration || 5000)
      return () => clearTimeout(timer)
    }
  }, [notification.duration])

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(notification.id), 300)
  }

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`relative max-w-md w-full min-w-80 bg-card border-l-4 ${colors[notification.type]} shadow-xl rounded-lg pointer-events-auto overflow-hidden backdrop-blur-sm`}
      >
        <div className="p-3 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className="flex-shrink-0">
                <IconComponent className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {notification.title}
                </p>
                {notification.message && (
                  <p className="text-xs text-black dark:text-white truncate">
                    {notification.message}
                  </p>
                )}
                {notification.action && (
                  <button
                    onClick={notification.action.onClick}
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors mt-1"
                  >
                    {notification.action.label}
                  </button>
                )}
              </div>
            </div>
            <div className="flex-shrink-0 ml-3">
              <button
                onClick={handleRemove}
                className="inline-flex text-muted-foreground hover:text-foreground focus:outline-none transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
