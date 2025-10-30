const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')

const connectionConfig = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

async function initDatabase() {
  const connection = await mysql.createConnection({
    ...connectionConfig,
    database: 'mysql' // Připojení k mysql databázi pro vytvoření nové databáze
  })
  
  try {
    console.log('🔄 Inicializuji databázi...')
    
    // Přečtení SQL schématu
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Rozdělení na jednotlivé příkazy
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    // Vytvoření databáze a tabulek
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`📝 Spouštím: ${statement.substring(0, 50)}...`)
        await connection.execute(statement)
      }
    }
    
    console.log('✅ Databáze byla úspěšně inicializována!')
    
    // Kontrola vytvořených tabulek
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'burza_web'
    `)
    
    console.log('\n📋 Vytvořené tabulky:')
    tables.forEach(table => console.log(`- ${table.TABLE_NAME}`))
    
    // Kontrola sloupců v tabulce users
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'burza_web' 
      AND TABLE_NAME = 'users'
      ORDER BY ORDINAL_POSITION
    `)
    
    console.log('\n👤 Sloupce v tabulce users:')
    columns.forEach(col => {
      console.log(`- ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'} ${col.COLUMN_DEFAULT ? `DEFAULT ${col.COLUMN_DEFAULT}` : ''}`)
    })
    
  } catch (error) {
    console.error('❌ Chyba při inicializaci databáze:', error)
    throw error
  } finally {
    await connection.end()
  }
}

// Spuštění inicializace
initDatabase()
  .then(() => {
    console.log('🎉 Inicializace databáze dokončena!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Inicializace selhala:', error)
    process.exit(1)
  })
