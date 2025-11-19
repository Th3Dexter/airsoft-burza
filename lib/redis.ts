import Redis from 'ioredis'

let redisClient: Redis | null = null

function createRedisClient(): Redis | null {
  if (redisClient) return redisClient

  const url = process.env.REDIS_URL
  const host = process.env.REDIS_HOST

  if (!url && !host) {
    return null
  }

  if (url) {
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: false,
      connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT_MS || 5000),
    })
  } else {
    redisClient = new Redis({
      host,
      port: Number(process.env.REDIS_PORT || 6379),
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      tls: process.env.REDIS_TLS === '1' ? {} : undefined,
      maxRetriesPerRequest: 2,
      enableReadyCheck: false,
      connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT_MS || 5000),
    })
  }

  redisClient.on('error', (err) => {
    console.error('[Redis] Error:', err)
  })

  redisClient.on('reconnecting', () => {
    console.warn('[Redis] Reconnecting...')
  })

  return redisClient
}

export function getRedis() {
  return createRedisClient()
}

export async function getCache<T>(key: string): Promise<T | null> {
  const client = getRedis()
  if (!client) return null

  try {
    const value = await client.get(key)
    if (!value) return null
    return JSON.parse(value) as T
  } catch (error) {
    console.error(`[Redis] Nepodařilo se načíst klíč ${key}:`, error)
    return null
  }
}

export async function setCache(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
  const client = getRedis()
  if (!client) return

  try {
    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  } catch (error) {
    console.error(`[Redis] Nepodařilo se uložit klíč ${key}:`, error)
  }
}

export async function invalidateCacheByPrefix(prefix: string): Promise<void> {
  const client = getRedis()
  if (!client) return

  try {
    const stream = client.scanStream({
      match: `${prefix}*`,
      count: Number(process.env.REDIS_INVALIDATE_SCAN_COUNT || 100),
    })

    const pipeline = client.pipeline()

    stream.on('data', (keys: string[]) => {
      if (keys.length) {
        keys.forEach((key) => pipeline.del(key))
      }
    })

    await new Promise<void>((resolve, reject) => {
      stream.on('end', resolve)
      stream.on('error', reject)
    })

    await pipeline.exec()
  } catch (error) {
    console.error(`[Redis] Nepodařilo se invalidovat prefix ${prefix}:`, error)
  }
}

export async function disconnectRedis() {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}


