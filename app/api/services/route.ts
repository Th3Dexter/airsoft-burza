import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, queryOne, insert } from '@/lib/mysql'
import { sanitizeInput } from '@/lib/utils'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomBytes } from 'crypto'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET - načtení všech servisů s filtry a vyhledáváním
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const location = searchParams.get('location') || ''
    const sort = searchParams.get('sort') || 'newest'

    // Sestavení WHERE podmínek - zobrazit jen schválené servisy (isActive = true)
    const whereConditions: string[] = ['s.isActive = true']
    const params: any[] = []

    // Vyhledávání podle názvu a popisu
    if (search) {
      whereConditions.push('(s.name LIKE ? OR s.description LIKE ?)')
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern)
    }

    // Filtrování podle lokace
    if (location) {
      whereConditions.push('s.location LIKE ?')
      params.push(`%${location}%`)
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : ''

    // Řazení
    let orderBy = 's.createdAt DESC'
    switch (sort) {
      case 'oldest':
        orderBy = 's.createdAt ASC'
        break
      case 'name-asc':
        orderBy = 's.name ASC'
        break
      case 'name-desc':
        orderBy = 's.name DESC'
        break
      case 'rating-high':
        orderBy = 's.rating DESC, s.reviewCount DESC'
        break
      case 'rating-low':
        orderBy = 's.rating ASC, s.reviewCount ASC'
        break
      default:
        orderBy = 's.createdAt DESC'
    }

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
        s.createdAt,
        s.userId,
        u.name as userName
      FROM services s
      LEFT JOIN users u ON s.userId = u.id
      ${whereClause}
      ORDER BY ${orderBy}
    `, params)

    return NextResponse.json({ 
      services: (services as any[]).map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        location: s.location,
        contactEmail: s.contactEmail,
        contactPhone: s.contactPhone,
        contact: s.contactEmail || s.contactPhone || '',
        image: s.image,
        additionalImages: s.additionalImages ? JSON.parse(s.additionalImages) : null,
        rating: s.rating !== null && s.rating !== undefined ? parseFloat(String(s.rating)) : undefined,
        reviewCount: s.reviewCount || 0,
        createdAt: s.createdAt,
        userId: s.userId,
      }))
    })
  } catch (error) {
    console.error('Chyba při načítání servisů:', error)
    return NextResponse.json(
      { message: 'Chyba při načítání servisů', services: [] },
      { status: 500 }
    )
  }
}

// POST - vytvoření nového servisu
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!(session?.user as any)?.id) {
      return NextResponse.json(
        { message: 'Neautorizovaný přístup. Musíte být přihlášeni.' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    
    // Získání dat z formuláře
    const name = sanitizeInput(formData.get('name') as string || '')
    const description = sanitizeInput(formData.get('description') as string || '')
    const location = sanitizeInput(formData.get('location') as string || '')
    const contactEmail = sanitizeInput(formData.get('contactEmail') as string || '')
    const contactPhone = sanitizeInput(formData.get('contactPhone') as string || '')
    
    // Validace povinných polí
    if (!name || !description || !location || !contactEmail) {
      return NextResponse.json(
        { message: 'Všechna povinná pole musí být vyplněna' },
        { status: 400 }
      )
    }

    // Validace emailu
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(contactEmail)) {
      return NextResponse.json(
        { message: 'Neplatný email' },
        { status: 400 }
      )
    }

    const userId = (session?.user as any)?.id
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Neautorizovaný přístup. Musíte být přihlášeni.' },
        { status: 401 }
      )
    }
    
    const id = randomBytes(16).toString('hex')
    const now = new Date()

    // Zpracování hlavní fotky
    let imagePath: string | null = null
    const imageFile = formData.get('image') as File | null

    if (imageFile && imageFile.size > 0) {
      try {
        // Validace velikosti (max 5MB)
        if (imageFile.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { message: 'Obrázek je příliš velký. Maximální velikost je 5MB.' },
            { status: 400 }
          )
        }

        // Validace typu
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
        if (!validTypes.includes(imageFile.type)) {
          return NextResponse.json(
            { message: 'Neplatný formát obrázku. Povolené formáty: JPEG, PNG, WEBP, GIF' },
            { status: 400 }
          )
        }

        // Vytvoření adresáře pokud neexistuje
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'services')
        await mkdir(uploadDir, { recursive: true })

        // Generování unikátního názvu souboru
        const timestamp = Date.now()
        const randomStr = randomBytes(8).toString('hex')
        const extension = imageFile.name.split('.').pop() || 'jpg'
        const fileName = `${timestamp}_${randomStr}.${extension}`
        const filePath = join(uploadDir, fileName)

        // Konverze File na Buffer a uložení
        const bytes = await imageFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        imagePath = `/uploads/services/${fileName}`
      } catch (error) {
        console.error('Chyba při ukládání obrázku:', error)
        return NextResponse.json(
          { message: 'Chyba při ukládání obrázku' },
          { status: 500 }
        )
      }
    }

    // Zpracování dodatečných fotek
    const additionalImages: string[] = []
    const additionalImageFiles = formData.getAll('additionalImages') as File[]

    if (additionalImageFiles && additionalImageFiles.length > 0) {
      try {
        // Validace počtu obrázků (max 10)
        if (additionalImageFiles.length > 10) {
          return NextResponse.json(
            { message: 'Můžete nahrát maximálně 10 dodatečných obrázků' },
            { status: 400 }
          )
        }

        const uploadDir = join(process.cwd(), 'public', 'uploads', 'services')
        await mkdir(uploadDir, { recursive: true })

        for (const imageFile of additionalImageFiles) {
          if (imageFile.size > 0) {
            // Validace velikosti (max 5MB)
            if (imageFile.size > 5 * 1024 * 1024) {
              return NextResponse.json(
                { message: 'Obrázek je příliš velký. Maximální velikost je 5MB.' },
                { status: 400 }
              )
            }

            // Validace typu
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
            if (!validTypes.includes(imageFile.type)) {
              return NextResponse.json(
                { message: 'Neplatný formát obrázku. Povolené formáty: JPEG, PNG, WEBP, GIF' },
                { status: 400 }
              )
            }

            // Generování unikátního názvu souboru
            const timestamp = Date.now()
            const randomStr = randomBytes(8).toString('hex')
            const extension = imageFile.name.split('.').pop() || 'jpg'
            const fileName = `${timestamp}_${randomStr}.${extension}`
            const filePath = join(uploadDir, fileName)

            // Konverze File na Buffer a uložení
            const bytes = await imageFile.arrayBuffer()
            const buffer = Buffer.from(bytes)
            await writeFile(filePath, buffer)

            additionalImages.push(`/uploads/services/${fileName}`)
          }
        }
      } catch (error) {
        console.error('Chyba při ukládání dodatečných obrázků:', error)
        return NextResponse.json(
          { message: 'Chyba při ukládání dodatečných obrázků' },
          { status: 500 }
        )
      }
    }

    // Vložení servisu do databáze
    await insert(
      `INSERT INTO services (
        id, name, description, location, contactEmail, contactPhone, 
        image, additionalImages, userId, isActive, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        description,
        location,
        contactEmail,
        contactPhone || null,
        imagePath,
        JSON.stringify(additionalImages),
        userId,
        false, // Servis čeká na schválení adminem
        now,
        now
      ]
    )

    return NextResponse.json({
      message: 'Servis byl úspěšně vytvořen a čeká na schválení administrátorem. Po schválení se zobrazí v sekci servisy.',
      serviceId: id
    })
  } catch (error: any) {
    console.error('Chyba při vytváření servisu:', error)
    
    // Kontrola duplicity
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { message: 'Servis s tímto názvem již existuje' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Chyba při vytváření servisu' },
      { status: 500 }
    )
  }
}

