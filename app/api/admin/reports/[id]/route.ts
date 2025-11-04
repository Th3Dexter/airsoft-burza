import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { queryOne, update, query } from '@/lib/mysql'

export const dynamic = 'force-dynamic'

// PATCH - změna stavu nahlášení
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

    const reportId = params.id
    const body = await request.json()
    const { status } = body

    // Validace statusu
    const validStatuses = ['PENDING', 'RESOLVED', 'REJECTED', 'IN_PROGRESS']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: 'Neplatný status' },
        { status: 400 }
      )
    }

    // Aktualizace nahlášení
    await update(
      'UPDATE reports SET status = ?, updatedAt = NOW() WHERE id = ?',
      [status, reportId]
    )

    return NextResponse.json({ 
      message: `Nahlášení bylo ${getStatusLabel(status)}` 
    })
  } catch (error) {
    console.error('Error updating report:', error)
    return NextResponse.json(
      { message: 'Chyba při aktualizaci nahlášení' },
      { status: 500 }
    )
  }
}

// DELETE - smazání nahlášení
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

    const reportId = params.id

    // Smazání nahlášení
    await query('DELETE FROM reports WHERE id = ?', [reportId])

    return NextResponse.json({ message: 'Nahlášení bylo smazáno' })
  } catch (error) {
    console.error('Error deleting report:', error)
    return NextResponse.json(
      { message: 'Chyba při mazání nahlášení' },
      { status: 500 }
    )
  }
}

function getStatusLabel(status: string): string {
  const labels: { [key: string]: string } = {
    'PENDING': 'označeno jako čekající',
    'RESOLVED': 'označeno jako vyřešené',
    'REJECTED': 'označeno jako zamítnuté',
    'IN_PROGRESS': 'označeno jako v řešení'
  }
  return labels[status] || status
}

