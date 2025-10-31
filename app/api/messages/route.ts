import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, queryOne, insert, update } from '@/lib/mysql'

// Force dynamic rendering - requires session data
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!(session?.user as any)?.id) {
      return NextResponse.json(
        { message: 'Neautorizovaný přístup' },
        { status: 401 }
      )
    }

    const userId = (session!.user as any).id
    const body = await request.json()
    const { conversationId, content, receiverId } = body

    // Validace
    if (!conversationId || !content || !receiverId) {
      return NextResponse.json(
        { message: 'Chybí conversationId, content nebo receiverId' },
        { status: 400 }
      )
    }

    // Zkontrolovat, jestli konverzace existuje a uživatel je účastník
    const conversation = await queryOne(
      `SELECT id, participant1Id, participant2Id FROM conversations WHERE id = ?`,
      [conversationId]
    )

    if (!conversation) {
      return NextResponse.json(
        { message: 'Konverzace nebyla nalezena' },
        { status: 404 }
      )
    }

    // Ověřit, že uživatel je účastník konverzace
    if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
      return NextResponse.json(
        { message: 'Nemáte oprávnění odesílat zprávy do této konverzace' },
        { status: 403 }
      )
    }

    // Ověřit, že receiverId je druhý účastník
    const otherParticipant = conversation.participant1Id === userId 
      ? conversation.participant2Id 
      : conversation.participant1Id

    if (receiverId !== otherParticipant) {
      return NextResponse.json(
        { message: 'Neplatný příjemce zprávy' },
        { status: 400 }
      )
    }

    // Vytvořit zprávu
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    await insert(
      `INSERT INTO messages (id, content, conversationId, senderId, receiverId, createdAt)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [messageId, content, conversationId, userId, receiverId]
    )

    // Aktualizovat updatedAt konverzace
    await update(
      `UPDATE conversations SET updatedAt = NOW() WHERE id = ?`,
      [conversationId]
    )

    // Načíst vytvořenou zprávu
    const message = await queryOne(
      `SELECT * FROM messages WHERE id = ?`,
      [messageId]
    )

    return NextResponse.json(
      { 
        message: 'Zpráva byla odeslána',
        data: message
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { message: 'Nastala chyba při odesílání zprávy' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!(session?.user as any)?.id) {
      return NextResponse.json(
        { message: 'Neautorizovaný přístup' },
        { status: 401 }
      )
    }

    const userId = (session!.user as any).id
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json(
        { message: 'Chybí conversationId' },
        { status: 400 }
      )
    }

    // Ověřit, že uživatel je účastník konverzace
    const conversation = await queryOne(
      `SELECT id, participant1Id, participant2Id FROM conversations WHERE id = ?`,
      [conversationId]
    )

    if (!conversation) {
      return NextResponse.json(
        { message: 'Konverzace nebyla nalezena' },
        { status: 404 }
      )
    }

    if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
      return NextResponse.json(
        { message: 'Nemáte oprávnění zobrazit zprávy z této konverzace' },
        { status: 403 }
      )
    }

    // Načíst zprávy
    const messages = await query(
      `SELECT m.*, 
              u.name as senderName, u.image as senderImage, u.nickname as senderNickname
       FROM messages m
       JOIN users u ON m.senderId = u.id
       WHERE m.conversationId = ?
       ORDER BY m.createdAt ASC`,
      [conversationId]
    )

    return NextResponse.json(
      { messages },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { message: 'Nastala chyba při načítání zpráv' },
      { status: 500 }
    )
  }
}

