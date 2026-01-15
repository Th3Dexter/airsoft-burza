import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { queryOne, update } from '@/lib/mysql'

export const dynamic = 'force-dynamic'

export async function POST(
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
    const adminId = (session!.user as any).id
    const adminUser = await queryOne('SELECT isAdmin FROM users WHERE id = ?', [adminId])
    
    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json(
        { message: 'Nemáte oprávnění' },
        { status: 403 }
      )
    }

    const { isBanned } = await request.json()
    const userId = params.id

    await update('UPDATE users SET isBanned = ?, updatedAt = NOW() WHERE id = ?', [isBanned, userId])

    return NextResponse.json({ 
      message: 'Stav uživatele byl aktualizován',
      isBanned 
    })
  } catch (error) {
    console.error('Error updating user ban status:', error)
    return NextResponse.json(
      { message: 'Chyba při aktualizaci stavu uživatele' },
      { status: 500 }
    )
  }
}



