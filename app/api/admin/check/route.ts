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
        { message: 'Neautorizovaný přístup', isAdmin: false },
        { status: 401 }
      )
    }

    const userId = (session!.user as any).id
    const user = await queryOne('SELECT isAdmin FROM users WHERE id = ?', [userId])

    return NextResponse.json({ 
      isAdmin: user?.isAdmin || false 
    })
  } catch (error) {
    console.error('Error checking admin status:', error)
    return NextResponse.json(
      { message: 'Chyba při kontrole oprávnění', isAdmin: false },
      { status: 500 }
    )
  }
}



