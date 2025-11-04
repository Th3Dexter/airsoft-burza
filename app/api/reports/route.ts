import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { insert, query } from '@/lib/mysql'
import { sanitizeInput } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// POST - vytvoření nahlášení problému
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    
    const { type, title, description, email, url } = body

    // Validace povinných polí
    if (!type || !title || !description) {
      return NextResponse.json(
        { message: 'Typ, název a popis jsou povinné' },
        { status: 400 }
      )
    }

    // Validace typu
    const validTypes = ['BUG', 'FEATURE', 'SECURITY', 'OTHER']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { message: 'Neplatný typ problému' },
        { status: 400 }
      )
    }

    // Sanitizace vstupů
    const sanitizedTitle = sanitizeInput(title)
    const sanitizedDescription = sanitizeInput(description)
    const sanitizedEmail = email ? sanitizeInput(email) : null
    const sanitizedUrl = url ? sanitizeInput(url) : null

    // Validace délky
    if (sanitizedTitle.length > 200) {
      return NextResponse.json(
        { message: 'Název může mít maximálně 200 znaků' },
        { status: 400 }
      )
    }

    if (sanitizedDescription.length > 5000) {
      return NextResponse.json(
        { message: 'Popis může mít maximálně 5000 znaků' },
        { status: 400 }
      )
    }

    // Validace emailu (pokud je zadán)
    if (sanitizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      return NextResponse.json(
        { message: 'Neplatný formát emailu' },
        { status: 400 }
      )
    }

    const userId = session?.user ? (session.user as any).id : null
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()

    // Vytvoření nahlášení
    await insert(
      `INSERT INTO reports (id, type, title, description, email, url, userId, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
      [
        reportId,
        type,
        sanitizedTitle,
        sanitizedDescription,
        sanitizedEmail,
        sanitizedUrl,
        userId,
        now,
        now
      ]
    )

    return NextResponse.json({
      message: 'Problém byl úspěšně nahlášen. Děkujeme za vaši zpětnou vazbu.',
      reportId
    })
  } catch (error: any) {
    console.error('Error creating report:', error)
    
    return NextResponse.json(
      { message: 'Chyba při vytváření nahlášení' },
      { status: 500 }
    )
  }
}

