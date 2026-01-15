'use client'

import { useState, useEffect } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { Button } from './Button'

interface CloseChatDialogProps {
  isOpen: boolean
  onConfirm: (reason: string) => void
  onCancel: () => void
}

export function CloseChatDialog({
  isOpen,
  onConfirm,
  onCancel,
}: CloseChatDialogProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setReason('')
    }
  }, [isOpen])

  const handleConfirm = () => {
    if (reason.trim()) {
      setIsVisible(false)
      setTimeout(() => {
        onConfirm(reason.trim())
        setReason('')
      }, 300)
    }
  }

  const handleCancel = () => {
    setIsVisible(false)
    setTimeout(() => {
      onCancel()
      setReason('')
    }, 300)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel()
    }
  }

  if (!isOpen) return null

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
        className={`relative bg-card border-2 border-primary rounded-lg shadow-xl max-w-md w-full transform transition-all duration-300 ${
          isVisible ? 'scale-100' : 'scale-95'
        }`}
      >
        <div className="p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-foreground mb-2">
                Uzavřít konverzaci
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Chystáte se uzavřít tuto konverzaci. Prosím uveďte důvod.
              </p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Např. Produkt byl prodán, Nedostal jsem odpověď, apod."
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-muted dark:text-foreground resize-none"
                rows={3}
              />
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
              Zrušit
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!reason.trim()}
              className="bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Uzavřít konverzaci
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

