import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, queryOne } from '@/lib/mysql'

// Force dynamic rendering - requires session data
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

    const { searchParams } = new URL(request.url)
    const requestedUserId = searchParams.get('userId')
    const currentUserId = (session!.user as any).id
    const isAdmin = (session!.user as any).isAdmin || false
    
    // Pokud je zadán userId parametr, zkontrolovat oprávnění
    // Pouze admin může zobrazit statistiky jiného uživatele
    let userId = currentUserId
    if (requestedUserId) {
      if (isAdmin) {
        userId = requestedUserId
      } else {
        // Pokud není admin, může zobrazit pouze svůj profil
        return NextResponse.json(
          { message: 'Nemáte oprávnění zobrazit statistiky jiného uživatele' },
          { status: 403 }
        )
      }
    }

    // Načtení základních informací o uživateli
    const userInfo = await queryOne(
      `SELECT name, email, image, phone, nickname, city, bio, reputation, createdAt, isVerified 
       FROM users 
       WHERE id = ?`,
      [userId]
    )

    // Kontrola, zda byl uživatel nalezen
    if (!userInfo) {
      return NextResponse.json(
        { message: 'Uživatel nebyl nalezen' },
        { status: 404 }
      )
    }

    // Počet aktivních inzerátů
    const activeProductsResult = await queryOne(
      `SELECT COUNT(*) as count 
       FROM products 
       WHERE userId = ? AND isActive = 1 AND isSold = 0`,
      [userId]
    )
    const activeProducts = activeProductsResult.count

    // Počet prodaných produktů
    const soldProductsResult = await queryOne(
      `SELECT COUNT(*) as count 
       FROM products 
       WHERE userId = ? AND isSold = 1`,
      [userId]
    )
    const soldProducts = soldProductsResult.count

    // Počet konverzací (zpráv) kde je uživatel účastníkem
    const conversationsResult = await queryOne(
      `SELECT COUNT(DISTINCT c.id) as count 
       FROM conversations c 
       WHERE c.participant1Id = ? OR c.participant2Id = ?`,
      [userId, userId]
    )
    const conversations = conversationsResult.count

    // Počet zpráv odeslaných uživatelem
    const sentMessagesResult = await queryOne(
      `SELECT COUNT(*) as count 
       FROM messages 
       WHERE senderId = ?`,
      [userId]
    )
    const sentMessages = sentMessagesResult.count

    // Počet zpráv přijatých uživatelem
    const receivedMessagesResult = await queryOne(
      `SELECT COUNT(*) as count 
       FROM messages 
       WHERE receiverId = ?`,
      [userId]
    )
    const receivedMessages = receivedMessagesResult.count

    // Celkový počet zpráv (odchozí + příchozí)
    const totalMessages = sentMessages + receivedMessages

    // Reputace uživatele
    const reputation = userInfo.reputation || 'NEUTRAL'

    // Rok registrace
    const registrationYear = new Date(userInfo.createdAt).getFullYear()

    // Poslední aktivita (nejnovější produkt nebo zpráva)
    const lastActivityResult = await queryOne(
      `SELECT MAX(activity_date) as lastActivity FROM (
        SELECT MAX(createdAt) as activity_date FROM products WHERE userId = ?
        UNION ALL
        SELECT MAX(createdAt) as activity_date FROM messages WHERE senderId = ? OR receiverId = ?
      ) as activities`,
      [userId, userId, userId]
    )
    const lastActivity = lastActivityResult.lastActivity

    // Statistiky podle kategorií
    const categoryStats = await query(
      `SELECT category, COUNT(*) as count 
       FROM products 
       WHERE userId = ? AND isActive = 1 
       GROUP BY category`,
      [userId]
    )

    // Celková hodnota aktivních inzerátů
    const totalValueResult = await queryOne(
      `SELECT COALESCE(SUM(price), 0) as totalValue 
       FROM products 
       WHERE userId = ? AND isActive = 1 AND isSold = 0`,
      [userId]
    )
    const totalValue = totalValueResult.totalValue

    const stats = {
      user: {
        name: userInfo.name,
        email: userInfo.email,
        image: userInfo.image,
        phone: userInfo.phone,
        nickname: userInfo.nickname,
        city: userInfo.city,
        bio: userInfo.bio,
        isVerified: userInfo.isVerified,
        registrationYear
      },
      products: {
        active: activeProducts,
        sold: soldProducts,
        total: activeProducts + soldProducts,
        totalValue: totalValue,
        categoryStats
      },
      messages: {
        sent: sentMessages,
        received: receivedMessages,
        total: totalMessages,
        conversations
      },
      reputation: reputation,
      lastActivity
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('User stats fetch error:', error)
    return NextResponse.json(
      { message: 'Nastala chyba při načítání statistik' },
      { status: 500 }
    )
  }
}
