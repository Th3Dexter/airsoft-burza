import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/mysql'

// Force dynamic rendering - requires session data
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

    const { searchParams } = new URL(request.url)
    const requestedUserId = searchParams.get('userId')
    const currentUserId = (session!.user as any).id
    const isAdmin = (session!.user as any).isAdmin || false
    
    // Pokud je zadán userId parametr, zkontrolovat oprávnění
    // Pouze admin může zobrazit produkty jiného uživatele
    let userId = currentUserId
    if (requestedUserId) {
      if (isAdmin) {
        userId = requestedUserId
      } else {
        // Pokud není admin, může zobrazit pouze své produkty
        return NextResponse.json(
          { message: 'Nemáte oprávnění zobrazit produkty jiného uživatele' },
          { status: 403 }
        )
      }
    }
    
    const status = searchParams.get('status') || 'all' // all, active, sold

    // Vytvoření WHERE podmínek
    let whereConditions = ['userId = ?']
    const params = [userId]

    if (status === 'active') {
      whereConditions.push('isActive = 1', 'isSold = 0')
    } else if (status === 'sold') {
      whereConditions.push('isSold = 1')
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Načtení inzerátů uživatele
    const products = await query(
      `SELECT id, title, description, price, category, subcategory, \`condition\`, images, location, isActive, isSold, createdAt, updatedAt
       FROM products 
       ${whereClause}
       ORDER BY createdAt DESC`,
      params
    )

    // Mapování kategorií pro zobrazení
    const categoryMap: { [key: string]: string } = {
      'AIRSOFT_WEAPONS': 'Airsoft zbraně',
      'MILITARY_EQUIPMENT': 'Military vybavení',
      'OTHER': 'Ostatní'
    }

    const conditionMap: { [key: string]: string } = {
      'NEW': 'Nový',
      'LIGHT_DAMAGE': 'Lehké poškození',
      'MAJOR_DAMAGE': 'Větší poškození',
      'NON_FUNCTIONAL': 'Nefunkční'
    }

    // Transformace dat pro frontend
    const transformedProducts = Array.isArray(products) ? products.map((product: any) => ({
      ...product,
      category: categoryMap[product.category] || product.category,
      condition: conditionMap[product.condition] || product.condition,
      images: product.images ? JSON.parse(product.images) : [],
      price: parseFloat(product.price)
    })) : []

    return NextResponse.json({
      products: transformedProducts,
      total: transformedProducts.length
    })

  } catch (error) {
    console.error('User products fetch error:', error)
    return NextResponse.json(
      { message: 'Nastala chyba při načítání inzerátů' },
      { status: 500 }
    )
  }
}
