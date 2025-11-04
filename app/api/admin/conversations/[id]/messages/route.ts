import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, queryOne } from '@/lib/mysql'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!(session?.user as any)?.id) {
      return NextResponse.json(
        { message: 'Neautorizovaný přístup' },
        { status: 401 }
      )
    }

    // Kontrola admin statusu
    const userId = (session!.user as any).id
    const user = await queryOne('SELECT isAdmin FROM users WHERE id = ?', [userId])
    
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { message: 'Nemáte oprávnění' },
        { status: 403 }
      )
    }

    const conversationId = params.id

    // Načtení zpráv z konverzace s informacemi o odesílateli
    const messages = await query(`
      SELECT 
        m.id,
        m.content,
        m.createdAt,
        m.senderId,
        m.receiverId,
        u.name as senderName,
        u.email as senderEmail,
        u.image as senderImage
      FROM messages m
      LEFT JOIN users u ON m.senderId = u.id
      WHERE m.conversationId = ?
      ORDER BY m.createdAt ASC
    `, [conversationId])

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error loading messages:', error)
    return NextResponse.json(
      { message: 'Chyba při načítání zpráv', messages: [] },
      { status: 500 }
    )
  }
}

