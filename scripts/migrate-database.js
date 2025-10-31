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
    
    // Kontrola existence sloupců v users
    const [userColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'burza_web' 
      AND TABLE_NAME = 'users'
    `)
    
    const existingUserColumns = userColumns.map(col => col.COLUMN_NAME)
    console.log('📋 Existující sloupce (users):', existingUserColumns)
    
    // Přidání chybějících sloupců (users)
    const userColumnsToAdd = [
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
    
    for (const column of userColumnsToAdd) {
      if (!existingUserColumns.includes(column.name)) {
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

    // Kontrola existence sloupců v products
    const [productColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'burza_web' 
      AND TABLE_NAME = 'products'
    `)
    const existingProductColumns = productColumns.map(col => col.COLUMN_NAME)
    console.log('📦 Existující sloupce (products):', existingProductColumns)

    // Přidání listingType do products
    if (!existingProductColumns.includes('listingType')) {
      console.log('➕ Přidávám sloupec: listingType do products')
      await connection.execute(`
        ALTER TABLE products 
        ADD COLUMN listingType ENUM('NABIZIM','SHANIM') NOT NULL DEFAULT 'NABIZIM' AFTER price
      `)
      console.log('✅ Sloupec listingType byl úspěšně přidán')
    } else {
      console.log('⏭️  Sloupec listingType již existuje')
    }
    
    // Přidání mainImage do products (hlavní obrázek produktu)
    if (!existingProductColumns.includes('mainImage')) {
      console.log('➕ Přidávám sloupec: mainImage do products')
      await connection.execute(`
        ALTER TABLE products 
        ADD COLUMN mainImage VARCHAR(512) NULL AFTER \`condition\`
      `)
      console.log('✅ Sloupec mainImage byl úspěšně přidán')
    } else {
      console.log('⏭️  Sloupec mainImage již existuje')
    }
    
    // Přidání viewCount do products (počet zobrazení produktu)
    if (!existingProductColumns.includes('viewCount')) {
      console.log('➕ Přidávám sloupec: viewCount do products')
      await connection.execute(`
        ALTER TABLE products 
        ADD COLUMN viewCount INT NOT NULL DEFAULT 0 AFTER isSold
      `)
      console.log('✅ Sloupec viewCount byl úspěšně přidán')
    } else {
      console.log('⏭️  Sloupec viewCount již existuje')
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
