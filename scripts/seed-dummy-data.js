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

// Rozšířený seznam uživatelů
const users = [
  {
    id: 'user_demo_1',
    name: 'Tomáš Novák',
    email: 'demo1@example.com',
    image: '/images/picture1.jpg',
    reputation: 'GOOD',
    isVerified: true,
    isAdmin: false,
    city: 'Praha',
    nickname: 'tomas_airsoft',
  },
  {
    id: 'user_demo_2',
    name: 'Jan Svoboda',
    email: 'demo2@example.com',
    image: '/images/picture2.jpg',
    reputation: 'VERY_GOOD',
    isVerified: true,
    isAdmin: false,
    city: 'Brno',
    nickname: 'jan_military',
  },
  {
    id: 'user_demo_3',
    name: 'Petr Servis',
    email: 'demo.service@example.com',
    image: '/images/picture3.jpeg',
    reputation: 'GOOD',
    isVerified: true,
    isAdmin: false,
    city: 'Praha',
    nickname: 'petr_servis',
  },
  {
    id: 'user_demo_4',
    name: 'Martin Prodejce',
    email: 'demo4@example.com',
    image: '/images/picture4.jpeg',
    reputation: 'NEUTRAL',
    isVerified: false,
    isAdmin: false,
    city: 'Ostrava',
    nickname: 'martin_pro',
  },
  {
    id: 'user_demo_5',
    name: 'Lukáš Kupující',
    email: 'demo5@example.com',
    image: '/images/picture5.jpg',
    reputation: 'GOOD',
    isVerified: true,
    isAdmin: false,
    city: 'Plzeň',
    nickname: 'lukas_buyer',
  },
  {
    id: 'user_demo_6',
    name: 'David Servisník',
    email: 'demo6@example.com',
    image: '/images/picture6.jpg',
    reputation: 'VERY_GOOD',
    isVerified: true,
    isAdmin: false,
    city: 'Brno',
    nickname: 'david_tech',
  },
]

// Rozšířený seznam produktů - všechny kategorie
const products = [
  // NABÍDKA - Airsoft zbraně
  {
    id: 'product_nabidka_aeg_m4',
    title: 'Airsoft AEG M4 - plně upgradená',
    description: 'Elektrická M4 s mosfetem, precizní hlavní a pružinou M120. Skvělá kadence, připravená na hru. Včetně baterie a nabíječky.',
    price: 4800,
    listingType: 'NABIZIM',
    category: 'AIRSOFT_WEAPONS',
    subcategory: 'AEG',
    condition: 'LIGHT_DAMAGE',
    mainImage: '/images/picture1.jpg',
    images: JSON.stringify(['/images/picture1.jpg', '/images/picture2.jpg']),
    location: 'Praha',
    viewCount: 128,
    userId: 'user_demo_1',
  },
  {
    id: 'product_nabidka_ak47',
    title: 'AK-47 AEG Classic Army',
    description: 'Kvalitní AK-47 od Classic Army, plně funkční, s originálním boxem. Ideální pro začátečníky i pokročilé hráče.',
    price: 3500,
    listingType: 'NABIZIM',
    category: 'AIRSOFT_WEAPONS',
    subcategory: 'AEG',
    condition: 'NEW',
    mainImage: '/images/picture2.jpg',
    images: JSON.stringify(['/images/picture2.jpg', '/images/picture3.jpeg']),
    location: 'Brno',
    viewCount: 95,
    userId: 'user_demo_2',
  },
  {
    id: 'product_nabidka_pistol',
    title: 'GBB Pistole Glock 17',
    description: 'Gas blowback Glock 17, výborný stav, málo použitá. Včetně 2 magazínů a holsteru.',
    price: 2200,
    listingType: 'NABIZIM',
    category: 'AIRSOFT_WEAPONS',
    subcategory: 'GBB',
    condition: 'NEW',
    mainImage: '/images/picture3.jpeg',
    images: JSON.stringify(['/images/picture3.jpeg', '/images/picture4.jpeg']),
    location: 'Ostrava',
    viewCount: 67,
    userId: 'user_demo_4',
  },
  {
    id: 'product_nabidka_sniper',
    title: 'Sniper puška VSR-10',
    description: 'Bolt action sniper puška, upgradená hlavní a pružina. Perfektní pro dlouhé vzdálenosti. Scope v ceně.',
    price: 5500,
    listingType: 'NABIZIM',
    category: 'AIRSOFT_WEAPONS',
    subcategory: 'Sniper',
    condition: 'LIGHT_DAMAGE',
    mainImage: '/images/picture4.jpeg',
    images: JSON.stringify(['/images/picture4.jpeg', '/images/picture5.jpg']),
    location: 'Praha',
    viewCount: 142,
    userId: 'user_demo_1',
  },
  
  // NABÍDKA - Military vybavení
  {
    id: 'product_nabidka_ghillie',
    title: 'Ghillie suit woodland (kompletní set)',
    description: 'Kompletní ghillie suit woodland, použitý dvakrát. Součástí jsou kalhoty, bunda i kapuce. Velikost M-L.',
    price: 2200,
    listingType: 'NABIZIM',
    category: 'MILITARY_EQUIPMENT',
    subcategory: 'maskovani',
    condition: 'LIGHT_DAMAGE',
    mainImage: '/images/picture5.jpg',
    images: JSON.stringify(['/images/picture5.jpg', '/images/picture6.jpg']),
    location: 'Brno',
    viewCount: 76,
    userId: 'user_demo_2',
  },
  {
    id: 'product_nabidka_vest',
    title: 'Taktická vesta Plate Carrier',
    description: 'Profesionální plate carrier s MOLLE systémem. Použitá několikrát, výborný stav. Velikost univerzální.',
    price: 1800,
    listingType: 'NABIZIM',
    category: 'MILITARY_EQUIPMENT',
    subcategory: 'vystroje',
    condition: 'NEW',
    mainImage: '/images/picture6.jpg',
    images: JSON.stringify(['/images/picture6.jpg', '/images/picture7.jpg']),
    location: 'Praha',
    viewCount: 89,
    userId: 'user_demo_1',
  },
  {
    id: 'product_nabidka_boots',
    title: 'Taktické boty 5.11',
    description: 'Kvalitní taktické boty 5.11, velikost 43. Voděodolné, pohodlné pro dlouhé hry. Použité, ale v dobrém stavu.',
    price: 1200,
    listingType: 'NABIZIM',
    category: 'MILITARY_EQUIPMENT',
    subcategory: 'obuv',
    condition: 'LIGHT_DAMAGE',
    mainImage: '/images/picture7.jpg',
    images: JSON.stringify(['/images/picture7.jpg', '/images/picture8.jpg']),
    location: 'Plzeň',
    viewCount: 54,
    userId: 'user_demo_5',
  },
  {
    id: 'product_nabidka_backpack',
    title: 'Taktický batoh 30L',
    description: 'Velký taktický batoh s MOLLE systémem, ideální pro vícedenní hry. Včetně vnitřních organizérů.',
    price: 1500,
    listingType: 'NABIZIM',
    category: 'MILITARY_EQUIPMENT',
    subcategory: 'batohy',
    condition: 'LIGHT_DAMAGE',
    mainImage: '/images/picture8.jpg',
    images: JSON.stringify(['/images/picture8.jpg', '/images/picture9.jpg']),
    location: 'Brno',
    viewCount: 43,
    userId: 'user_demo_2',
  },
  
  // NABÍDKA - Ostatní
  {
    id: 'product_nabidka_grenady',
    title: 'Sada CO2 granátů + launcher',
    description: 'Tři CO2 granáty s launcherem, ideální pro CQB. V ceně rychloplnička a náhradní těsnění.',
    price: 3100,
    listingType: 'NABIZIM',
    category: 'OTHER',
    subcategory: 'vybaveni',
    condition: 'LIGHT_DAMAGE',
    mainImage: '/images/picture9.jpg',
    images: JSON.stringify(['/images/picture9.jpg', '/images/picture10.jpg']),
    location: 'Ostrava',
    viewCount: 54,
    userId: 'user_demo_4',
  },
  {
    id: 'product_nabidka_bb',
    title: 'BB kuličky 0.25g - 5000ks',
    description: 'Kvalitní BB kuličky 0.25g, neotevřené balení. Perfektní pro AEG zbraně. 5000 kusů v balení.',
    price: 450,
    listingType: 'NABIZIM',
    category: 'OTHER',
    subcategory: 'munice',
    condition: 'NEW',
    mainImage: '/images/picture10.jpg',
    images: JSON.stringify(['/images/picture10.jpg', '/images/picture1.jpg']),
    location: 'Praha',
    viewCount: 112,
    userId: 'user_demo_1',
  },
  {
    id: 'product_nabidka_scope',
    title: 'Red dot zaměřovač',
    description: 'Kvalitní red dot zaměřovač s možností změny jasu. Univerzální montáž. Použitý, ale funkční.',
    price: 800,
    listingType: 'NABIZIM',
    category: 'OTHER',
    subcategory: 'prislusenstvi',
    condition: 'LIGHT_DAMAGE',
    mainImage: '/images/picture1.jpg',
    images: JSON.stringify(['/images/picture1.jpg', '/images/picture2.jpg']),
    location: 'Brno',
    viewCount: 78,
    userId: 'user_demo_2',
  },
  {
    id: 'product_nabidka_battery',
    title: 'LiPo baterie 11.1V 2200mAh',
    description: 'Výkonná LiPo baterie pro AEG zbraně. Včetně balancéru. Použitá, ale stále výkonná.',
    price: 600,
    listingType: 'NABIZIM',
    category: 'OTHER',
    subcategory: 'elektronika',
    condition: 'LIGHT_DAMAGE',
    mainImage: '/images/picture2.jpg',
    images: JSON.stringify(['/images/picture2.jpg', '/images/picture3.jpeg']),
    location: 'Praha',
    viewCount: 91,
    userId: 'user_demo_1',
  },
  
  // POPTÁVKA - Airsoft zbraně
  {
    id: 'product_poptavka_p90',
    title: 'Sháním P90 Tokyo Marui',
    description: 'Koupím P90 od Tokyo Marui v dobrém stavu. Preferuji osobní předání v Brně nebo okolí.',
    price: 0,
    listingType: 'SHANIM',
    category: 'AIRSOFT_WEAPONS',
    subcategory: 'SMG',
    condition: 'LIGHT_DAMAGE',
    mainImage: '/images/picture3.jpeg',
    images: JSON.stringify(['/images/picture3.jpeg']),
    location: 'Brno',
    viewCount: 33,
    userId: 'user_demo_5',
  },
  {
    id: 'product_poptavka_mp5',
    title: 'Hledám MP5 AEG',
    description: 'Sháním MP5 AEG v dobrém stavu. Ideálně s baterií a nabíječkou. Cena do 3000 Kč.',
    price: 0,
    listingType: 'SHANIM',
    category: 'AIRSOFT_WEAPONS',
    subcategory: 'AEG',
    condition: 'LIGHT_DAMAGE',
    mainImage: '/images/picture4.jpeg',
    images: JSON.stringify(['/images/picture4.jpeg']),
    location: 'Praha',
    viewCount: 28,
    userId: 'user_demo_4',
  },
  {
    id: 'product_poptavka_gbb_pistol',
    title: 'Poptávka: GBB pistole',
    description: 'Koupím jakoukoliv GBB pistoli v dobrém stavu. Preferuji Glock nebo 1911. S magazíny.',
    price: 0,
    listingType: 'SHANIM',
    category: 'AIRSOFT_WEAPONS',
    subcategory: 'GBB',
    condition: 'LIGHT_DAMAGE',
    mainImage: '/images/picture5.jpg',
    images: JSON.stringify(['/images/picture5.jpg']),
    location: 'Ostrava',
    viewCount: 19,
    userId: 'user_demo_5',
  },
  
  // POPTÁVKA - Military vybavení
  {
    id: 'product_poptavka_helmet',
    title: 'Sháním taktickou helmu',
    description: 'Koupím taktickou helmu s možností montáže NVG. Velikost M-L. Preferuji osobní předání.',
    price: 0,
    listingType: 'SHANIM',
    category: 'MILITARY_EQUIPMENT',
    subcategory: 'vystroje',
    condition: 'LIGHT_DAMAGE',
    mainImage: '/images/picture6.jpg',
    images: JSON.stringify(['/images/picture6.jpg']),
    location: 'Praha',
    viewCount: 42,
    userId: 'user_demo_4',
  },
  {
    id: 'product_poptavka_uniform',
    title: 'Hledám vojenskou uniformu',
    description: 'Sháním vojenskou uniformu velikost M. Preferuji multicam nebo woodland. Kalhoty + bunda.',
    price: 0,
    listingType: 'SHANIM',
    category: 'MILITARY_EQUIPMENT',
    subcategory: 'obleceni',
    condition: 'LIGHT_DAMAGE',
    mainImage: '/images/picture7.jpg',
    images: JSON.stringify(['/images/picture7.jpg']),
    location: 'Brno',
    viewCount: 35,
    userId: 'user_demo_5',
  },
  {
    id: 'product_poptavka_gloves',
    title: 'Poptávka: Taktické rukavice',
    description: 'Koupím kvalitní taktické rukavice, velikost L. Preferuji mechanické rukavice s ochranou prstů.',
    price: 0,
    listingType: 'SHANIM',
    category: 'MILITARY_EQUIPMENT',
    subcategory: 'prislusenstvi',
    condition: 'LIGHT_DAMAGE',
    mainImage: '/images/picture8.jpg',
    images: JSON.stringify(['/images/picture8.jpg']),
    location: 'Plzeň',
    viewCount: 24,
    userId: 'user_demo_4',
  },
  
  // POPTÁVKA - Ostatní
  {
    id: 'product_poptavka_magazines',
    title: 'Sháním M4 magazíny',
    description: 'Koupím M4 mid-cap magazíny, ideálně 5-10 kusů. Cena do 200 Kč za kus.',
    price: 0,
    listingType: 'SHANIM',
    category: 'OTHER',
    subcategory: 'prislusenstvi',
    condition: 'LIGHT_DAMAGE',
    mainImage: '/images/picture9.jpg',
    images: JSON.stringify(['/images/picture9.jpg']),
    location: 'Praha',
    viewCount: 31,
    userId: 'user_demo_5',
  },
  {
    id: 'product_poptavka_charger',
    title: 'Hledám LiPo nabíječku',
    description: 'Sháním kvalitní LiPo nabíječku s balancérem. Preferuji IMAX B6 nebo podobnou.',
    price: 0,
    listingType: 'SHANIM',
    category: 'OTHER',
    subcategory: 'elektronika',
    condition: 'LIGHT_DAMAGE',
    mainImage: '/images/picture10.jpg',
    images: JSON.stringify(['/images/picture10.jpg']),
    location: 'Brno',
    viewCount: 27,
    userId: 'user_demo_4',
  },
  {
    id: 'product_poptavka_holster',
    title: 'Poptávka: Holster pro Glock',
    description: 'Koupím holster pro Glock 17/19. Preferuji kydex nebo podobný materiál. S možností montáže na taktickou vestu.',
    price: 0,
    listingType: 'SHANIM',
    category: 'OTHER',
    subcategory: 'prislusenstvi',
    condition: 'LIGHT_DAMAGE',
    mainImage: '/images/picture1.jpg',
    images: JSON.stringify(['/images/picture1.jpg']),
    location: 'Ostrava',
    viewCount: 18,
    userId: 'user_demo_5',
  },
]

// Rozšířený seznam servisů
const services = [
  {
    id: 'service_demo_upgrade',
    name: 'Airsoft Upgrade Praha',
    description: 'Profesionální upgrade a servis AEG i GBB zbraní. Diagnostika, instalace mosfetů, precizní hlavně, lakování a custom úpravy. Specializace na Tokyo Marui, Classic Army a další značky.',
    location: 'Praha',
    contactEmail: 'servis@airsoft-upgrade.cz',
    contactPhone: '+420777111222',
    image: '/images/picture1.jpg',
    additionalImages: JSON.stringify(['/images/picture2.jpg', '/images/picture3.jpeg']),
    rating: 4.8,
    reviewCount: 42,
    isActive: true,
    userId: 'user_demo_3',
  },
  {
    id: 'service_demo_paintball',
    name: 'Taktické lakování zbraní',
    description: 'Custom hydro dipping, cerakote a airbrush pro airsoft zbraně i příslušenství. Individuální design podle vašich představ. Rychlé dodání a kvalitní práce.',
    location: 'Plzeň',
    contactEmail: 'info@tacticpaint.cz',
    contactPhone: '+420602333444',
    image: '/images/picture4.jpeg',
    additionalImages: JSON.stringify(['/images/picture5.jpg', '/images/picture6.jpg']),
    rating: 4.6,
    reviewCount: 18,
    isActive: true,
    userId: 'user_demo_3',
  },
  {
    id: 'service_demo_brno',
    name: 'Airsoft Servis Brno',
    description: 'Komplexní servis airsoft zbraní v Brně. Opravy, upgrade, diagnostika. Specializace na AEG zbraně. Rychlé termíny, férové ceny. Osobní přístup ke každé zbrani.',
    location: 'Brno',
    contactEmail: 'servis@airsoft-brno.cz',
    contactPhone: '+420603444555',
    image: '/images/picture7.jpg',
    additionalImages: JSON.stringify(['/images/picture8.jpg']),
    rating: 4.9,
    reviewCount: 35,
    isActive: true,
    userId: 'user_demo_6',
  },
  {
    id: 'service_demo_ostrava',
    name: 'Tech Airsoft Ostrava',
    description: 'Profesionální servis a upgrade airsoft zbraní v Ostravě. Specializace na GBB pistole a AEG pušky. Instalace mosfetů, precizní hlavně, tuning výkonu.',
    location: 'Ostrava',
    contactEmail: 'info@techairsoft.cz',
    contactPhone: '+420604555666',
    image: '/images/picture9.jpg',
    additionalImages: JSON.stringify(['/images/picture10.jpg', '/images/picture1.jpg']),
    rating: 4.7,
    reviewCount: 28,
    isActive: true,
    userId: 'user_demo_6',
  },
  {
    id: 'service_demo_praha2',
    name: 'Precision Airsoft Praha',
    description: 'Vysoce přesný servis a upgrade airsoft zbraní. Specializace na sniper pušky a precizní hlavně. Custom úpravy podle požadavků zákazníka.',
    location: 'Praha',
    contactEmail: 'precision@airsoft.cz',
    contactPhone: '+420605666777',
    image: '/images/picture2.jpg',
    additionalImages: JSON.stringify(['/images/picture3.jpeg']),
    rating: 4.5,
    reviewCount: 15,
    isActive: true,
    userId: 'user_demo_3',
  },
]

// Hodnocení servisů
const serviceReviews = [
  {
    id: 'review_service_1_1',
    serviceId: 'service_demo_upgrade',
    userId: 'user_demo_1',
    ratingSpeed: 5,
    ratingQuality: 5,
    ratingCommunication: 4,
    ratingPrice: 4,
    ratingOverall: 5,
    comment: 'Výborný servis, rychlá oprava a profesionální přístup. Doporučuji!',
  },
  {
    id: 'review_service_1_2',
    serviceId: 'service_demo_upgrade',
    userId: 'user_demo_2',
    ratingSpeed: 4,
    ratingQuality: 5,
    ratingCommunication: 5,
    ratingPrice: 4,
    ratingOverall: 5,
    comment: 'Skvělá práce, zbraně fungují perfektně po upgrade.',
  },
  {
    id: 'review_service_2_1',
    serviceId: 'service_demo_paintball',
    userId: 'user_demo_1',
    ratingSpeed: 4,
    ratingQuality: 5,
    ratingCommunication: 4,
    ratingPrice: 3,
    ratingOverall: 4,
    comment: 'Krásné lakování, ale trochu dražší než jsem čekal.',
  },
  {
    id: 'review_service_3_1',
    serviceId: 'service_demo_brno',
    userId: 'user_demo_4',
    ratingSpeed: 5,
    ratingQuality: 5,
    ratingCommunication: 5,
    ratingPrice: 5,
    ratingOverall: 5,
    comment: 'Nejlepší servis v Brně! Rychlé, kvalitní a za férovou cenu.',
  },
  {
    id: 'review_service_3_2',
    serviceId: 'service_demo_brno',
    userId: 'user_demo_5',
    ratingSpeed: 5,
    ratingQuality: 5,
    ratingCommunication: 5,
    ratingPrice: 4,
    ratingOverall: 5,
    comment: 'Výborná komunikace a rychlé dodání. Zbraň funguje jako nová.',
  },
  {
    id: 'review_service_4_1',
    serviceId: 'service_demo_ostrava',
    userId: 'user_demo_2',
    ratingSpeed: 4,
    ratingQuality: 4,
    ratingCommunication: 4,
    ratingPrice: 4,
    ratingOverall: 4,
    comment: 'Dobrý servis, spokojenost s prací.',
  },
  {
    id: 'review_service_5_1',
    serviceId: 'service_demo_praha2',
    userId: 'user_demo_1',
    ratingSpeed: 4,
    ratingQuality: 5,
    ratingCommunication: 4,
    ratingPrice: 4,
    ratingOverall: 4,
    comment: 'Kvalitní práce na sniper pušce, přesnost se výrazně zlepšila.',
  },
]

async function seedUsers(connection) {
  console.log('👥 Sázím ukázkové uživatele...')
  for (const user of users) {
    await connection.execute(
      `
        INSERT INTO users (id, name, email, image, reputation, isVerified, isAdmin, isBanned, city, nickname, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          image = VALUES(image),
          reputation = VALUES(reputation),
          isVerified = VALUES(isVerified),
          isAdmin = VALUES(isAdmin),
          city = VALUES(city),
          nickname = VALUES(nickname),
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
        user.city || null,
        user.nickname || null,
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
        product.images,
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
        service.additionalImages,
        service.rating,
        service.reviewCount,
        service.isActive ? 1 : 0,
        service.userId,
      ]
    )
  }
  console.log(`✅ Služby připraveny (${services.length})`)
}

async function seedServiceReviews(connection) {
  console.log('⭐ Sázím hodnocení servisů...')
  for (const review of serviceReviews) {
    await connection.execute(
      `
        INSERT INTO service_reviews (
          id, serviceId, userId, ratingSpeed, ratingQuality, ratingCommunication, 
          ratingPrice, ratingOverall, comment, createdAt, updatedAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          ratingSpeed = VALUES(ratingSpeed),
          ratingQuality = VALUES(ratingQuality),
          ratingCommunication = VALUES(ratingCommunication),
          ratingPrice = VALUES(ratingPrice),
          ratingOverall = VALUES(ratingOverall),
          comment = VALUES(comment),
          updatedAt = NOW()
      `,
      [
        review.id,
        review.serviceId,
        review.userId,
        review.ratingSpeed,
        review.ratingQuality,
        review.ratingCommunication,
        review.ratingPrice,
        review.ratingOverall,
        review.comment,
      ]
    )
  }
  console.log(`✅ Hodnocení servisů připravena (${serviceReviews.length})`)
}

async function seed() {
  const connection = await mysql.createConnection(connectionConfig)
  try {
    console.log('🌱 Spouštím seed ukázkových dat...')
    await seedUsers(connection)
    await seedProducts(connection)
    await seedServices(connection)
    await seedServiceReviews(connection)
    console.log('🎉 Seed byl úspěšně dokončen!')
  } catch (error) {
    console.error('❌ Seed selhal:', error)
    process.exitCode = 1
  } finally {
    await connection.end()
  }
}

seed()
