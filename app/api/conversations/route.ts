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
    const { productId, otherUserId } = body

    // Validace
    if (!productId || !otherUserId) {
      return NextResponse.json(
        { message: 'Chybí productId nebo otherUserId' },
        { status: 400 }
      )
    }

    if (userId === otherUserId) {
      return NextResponse.json(
        { message: 'Nemůžete vytvořit konverzaci sami se sebou' },
        { status: 400 }
      )
    }

    // Zkontrolovat, jestli produkt existuje
    const product = await queryOne(
      'SELECT id, userId FROM products WHERE id = ?',
      [productId]
    )

    if (!product) {
      return NextResponse.json(
        { message: 'Produkt nebyl nalezen' },
        { status: 404 }
      )
    }

    // Uspořádat účastníky pro konzistenci (menší ID jako participant1, větší jako participant2)
    const participant1Id = userId.localeCompare(otherUserId) < 0 ? userId : otherUserId
    const participant2Id = userId.localeCompare(otherUserId) < 0 ? otherUserId : userId

    // Zkontrolovat, jestli konverzace už existuje
    const existingConversation = await queryOne(
      `SELECT id FROM conversations 
       WHERE productId = ? AND participant1Id = ? AND participant2Id = ?`,
      [productId, participant1Id, participant2Id]
    )

    if (existingConversation) {
      return NextResponse.json(
        { 
          message: 'Konverzace již existuje',
          conversationId: existingConversation.id 
        },
        { status: 200 }
      )
    }

    // Vytvořit novou konverzaci
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      await insert(
        `INSERT INTO conversations (id, productId, participant1Id, participant2Id, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [conversationId, productId, participant1Id, participant2Id]
      )
    } catch (insertError: any) {
      // Pokud je to duplicitní záznam, zkus načíst existující
      if (insertError.code === 'ER_DUP_ENTRY') {
        const existingConv = await queryOne(
          `SELECT id FROM conversations 
           WHERE productId = ? AND participant1Id = ? AND participant2Id = ?`,
          [productId, participant1Id, participant2Id]
        )
        if (existingConv) {
          return NextResponse.json(
            { 
              message: 'Konverzace již existuje',
              conversationId: existingConv.id 
            },
            { status: 200 }
          )
        }
      }
      throw insertError
    }

    return NextResponse.json(
      { 
        message: 'Konverzace byla vytvořena',
        conversationId 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { message: 'Nastala chyba při vytváření konverzace' },
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

    // Načtení konverzací uživatele - skrýt uzavřené konverzace pokud je uzavřel aktuální uživatel, nebo pokud je skryl
    const conversations = await query(
      `SELECT c.*, 
              p.title as productTitle, p.mainImage as productImage,
              CASE 
                WHEN c.participant1Id = ? THEN u2.id
                ELSE u1.id
              END as otherUserId,
              CASE 
                WHEN c.participant1Id = ? THEN u2.name
                ELSE u1.name
              END as otherUserName,
              CASE 
                WHEN c.participant1Id = ? THEN u2.image
                ELSE u1.image
              END as otherUserImage,
              CASE 
                WHEN c.participant1Id = ? THEN u2.nickname
                ELSE u1.nickname
              END as otherUserNickname,
              (SELECT content FROM messages WHERE conversationId = c.id ORDER BY createdAt DESC LIMIT 1) as lastMessage,
              (SELECT createdAt FROM messages WHERE conversationId = c.id ORDER BY createdAt DESC LIMIT 1) as lastMessageAt
       FROM conversations c
       JOIN products p ON c.productId = p.id
       JOIN users u1 ON c.participant1Id = u1.id
       JOIN users u2 ON c.participant2Id = u2.id
       WHERE (c.participant1Id = ? OR c.participant2Id = ?)
         AND (c.closedById IS NULL OR c.closedById != ?)
         AND (c.hiddenForUserId IS NULL OR c.hiddenForUserId != ?)
       ORDER BY lastMessageAt DESC, c.updatedAt DESC`,
      [userId, userId, userId, userId, userId, userId, userId, userId]
    )

    return NextResponse.json(
      { conversations },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { message: 'Nastala chyba při načítání konverzací' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
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
    const { conversationId, closeReason, hideConversation } = body

    // Validace
    if (!conversationId) {
      return NextResponse.json(
        { message: 'Chybí conversationId' },
        { status: 400 }
      )
    }

    // Zkontrolovat, jestli konverzace existuje a uživatel je účastník
    const conversation = await queryOne(
      `SELECT id, participant1Id, participant2Id, closedById, hiddenForUserId FROM conversations WHERE id = ?`,
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
        { message: 'Nemáte oprávnění upravit tuto konverzaci' },
        { status: 403 }
      )
    }

    // Pokud je to skrytí konverzace (když uživatel klikne na "Ok" v notifikaci)
    if (hideConversation === true) {
      await update(
        `UPDATE conversations SET hiddenForUserId = ?, updatedAt = NOW() WHERE id = ?`,
        [userId, conversationId]
      )
      return NextResponse.json(
        { 
          message: 'Konverzace byla skryta'
        },
        { status: 200 }
      )
    }

    // Pokud je to uzavření konverzace
    if (!closeReason || closeReason.trim() === '') {
      return NextResponse.json(
        { message: 'Důvod uzavření je povinný' },
        { status: 400 }
      )
    }

    // Ověřit, že konverzace není již uzavřena
    if (conversation.closedById) {
      return NextResponse.json(
        { message: 'Konverzace je již uzavřena' },
        { status: 400 }
      )
    }

    // Uzavřít konverzaci
    await update(
      `UPDATE conversations SET closedById = ?, closeReason = ?, closedAt = NOW(), updatedAt = NOW() WHERE id = ?`,
      [userId, closeReason.trim(), conversationId]
    )

    return NextResponse.json(
      { 
        message: 'Konverzace byla uzavřena'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error closing conversation:', error)
    return NextResponse.json(
      { message: 'Nastala chyba při uzavírání konverzace' },
      { status: 500 }
    )
  }
}

