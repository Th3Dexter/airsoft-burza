import mysql from 'mysql2/promise'

const connectionConfig = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'burza_web',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Create connection pool
const pool = mysql.createPool(connectionConfig)

export default pool

// Helper function to execute queries
export async function query(sql: string, params?: any[]) {
  const [rows] = await pool.execute(sql, params)
  return rows
}

// Helper function to get a single row
export async function queryOne(sql: string, params?: any[]) {
  const rows = await query(sql, params) as any[]
  return rows[0] || null
}

// Helper function to insert and get the inserted ID
export async function insert(sql: string, params?: any[]) {
  const [result] = await pool.execute(sql, params) as any
  return result.insertId
}

// Helper function to update/delete and get affected rows
export async function update(sql: string, params?: any[]) {
  const [result] = await pool.execute(sql, params) as any
  return result.affectedRows
}

