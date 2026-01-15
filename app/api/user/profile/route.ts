import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, update } from '@/lib/mysql'
import { sanitizeInput } from '@/lib/utils'

// Force dynamic rendering - requires session data
export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!(session?.user as any)?.id) {
      return NextResponse.json(
        { message: 'Neautorizovaný přístup' },
        { status: 401 }
      )
    }

    const userId = (session!.user as any).id
    const body = await request.json()
    
    // Validace a sanitizace dat
    const { nickname, phone, city, bio } = body
    
    // Sanitizace vstupů
    const sanitizedNickname = nickname ? sanitizeInput(nickname) : null
    const sanitizedPhone = phone ? sanitizeInput(phone) : null
    const sanitizedCity = city ? sanitizeInput(city) : null
    const sanitizedBio = bio ? sanitizeInput(bio) : null

    // Validace přezdívky (volitelné, ale pokud je zadána, musí být kratší než 50 znaků)
    if (sanitizedNickname && sanitizedNickname.length > 50) {
      return NextResponse.json(
        { message: 'Přezdívka může mít maximálně 50 znaků' },
        { status: 400 }
      )
    }

    // Validace telefonu (volitelné, ale pokud je zadán, musí být validní)
    if (sanitizedPhone && !/^[\+]?[0-9\s\-\(\)]{9,15}$/.test(sanitizedPhone)) {
      return NextResponse.json(
        { message: 'Neplatný formát telefonního čísla' },
        { status: 400 }
      )
    }

    // Validace města (volitelné, ale pokud je zadáno, musí být kratší než 100 znaků)
    if (sanitizedCity && sanitizedCity.length > 100) {
      return NextResponse.json(
        { message: 'Název města může mít maximálně 100 znaků' },
        { status: 400 }
      )
    }

    // Validace bio (volitelné, ale pokud je zadáno, musí být kratší než 500 znaků)
    if (sanitizedBio && sanitizedBio.length > 500) {
      return NextResponse.json(
        { message: 'Popis může mít maximálně 500 znaků' },
        { status: 400 }
      )
    }

    // Kontrola, zda přezdívka už neexistuje (pokud je zadána)
    if (sanitizedNickname) {
      const existingUser = await query(
        'SELECT id FROM users WHERE nickname = ? AND id != ?',
        [sanitizedNickname, userId]
      )
      
      if (Array.isArray(existingUser) && existingUser.length > 0) {
        return NextResponse.json(
          { message: 'Tato přezdívka je již používána' },
          { status: 400 }
        )
      }
    }

    // Aktualizace profilu v databázi
    const updateFields = []
    const updateValues = []

    if (sanitizedNickname !== null) {
      updateFields.push('nickname = ?')
      updateValues.push(sanitizedNickname)
    }
    
    if (sanitizedPhone !== null) {
      updateFields.push('phone = ?')
      updateValues.push(sanitizedPhone)
    }
    
    if (sanitizedCity !== null) {
      updateFields.push('city = ?')
      updateValues.push(sanitizedCity)
    }
    
    if (sanitizedBio !== null) {
      updateFields.push('bio = ?')
      updateValues.push(sanitizedBio)
    }

    // Přidání updatedAt
    updateFields.push('updatedAt = NOW()')
    updateValues.push(userId)

    if (updateFields.length > 1) { // Více než jen updatedAt
      const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`
      const affectedRows = await update(sql, updateValues)

      if (affectedRows === 0) {
        return NextResponse.json(
          { message: 'Uživatel nebyl nalezen' },
          { status: 404 }
        )
      }

      // Získání aktualizovaných dat
      const updatedUser = await query(
        'SELECT id, name, email, image, phone, nickname, city, bio, isVerified, createdAt FROM users WHERE id = ?',
        [userId]
      )

      return NextResponse.json({
        message: 'Profil byl úspěšně aktualizován',
        user: Array.isArray(updatedUser) ? updatedUser[0] : null
      })
    } else {
      return NextResponse.json(
        { message: 'Žádné změny k uložení' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { message: 'Nastala chyba při aktualizaci profilu' },
      { status: 500 }
    )
  }
}

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

    // Získání dat uživatele
    const user = await query(
      'SELECT id, name, email, image, phone, nickname, city, bio, isVerified, createdAt FROM users WHERE id = ?',
      [userId]
    )

    if (!Array.isArray(user) || user.length === 0) {
      return NextResponse.json(
        { message: 'Uživatel nebyl nalezen' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user: Array.isArray(user) ? user[0] : null })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { message: 'Nastala chyba při načítání profilu' },
      { status: 500 }
    )
  }
}
