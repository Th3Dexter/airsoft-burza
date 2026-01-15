import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { queryOne, update, query } from '@/lib/mysql'

export const dynamic = 'force-dynamic'

// PATCH - schválení/zamítnutí servisu
export async function PATCH(
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

    const serviceId = params.id
    const body = await request.json()
    const { isActive } = body

    // Aktualizace servisu
    await update(
      'UPDATE services SET isActive = ?, updatedAt = NOW() WHERE id = ?',
      [isActive ? 1 : 0, serviceId]
    )

    return NextResponse.json({ 
      message: `Servis byl ${isActive ? 'schválen' : 'zamítnut'}` 
    })
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { message: 'Chyba při aktualizaci servisu' },
      { status: 500 }
    )
  }
}

// DELETE - smazání servisu
export async function DELETE(
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

    const serviceId = params.id

    // Smazání servisu (cascade smaže i recenze)
    await query('DELETE FROM services WHERE id = ?', [serviceId])

    return NextResponse.json({ message: 'Servis byl smazán' })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { message: 'Chyba při mazání servisu' },
      { status: 500 }
    )
  }
}

