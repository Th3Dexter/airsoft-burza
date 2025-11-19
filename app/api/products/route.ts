import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, queryOne, insert } from '@/lib/mysql'
import { sanitizeInput } from '@/lib/utils'
import { storeFile } from '@/lib/storage'
import { getCache, setCache, invalidateCacheByPrefix } from '@/lib/redis'

// Force dynamic rendering - requires session data for POST
export const dynamic = 'force-dynamic'

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
    const priceRaw = formData.get('price')
    const listingTypeRaw = formData.get('listingType') as string
    
    if (!listingTypeRaw || (listingTypeRaw !== 'nabizim' && listingTypeRaw !== 'shanim')) {
      return NextResponse.json(
        { message: 'Musíte vybrat sekci (Nabídka nebo Poptávka)' },
        { status: 400 }
      )
    }
    const category = formData.get('category') as string
    const subcategory = sanitizeInput(formData.get('subcategory') as string || '')
    const condition = formData.get('condition') as string
    const location = formData.get('location') as string
    
    // Validace povinných polí
    if (!title || !description || !priceRaw || !category || !condition || !location) {
      return NextResponse.json(
        { message: 'Všechna povinná pole musí být vyplněna' },
        { status: 400 }
      )
    }
    
    const price = parseFloat(priceRaw as string)

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

    // Zpracování stavu - podpora pro custom stav
    let conditionValue: string | undefined = undefined
    if (condition.startsWith('custom-')) {
      // Vlastní stav - zachovat text
      const customText = condition.substring(7) // Odstranit "custom-" prefix
      if (!customText || customText.trim().length === 0) {
        return NextResponse.json(
          { message: 'Vyplňte vlastní stav produktu' },
          { status: 400 }
        )
      }
      conditionValue = sanitizeInput(customText)
      if (conditionValue.length > 20) {
        return NextResponse.json(
          { message: 'Vlastní stav může mít maximálně 20 znaků' },
          { status: 400 }
        )
      }
    } else {
      // Validace standardního stavu
      const validConditions = ['new', 'light-damage', 'major-damage', 'non-functional']
      if (!validConditions.includes(condition)) {
        return NextResponse.json(
          { message: 'Neplatný stav' },
          { status: 400 }
        )
      }
    }

    // Validace typu inzerátu (listingType) - už je validováno výše

    // Zpracování obrázků - hlavní obrázek se označí podle indexu z frontendu
    const images: string[] = []
    const imageFiles = formData.getAll('images') as File[]
    const mainImageIndexRaw = formData.get('mainImageIndex')
    const mainImageIndex = mainImageIndexRaw ? parseInt(mainImageIndexRaw as string, 10) : 0 // Default: první obrázek
    
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

    // Validace obrázků (s fallbackem dle přípony pro případy, kdy chybí MIME type)
    const allowedExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.heic', '.heif'])
    const allowedMimes = new Set(['image/png','image/jpeg','image/webp','image/gif','image/jpg','image/x-png','image/pjpeg','image/heic','image/heif','image/heic-sequence','image/heif-sequence','application/octet-stream','binary/octet-stream'])
    const getExtension = (name: string): string => {
      const m = (name || '').toLowerCase().match(/\.[a-z0-9]+$/)
      return m ? m[0] : ''
    }
    const sniffImage = async (f: File): Promise<boolean> => {
      try {
        const arr = new Uint8Array(await f.arrayBuffer())
        if (arr.length >= 8) {
          // PNG signature
          const isPng = arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47 && arr[4] === 0x0D && arr[5] === 0x0A && arr[6] === 0x1A && arr[7] === 0x0A
          if (isPng) return true
        }
        if (arr.length >= 3) {
          // JPEG signature FF D8 FF
          const isJpeg = arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF
          if (isJpeg) return true
        }
        if (arr.length >= 12) {
          // WEBP: RIFF....WEBP
          const riff = String.fromCharCode(arr[0],arr[1],arr[2],arr[3])
          const webp = String.fromCharCode(arr[8],arr[9],arr[10],arr[11])
          const isWebp = riff === 'RIFF' && webp === 'WEBP'
          if (isWebp) return true
        }
        if (arr.length >= 6) {
          // GIF87a or GIF89a
          const hdr = String.fromCharCode(arr[0],arr[1],arr[2],arr[3],arr[4],arr[5])
          if (hdr === 'GIF87a' || hdr === 'GIF89a') return true
        }
        if (arr.length >= 12) {
          // HEIC/HEIF brand in ftyp box
          const brand = String.fromCharCode(arr[8],arr[9],arr[10],arr[11])
          if (brand.toLowerCase().includes('heic') || brand.toLowerCase().includes('heif')) return true
        }
      } catch {}
      return false
    }
    const isImageFile = async (f: File): Promise<boolean> => {
      if (f.type && (f.type.startsWith('image/') || allowedMimes.has(f.type))) return true
      const ext = getExtension(f.name || '')
      if (allowedExtensions.has(ext)) return true
      return await sniffImage(f)
    }

    for (const file of imageFiles) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        return NextResponse.json(
          { message: `Obrázek ${file.name} je příliš velký (max 5MB)` },
          { status: 400 }
        )
      }
      
      if (!(await isImageFile(file))) {
        return NextResponse.json(
          { message: `Soubor ${file.name} není obrázek (podporované: PNG, JPG, JPEG, WEBP, GIF)` },
          { status: 400 }
        )
      }
    }

    // Uložení každého obrázku v původním pořadí - každý jen jednou
    let mainImagePath: string | null = null
    
    // Validace indexu hlavního obrázku - defaultně první (index 0)
    const validMainImageIndex = (mainImageIndex !== undefined && mainImageIndex !== null && mainImageIndex >= 0 && mainImageIndex < imageFiles.length) 
      ? mainImageIndex 
      : 0
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      
      // Přeskočit prázdné nebo neplatné soubory
      if (!file || file.size === 0) {
        console.warn(`[WARN] Přeskakuji prázdný nebo neplatný soubor na indexu ${i}`)
        continue
      }
      
      try {
        // Detekce přípony z názvu souboru - zachování původní přípony
        let fileExtension = getExtension(file.name || '')
        
        // Pokud není přípona v názvu, zkus detekovat z MIME type
        if (!fileExtension || fileExtension === '') {
          if (file.type) {
            if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
              fileExtension = '.jpg'
            } else if (file.type === 'image/png') {
              fileExtension = '.png'
            } else if (file.type === 'image/webp') {
              fileExtension = '.webp'
            } else if (file.type === 'image/gif') {
              fileExtension = '.gif'
            } else if (file.type === 'image/heic' || file.type === 'image/heif') {
              fileExtension = '.heic'
            }
          }
        }
        
        // Pokud stále není přípona, použij .jpg jako fallback
        if (!fileExtension || fileExtension === '') {
          fileExtension = '.jpg'
        }
        
        // Normalizace .jpeg -> .jpg pro konzistenci
        if (fileExtension.toLowerCase() === '.jpeg') {
          fileExtension = '.jpg'
        }
        
        // Vytvoření unikátního názvu souboru
        const randomString = Math.random().toString(36).substring(2, 15)
        const fileName = `${baseTimestamp}_${i}_${randomString}${fileExtension}`
        const filePath = join(uploadsDir, fileName)
        
        // Konverze File na Buffer a uložení - validace před uložením
        const bytes = await file.arrayBuffer()
        if (bytes.byteLength === 0) {
          console.warn(`[WARN] Přeskakuji prázdný soubor: ${file.name}`)
          continue
        }
        
        const buffer = Buffer.from(bytes)
        const storedFile = await storeFile(
          buffer,
          file.name || `image_${i}${fileExtension}`,
          'products'
        )
        
        const savedPath = storedFile.url
        images.push(savedPath)
        
        // Nastavit hlavní obrázek podle indexu z frontendu (nebo první pokud není vybrán)
        if (i === validMainImageIndex) {
          mainImagePath = savedPath
        }
      } catch (error) {
        console.error(`Chyba při ukládání obrázku ${file.name || `index ${i}`}:`, error)
        // Pokračovat s dalšími obrázky místo ukončení
        continue
      }
    }
    
    // Validace - musí být alespoň jeden obrázek
    if (images.length === 0) {
      return NextResponse.json(
        { message: 'Nepodařilo se uložit žádný obrázek' },
        { status: 400 }
      )
    }
    
    // Pokud nebyl hlavní obrázek nastaven (např. kvůli chybě), použij první
    if (!mainImagePath && images.length > 0) {
      mainImagePath = images[0]
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
      'light-damage': 'LIGHT_DAMAGE',
      'major-damage': 'MAJOR_DAMAGE',
      'non-functional': 'NON_FUNCTIONAL'
    }

    // Zpracování stavu pro uložení
    let finalCondition: string
    if (condition.startsWith('custom-') && conditionValue !== undefined) {
      finalCondition = conditionValue // Použít vlastní text
    } else {
      finalCondition = conditionMap[condition]
    }

    // Generování unikátního ID pro produkt
    const productId = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Vytvoření produktu v databázi
    await insert(
      `INSERT INTO products (id, title, description, price, listingType, category, subcategory, \`condition\`, mainImage, images, location, userId, isActive, isSold, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        productId,              // 1. id
        title,                  // 2. title
        description,            // 3. description
        price,                  // 4. price
        // Explicitní mapování: nabizim -> NABIZIM (Nabídka), shanim -> SHANIM (Poptávka)
        listingTypeRaw === 'nabizim' ? 'NABIZIM' : 'SHANIM',  // 5. listingType
        categoryMap[category],   // 6. category
        subcategory || null,     // 7. subcategory
        finalCondition,         // 8. condition
        mainImagePath,          // 9. mainImage
        JSON.stringify(images), // 10. images
        location,               // 11. location
        (session!.user as any).id, // 12. userId
        true,                   // 13. isActive
        false                   // 14. isSold
        // createdAt a updatedAt jsou NOW() v SQL
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

    await invalidateCacheByPrefix('products:list:')
    await invalidateCacheByPrefix('stats:summary')

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
    const cacheKey = getProductsCacheKey(searchParams)
    const cacheTtl = Number(process.env.PRODUCTS_CACHE_TTL_SECONDS || 60)

    if (cacheTtl > 0) {
      const cachedResponse = await getCache<{ products: any[]; pagination: any }>(cacheKey)
      if (cachedResponse) {
        return NextResponse.json(cachedResponse)
      }
    }
    
    // Získání parametrů pro filtrování a stránkování
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const listingType = searchParams.get('listingType') // 'nabizim' | 'shanim'
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
      // Zajistit, že category je v mapě před přidáním podmínky
      const mappedCategory = categoryMap[category.toLowerCase().trim()]
      if (mappedCategory) {
        whereConditions.push('p.category = ?')
        params.push(mappedCategory)
      }
    }

    if (listingType) {
      const lt = listingType === 'shanim' ? 'SHANIM' : 'NABIZIM'
      whereConditions.push('p.listingType = ?')
      params.push(lt)
    }

    if (search) {
      // Použít case-insensitive vyhledávání pomocí LOWER() pro lepší kompatibilitu
      whereConditions.push('(LOWER(p.title) LIKE LOWER(?) OR LOWER(p.description) LIKE LOWER(?) OR LOWER(p.subcategory) LIKE LOWER(?))')
      const searchTerm = `%${search.trim()}%`
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
        'light-damage': 'LIGHT_DAMAGE',
        'major-damage': 'MAJOR_DAMAGE',
        'non-functional': 'NON_FUNCTIONAL'
      }
      const mappedCondition = conditionMap[condition]
      if (mappedCondition) {
        whereConditions.push('p.`condition` = ?')
        params.push(mappedCondition)
      }
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
      `SELECT p.*, u.id as userId, u.name as userName, u.email as userEmail, u.image as userImage, u.isVerified as userIsVerified, COALESCE(p.viewCount, 0) as viewCount
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

    // Mapování pro zobrazení
    const categoryMapDisplay: { [key: string]: string } = {
      'AIRSOFT_WEAPONS': 'Airsoft zbraně',
      'MILITARY_EQUIPMENT': 'Military vybavení',
      'OTHER': 'Ostatní'
    }

    const conditionMapDisplay: { [key: string]: string } = {
      'NEW': 'Nový',
      'LIGHT_DAMAGE': 'Lehké poškození',
      'MAJOR_DAMAGE': 'Větší poškození',
      'NON_FUNCTIONAL': 'Nefunkční'
    }

    // Transformace dat pro frontend
    const transformedProducts = Array.isArray(products) ? products.map((product: any) => {
      // Parsování obrázků
      let images: string[] = []
      try {
        if (product.images) {
          if (typeof product.images === 'string') {
            const parsed = JSON.parse(product.images)
            images = Array.isArray(parsed) ? parsed : []
          } else if (Array.isArray(product.images)) {
            images = product.images
          }
          // Filtrovat pouze validní stringy
          images = images.filter((img: any) => img && typeof img === 'string' && img.trim().length > 0)
        }
      } catch (e) {
        images = []
      }

      return {
        ...product,
        images,
        price: parseFloat(product.price) || 0,
        viewCount: parseInt(product.viewCount) || 0,
        category: categoryMapDisplay[product.category] || product.category,
        condition: conditionMapDisplay[product.condition] || product.condition
      }
    }) : []

    const responsePayload = {
      products: transformedProducts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }

    if (cacheTtl > 0) {
      await setCache(cacheKey, responsePayload, cacheTtl)
    }

    return NextResponse.json(responsePayload)

  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json(
      { message: 'Nastala chyba při načítání produktů' },
      { status: 500 }
    )
  }
}

function getProductsCacheKey(searchParams: URLSearchParams) {
  const entries = Array.from(searchParams.entries())
    .map(([key, value]) => [key, value ?? ''] as const)
    .sort(([a], [b]) => a.localeCompare(b))

  const serialized = entries.map(([key, value]) => `${key}=${value}`).join('&')
  return `products:list:${serialized}`
}