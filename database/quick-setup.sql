-- =====================================================
-- AIRSOFT BURZA - RYCHLÉ NASTAVENÍ DATABÁZE
-- =====================================================
-- Verze: 1.0
-- Popis: Zjednodušený skript pro rychlé vytvoření databáze
-- =====================================================

-- Vytvoření databáze
CREATE DATABASE IF NOT EXISTS airsoft_burza 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE airsoft_burza;

-- =====================================================
-- ZÁKLADNÍ TABULKY
-- =====================================================

-- Uživatelé
CREATE TABLE users (
    id VARCHAR(191) PRIMARY KEY,
    name VARCHAR(191),
    email VARCHAR(191) UNIQUE NOT NULL,
    emailVerified DATETIME(3),
    image VARCHAR(191),
    phone VARCHAR(191),
    nickname VARCHAR(191),
    city VARCHAR(191),
    bio TEXT,
    reputation ENUM('VERY_GOOD', 'GOOD', 'NEUTRAL', 'BAD', 'VERY_BAD') DEFAULT 'NEUTRAL',
    password VARCHAR(191),
    createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    isVerified BOOLEAN DEFAULT false,
    isBanned BOOLEAN DEFAULT false,
    lastLoginAt DATETIME(3)
);

-- OAuth účty
CREATE TABLE accounts (
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
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY accounts_provider_providerAccountId_key (provider, providerAccountId)
);

-- Session
CREATE TABLE sessions (
    id VARCHAR(191) PRIMARY KEY,
    sessionToken VARCHAR(191) UNIQUE NOT NULL,
    userId VARCHAR(191) NOT NULL,
    expires DATETIME(3) NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Verifikační tokeny
CREATE TABLE verification_tokens (
    identifier VARCHAR(191) NOT NULL,
    token VARCHAR(191) UNIQUE NOT NULL,
    expires DATETIME(3) NOT NULL,
    UNIQUE KEY verification_tokens_identifier_token_key (identifier, token)
);

-- Produkty
CREATE TABLE products (
    id VARCHAR(191) PRIMARY KEY,
    title VARCHAR(191) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category ENUM('AIRSOFT_WEAPONS', 'MILITARY_EQUIPMENT', 'OTHER') NOT NULL,
    subcategory VARCHAR(191),
    condition ENUM('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR') NOT NULL,
    images JSON,
    location VARCHAR(191),
    isActive BOOLEAN DEFAULT true,
    isSold BOOLEAN DEFAULT false,
    createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    userId VARCHAR(191) NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Konverzace
CREATE TABLE conversations (
    id VARCHAR(191) PRIMARY KEY,
    productId VARCHAR(191) NOT NULL,
    participant1Id VARCHAR(191) NOT NULL,
    participant2Id VARCHAR(191) NOT NULL,
    createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (participant1Id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (participant2Id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY conversations_productId_participant1Id_participant2Id_key (productId, participant1Id, participant2Id)
);

-- Zprávy
CREATE TABLE messages (
    id VARCHAR(191) PRIMARY KEY,
    content TEXT NOT NULL,
    createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    conversationId VARCHAR(191) NOT NULL,
    senderId VARCHAR(191) NOT NULL,
    receiverId VARCHAR(191) NOT NULL,
    isRead BOOLEAN DEFAULT false,
    FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiverId) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- ZÁKLADNÍ INDEXY
-- =====================================================

-- Indexy pro rychlé vyhledávání
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_nickname ON users(nickname);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_condition ON products(condition);
CREATE INDEX idx_products_location ON products(location);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_is_active ON products(isActive);
CREATE INDEX idx_products_is_sold ON products(isSold);
CREATE INDEX idx_products_created_at ON products(createdAt);
CREATE INDEX idx_products_user_id ON products(userId);
CREATE INDEX idx_messages_conversation_id ON messages(conversationId);
CREATE INDEX idx_messages_sender_id ON messages(senderId);
CREATE INDEX idx_messages_receiver_id ON messages(receiverId);

-- =====================================================
-- VLOŽENÍ ZÁKLADNÍCH DAT
-- =====================================================

-- Vložení testovacího uživatele (volitelné)
INSERT INTO users (id, name, email, nickname, reputation, isVerified, createdAt, updatedAt) VALUES
('test_user_1', 'Test User', 'test@example.com', 'testuser', 'NEUTRAL', true, NOW(), NOW());

-- =====================================================
-- KONEC RYCHLÉHO NASTAVENÍ
-- =====================================================

SELECT 'Databáze airsoft_burza byla úspěšně vytvořena!' as status;
SHOW TABLES;
