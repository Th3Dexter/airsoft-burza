const mysql = require('mysql2/promise')

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

async function migrateDatabase() {
  const connection = await mysql.createConnection(connectionConfig)
  
  try {
    console.log('🔄 Spouštím migraci databáze...')
    
    // Kontrola existence sloupců
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'burza_web' 
      AND TABLE_NAME = 'users'
    `)
    
    const existingColumns = columns.map(col => col.COLUMN_NAME)
    console.log('📋 Existující sloupce:', existingColumns)
    
    // Přidání chybějících sloupců
    const columnsToAdd = [
      {
        name: 'nickname',
        definition: 'VARCHAR(191) NULL',
        description: 'Přezdívka uživatele'
      },
      {
        name: 'city',
        definition: 'VARCHAR(191) NULL',
        description: 'Město uživatele'
      },
      {
        name: 'bio',
        definition: 'TEXT NULL',
        description: 'Bio uživatele'
      },
      {
        name: 'reputation',
        definition: "ENUM('VERY_GOOD', 'GOOD', 'NEUTRAL', 'BAD', 'VERY_BAD') NOT NULL DEFAULT 'NEUTRAL'",
        description: 'Reputace uživatele'
      }
    ]
    
    for (const column of columnsToAdd) {
      if (!existingColumns.includes(column.name)) {
        console.log(`➕ Přidávám sloupec: ${column.name}`)
        await connection.execute(`
          ALTER TABLE users 
          ADD COLUMN ${column.name} ${column.definition}
        `)
        console.log(`✅ Sloupec ${column.name} byl úspěšně přidán`)
      } else {
        console.log(`⏭️  Sloupec ${column.name} již existuje`)
      }
    }
    
    console.log('🎉 Migrace databáze dokončena!')
    
  } catch (error) {
    console.error('❌ Chyba při migraci databáze:', error)
    throw error
  } finally {
    await connection.end()
  }
}

// Spuštění migrace
migrateDatabase()
  .then(() => {
    console.log('✅ Migrace byla úspěšně dokončena')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Migrace selhala:', error)
    process.exit(1)
  })
