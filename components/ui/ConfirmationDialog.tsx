'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from './Button'

interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'warning' | 'danger' | 'info'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText = 'Potvrdit',
  cancelText = 'Zrušit',
  type = 'warning',
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    }
  }, [isOpen])

  const handleConfirm = () => {
    setIsVisible(false)
    setTimeout(() => onConfirm(), 300)
  }

  const handleCancel = () => {
    setIsVisible(false)
    setTimeout(() => onCancel(), 300)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel()
    }
  }

  if (!isOpen) return null

  const typeStyles = {
    warning: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    danger: 'border-primary bg-red-50 dark:bg-red-900/20',
    info: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
  }

  const buttonStyles = {
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    danger: 'bg-primary hover:bg-primary/90 text-white',
    info: 'bg-blue-600 hover:bg-blue-700 text-white',
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } transition-opacity duration-300`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Dialog */}
      <div
        className={`relative bg-card border-2 ${typeStyles[type]} rounded-lg shadow-xl max-w-md w-full transform transition-all duration-300 ${
          isVisible ? 'scale-100' : 'scale-95'
        }`}
      >
        <div className="p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-foreground" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-foreground mb-2">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {message}
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="ml-4 flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="border-border text-foreground hover:bg-muted"
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              className={buttonStyles[type]}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
