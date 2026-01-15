import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { queryOne } from '@/lib/mysql'

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

    // Načtení statistik
    const totalUsers = await queryOne('SELECT COUNT(*) as count FROM users', [])
    const activeProducts = await queryOne('SELECT COUNT(*) as count FROM products WHERE isActive = 1 AND isSold = 0', [])
    const totalProducts = await queryOne('SELECT COUNT(*) as count FROM products', [])
    const pendingReports = await queryOne('SELECT COUNT(*) as count FROM products WHERE isActive = 0', [])

    return NextResponse.json({
      totalUsers: totalUsers?.count || 0,
      activeProducts: activeProducts?.count || 0,
      totalProducts: totalProducts?.count || 0,
      pendingReports: pendingReports?.count || 0
    })
  } catch (error) {
    console.error('Error loading admin stats:', error)
    return NextResponse.json(
      { message: 'Chyba při načítání statistik' },
      { status: 500 }
    )
  }
}




