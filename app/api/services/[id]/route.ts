import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { queryOne, update } from '@/lib/mysql'
import { sanitizeInput } from '@/lib/utils'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { randomBytes } from 'crypto'
import { existsSync } from 'fs'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET - načtení detailu servisu
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

    const service = await queryOne(
      `SELECT 
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
        s.updatedAt,
        s.userId,
        u.name as userName,
        u.email as userEmail,
        u.image as userImage,
        u.isVerified as userIsVerified,
        u.reputation as userReputation
      FROM services s
      LEFT JOIN users u ON s.userId = u.id
      WHERE s.id = ? AND s.isActive = true`,
      [serviceId]
    )

    if (!service) {
      return NextResponse.json(
        { message: 'Servis nebyl nalezen' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: service.id,
      name: service.name,
      description: service.description,
      location: service.location,
      contactEmail: service.contactEmail,
      contactPhone: service.contactPhone,
      image: service.image,
      additionalImages: service.additionalImages ? JSON.parse(service.additionalImages) : null,
      rating: service.rating !== null && service.rating !== undefined 
        ? parseFloat(String(service.rating)) 
        : undefined,
      reviewCount: service.reviewCount || 0,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      userId: service.userId,
      userName: service.userName,
      userEmail: service.userEmail,
      userImage: service.userImage,
      userIsVerified: service.userIsVerified || false,
      userReputation: service.userReputation || 'NEUTRAL'
    })
  } catch (error) {
    console.error('Chyba při načítání servisu:', error)
    return NextResponse.json(
      { message: 'Chyba při načítání servisu' },
      { status: 500 }
    )
  }
}

// PATCH - úprava servisu
export async function PATCH(
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

    // Kontrola, zda je uživatel vlastníkem servisu
    const existingService = await queryOne(
      'SELECT * FROM services WHERE id = ? AND isActive = true',
      [serviceId]
    )

    if (!existingService) {
      return NextResponse.json(
        { message: 'Servis nebyl nalezen' },
        { status: 404 }
      )
    }

    if (existingService.userId !== userId) {
      return NextResponse.json(
        { message: 'Nemáte oprávnění upravovat tento servis' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const now = new Date()

    // Získání dat z formuláře (volitelné - pouze pokud jsou poskytnuty)
    const name = formData.get('name') ? sanitizeInput(formData.get('name') as string) : existingService.name
    const description = formData.get('description') ? sanitizeInput(formData.get('description') as string) : existingService.description
    const location = formData.get('location') ? sanitizeInput(formData.get('location') as string) : existingService.location
    const contactEmail = formData.get('contactEmail') ? sanitizeInput(formData.get('contactEmail') as string) : existingService.contactEmail
    const contactPhone = formData.get('contactPhone') ? sanitizeInput(formData.get('contactPhone') as string) : existingService.contactPhone

    // Validace emailu
    if (formData.get('contactEmail')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(contactEmail)) {
        return NextResponse.json(
          { message: 'Neplatný email' },
          { status: 400 }
        )
      }
    }

    // Validace povinných polí
    if (!name || !description || !location || !contactEmail) {
      return NextResponse.json(
        { message: 'Všechna povinná pole musí být vyplněna' },
        { status: 400 }
      )
    }

    // Zpracování hlavní fotky
    let mainImagePath: string | undefined = existingService.image
    const mainImageFile = formData.get('image') as File | null

    if (mainImageFile && mainImageFile.size > 0) {
      try {
        // Validace velikosti (max 5MB)
        if (mainImageFile.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { message: 'Obrázek je příliš velký. Maximální velikost je 5MB.' },
            { status: 400 }
          )
        }

        // Validace typu
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
        if (!validTypes.includes(mainImageFile.type)) {
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
        const extension = mainImageFile.name.split('.').pop() || 'jpg'
        const fileName = `${timestamp}_${randomStr}.${extension}`
        const filePath = join(uploadDir, fileName)

        // Konverze File na Buffer a uložení
        const bytes = await mainImageFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        mainImagePath = `/uploads/services/${fileName}`

        // Smazání starého obrázku
        if (existingService.image) {
          const oldImagePath = join(process.cwd(), 'public', existingService.image)
          if (existsSync(oldImagePath)) {
            try {
              await unlink(oldImagePath)
            } catch (e) {
              console.error(`Chyba při mazání starého obrázku:`, e)
            }
          }
        }
      } catch (error) {
        console.error('Chyba při ukládání obrázku:', error)
        return NextResponse.json(
          { message: 'Chyba při ukládání obrázku' },
          { status: 500 }
        )
      }
    }

    // Zpracování dodatečných fotek
    let additionalImages: string[] = []
    
    // Načtení stávajících dodatečných fotek
    if (existingService.additionalImages) {
      try {
        additionalImages = JSON.parse(existingService.additionalImages)
      } catch (e) {
        console.error('Chyba při parsování additionalImages:', e)
      }
    }

    // Pokud je poslán parametr 'keepImages', použijeme je
    const keepImagesParam = formData.get('keepImages')
    if (keepImagesParam) {
      try {
        const keepImagesArray = JSON.parse(keepImagesParam as string) as string[]
        additionalImages = keepImagesArray
      } catch (e) {
        console.error('Chyba při parsování keepImages:', e)
      }
    }

    // Přidání nových obrázků
    const additionalImageFiles = formData.getAll('additionalImages') as File[]
    if (additionalImageFiles && additionalImageFiles.length > 0) {
      try {
        // Validace počtu obrázků (max 10)
        const totalImagesCount = additionalImages.length + additionalImageFiles.length
        if (totalImagesCount > 10) {
          return NextResponse.json(
            { message: 'Můžete mít maximálně 10 dodatečných obrázků' },
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
        console.error('Chyba při ukládání obrázků:', error)
        return NextResponse.json(
          { message: 'Chyba při ukládání obrázků' },
          { status: 500 }
        )
      }
    }

    // Smazání obrázků, které uživatel chce odstranit
    const deleteImagesParam = formData.get('deleteImages')
    if (deleteImagesParam) {
      try {
        const deleteImagesArray = JSON.parse(deleteImagesParam as string) as string[]
        for (const imagePath of deleteImagesArray) {
          // Odebrat z pole
          additionalImages = additionalImages.filter(img => img !== imagePath)
          
          // Smazat soubor z disku
          const fullPath = join(process.cwd(), 'public', imagePath)
          if (existsSync(fullPath)) {
            try {
              await unlink(fullPath)
            } catch (e) {
              console.error(`Chyba při mazání obrázku ${imagePath}:`, e)
            }
          }
        }
      } catch (e) {
        console.error('Chyba při mazání obrázků:', e)
      }
    }

    // Aktualizace servisu v databázi
    await update(
      `UPDATE services SET 
        name = ?,
        description = ?,
        location = ?,
        contactEmail = ?,
        contactPhone = ?,
        image = ?,
        additionalImages = ?,
        updatedAt = ?
      WHERE id = ?`,
      [
        name,
        description,
        location,
        contactEmail,
        contactPhone || null,
        mainImagePath || null,
        JSON.stringify(additionalImages),
        now,
        serviceId
      ]
    )

    return NextResponse.json({
      message: 'Servis byl úspěšně upraven',
      serviceId: serviceId
    })
  } catch (error: any) {
    console.error('Chyba při úpravě servisu:', error)
    
    return NextResponse.json(
      { message: 'Chyba při úpravě servisu' },
      { status: 500 }
    )
  }
}


