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

    // Načtení všech uživatelů
    const users = await query(`
      SELECT 
        id, name, email, image, isVerified, isBanned, isAdmin, reputation, 
        createdAt, lastLoginAt
      FROM users 
      ORDER BY createdAt DESC
    `, [])

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error loading users:', error)
    return NextResponse.json(
      { message: 'Chyba při načítání uživatelů', users: [] },
      { status: 500 }
    )
  }
}



