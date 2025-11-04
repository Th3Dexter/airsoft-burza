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

    // Načtení všech servisů s informacemi o uživateli
    const services = await query(`
      SELECT 
        s.id,
        s.name,
        s.description,
        s.location,
        s.contactEmail,
        s.contactPhone,
        s.image,
        s.additionalImages,
        s.rating,
        s.reviewCount,
        s.isActive,
        s.createdAt,
        s.updatedAt,
        s.userId,
        u.name as userName,
        u.email as userEmail
      FROM services s
      LEFT JOIN users u ON s.userId = u.id
      ORDER BY s.createdAt DESC
    `, [])

    return NextResponse.json({ 
      services: (services as any[]).map((s) => ({
        ...s,
        additionalImages: s.additionalImages ? JSON.parse(s.additionalImages) : null,
        rating: s.rating !== null && s.rating !== undefined ? parseFloat(String(s.rating)) : undefined,
      }))
    })
  } catch (error) {
    console.error('Error loading services:', error)
    return NextResponse.json(
      { message: 'Chyba při načítání servisů', services: [] },
      { status: 500 }
    )
  }
}

