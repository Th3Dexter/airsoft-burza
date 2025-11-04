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
      },
      {
        name: 'isAdmin',
        definition: 'BOOLEAN NOT NULL DEFAULT false',
        description: 'Administrátorské oprávnění'
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

    // Kontrola existence sloupců v conversations
    const [conversationColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'burza_web' 
      AND TABLE_NAME = 'conversations'
    `)
    
    const existingConversationColumns = conversationColumns.map(col => col.COLUMN_NAME)
    console.log('💬 Existující sloupce (conversations):', existingConversationColumns)

    // Přidání sloupců pro uzavření konverzace
    const conversationColumnsToAdd = [
      {
        name: 'closedById',
        definition: 'VARCHAR(191) NULL',
        description: 'ID uživatele, který uzavřel konverzaci'
      },
      {
        name: 'closeReason',
        definition: 'TEXT NULL',
        description: 'Důvod uzavření konverzace'
      },
      {
        name: 'closedAt',
        definition: 'DATETIME(3) NULL',
        description: 'Datum a čas uzavření konverzace'
      },
      {
        name: 'hiddenForUserId',
        definition: 'VARCHAR(191) NULL',
        description: 'ID uživatele, který skryl konverzaci (po kliknutí na Ok v notifikaci o uzavření)'
      }
    ]
    
    for (const column of conversationColumnsToAdd) {
      if (!existingConversationColumns.includes(column.name)) {
        console.log(`➕ Přidávám sloupec: ${column.name} do conversations`)
        await connection.execute(`
          ALTER TABLE conversations 
          ADD COLUMN ${column.name} ${column.definition}
        `)
        console.log(`✅ Sloupec ${column.name} byl úspěšně přidán`)
      } else {
        console.log(`⏭️  Sloupec ${column.name} již existuje`)
      }
    }
    
    // Kontrola existence tabulky services
    const [servicesTables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'burza_web' 
      AND TABLE_NAME = 'services'
    `)
    
    if (servicesTables.length === 0) {
      console.log('➕ Přidávám tabulku: services')
      await connection.execute(`
        CREATE TABLE services (
          id VARCHAR(191) PRIMARY KEY,
          name VARCHAR(191) NOT NULL,
          description TEXT NOT NULL,
          location VARCHAR(191) NOT NULL,
          contactEmail VARCHAR(191) NOT NULL,
          contactPhone VARCHAR(191),
          image VARCHAR(512),
          rating DECIMAL(3,2) DEFAULT NULL,
          reviewCount INT NOT NULL DEFAULT 0,
          isActive BOOLEAN NOT NULL DEFAULT true,
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updatedAt DATETIME(3) NOT NULL,
          userId VARCHAR(191) NOT NULL,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `)
      console.log('✅ Tabulka services byla úspěšně vytvořena')
    } else {
      console.log('⏭️  Tabulka services již existuje')
    }
    
    // Kontrola existence sloupců v services
    const [serviceColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'burza_web' 
      AND TABLE_NAME = 'services'
    `)
    
    const existingServiceColumns = serviceColumns.map(col => col.COLUMN_NAME)
    console.log('🔧 Existující sloupce (services):', existingServiceColumns)
    
    // Přidání sloupce additionalImages do services
    if (!existingServiceColumns.includes('additionalImages')) {
      console.log('➕ Přidávám sloupec: additionalImages do services')
      await connection.execute(`
        ALTER TABLE services 
        ADD COLUMN additionalImages JSON NULL AFTER image
      `)
      console.log('✅ Sloupec additionalImages byl úspěšně přidán')
    } else {
      console.log('⏭️  Sloupec additionalImages již existuje')
    }
    
    // Kontrola existence tabulky service_reviews
    const [reviewsTables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'burza_web' 
      AND TABLE_NAME = 'service_reviews'
    `)
    
    if (reviewsTables.length === 0) {
      console.log('➕ Přidávám tabulku: service_reviews')
      await connection.execute(`
        CREATE TABLE service_reviews (
          id VARCHAR(191) PRIMARY KEY,
          serviceId VARCHAR(191) NOT NULL,
          userId VARCHAR(191) NOT NULL,
          ratingSpeed INT NOT NULL CHECK (ratingSpeed >= 1 AND ratingSpeed <= 5),
          ratingQuality INT NOT NULL CHECK (ratingQuality >= 1 AND ratingQuality <= 5),
          ratingCommunication INT NOT NULL CHECK (ratingCommunication >= 1 AND ratingCommunication <= 5),
          ratingPrice INT NOT NULL CHECK (ratingPrice >= 1 AND ratingPrice <= 5),
          ratingOverall INT NOT NULL CHECK (ratingOverall >= 1 AND ratingOverall <= 5),
          comment TEXT,
          images JSON,
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updatedAt DATETIME(3) NOT NULL,
          FOREIGN KEY (serviceId) REFERENCES services(id) ON DELETE CASCADE,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY service_reviews_serviceId_userId_key (serviceId, userId)
        )
      `)
      console.log('✅ Tabulka service_reviews byla úspěšně vytvořena')
    } else {
      console.log('⏭️  Tabulka service_reviews již existuje')
    }
    
    // Kontrola existence tabulky reports
    const [reportsTables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'burza_web' 
      AND TABLE_NAME = 'reports'
    `)
    
    if (reportsTables.length === 0) {
      console.log('➕ Přidávám tabulku: reports')
      await connection.execute(`
        CREATE TABLE reports (
          id VARCHAR(191) PRIMARY KEY,
          type ENUM('BUG', 'FEATURE', 'SECURITY', 'OTHER') NOT NULL,
          title VARCHAR(200) NOT NULL,
          description TEXT NOT NULL,
          email VARCHAR(191),
          url VARCHAR(512),
          status ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
          userId VARCHAR(191),
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updatedAt DATETIME(3) NOT NULL,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
        )
      `)
      console.log('✅ Tabulka reports byla úspěšně vytvořena')
    } else {
      console.log('⏭️  Tabulka reports již existuje')
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
