'use client'

import { Notification, NotificationItem } from './Notification'

interface NotificationContainerProps {
  notifications: Notification[]
  onRemove: (id: string) => void
}

export function NotificationContainer({ notifications, onRemove }: NotificationContainerProps) {
  return (
    <div
      aria-live="assertive"
      className="fixed top-6 right-6 z-50 flex flex-col space-y-3 pointer-events-none"
    >
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationItem
            notification={notification}
            onRemove={onRemove}
          />
        </div>
      ))}
    </div>
  )
}
