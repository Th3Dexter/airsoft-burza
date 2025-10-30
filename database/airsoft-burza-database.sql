-- =====================================================
-- AIRSOFT BURZA - KOMPLETNÍ DATABÁZOVÁ STRUKTURA
-- =====================================================
-- Verze: 1.0
-- Datum: 2024
-- Popis: Kompletní SQL skript pro vytvoření databáze
--        pro Airsoft Burza webovou aplikaci
-- =====================================================

-- Vytvoření databáze
CREATE DATABASE IF NOT EXISTS airsoft_burza 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE airsoft_burza;

-- =====================================================
-- 1. TABULKA UŽIVATELŮ (USERS)
-- =====================================================
-- Obsahuje základní informace o uživatelích platformy
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(191) PRIMARY KEY,
    name VARCHAR(191),
    email VARCHAR(191) UNIQUE NOT NULL,
    emailVerified DATETIME(3),
    image VARCHAR(191),
    phone VARCHAR(191),
    nickname VARCHAR(191) UNIQUE,
    city VARCHAR(191),
    bio TEXT,
    reputation ENUM('VERY_GOOD', 'GOOD', 'NEUTRAL', 'BAD', 'VERY_BAD') NOT NULL DEFAULT 'NEUTRAL',
    password VARCHAR(191),
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    isVerified BOOLEAN NOT NULL DEFAULT false,
    isBanned BOOLEAN NOT NULL DEFAULT false,
    lastLoginAt DATETIME(3),
    
    -- Indexy pro rychlé vyhledávání
    INDEX idx_email (email),
    INDEX idx_nickname (nickname),
    INDEX idx_reputation (reputation),
    INDEX idx_created_at (createdAt),
    INDEX idx_is_verified (isVerified),
    INDEX idx_is_banned (isBanned)
);

-- =====================================================
-- 2. TABULKA ÚČTŮ (ACCOUNTS) - PRO OAUTH
-- =====================================================
-- Ukládá informace o OAuth účtech (Google, GitHub, atd.)
CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(191) PRIMARY KEY,
    userId VARCHAR(191) NOT NULL,
    type VARCHAR(191) NOT NULL,
    provider VARCHAR(191) NOT NULL,
    providerAccountId VARCHAR(191) NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INT,
    token_type VARCHAR(191),
    scope VARCHAR(191),
    id_token TEXT,
    session_state VARCHAR(191),
    
    -- Cizí klíče
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unikátní kombinace provider + providerAccountId
    UNIQUE KEY accounts_provider_providerAccountId_key (provider, providerAccountId),
    
    -- Indexy
    INDEX idx_user_id (userId),
    INDEX idx_provider (provider)
);

-- =====================================================
-- 3. TABULKA SESSION (SESSIONS)
-- =====================================================
-- Ukládá aktivní uživatelské session
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(191) PRIMARY KEY,
    sessionToken VARCHAR(191) UNIQUE NOT NULL,
    userId VARCHAR(191) NOT NULL,
    expires DATETIME(3) NOT NULL,
    
    -- Cizí klíče
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexy
    INDEX idx_session_token (sessionToken),
    INDEX idx_user_id (userId),
    INDEX idx_expires (expires)
);

-- =====================================================
-- 4. TABULKA VERIFIKAČNÍCH TOKENŮ (VERIFICATION_TOKENS)
-- =====================================================
-- Ukládá tokeny pro ověření emailu a reset hesla
CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier VARCHAR(191) NOT NULL,
    token VARCHAR(191) UNIQUE NOT NULL,
    expires DATETIME(3) NOT NULL,
    
    -- Unikátní kombinace identifier + token
    UNIQUE KEY verification_tokens_identifier_token_key (identifier, token),
    
    -- Indexy
    INDEX idx_token (token),
    INDEX idx_expires (expires)
);

-- =====================================================
-- 5. TABULKA PRODUKTŮ (PRODUCTS)
-- =====================================================
-- Hlavní tabulka pro inzeráty produktů
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(191) PRIMARY KEY,
    title VARCHAR(191) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category ENUM('AIRSOFT_WEAPONS', 'MILITARY_EQUIPMENT', 'OTHER') NOT NULL,
    subcategory VARCHAR(191),
    condition ENUM('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR') NOT NULL,
    images JSON,
    location VARCHAR(191),
    isActive BOOLEAN NOT NULL DEFAULT true,
    isSold BOOLEAN NOT NULL DEFAULT false,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    userId VARCHAR(191) NOT NULL,
    
    -- Cizí klíče
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexy pro rychlé vyhledávání a filtrování
    INDEX idx_category (category),
    INDEX idx_condition (condition),
    INDEX idx_location (location),
    INDEX idx_price (price),
    INDEX idx_is_active (isActive),
    INDEX idx_is_sold (isSold),
    INDEX idx_created_at (createdAt),
    INDEX idx_user_id (userId),
    INDEX idx_title (title),
    
    -- Fulltext index pro vyhledávání v názvu a popisu
    FULLTEXT idx_fulltext_search (title, description)
);

-- =====================================================
-- 6. TABULKA KONVERZACÍ (CONVERSATIONS)
-- =====================================================
-- Ukládá konverzace mezi uživateli o produktech
CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(191) PRIMARY KEY,
    productId VARCHAR(191) NOT NULL,
    participant1Id VARCHAR(191) NOT NULL,
    participant2Id VARCHAR(191) NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    
    -- Cizí klíče
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (participant1Id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (participant2Id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unikátní kombinace produkt + oba účastníci
    UNIQUE KEY conversations_productId_participant1Id_participant2Id_key (productId, participant1Id, participant2Id),
    
    -- Indexy
    INDEX idx_product_id (productId),
    INDEX idx_participant1_id (participant1Id),
    INDEX idx_participant2_id (participant2Id),
    INDEX idx_created_at (createdAt)
);

-- =====================================================
-- 7. TABULKA ZPRÁV (MESSAGES)
-- =====================================================
-- Ukládá zprávy v konverzacích
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(191) PRIMARY KEY,
    content TEXT NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    conversationId VARCHAR(191) NOT NULL,
    senderId VARCHAR(191) NOT NULL,
    receiverId VARCHAR(191) NOT NULL,
    isRead BOOLEAN NOT NULL DEFAULT false,
    
    -- Cizí klíče
    FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiverId) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexy
    INDEX idx_conversation_id (conversationId),
    INDEX idx_sender_id (senderId),
    INDEX idx_receiver_id (receiverId),
    INDEX idx_created_at (createdAt),
    INDEX idx_is_read (isRead)
);

-- =====================================================
-- 8. TABULKA NOTIFIKACÍ (NOTIFICATIONS)
-- =====================================================
-- Ukládá notifikace pro uživatele
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(191) PRIMARY KEY,
    userId VARCHAR(191) NOT NULL,
    type ENUM('MESSAGE', 'PRODUCT_VIEW', 'PRODUCT_SOLD', 'SYSTEM') NOT NULL,
    title VARCHAR(191) NOT NULL,
    content TEXT NOT NULL,
    isRead BOOLEAN NOT NULL DEFAULT false,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    relatedId VARCHAR(191), -- ID souvisejícího objektu (produkt, zpráva, atd.)
    
    -- Cizí klíče
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexy
    INDEX idx_user_id (userId),
    INDEX idx_type (type),
    INDEX idx_is_read (isRead),
    INDEX idx_created_at (createdAt)
);

-- =====================================================
-- 9. TABULKA HODNOCENÍ (REVIEWS)
-- =====================================================
-- Ukládá hodnocení uživatelů
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(191) PRIMARY KEY,
    reviewerId VARCHAR(191) NOT NULL,
    revieweeId VARCHAR(191) NOT NULL,
    productId VARCHAR(191),
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    
    -- Cizí klíče
    FOREIGN KEY (reviewerId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (revieweeId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE SET NULL,
    
    -- Unikátní kombinace - jeden uživatel může hodnotit druhého pouze jednou
    UNIQUE KEY reviews_reviewer_reviewee_key (reviewerId, revieweeId),
    
    -- Indexy
    INDEX idx_reviewer_id (reviewerId),
    INDEX idx_reviewee_id (revieweeId),
    INDEX idx_product_id (productId),
    INDEX idx_rating (rating),
    INDEX idx_created_at (createdAt)
);

-- =====================================================
-- 10. TABULKA OBLÍBENÝCH (FAVORITES)
-- =====================================================
-- Ukládá oblíbené produkty uživatelů
CREATE TABLE IF NOT EXISTS favorites (
    id VARCHAR(191) PRIMARY KEY,
    userId VARCHAR(191) NOT NULL,
    productId VARCHAR(191) NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    
    -- Cizí klíče
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
    
    -- Unikátní kombinace - jeden uživatel může mít produkt v oblíbených pouze jednou
    UNIQUE KEY favorites_user_product_key (userId, productId),
    
    -- Indexy
    INDEX idx_user_id (userId),
    INDEX idx_product_id (productId),
    INDEX idx_created_at (createdAt)
);

-- =====================================================
-- 11. TABULKA KATEGORIÍ (CATEGORIES)
-- =====================================================
-- Ukládá kategorie a podkategorie produktů
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(191) PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    slug VARCHAR(191) UNIQUE NOT NULL,
    description TEXT,
    parentId VARCHAR(191),
    isActive BOOLEAN NOT NULL DEFAULT true,
    sortOrder INT NOT NULL DEFAULT 0,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    
    -- Cizí klíče
    FOREIGN KEY (parentId) REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Indexy
    INDEX idx_slug (slug),
    INDEX idx_parent_id (parentId),
    INDEX idx_is_active (isActive),
    INDEX idx_sort_order (sortOrder)
);

-- =====================================================
-- 12. TABULKA LOKACÍ (LOCATIONS)
-- =====================================================
-- Ukládá dostupné lokace pro produkty
CREATE TABLE IF NOT EXISTS locations (
    id VARCHAR(191) PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    slug VARCHAR(191) UNIQUE NOT NULL,
    region VARCHAR(191),
    isActive BOOLEAN NOT NULL DEFAULT true,
    sortOrder INT NOT NULL DEFAULT 0,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    
    -- Indexy
    INDEX idx_slug (slug),
    INDEX idx_region (region),
    INDEX idx_is_active (isActive),
    INDEX idx_sort_order (sortOrder)
);

-- =====================================================
-- VLOŽENÍ ZÁKLADNÍCH DAT
-- =====================================================

-- Vložení základních kategorií
INSERT INTO categories (id, name, slug, description, parentId, isActive, sortOrder) VALUES
('cat_airsoft_weapons', 'Airsoft zbraně', 'airsoft-weapons', 'AEG repliky, pistole, pušky a další airsoft zbraně', NULL, true, 1),
('cat_military_equipment', 'Military vybavení', 'military-equipment', 'Taktické vesty, boty, rukavice a další military vybavení', NULL, true, 2),
('cat_other', 'Ostatní', 'other', 'Náhradní díly, optika, baterie a další airsoft příslušenství', NULL, true, 3);

-- Vložení základních lokací
INSERT INTO locations (id, name, slug, region, isActive, sortOrder) VALUES
('loc_praha', 'Praha', 'praha', 'Praha', true, 1),
('loc_brno', 'Brno', 'brno', 'Jihomoravský', true, 2),
('loc_ostrava', 'Ostrava', 'ostrava', 'Moravskoslezský', true, 3),
('loc_plzen', 'Plzeň', 'plzen', 'Plzeňský', true, 4),
('loc_hradec_kralove', 'Hradec Králové', 'hradec-kralove', 'Královéhradecký', true, 5),
('loc_ceske_budejovice', 'České Budějovice', 'ceske-budejovice', 'Jihočeský', true, 6),
('loc_olomouc', 'Olomouc', 'olomouc', 'Olomoucký', true, 7),
('loc_liberec', 'Liberec', 'liberec', 'Liberecký', true, 8);

-- =====================================================
-- VYTVOŘENÍ VIEW PRO STATISTIKY
-- =====================================================

-- View pro uživatelské statistiky
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.nickname,
    u.reputation,
    u.createdAt,
    u.isVerified,
    COUNT(DISTINCT p.id) as total_products,
    COUNT(DISTINCT CASE WHEN p.isActive = true AND p.isSold = false THEN p.id END) as active_products,
    COUNT(DISTINCT CASE WHEN p.isSold = true THEN p.id END) as sold_products,
    COALESCE(SUM(CASE WHEN p.isSold = true THEN p.price END), 0) as total_sales_value,
    COUNT(DISTINCT c.id) as total_conversations,
    COUNT(DISTINCT m.id) as total_messages_sent,
    COUNT(DISTINCT CASE WHEN m.receiverId = u.id THEN m.id END) as total_messages_received,
    AVG(r.rating) as average_rating,
    COUNT(DISTINCT r.id) as total_reviews
FROM users u
LEFT JOIN products p ON u.id = p.userId
LEFT JOIN conversations c ON (u.id = c.participant1Id OR u.id = c.participant2Id)
LEFT JOIN messages m ON u.id = m.senderId
LEFT JOIN reviews r ON u.id = r.revieweeId
GROUP BY u.id, u.name, u.email, u.nickname, u.reputation, u.createdAt, u.isVerified;

-- =====================================================
-- VYTVOŘENÍ STORED PROCEDURES
-- =====================================================

-- Procedure pro aktualizaci reputace uživatele
DELIMITER //
CREATE PROCEDURE UpdateUserReputation(IN user_id VARCHAR(191))
BEGIN
    DECLARE avg_rating DECIMAL(3,2);
    DECLARE new_reputation VARCHAR(20);
    
    -- Získání průměrného hodnocení
    SELECT AVG(rating) INTO avg_rating
    FROM reviews 
    WHERE revieweeId = user_id;
    
    -- Určení nové reputace na základě průměrného hodnocení
    IF avg_rating >= 4.5 THEN
        SET new_reputation = 'VERY_GOOD';
    ELSEIF avg_rating >= 3.5 THEN
        SET new_reputation = 'GOOD';
    ELSEIF avg_rating >= 2.5 THEN
        SET new_reputation = 'NEUTRAL';
    ELSEIF avg_rating >= 1.5 THEN
        SET new_reputation = 'BAD';
    ELSE
        SET new_reputation = 'VERY_BAD';
    END IF;
    
    -- Aktualizace reputace
    UPDATE users 
    SET reputation = new_reputation, updatedAt = CURRENT_TIMESTAMP(3)
    WHERE id = user_id;
END //
DELIMITER ;

-- =====================================================
-- VYTVOŘENÍ TRIGGERŮ
-- =====================================================

-- Trigger pro automatickou aktualizaci updatedAt v products
DELIMITER //
CREATE TRIGGER products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
BEGIN
    SET NEW.updatedAt = CURRENT_TIMESTAMP(3);
END //
DELIMITER ;

-- Trigger pro automatickou aktualizaci updatedAt v users
DELIMITER //
CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
BEGIN
    SET NEW.updatedAt = CURRENT_TIMESTAMP(3);
END //
DELIMITER ;

-- =====================================================
-- VYTVOŘENÍ INDEXŮ PRO VÝKON
-- =====================================================

-- Kompozitní indexy pro složité dotazy
CREATE INDEX idx_products_category_active_sold ON products(category, isActive, isSold);
CREATE INDEX idx_products_price_range ON products(price, isActive);
CREATE INDEX idx_products_location_category ON products(location, category);
CREATE INDEX idx_messages_conversation_created ON messages(conversationId, createdAt);
CREATE INDEX idx_notifications_user_unread ON notifications(userId, isRead, createdAt);

-- =====================================================
-- KONFIGURACE DATABÁZE
-- =====================================================

-- Nastavení pro lepší výkon
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB
SET GLOBAL innodb_log_file_size = 268435456; -- 256MB
SET GLOBAL innodb_flush_log_at_trx_commit = 2;
SET GLOBAL innodb_flush_method = O_DIRECT;

-- =====================================================
-- KOMENTÁŘE K TABULKÁM
-- =====================================================

ALTER TABLE users COMMENT = 'Uživatelé platformy s profilem a reputací';
ALTER TABLE products COMMENT = 'Inzeráty produktů s kategoriemi a stavy';
ALTER TABLE conversations COMMENT = 'Konverzace mezi uživateli o produktech';
ALTER TABLE messages COMMENT = 'Zprávy v konverzacích';
ALTER TABLE notifications COMMENT = 'Notifikace pro uživatele';
ALTER TABLE reviews COMMENT = 'Hodnocení uživatelů';
ALTER TABLE favorites COMMENT = 'Oblíbené produkty uživatelů';
ALTER TABLE categories COMMENT = 'Kategorie a podkategorie produktů';
ALTER TABLE locations COMMENT = 'Dostupné lokace pro produkty';

-- =====================================================
-- KONEC SKRIPTU
-- =====================================================

-- Zobrazení informací o vytvořené databázi
SELECT 
    'airsoft_burza' as database_name,
    'utf8mb4' as character_set,
    'utf8mb4_unicode_ci' as collation,
    NOW() as created_at;

-- Zobrazení všech tabulek
SHOW TABLES;

-- Zobrazení počtu tabulek
SELECT COUNT(*) as total_tables FROM information_schema.tables 
WHERE table_schema = 'airsoft_burza';
