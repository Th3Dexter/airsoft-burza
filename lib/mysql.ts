import mysql, { PoolOptions } from 'mysql2/promise'

const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const baseConfig: PoolOptions = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseNumber(process.env.DB_PORT, 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'burza_web',
  waitForConnections: true,
  connectionLimit: parseNumber(process.env.DB_POOL_SIZE, 40),
  maxIdle: parseNumber(process.env.DB_POOL_IDLE, 20),
  idleTimeout: parseNumber(process.env.DB_POOL_IDLE_TIMEOUT_MS, 60_000),
  queueLimit: parseNumber(process.env.DB_QUEUE_LIMIT, 0),
  enableKeepAlive: process.env.DB_KEEP_ALIVE !== '0',
  keepAliveInitialDelay: parseNumber(process.env.DB_KEEP_ALIVE_DELAY_MS, 0),
  charset: 'utf8mb4',
}

const sslMode = process.env.DB_SSL_MODE?.toLowerCase()

if (sslMode && sslMode !== 'disabled') {
  baseConfig.ssl = {
    rejectUnauthorized: sslMode !== 'skip-verify',
  }
}

const pool = mysql.createPool(baseConfig)

export default pool

const MAX_RETRIES = parseNumber(process.env.DB_QUERY_MAX_RETRIES, 3)
const RETRY_BASE_DELAY_MS = parseNumber(process.env.DB_QUERY_RETRY_BASE_DELAY_MS, 50)

const recoverableErrorCodes = new Set<string>([
  'PROTOCOL_CONNECTION_LOST',
  'ECONNRESET',
  'ER_LOCK_DEADLOCK',
  'ER_LOCK_WAIT_TIMEOUT',
  'ER_CON_COUNT_ERROR',
  'ETIMEDOUT',
  'EPIPE',
  'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR',
  'PROTOCOL_ENQUEUE_HANDSHAKE_TWICE',
  'ER_SERVER_SHUTDOWN',
])

async function executeWithRetry<T>(fn: () => Promise<T>, attempt = 1): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    if (
      attempt < MAX_RETRIES &&
      (recoverableErrorCodes.has(error?.code) || error?.code === 'EAI_AGAIN')
    ) {
      const delay = Math.min(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1), 1000)
      await new Promise((resolve) => setTimeout(resolve, delay))
      return executeWithRetry(fn, attempt + 1)
    }
    throw error
  }
}

export async function query<T = any>(sql: string, params?: any[]) {
  const [rows] = await executeWithRetry(() => pool.execute(sql, params))
  return rows as T
}

export async function queryOne<T = any>(sql: string, params?: any[]) {
  const rows = (await query<T[]>(sql, params)) || []
  return (Array.isArray(rows) ? rows[0] : null) || null
}

export async function insert(sql: string, params?: any[]) {
  const [result] = await executeWithRetry(() => pool.execute(sql, params)) as any
  return result.insertId
}

export async function update(sql: string, params?: any[]) {
  const [result] = await executeWithRetry(() => pool.execute(sql, params)) as any
  return result.affectedRows
}

export async function healthCheck(timeoutMs = 2_000) {
  const pingPromise = (async () => {
    const connection = await pool.getConnection()
    try {
      await connection.ping()
    } finally {
      connection.release()
    }
  })()

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('DB health check timeout')), timeoutMs)
  )

  await Promise.race([pingPromise, timeoutPromise])
}

