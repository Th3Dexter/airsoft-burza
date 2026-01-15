import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { queryOne, query, update } from '@/lib/mysql'

export const dynamic = 'force-dynamic'

// DELETE - smazání recenze
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

    const reviewId = params.id

    // Získání informací o recenzi pro přepočítání ratingu
    const review = await queryOne(
      'SELECT serviceId, ratingOverall FROM service_reviews WHERE id = ?',
      [reviewId]
    )

    if (!review) {
      return NextResponse.json(
        { message: 'Recenze nebyla nalezena' },
        { status: 404 }
      )
    }

    // Smazání recenze
    await query('DELETE FROM service_reviews WHERE id = ?', [reviewId])

    // Přepočítání ratingu servisu
    const ratingResult = await queryOne(
      `SELECT 
        AVG(ratingOverall) as avgRating,
        COUNT(*) as count
       FROM service_reviews 
       WHERE serviceId = ?`,
      [review.serviceId]
    )

    const newRating = ratingResult?.avgRating || null
    const newReviewCount = ratingResult?.count || 0

    await update(
      'UPDATE services SET rating = ?, reviewCount = ?, updatedAt = NOW() WHERE id = ?',
      [newRating, newReviewCount, review.serviceId]
    )

    return NextResponse.json({ message: 'Recenze byla smazána' })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { message: 'Chyba při mazání recenze' },
      { status: 500 }
    )
  }
}

