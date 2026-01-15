'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Search, Send, Image as ImageIcon, X, Video, User, LogOut } from 'lucide-react'
import Image from 'next/image'
import { CloseChatDialog } from '@/components/ui/CloseChatDialog'
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog'

interface UploadedFile {
  file: File
  preview: string
  type: 'image' | 'video'
}

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [showCloseDialog, setShowCloseDialog] = useState(false)
  const [showClosedNotification, setShowClosedNotification] = useState(false)
  const [closedConversationInfo, setClosedConversationInfo] = useState<any>(null)

  useEffect(() => {
    if (status !== 'loading') {
      setIsLoading(false)
    }
  }, [status])

  // Načíst konverzace při načtení stránky
  useEffect(() => {
    const fetchConversations = async () => {
      if (status === 'loading') return
      if (!session) return
      
      try {
        const response = await fetch('/api/conversations')
        if (response.ok) {
          const data = await response.json()
          setConversations(data.conversations || [])
        }
      } catch (error) {
        console.error('Chyba při načítání konverzací:', error)
      }
    }
    
    fetchConversations()
  }, [session, status])

  // Zkontrolovat, jestli jsou v URL query parametry pro vytvoření konverzace
  useEffect(() => {
    const createOrGetConversation = async () => {
      if (status === 'loading') return
      if (!session) return
      
      const userId = searchParams.get('userId')
      const productId = searchParams.get('productId')
      
      if (userId && productId) {
        try {
          const response = await fetch('/api/conversations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productId,
              otherUserId: userId
            })
          })
          
          if (response.ok) {
            const data = await response.json()
            setSelectedConversation(data.conversationId)
            // Načíst aktualizovaný seznam konverzací
            const conversationsResponse = await fetch('/api/conversations')
            if (conversationsResponse.ok) {
              const conversationsData = await conversationsResponse.json()
              setConversations(conversationsData.conversations || [])
            }
            // Vyčistit URL parametry
            window.history.replaceState({}, '', '/messages')
          } else {
            console.error('Chyba při vytváření konverzace')
          }
        } catch (error) {
          console.error('Chyba při vytváření konverzace:', error)
        }
      }
    }
    
    createOrGetConversation()
  }, [searchParams, session, status])

  // Načíst zprávy při výběru konverzace
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) {
        setMessages([])
        return
      }

      try {
        const response = await fetch(`/api/messages?conversationId=${selectedConversation}`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages || [])
        }
      } catch (error) {
        console.error('Chyba při načítání zpráv:', error)
      }
    }

    fetchMessages()
  }, [selectedConversation])

  // Zkontrolovat uzavřené konverzace při výběru konverzace
  useEffect(() => {
    const checkClosedConversation = () => {
      if (!session || !selectedConversation) return
      
      const conv = conversations.find(c => c.id === selectedConversation)
      if (!conv) return
      
      const currentUserId = (session.user as any).id
      // Pokud je konverzace uzavřena někým jiným, zobrazit notifikaci
      if (conv.closedById && conv.closedById !== currentUserId) {
        setShowClosedNotification(true)
        setClosedConversationInfo({
          conversationId: conv.id,
          closeReason: conv.closeReason
        })
      }
    }
    
    checkClosedConversation()
  }, [selectedConversation, conversations, session])

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      uploadedFiles.forEach(file => {
        if (file.preview.startsWith('blob:')) {
          URL.revokeObjectURL(file.preview)
        }
      })
    }
  }, [uploadedFiles])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadError(null)
    const newFiles: UploadedFile[] = []

    Array.from(files).forEach((file) => {
      // Kontrola typu souboru - podpora pro iPhone (HEIC, MOV, atd.)
      const fileName = file.name.toLowerCase()
      const fileExtension = fileName.split('.').pop() || ''
      
      // Podporované formáty obrázků (včetně iPhone HEIC)
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif']
      const imageMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
      
      // Podporované formáty videí (včetně iPhone MOV)
      const videoExtensions = ['mp4', 'mov', 'avi', 'webm', 'mkv', 'm4v']
      const videoMimes = ['video/mp4', 'video/quicktime', 'video/avi', 'video/webm', 'video/x-matroska', 'video/x-m4v']
      
      const isImage = file.type.startsWith('image/') || 
                      imageMimes.includes(file.type) || 
                      imageExtensions.includes(fileExtension)
      
      const isVideo = file.type.startsWith('video/') || 
                      videoMimes.includes(file.type) || 
                      videoExtensions.includes(fileExtension)

      if (!isImage && !isVideo) {
        setUploadError(`Soubor ${file.name} není podporovaný formát (podporujeme pouze obrázky a videa včetně iPhone formátů HEIC a MOV)`)
        return
      }

      // Validace velikosti
      const maxSize = isImage ? 5 * 1024 * 1024 : 50 * 1024 * 1024 // 5MB pro obrázky, 50MB pro videa
      const maxSizeMB = isImage ? 5 : 50

      if (file.size > maxSize) {
        setUploadError(`Soubor ${file.name} je příliš velký. Maximální velikost pro ${isImage ? 'obrázky' : 'videa'} je ${maxSizeMB}MB`)
        return
      }

      // Vytvoření preview
      const preview = URL.createObjectURL(file)
      newFiles.push({
        file,
        preview,
        type: isImage ? 'image' : 'video'
      })
    })

    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles])
    }

    // Reset input
    e.target.value = ''
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const file = prev[index]
      if (file.preview.startsWith('blob:')) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleImageButtonClick = () => {
    const input = document.getElementById('image-input') as HTMLInputElement
    input?.click()
  }

  const handleVideoButtonClick = () => {
    const input = document.getElementById('video-input') as HTMLInputElement
    input?.click()
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() && uploadedFiles.length === 0) return
    if (!selectedConversation) return
    if (!session) return

    const conversation = conversations.find(c => c.id === selectedConversation)
    if (!conversation) return

    // Zjistit receiverId (druhý účastník konverzace)
    const currentUserId = (session.user as any).id
    const receiverId = conversation.otherUserId

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversation,
          content: newMessage.trim(),
          receiverId: receiverId
        })
      })

      if (response.ok) {
        // Přidat novou zprávu do seznamu (optimistic update)
        const messageData = await response.json()
        const newMsg = {
          ...messageData.data,
          senderId: currentUserId,
          receiverId: receiverId,
          isOwn: true
        }
        setMessages(prev => [...prev, newMsg])
        
        // Resetovat form
        setNewMessage('')
        setUploadedFiles([])
        setUploadError(null)
      } else {
        console.error('Chyba při odesílání zprávy')
      }
    } catch (error) {
      console.error('Chyba při odesílání zprávy:', error)
    }
  }

  const handleCloseConversation = async (reason: string) => {
    if (!selectedConversation) return

    try {
      const response = await fetch('/api/conversations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversation,
          closeReason: reason
        })
      })

      if (response.ok) {
        // Odstranit konverzaci z seznamu
        setConversations(prev => prev.filter(c => c.id !== selectedConversation))
        setSelectedConversation(null)
        setShowCloseDialog(false)
      } else {
        console.error('Chyba při uzavírání konverzace')
      }
    } catch (error) {
      console.error('Chyba při uzavírání konverzace:', error)
    }
  }

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
                    {conversations.length === 0 && (
                      <div className="p-4 text-center">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          Žádné konverzace
                        </p>
                      </div>
                    )}
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation.id)}
                        className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 ${
                          selectedConversation === conversation.id ? 'bg-slate-100 dark:bg-slate-800' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {conversation.otherUserImage ? (
                              <Image
                                src={conversation.otherUserImage}
                                alt={conversation.otherUserName || 'User'}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-6 w-6 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                                {conversation.otherUserNickname || conversation.otherUserName}
                              </h3>
                              {conversation.lastMessageAt && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(conversation.lastMessageAt).toLocaleDateString('cs-CZ')}
                                </span>
                              )}
                            </div>
                            {conversation.lastMessage && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                                {conversation.lastMessage}
                              </p>
                            )}
                            {conversation.productTitle && (
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                {conversation.productTitle}
                              </p>
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
                      {selectedConversation && conversations.find(c => c.id === selectedConversation) ? (() => {
                        const conv = conversations.find(c => c.id === selectedConversation)
                        return (
                          <>
                            <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center overflow-hidden">
                              {conv?.otherUserImage ? (
                                <Image
                                  src={conv.otherUserImage}
                                  alt={conv.otherUserName || 'User'}
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <User className="h-6 w-6 text-white" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900 dark:text-white">
                                {conv?.otherUserNickname || conv?.otherUserName || ''}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {conv?.productTitle || ''}
                              </p>
                            </div>
                          </>
                        )
                      })() : (
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            Vyberte konverzaci
                          </h3>
                    </div>
                      )}
                    </div>
                    {selectedConversation && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCloseDialog(true)}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Uzavřít chat
                      </Button>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 dark:text-gray-400">
                        Žádné zprávy. Začněte konverzaci výběrem z levého panelu.
                      </p>
                    </div>
                  )}
                  {messages.map((message) => {
                    const currentUserId = session?.user ? (session.user as any).id : null
                    const isOwn = message.senderId === currentUserId
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isOwn
                              ? 'bg-slate-700 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(message.createdAt).toLocaleString('cs-CZ', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  {/* Error message */}
                  {uploadError && (
                    <div className="mb-2 p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded text-red-700 dark:text-red-300 text-sm">
                      {uploadError}
                    </div>
                  )}

                  {/* Preview nahraných souborů */}
                  {uploadedFiles.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {uploadedFiles.map((uploadedFile, index) => {
                        const isHEIC = uploadedFile.file.name.toLowerCase().endsWith('.heic') || 
                                       uploadedFile.file.name.toLowerCase().endsWith('.heif') ||
                                       uploadedFile.file.type === 'image/heic' || 
                                       uploadedFile.file.type === 'image/heif'
                        
                        return (
                          <div key={index} className="relative group">
                            {uploadedFile.type === 'image' ? (
                              <div className="relative">
                                {isHEIC ? (
                                  // Pro HEIC soubory zobrazíme ikonu, protože preview nemusí fungovat
                                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center">
                                    <ImageIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 rounded-b-lg">
                                      HEIC
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <img
                                      src={uploadedFile.preview}
                                      alt={`Náhled ${index + 1}`}
                                      className="w-20 h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                                    />
                                  </>
                                )}
                                <button
                                  onClick={() => removeFile(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                  type="button"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="relative">
                                {(uploadedFile.file.name.toLowerCase().endsWith('.mov') || 
                                   uploadedFile.file.name.toLowerCase().endsWith('.m4v') ||
                                   uploadedFile.file.type === 'video/quicktime' ||
                                   uploadedFile.file.type === 'video/x-m4v') ? (
                                  // Pro MOV/M4V zobrazíme ikonu, protože preview nemusí fungovat ve všech prohlížečích
                                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center">
                                    <Video className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 rounded-b-lg">
                                      {uploadedFile.file.name.split('.').pop()?.toUpperCase() || 'VIDEO'}
                                    </div>
                                  </div>
                                ) : (
                                  <video
                                    src={uploadedFile.preview}
                                    className="w-20 h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                                    muted
                                  />
                                )}
                                <button
                                  onClick={() => removeFile(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                  type="button"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
                              {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Skryté inputy pro soubory */}
                  <input
                    id="image-input"
                    type="file"
                    accept="image/*,image/heic,image/heif,.heic,.heif"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <input
                    id="video-input"
                    type="file"
                    accept="video/*,video/quicktime,.mov,.m4v"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={handleImageButtonClick}
                      title="Nahrát obrázek (max 5MB)"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={handleVideoButtonClick}
                      title="Nahrát video (max 50MB)"
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Napište zprávu..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <Button
                      className="bg-slate-700 hover:bg-slate-800 text-white"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() && uploadedFiles.length === 0}
                    >
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

      {/* Dialogs */}
      <CloseChatDialog
        isOpen={showCloseDialog}
        onConfirm={handleCloseConversation}
        onCancel={() => setShowCloseDialog(false)}
      />

      <ConfirmationDialog
        isOpen={showClosedNotification}
        title="Konverzace byla uzavřena"
        message={closedConversationInfo ? `Druhá strana ukončila konverzaci s důvodem: ${closedConversationInfo.closeReason}` : ''}
        confirmText="Ok"
        type="info"
        onConfirm={async () => {
          if (closedConversationInfo) {
            try {
              // Označit konverzaci jako skrytou v databázi
              const response = await fetch('/api/conversations', {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  conversationId: closedConversationInfo.conversationId,
                  hideConversation: true
                })
              })

              if (response.ok) {
                // Odstranit konverzaci z lokálního seznamu a načíst aktualizovaný seznam
                const conversationsResponse = await fetch('/api/conversations')
                if (conversationsResponse.ok) {
                  const conversationsData = await conversationsResponse.json()
                  setConversations(conversationsData.conversations || [])
                }
              }
            } catch (error) {
              console.error('Chyba při skrývání konverzace:', error)
            }
          }
          setShowClosedNotification(false)
          setClosedConversationInfo(null)
          setSelectedConversation(null)
        }}
        onCancel={async () => {
          if (closedConversationInfo) {
            try {
              // Označit konverzaci jako skrytou v databázi
              const response = await fetch('/api/conversations', {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  conversationId: closedConversationInfo.conversationId,
                  hideConversation: true
                })
              })

              if (response.ok) {
                // Odstranit konverzaci z lokálního seznamu a načíst aktualizovaný seznam
                const conversationsResponse = await fetch('/api/conversations')
                if (conversationsResponse.ok) {
                  const conversationsData = await conversationsResponse.json()
                  setConversations(conversationsData.conversations || [])
                }
              }
            } catch (error) {
              console.error('Chyba při skrývání konverzace:', error)
            }
          }
          setShowClosedNotification(false)
          setClosedConversationInfo(null)
          setSelectedConversation(null)
        }}
      />
    </div>
  )
}