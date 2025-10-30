import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, update, queryOne } from '@/lib/mysql'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!(session?.user as any)?.id) {
      return NextResponse.json(
        { message: 'Neautorizovaný přístup' },
        { status: 401 }
      )
    }

    const productId = params.id
    const userId = (session!.user as any).id

    // Kontrola, zda inzerát patří uživateli
    const product = await queryOne(
      'SELECT id, userId FROM products WHERE id = ?',
      [productId]
    )

    if (!product) {
      return NextResponse.json(
        { message: 'Inzerát nebyl nalezen' },
        { status: 404 }
      )
    }

    if (product.userId !== userId) {
      return NextResponse.json(
        { message: 'Nemáte oprávnění smazat tento inzerát' },
        { status: 403 }
      )
    }

    // Smazání inzerátu
    const affectedRows = await update(
      'DELETE FROM products WHERE id = ?',
      [productId]
    )

    if (affectedRows === 0) {
      return NextResponse.json(
        { message: 'Inzerát nebyl nalezen' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Inzerát byl úspěšně smazán'
    })

  } catch (error) {
    console.error('Product delete error:', error)
    return NextResponse.json(
      { message: 'Nastala chyba při mazání inzerátu' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!(session?.user as any)?.id) {
      return NextResponse.json(
        { message: 'Neautorizovaný přístup' },
        { status: 401 }
      )
    }

    const productId = params.id
    const userId = (session!.user as any).id
    const body = await request.json()

    // Kontrola, zda inzerát patří uživateli
    const product = await queryOne(
      'SELECT id, userId FROM products WHERE id = ?',
      [productId]
    )

    if (!product) {
      return NextResponse.json(
        { message: 'Inzerát nebyl nalezen' },
        { status: 404 }
      )
    }

    if (product.userId !== userId) {
      return NextResponse.json(
        { message: 'Nemáte oprávnění upravit tento inzerát' },
        { status: 403 }
      )
    }

    // Příprava aktualizace
    const updateFields = []
    const updateValues = []

    if (body.isActive !== undefined) {
      updateFields.push('isActive = ?')
      updateValues.push(body.isActive)
    }

    if (body.isSold !== undefined) {
      updateFields.push('isSold = ?')
      updateValues.push(body.isSold)
    }

    if (body.title) {
      updateFields.push('title = ?')
      updateValues.push(body.title)
    }

    if (body.description) {
      updateFields.push('description = ?')
      updateValues.push(body.description)
    }

    if (body.price !== undefined) {
      updateFields.push('price = ?')
      updateValues.push(body.price)
    }

    if (body.category) {
      updateFields.push('category = ?')
      updateValues.push(body.category)
    }

    if (body.subcategory !== undefined) {
      updateFields.push('subcategory = ?')
      updateValues.push(body.subcategory)
    }

    if (body.condition) {
      updateFields.push('`condition` = ?')
      updateValues.push(body.condition)
    }

    if (body.location) {
      updateFields.push('location = ?')
      updateValues.push(body.location)
    }

    if (body.images) {
      updateFields.push('images = ?')
      updateValues.push(JSON.stringify(body.images))
    }

    // Přidání updatedAt
    updateFields.push('updatedAt = NOW()')
    updateValues.push(productId)

    if (updateFields.length > 1) { // Více než jen updatedAt
      const sql = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`
      const affectedRows = await update(sql, updateValues)

      if (affectedRows === 0) {
        return NextResponse.json(
          { message: 'Inzerát nebyl nalezen' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        message: 'Inzerát byl úspěšně aktualizován'
      })
    } else {
      return NextResponse.json(
        { message: 'Žádné změny k uložení' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json(
      { message: 'Nastala chyba při aktualizaci inzerátu' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id

    // Načtení inzerátu
    const product = await queryOne(
      `SELECT p.*, u.id as userId, u.name as userName, u.email as userEmail, u.image as userImage, u.nickname as userNickname, u.isVerified as userIsVerified, u.reputation as userReputation
       FROM products p 
       JOIN users u ON p.userId = u.id 
       WHERE p.id = ?`,
      [productId]
    )

    if (!product) {
      return NextResponse.json(
        { message: 'Inzerát nebyl nalezen' },
        { status: 404 }
      )
    }

    // Mapování kategorií a stavů
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

    // Transformace dat
    const transformedProduct = {
      ...product,
      category: categoryMap[product.category] || product.category,
      condition: conditionMap[product.condition] || product.condition,
      images: product.images ? JSON.parse(product.images) : [],
      price: parseFloat(product.price)
    }

    return NextResponse.json(transformedProduct)

  } catch (error) {
    console.error('Product fetch error:', error)
    return NextResponse.json(
      { message: 'Nastala chyba při načítání inzerátu' },
      { status: 500 }
    )
  }
}
