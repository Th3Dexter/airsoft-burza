'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Search, Send, MoreVertical, Phone, Video, Image, Paperclip } from 'lucide-react'

const conversations = [
  {
    id: '1',
    name: 'Petr Svoboda',
    lastMessage: 'Dobrý den, máte ještě tu taktickou vestu?',
    time: '14:30',
    unread: 2,
    avatar: 'PS',
    product: 'Taktická vesta Condor'
  },
  {
    id: '2',
    name: 'Tomáš Dvořák',
    lastMessage: 'Děkuji za rychlé dodání!',
    time: '12:15',
    unread: 0,
    avatar: 'TD',
    product: 'Combat boty 5.11'
  },
  {
    id: '3',
    name: 'Martin Kratochvíl',
    lastMessage: 'Můžeme se domluvit na osobním předání?',
    time: '10:45',
    unread: 1,
    avatar: 'MK',
    product: 'Glock 17 Gen 4'
  }
]

const messages = [
  {
    id: '1',
    sender: 'Petr Svoboda',
    content: 'Dobrý den, máte ještě tu taktickou vestu?',
    time: '14:25',
    isOwn: false
  },
  {
    id: '2',
    sender: 'Jan Novák',
    content: 'Ano, stále ji mám. Je v perfektním stavu.',
    time: '14:26',
    isOwn: true
  },
  {
    id: '3',
    sender: 'Petr Svoboda',
    content: 'Skvělé! Můžeme se domluvit na osobním předání v Praze?',
    time: '14:30',
    isOwn: false
  }
]

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const [selectedConversation, setSelectedConversation] = useState('1')
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status !== 'loading') {
      setIsLoading(false)
    }
  }, [status])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Načítání zpráv...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Přihlášení vyžadováno
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Pro zobrazení zpráv se musíte přihlásit.
          </p>
          <Button asChild>
            <a href="/auth/signin">Přihlásit se</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Zprávy
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Komunikujte s kupci a prodejci
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardContent className="p-0">
                  {/* Search */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Hledat konverzace..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 dark:bg-gray-800 dark:text-white text-sm"
                      />
                    </div>
                  </div>

                  {/* Conversations */}
                  <div className="overflow-y-auto">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation.id)}
                        className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 ${
                          selectedConversation === conversation.id ? 'bg-slate-100 dark:bg-slate-800' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">
                              {conversation.avatar}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                                {conversation.name}
                              </h3>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {conversation.time}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                              {conversation.lastMessage}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              {conversation.product}
                            </p>
                            {conversation.unread > 0 && (
                              <div className="mt-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-700 text-white">
                                  {conversation.unread}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2">
              <Card className="h-full flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">PS</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          Petr Svoboda
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Taktická vesta Condor
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isOwn
                            ? 'bg-slate-700 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Image className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Napište zprávu..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <Button className="bg-slate-700 hover:bg-slate-800 text-white">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}