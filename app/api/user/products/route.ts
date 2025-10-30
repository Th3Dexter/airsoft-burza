import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/mysql'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!(session?.user as any)?.id) {
      return NextResponse.json(
        { message: 'Neautorizovaný přístup' },
        { status: 401 }
      )
    }

    const userId = (session!.user as any).id
    const { searchParams } = new URL(request.url)
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
      'NEW': 'Nové',
      'LIKE_NEW': 'Jako nové',
      'GOOD': 'Dobrý stav',
      'FAIR': 'Použitelné',
      'POOR': 'Špatný stav'
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
