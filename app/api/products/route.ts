import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, queryOne, insert } from '@/lib/mysql'
import { sanitizeInput } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!(session?.user as any)?.id) {
      return NextResponse.json(
        { message: 'Neautorizovaný přístup' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    
    // Získání dat z formuláře
    const title = sanitizeInput(formData.get('title') as string || '')
    const description = sanitizeInput(formData.get('description') as string || '')
    const price = parseFloat(formData.get('price') as string)
    const category = formData.get('category') as string
    const subcategory = sanitizeInput(formData.get('subcategory') as string || '')
    const condition = formData.get('condition') as string
    const location = formData.get('location') as string
    
    // Validace povinných polí
    if (!title || !description || !price || !category || !condition || !location) {
      return NextResponse.json(
        { message: 'Všechna povinná pole musí být vyplněna' },
        { status: 400 }
      )
    }

    if (price <= 0) {
      return NextResponse.json(
        { message: 'Cena musí být větší než 0' },
        { status: 400 }
      )
    }

    // Validace kategorie
    const validCategories = ['airsoft-weapons', 'military-equipment', 'other']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { message: 'Neplatná kategorie' },
        { status: 400 }
      )
    }

    // Validace stavu
    const validConditions = ['new', 'like-new', 'good', 'fair', 'poor']
    if (!validConditions.includes(condition)) {
      return NextResponse.json(
        { message: 'Neplatný stav' },
        { status: 400 }
      )
    }

    // Zpracování obrázků
    const images: string[] = []
    const imageFiles = formData.getAll('images') as File[]
    
    if (imageFiles.length === 0) {
      return NextResponse.json(
        { message: 'Přidejte alespoň jeden obrázek' },
        { status: 400 }
      )
    }

    if (imageFiles.length > 10) {
      return NextResponse.json(
        { message: 'Maximálně 10 obrázků' },
        { status: 400 }
      )
    }

    // Validace obrázků
    for (const file of imageFiles) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        return NextResponse.json(
          { message: `Obrázek ${file.name} je příliš velký (max 5MB)` },
          { status: 400 }
        )
      }
      
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { message: `Soubor ${file.name} není obrázek` },
          { status: 400 }
        )
      }
    }

    // TODO: Implementovat upload obrázků do cloudu (Cloudinary, AWS S3, atd.)
    // Prozatím ukládáme placeholder URL
    for (let i = 0; i < imageFiles.length; i++) {
      images.push(`/images/placeholder-product-${i + 1}.jpg`)
    }

    // Mapování kategorií
    const categoryMap: { [key: string]: string } = {
      'airsoft-weapons': 'AIRSOFT_WEAPONS',
      'military-equipment': 'MILITARY_EQUIPMENT',
      'other': 'OTHER'
    }

    // Mapování stavů
    const conditionMap: { [key: string]: string } = {
      'new': 'NEW',
      'like-new': 'LIKE_NEW',
      'good': 'GOOD',
      'fair': 'FAIR',
      'poor': 'POOR'
    }

    // Vytvoření produktu v databázi
    const productId = await insert(
      `INSERT INTO products (title, description, price, category, subcategory, \`condition\`, images, location, userId, isActive, isSold, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        title,
        description,
        price,
        categoryMap[category],
        subcategory || null,
        conditionMap[condition],
        JSON.stringify(images),
        location,
        (session!.user as any).id,
        true,
        false
      ]
    )

    // Získání vytvořeného produktu s uživatelem
    const product = await queryOne(
      `SELECT p.*, u.id as userId, u.name as userName, u.email as userEmail, u.image as userImage, u.isVerified as userIsVerified
       FROM products p 
       JOIN users u ON p.userId = u.id 
       WHERE p.id = ?`,
      [productId]
    )

    return NextResponse.json(
      { 
        message: 'Produkt byl úspěšně vytvořen',
        product 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json(
      { message: 'Nastala chyba při vytváření produktu' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Získání parametrů pro filtrování a stránkování
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const condition = searchParams.get('condition')
    const location = searchParams.get('location')
    const sort = searchParams.get('sort') || 'newest'

    // Vytvoření WHERE podmínek
    let whereConditions = ['p.isActive = 1', 'p.isSold = 0']
    const params: any[] = []

    if (category) {
      const categoryMap: { [key: string]: string } = {
        'airsoft-weapons': 'AIRSOFT_WEAPONS',
        'military-equipment': 'MILITARY_EQUIPMENT',
        'other': 'OTHER'
      }
      whereConditions.push('p.category = ?')
      params.push(categoryMap[category])
    }

    if (search) {
      whereConditions.push('(p.title LIKE ? OR p.description LIKE ? OR p.subcategory LIKE ?)')
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    if (minPrice) {
      whereConditions.push('p.price >= ?')
      params.push(parseFloat(minPrice))
    }

    if (maxPrice) {
      whereConditions.push('p.price <= ?')
      params.push(parseFloat(maxPrice))
    }

    if (condition) {
      const conditionMap: { [key: string]: string } = {
        'new': 'NEW',
        'like-new': 'LIKE_NEW',
        'good': 'GOOD',
        'fair': 'FAIR',
        'poor': 'POOR'
      }
      whereConditions.push('p.`condition` = ?')
      params.push(conditionMap[condition])
    }

    if (location) {
      const locationMap: { [key: string]: string } = {
        'praha': 'Praha',
        'brno': 'Brno',
        'ostrava': 'Ostrava',
        'plzen': 'Plzeň',
        'hradec-kralove': 'Hradec Králové',
        'ceske-budejovice': 'České Budějovice',
        'olomouc': 'Olomouc',
        'liberec': 'Liberec'
      }
      whereConditions.push('p.location = ?')
      params.push(locationMap[location])
    }

    // Vytvoření ORDER BY podmínek
    let orderBy = 'p.createdAt DESC'
    
    switch (sort) {
      case 'newest':
        orderBy = 'p.createdAt DESC'
        break
      case 'oldest':
        orderBy = 'p.createdAt ASC'
        break
      case 'price-low':
        orderBy = 'p.price ASC'
        break
      case 'price-high':
        orderBy = 'p.price DESC'
        break
      case 'name-asc':
        orderBy = 'p.title ASC'
        break
      case 'name-desc':
        orderBy = 'p.title DESC'
        break
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Získání produktů s paginací
    const offset = (page - 1) * limit
    
    const products = await query(
      `SELECT p.*, u.id as userId, u.name as userName, u.email as userEmail, u.image as userImage, u.isVerified as userIsVerified
       FROM products p 
       JOIN users u ON p.userId = u.id 
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )

    // Získání celkového počtu
    const countResult = await queryOne(
      `SELECT COUNT(*) as total FROM products p ${whereClause}`,
      params
    )
    const totalCount = countResult.total

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json(
      { message: 'Nastala chyba při načítání produktů' },
      { status: 500 }
    )
  }
}