'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { 
  MessageSquare, 
  Search,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  User,
  Package,
  Calendar,
  Mail
} from 'lucide-react'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'

interface Conversation {
  id: string
  productId: string
  productTitle: string
  productPrice: number
  participant1Id: string
  participant1Name: string
  participant1Email: string
  participant1Image?: string
  participant2Id: string
  participant2Name: string
  participant2Email: string
  participant2Image?: string
  createdAt: string
  updatedAt: string
  messageCount: number
}

interface Message {
  id: string
  content: string
  createdAt: string
  senderId: string
  senderName: string
  senderEmail: string
  senderImage?: string
  receiverId: string
}

export default function AdminMessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [expandedConversations, setExpandedConversations] = useState<Set<string>>(new Set())
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({})
  const [loadingMessages, setLoadingMessages] = useState<Set<string>>(new Set())

  const loadConversations = useCallback(async () => {
    setLoadingConversations(true)
    try {
      const response = await fetch('/api/admin/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
        setFilteredConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoadingConversations(false)
    }
  }, [])

  const loadMessages = async (conversationId: string) => {
    if (messagesMap[conversationId]) return // Už jsou načtené

    setLoadingMessages(prev => new Set(prev).add(conversationId))
    try {
      const response = await fetch(`/api/admin/conversations/${conversationId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessagesMap(prev => ({
          ...prev,
          [conversationId]: data.messages || []
        }))
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoadingMessages(prev => {
        const newSet = new Set(prev)
        newSet.delete(conversationId)
        return newSet
      })
    }
  }

  const toggleConversation = (conversationId: string) => {
    const isExpanded = expandedConversations.has(conversationId)
    const newExpanded = new Set(expandedConversations)
    
    if (isExpanded) {
      newExpanded.delete(conversationId)
    } else {
      newExpanded.add(conversationId)
      loadMessages(conversationId)
    }
    
    setExpandedConversations(newExpanded)
  }

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    const userIsAdmin = (session.user as any).isAdmin || false
    setIsAdmin(userIsAdmin)
    
    if (userIsAdmin) {
      loadConversations()
    } else {
      router.push('/admin')
    }
    
    setLoading(false)
  }, [session, status, router, loadConversations])

  useEffect(() => {
    if (searchTerm) {
      const filtered = conversations.filter(conv =>
        conv.participant1Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.participant1Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.participant2Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.participant2Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.productTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredConversations(filtered)
    } else {
      setFilteredConversations(conversations)
    }
  }, [searchTerm, conversations])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Načítání..." />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8 opacity-80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/admin')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zpět na dashboard
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              Správa konverzací
            </h1>
            <p className="text-lg text-muted-foreground">
              Kontrola a správa všech konverzací mezi uživateli
            </p>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Hledat konverzace podle uživatelů nebo produktu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-slate-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Conversations List */}
          {loadingConversations ? (
            <LoadingSpinner size="lg" text="Načítání konverzací..." />
          ) : filteredConversations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Žádné konverzace
                </h3>
                <p className="text-muted-foreground">
                  Nebyly nalezeny žádné konverzace
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredConversations.map((conversation) => {
                const isExpanded = expandedConversations.has(conversation.id)
                const messages = messagesMap[conversation.id] || []
                const isLoadingMessages = loadingMessages.has(conversation.id)

                return (
                  <Card key={conversation.id}>
                    <CardContent className="p-6">
                      {/* Conversation Header */}
                      <div 
                        className="flex items-start justify-between cursor-pointer"
                        onClick={() => toggleConversation(conversation.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                              <Package className="h-5 w-5 text-blue-600" />
                              {conversation.productTitle || 'Neznámý produkt'}
                            </h3>
                            <span className="text-sm font-medium text-muted-foreground">
                              {formatPrice(conversation.productPrice || 0)}
                            </span>
                          </div>

                          {/* Participants */}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span className="font-medium">{conversation.participant1Name || 'Uživatel 1'}</span>
                              <span className="text-xs">({conversation.participant1Email})</span>
                            </div>
                            <span className="text-gray-400">↔</span>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span className="font-medium">{conversation.participant2Name || 'Uživatel 2'}</span>
                              <span className="text-xs">({conversation.participant2Email})</span>
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {conversation.messageCount || 0} zpráv
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Vytvořeno: {formatDate(conversation.createdAt)}
                            </div>
                            {conversation.updatedAt !== conversation.createdAt && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Aktualizováno: {formatDate(conversation.updatedAt)}
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleConversation(conversation.id)
                          }}
                          className="ml-4"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </Button>
                      </div>

                      {/* Messages */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-border">
                          {isLoadingMessages ? (
                            <div className="py-4 text-center">
                              <LoadingSpinner size="sm" text="Načítání zpráv..." />
                            </div>
                          ) : messages.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              Žádné zprávy v této konverzaci
                            </p>
                          ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                              {messages.map((message) => (
                                <div
                                  key={message.id}
                                  className="flex gap-3 p-3 rounded-lg bg-muted/50"
                                >
                                  {/* Avatar */}
                                  <div className="flex-shrink-0">
                                    {message.senderImage ? (
                                      <Image
                                        src={message.senderImage}
                                        alt={message.senderName}
                                        width={40}
                                        height={40}
                                        className="rounded-full"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                                        <User className="h-5 w-5 text-gray-500" />
                                      </div>
                                    )}
                                  </div>

                                  {/* Message Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-semibold text-foreground">
                                        {message.senderName || 'Neznámý uživatel'}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        ({message.senderEmail})
                                      </span>
                                      <span className="text-xs text-muted-foreground ml-auto">
                                        {formatDate(message.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                                      {message.content}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

