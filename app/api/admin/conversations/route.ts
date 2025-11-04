import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, queryOne } from '@/lib/mysql'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
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

    // Načtení všech konverzací s informacemi o účastnících a produktu
    const conversations = await query(`
      SELECT 
        c.id,
        c.productId,
        c.participant1Id,
        c.participant2Id,
        c.createdAt,
        c.updatedAt,
        p.title as productTitle,
        p.price as productPrice,
        u1.name as participant1Name,
        u1.email as participant1Email,
        u1.image as participant1Image,
        u2.name as participant2Name,
        u2.email as participant2Email,
        u2.image as participant2Image,
        (SELECT COUNT(*) FROM messages WHERE conversationId = c.id) as messageCount
      FROM conversations c
      LEFT JOIN products p ON c.productId = p.id
      LEFT JOIN users u1 ON c.participant1Id = u1.id
      LEFT JOIN users u2 ON c.participant2Id = u2.id
      ORDER BY c.updatedAt DESC
    `, [])

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Error loading conversations:', error)
    return NextResponse.json(
      { message: 'Chyba při načítání konverzací', conversations: [] },
      { status: 500 }
    )
  }
}

