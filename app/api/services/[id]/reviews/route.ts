import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, queryOne, insert, update } from '@/lib/mysql'
import { sanitizeInput } from '@/lib/utils'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomBytes } from 'crypto'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET - načtení recenzí servisu
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = params.id

    if (!serviceId) {
      return NextResponse.json(
        { message: 'ID servisu je vyžadováno' },
        { status: 400 }
      )
    }

    // Načtení všech recenzí pro daný servis
    const reviews = await query(`
      SELECT 
        sr.id,
        sr.serviceId,
        sr.userId,
        sr.ratingSpeed,
        sr.ratingQuality,
        sr.ratingCommunication,
        sr.ratingPrice,
        sr.ratingOverall,
        sr.comment,
        sr.images,
        sr.createdAt,
        sr.updatedAt,
        u.name as userName,
        u.image as userImage,
        (SELECT COUNT(*) FROM service_reviews WHERE userId = sr.userId) as userReviewCount
      FROM service_reviews sr
      LEFT JOIN users u ON sr.userId = u.id
      WHERE sr.serviceId = ?
      ORDER BY sr.createdAt DESC
    `, [serviceId])

    return NextResponse.json({ reviews: reviews as any[] })
  } catch (error) {
    console.error('Chyba při načítání recenzí:', error)
    return NextResponse.json(
      { message: 'Chyba při načítání recenzí' },
      { status: 500 }
    )
  }
}

// POST - vytvoření nové recenze
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!(session?.user as any)?.id) {
      return NextResponse.json(
        { message: 'Neautorizovaný přístup. Musíte být přihlášeni.' },
        { status: 401 }
      )
    }

    const serviceId = params.id
    const userId = (session?.user as any)?.id
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Neautorizovaný přístup. Musíte být přihlášeni.' },
        { status: 401 }
      )
    }

    // Kontrola, zda servis existuje
    const service = await queryOne(
      'SELECT id FROM services WHERE id = ? AND isActive = true',
      [serviceId]
    )

    if (!service) {
      return NextResponse.json(
        { message: 'Servis nebyl nalezen' },
        { status: 404 }
      )
    }

    // Kontrola, zda uživatel již recenzi napsal
    const existingReview = await queryOne(
      'SELECT id FROM service_reviews WHERE serviceId = ? AND userId = ?',
      [serviceId, userId]
    )

    if (existingReview) {
      return NextResponse.json(
        { message: 'Recenzi již jste napsal pro tento servis' },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    
    // Získání dat z formuláře
    const ratingSpeed = parseInt(formData.get('ratingSpeed') as string)
    const ratingQuality = parseInt(formData.get('ratingQuality') as string)
    const ratingCommunication = parseInt(formData.get('ratingCommunication') as string)
    const ratingPrice = parseInt(formData.get('ratingPrice') as string)
    const ratingOverall = parseInt(formData.get('ratingOverall') as string)
    const comment = sanitizeInput(formData.get('comment') as string || '')
    
    // Validace hodnocení
    const ratings = [ratingSpeed, ratingQuality, ratingCommunication, ratingPrice, ratingOverall]
    if (ratings.some(r => !r || r < 1 || r > 5)) {
      return NextResponse.json(
        { message: 'Všechna hodnocení musí být mezi 1 a 5 hvězdičkami' },
        { status: 400 }
      )
    }

    const id = randomBytes(16).toString('hex')
    const now = new Date()

    // Zpracování obrázků
    const imageFiles = formData.getAll('images') as File[]
    const imagePaths: string[] = []

    if (imageFiles && imageFiles.length > 0) {
      try {
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'reviews')
        await mkdir(uploadDir, { recursive: true })

        for (const imageFile of imageFiles) {
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

            imagePaths.push(`/uploads/reviews/${fileName}`)
          }
        }
      } catch (error) {
        console.error('Chyba při ukládání obrázků:', error)
        return NextResponse.json(
          { message: 'Chyba při ukládání obrázků' },
          { status: 500 }
        )
      }
    }

    // Vložení recenze do databáze
    await insert(
      `INSERT INTO service_reviews (
        id, serviceId, userId, ratingSpeed, ratingQuality, ratingCommunication,
        ratingPrice, ratingOverall, comment, images, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        serviceId,
        userId,
        ratingSpeed,
        ratingQuality,
        ratingCommunication,
        ratingPrice,
        ratingOverall,
        comment || null,
        JSON.stringify(imagePaths),
        now,
        now
      ]
    )

    // Přepočítání průměrného hodnocení servisu
    const avgRatings = await queryOne(
      `SELECT 
        AVG(ratingOverall) as avgRating
      FROM service_reviews
      WHERE serviceId = ?`,
      [serviceId]
    )

    const avgRating = avgRatings.avgRating ? parseFloat(avgRatings.avgRating) : null

    // Počet recenzí
    const reviewCountResult = await queryOne(
      'SELECT COUNT(*) as count FROM service_reviews WHERE serviceId = ?',
      [serviceId]
    )
    const reviewCount = reviewCountResult.count || 0

    // Aktualizace servisu
    await update(
      'UPDATE services SET rating = ?, reviewCount = ?, updatedAt = ? WHERE id = ?',
      [avgRating, reviewCount, now, serviceId]
    )

    return NextResponse.json({
      message: 'Recenze byla úspěšně přidána',
      reviewId: id
    })
  } catch (error: any) {
    console.error('Chyba při vytváření recenze:', error)
    
    return NextResponse.json(
      { message: 'Chyba při vytváření recenze' },
      { status: 500 }
    )
  }
}

