import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { queryOne, insert } from '@/lib/mysql'
import { validateEmail, validatePhone, sanitizeInput } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, password } = body

    // Validace vstupů
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Jméno, email a heslo jsou povinné' },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { message: 'Neplatný email' },
        { status: 400 }
      )
    }

    if (phone && !validatePhone(phone)) {
      return NextResponse.json(
        { message: 'Neplatné telefonní číslo' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Heslo musí mít alespoň 8 znaků' },
        { status: 400 }
      )
    }

    // Sanitizace vstupů
    const sanitizedName = sanitizeInput(name)
    const sanitizedEmail = sanitizeInput(email)
    const sanitizedPhone = phone ? sanitizeInput(phone) : null

    // Kontrola, zda uživatel již existuje
    const existingUser = await queryOne(
      'SELECT id FROM users WHERE email = ?',
      [sanitizedEmail]
    )

    if (existingUser) {
      return NextResponse.json(
        { message: 'Uživatel s tímto emailem již existuje' },
        { status: 400 }
      )
    }

    // Hash hesla
    const hashedPassword = await bcrypt.hash(password, 12)

    // Vytvoření uživatele
    const userId = await insert(
      `INSERT INTO users (name, email, phone, password, isVerified, isBanned, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        sanitizedName,
        sanitizedEmail,
        sanitizedPhone,
        hashedPassword,
        false,
        false
      ]
    )

    // Získání vytvořeného uživatele
    const user = await queryOne(
      'SELECT id, name, email, phone, createdAt FROM users WHERE id = ?',
      [userId]
    )

    return NextResponse.json(
      { 
        message: 'Účet byl úspěšně vytvořen',
        user 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Nastala chyba při vytváření účtu' },
      { status: 500 }
    )
  }
}