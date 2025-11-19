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

    // Načtení všech inzerátů s informacemi o uživatelích
    const products = await query(`
      SELECT 
        p.id, p.title, p.description, p.price, p.mainImage, p.images,
        p.location, p.isActive, p.isSold, p.userId, p.createdAt,
        u.name as userName
      FROM products p
      LEFT JOIN users u ON p.userId = u.id
      ORDER BY p.createdAt DESC
    `, [])

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error loading products:', error)
    return NextResponse.json(
      { message: 'Chyba při načítání inzerátů', products: [] },
      { status: 500 }
    )
  }
}



