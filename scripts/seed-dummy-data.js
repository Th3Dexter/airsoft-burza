const mysql = require('mysql2/promise')

const connectionConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'burza_web',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_SIZE || 10),
  queueLimit: 0,
}

const users = [
  {
    id: 'user_demo_1',
    name: 'Demo Prodejce 1',
    email: 'demo1@example.com',
    image: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200&auto=format&fit=crop&q=80',
    reputation: 'GOOD',
    isVerified: true,
    isAdmin: false,
  },
  {
    id: 'user_demo_2',
    name: 'Demo Prodejce 2',
    email: 'demo2@example.com',
    image: 'https://images.unsplash.com/photo-1546525848-3ce03ca516f6?w=200&auto=format&fit=crop&q=80',
    reputation: 'VERY_GOOD',
    isVerified: true,
    isAdmin: false,
  },
  {
    id: 'user_demo_3',
    name: 'Demo Servisák',
    email: 'demo.service@example.com',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    reputation: 'GOOD',
    isVerified: true,
    isAdmin: false,
  },
]

const products = [
  {
    id: 'product_demo_aeg_m4',
    title: 'Airsoft AEG M4 - plně upgradená',
    description: 'Elektrická M4 s mosfetem, precizní hlavní a pružinou M120. Skvělá kadence, připravená na hru.',
    price: 4800,
    listingType: 'NABIZIM',
    category: 'AIRSOFT_WEAPONS',
    subcategory: 'AEG',
    condition: 'LIGHT_DAMAGE',
    mainImage: 'https://images.unsplash.com/photo-1613384000954-5e1b612821b5?w=900&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1613384000954-5e1b612821b5?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&auto=format&fit=crop&q=80',
    ],
    location: 'Praha',
    viewCount: 128,
    userId: 'user_demo_1',
  },
  {
    id: 'product_demo_ghillie',
    title: 'Ghillie suit woodland (kompletní set)',
    description: 'Kompletní ghillie suit woodland, použitý dvakrát. Součástí jsou kalhoty, bunda i kapuce.',
    price: 2200,
    listingType: 'NABIZIM',
    category: 'MILITARY_EQUIPMENT',
    subcategory: 'maskovani',
    condition: 'GOOD',
    mainImage: 'https://images.unsplash.com/photo-1594610431027-3ff197b5f6d6?w=900&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1594610431027-3ff197b5f6d6?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1523875194681-bedd468c58bf?w=900&auto=format&fit=crop&q=80',
    ],
    location: 'Brno',
    viewCount: 76,
    userId: 'user_demo_2',
  },
  {
    id: 'product_demo_grenady',
    title: 'Sada CO2 granátů + launcher',
    description: 'Tři CO2 granáty s launcherem, ideální pro CQB. V ceně rychloplnička a náhradní těsnění.',
    price: 3100,
    listingType: 'NABIZIM',
    category: 'OTHER',
    subcategory: 'vybaveni',
    condition: 'NEW',
    mainImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=900&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502489597346-dad15683d420?w=900&auto=format&fit=crop&q=80',
    ],
    location: 'Ostrava',
    viewCount: 54,
    userId: 'user_demo_1',
  },
  {
    id: 'product_demo_shanim_p90',
    title: 'Sháním P90 Tokyo Marui',
    description: 'Koupím P90 od Tokyo Marui v dobrém stavu. Preferuji osobní předání v Brně.',
    price: 0,
    listingType: 'SHANIM',
    category: 'AIRSOFT_WEAPONS',
    subcategory: 'SMG',
    condition: 'GOOD',
    mainImage: 'https://images.unsplash.com/photo-1612810806695-30ba0fda3f7b?w=900&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1612810806695-30ba0fda3f7b?w=900&auto=format&fit=crop&q=80',
    ],
    location: 'Brno',
    viewCount: 33,
    userId: 'user_demo_2',
  },
]

const services = [
  {
    id: 'service_demo_upgrade',
    name: 'Airsoft Upgrade Praha',
    description: 'Profesionální upgrade a servis AEG i GBB. Diagnostika, mosfety, precizní hlavně i lakování.',
    location: 'Praha',
    contactEmail: 'servis@airsoft-upgrade.cz',
    contactPhone: '+420777111222',
    image: 'https://images.unsplash.com/photo-1525182008055-f88b95ff7980?w=900&auto=format&fit=crop&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&auto=format&fit=crop&q=80',
    ],
    rating: 4.8,
    reviewCount: 42,
    isActive: true,
    userId: 'user_demo_3',
  },
  {
    id: 'service_demo_paintball',
    name: 'Taktické lakování zbraní',
    description: 'Custom hydro dipping, cerakote a airbrush pro airsoft zbraně i příslušenství. Individuální design.',
    location: 'Plzeň',
    contactEmail: 'info@tacticpaint.cz',
    contactPhone: '+420602333444',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=900&auto=format&fit=crop&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1529927066849-66e1c4ebab9a?w=900&auto=format&fit=crop&q=80',
    ],
    rating: 4.6,
    reviewCount: 18,
    isActive: true,
    userId: 'user_demo_3',
  },
]

async function seedUsers(connection) {
  console.log('👥 Sázím ukázkové uživatele...')
  for (const user of users) {
    await connection.execute(
      `
        INSERT INTO users (id, name, email, image, reputation, isVerified, isAdmin, isBanned, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          image = VALUES(image),
          reputation = VALUES(reputation),
          isVerified = VALUES(isVerified),
          isAdmin = VALUES(isAdmin),
          updatedAt = NOW()
      `,
      [
        user.id,
        user.name,
        user.email,
        user.image,
        user.reputation,
        user.isVerified ? 1 : 0,
        user.isAdmin ? 1 : 0,
      ]
    )
  }
  console.log(`✅ Uživatelé připraveni (${users.length})`)
}

async function seedProducts(connection) {
  console.log('🛒 Sázím ukázkové inzeráty...')
  for (const product of products) {
    await connection.execute(
      `
        INSERT INTO products (
          id, title, description, price, listingType, category, subcategory, \`condition\`,
          mainImage, images, location, isActive, isSold, viewCount, createdAt, updatedAt, userId
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?, NOW(), NOW(), ?)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          description = VALUES(description),
          price = VALUES(price),
          listingType = VALUES(listingType),
          category = VALUES(category),
          subcategory = VALUES(subcategory),
          \`condition\` = VALUES(\`condition\`),
          mainImage = VALUES(mainImage),
          images = VALUES(images),
          location = VALUES(location),
          isActive = VALUES(isActive),
          isSold = VALUES(isSold),
          viewCount = VALUES(viewCount),
          updatedAt = NOW(),
          userId = VALUES(userId)
      `,
      [
        product.id,
        product.title,
        product.description,
        product.price,
        product.listingType,
        product.category,
        product.subcategory,
        product.condition,
        product.mainImage,
        JSON.stringify(product.images),
        product.location,
        product.viewCount,
        product.userId,
      ]
    )
  }
  console.log(`✅ Inzeráty připraveny (${products.length})`)
}

async function seedServices(connection) {
  console.log('🛠️  Sázím ukázkové služby...')
  for (const service of services) {
    await connection.execute(
      `
        INSERT INTO services (
          id, name, description, location, contactEmail, contactPhone,
          image, additionalImages, rating, reviewCount, isActive, createdAt, updatedAt, userId
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          description = VALUES(description),
          location = VALUES(location),
          contactEmail = VALUES(contactEmail),
          contactPhone = VALUES(contactPhone),
          image = VALUES(image),
          additionalImages = VALUES(additionalImages),
          rating = VALUES(rating),
          reviewCount = VALUES(reviewCount),
          isActive = VALUES(isActive),
          updatedAt = NOW(),
          userId = VALUES(userId)
      `,
      [
        service.id,
        service.name,
        service.description,
        service.location,
        service.contactEmail,
        service.contactPhone,
        service.image,
        JSON.stringify(service.additionalImages),
        service.rating,
        service.reviewCount,
        service.isActive ? 1 : 0,
        service.userId,
      ]
    )
  }
  console.log(`✅ Služby připraveny (${services.length})`)
}

async function seed() {
  const connection = await mysql.createConnection(connectionConfig)
  try {
    console.log('🌱 Spouštím seed ukázkových dat...')
    await seedUsers(connection)
    await seedProducts(connection)
    await seedServices(connection)
    console.log('🎉 Seed byl úspěšně dokončen!')
  } catch (error) {
    console.error('❌ Seed selhal:', error)
    process.exitCode = 1
  } finally {
    await connection.end()
  }
}

seed()


