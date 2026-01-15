import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import { getCache, setCache } from '@/lib/redis'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const cacheKey = 'stats:summary'
    const cacheTtl = Number(process.env.STATS_CACHE_TTL_SECONDS || 120)

    if (cacheTtl > 0) {
      const cached = await getCache<any>(cacheKey)
      if (cached) {
        return NextResponse.json(cached)
      }
    }

    // Celkový počet aktivních inzerátů (nabízím)
    const [totalActive] = await query(
      `SELECT COUNT(*) as count FROM products WHERE listingType = 'NABIZIM' AND isSold = 0`
    ) as any[]

    // Počet nových inzerátů za posledních 24h (nabízím)
    const [newLast24h] = await query(
      `SELECT COUNT(*) as count FROM products 
       WHERE listingType = 'NABIZIM' 
       AND createdAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
       AND isSold = 0`
    ) as any[]

    // Počet nových inzerátů za posledních 7 dní (nabízím)
    const [newLast7d] = await query(
      `SELECT COUNT(*) as count FROM products 
       WHERE listingType = 'NABIZIM' 
       AND createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       AND isSold = 0`
    ) as any[]

    // Počet nových inzerátů za posledních 30 dní (nabízím)
    const [newLast30d] = await query(
      `SELECT COUNT(*) as count FROM products 
       WHERE listingType = 'NABIZIM' 
       AND createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       AND isSold = 0`
    ) as any[]

    // Celkový počet zobrazení všech produktů
    const [totalViews] = await query(
      `SELECT SUM(viewCount) as total FROM products WHERE listingType = 'NABIZIM'`
    ) as any[]

    // Průměrný počet zobrazení na produkt
    const avgViews = totalActive.count > 0 
      ? Math.round((totalViews.total || 0) / totalActive.count)
      : 0

    // Počet aktivních prodejců (uživatelé s alespoň jedním aktivním inzerátem)
    const [activeSellers] = await query(
      `SELECT COUNT(DISTINCT userId) as count FROM products 
       WHERE listingType = 'NABIZIM' AND isSold = 0`
    ) as any[]

    const payload = {
      totalActive: parseInt(totalActive.count) || 0,
      newLast24h: parseInt(newLast24h.count) || 0,
      newLast7d: parseInt(newLast7d.count) || 0,
      newLast30d: parseInt(newLast30d.count) || 0,
      totalViews: parseInt(totalViews.total) || 0,
      avgViews,
      activeSellers: parseInt(activeSellers.count) || 0,
    }

    if (cacheTtl > 0) {
      await setCache(cacheKey, payload, cacheTtl)
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json(
      { 
        totalActive: 0,
        newLast24h: 0,
        newLast7d: 0,
        newLast30d: 0,
        totalViews: 0,
        avgViews: 0,
        activeSellers: 0,
      },
      { status: 500 }
    )
  }
}
