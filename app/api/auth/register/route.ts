import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { queryOne, insert } from '@/lib/mysql'
import { validateEmail, validatePhone, sanitizeInput } from '@/lib/utils'

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { message: 'Registrace je dostupná pouze přes Google účet' },
    { status: 403 }
  )
}