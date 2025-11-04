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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'

    // Sestavení WHERE podmínek
    let whereConditions: string[] = []
    const params: any[] = []

    if (status !== 'all') {
      whereConditions.push('r.status = ?')
      params.push(status)
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : ''

    // Načtení všech nahlášení s informacemi o uživateli
    const reports = await query(`
      SELECT 
        r.id,
        r.type,
        r.title,
        r.description,
        r.email,
        r.url,
        r.status,
        r.createdAt,
        r.updatedAt,
        r.userId,
        u.name as userName,
        u.email as userEmail
      FROM reports r
      LEFT JOIN users u ON r.userId = u.id
      ${whereClause}
      ORDER BY r.createdAt DESC
    `, params)

    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Error loading reports:', error)
    return NextResponse.json(
      { message: 'Chyba při načítání nahlášení', reports: [] },
      { status: 500 }
    )
  }
}

