'use client'

import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Bell, Check, X, Trash2, Filter } from 'lucide-react'
import { useState } from 'react'

const notifications = [
  {
    id: '1',
    title: 'Nový zájem o váš inzerát',
    message: 'Petr Svoboda se zajímá o vaši taktickou vestu Condor',
    time: '2 minuty zpět',
    type: 'info',
    isRead: false,
    product: 'Taktická vesta Condor'
  },
  {
    id: '2',
    title: 'Zpráva od kupce',
    message: 'Tomáš Dvořák vám poslal zprávu ohledně Combat bot 5.11',
    time: '1 hodina zpět',
    type: 'message',
    isRead: false,
    product: 'Combat boty 5.11'
  },
  {
    id: '3',
    title: 'Inzerát schválen',
    message: 'Váš inzerát "Glock 17 Gen 4" byl úspěšně zveřejněn',
    time: '3 hodiny zpět',
    type: 'success',
    isRead: true,
    product: 'Glock 17 Gen 4'
  },
  {
    id: '4',
    title: 'Připomínka',
    message: 'Váš inzerát "Tokyo Marui M4A1" bude za 7 dní automaticky smazán',
    time: '1 den zpět',
    type: 'warning',
    isRead: true,
    product: 'Tokyo Marui M4A1 AEG'
  },
  {
    id: '5',
    title: 'Prodej dokončen',
    message: 'Gratulujeme! Úspěšně jste prodali "Taktické rukavice Mechanix"',
    time: '2 dny zpět',
    type: 'success',
    isRead: true,
    product: 'Taktické rukavice Mechanix'
  }
]

const notificationTypes = [
  { id: 'all', label: 'Všechny', count: notifications.length },
  { id: 'unread', label: 'Nepřečtené', count: notifications.filter(n => !n.isRead).length },
  { id: 'messages', label: 'Zprávy', count: notifications.filter(n => n.type === 'message').length },
  { id: 'products', label: 'Inzeráty', count: notifications.filter(n => n.type === 'info' || n.type === 'success' || n.type === 'warning').length }
]

export default function NotificationsPage() {
  const [selectedType, setSelectedType] = useState('all')
  const [notificationList, setNotificationList] = useState(notifications)

  const getFilteredNotifications = () => {
    switch (selectedType) {
      case 'unread':
        return notificationList.filter(n => !n.isRead)
      case 'messages':
        return notificationList.filter(n => n.type === 'message')
      case 'products':
        return notificationList.filter(n => n.type === 'info' || n.type === 'success' || n.type === 'warning')
      default:
        return notificationList
    }
  }

  const markAsRead = (id: string) => {
    setNotificationList(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotificationList(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotificationList(prev => prev.filter(n => n.id !== id))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'message':
        return '💬'
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return '🔔'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20'
      case 'success':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20'
      case 'info':
        return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20'
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  Notifikace
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Sledujte aktivitu na vašich inzerátech
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={markAllAsRead}
                  variant="outline"
                  className="flex items-center"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Označit vše jako přečtené
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Filtry
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {notificationTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedType === type.id
                          ? 'bg-slate-700 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{type.label}</span>
                        <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                          {type.count}
                        </span>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Notifications List */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-0">
                  {getFilteredNotifications().length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Žádné notifikace
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {selectedType === 'unread' 
                          ? 'Nemáte žádné nepřečtené notifikace'
                          : 'Zde se zobrazí vaše notifikace'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {getFilteredNotifications().map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                            !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="text-2xl">
                              {getTypeIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <h3 className={`text-sm font-medium ${
                                      !notification.isRead 
                                        ? 'text-slate-900 dark:text-white' 
                                        : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                      {notification.title}
                                    </h3>
                                    {!notification.isRead && (
                                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {notification.product} • {notification.time}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-1 ml-4">
                                  {!notification.isRead && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => markAsRead(notification.id)}
                                      className="text-gray-400 hover:text-gray-600"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteNotification(notification.id)}
                                    className="text-gray-400 hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}









