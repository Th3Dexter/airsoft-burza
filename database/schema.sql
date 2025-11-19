-- Vytvoření databáze
CREATE DATABASE IF NOT EXISTS burza_web;
USE burza_web;

-- Tabulka uživatelů
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(191),
  email VARCHAR(191) UNIQUE NOT NULL,
  emailVerified DATETIME(3),
  image VARCHAR(191),
  phone VARCHAR(191),
  nickname VARCHAR(191),
  city VARCHAR(191),
  bio TEXT,
  reputation ENUM('VERY_GOOD', 'GOOD', 'NEUTRAL', 'BAD', 'VERY_BAD') NOT NULL DEFAULT 'NEUTRAL',
  password VARCHAR(191),
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL,
  isVerified BOOLEAN NOT NULL DEFAULT false,
  isBanned BOOLEAN NOT NULL DEFAULT false,
  isAdmin BOOLEAN NOT NULL DEFAULT false,
  lastLoginAt DATETIME(3)
);

-- Tabulka účtů (pro OAuth)
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
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY accounts_provider_providerAccountId_key (provider, providerAccountId)
);

-- Tabulka session
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(191) PRIMARY KEY,
  sessionToken VARCHAR(191) UNIQUE NOT NULL,
  userId VARCHAR(191) NOT NULL,
  expires DATETIME(3) NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabulka verifikačních tokenů
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier VARCHAR(191) NOT NULL,
  token VARCHAR(191) UNIQUE NOT NULL,
  expires DATETIME(3) NOT NULL,
  UNIQUE KEY verification_tokens_identifier_token_key (identifier, token)
);

-- Tabulka produktů
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(191) PRIMARY KEY,
  title VARCHAR(191) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  listingType ENUM('NABIZIM', 'SHANIM') NOT NULL DEFAULT 'NABIZIM',
  category VARCHAR(191) NOT NULL,
  subcategory VARCHAR(191),
  `condition` VARCHAR(191) NOT NULL,
  mainImage VARCHAR(512),
  images JSON,
  location VARCHAR(191),
  isActive BOOLEAN NOT NULL DEFAULT true,
  isSold BOOLEAN NOT NULL DEFAULT false,
  viewCount INT NOT NULL DEFAULT 0,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL,
  userId VARCHAR(191) NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_products_listingType_isSold (listingType, isSold),
  INDEX idx_products_createdAt (createdAt),
  INDEX idx_products_category_listingType (category, listingType),
  INDEX idx_products_price (price),
  INDEX idx_products_location (location),
  INDEX idx_products_condition (`condition`),
  INDEX idx_products_userId (userId)
);

-- Tabulka konverzací
CREATE TABLE IF NOT EXISTS conversations (
  id VARCHAR(191) PRIMARY KEY,
  productId VARCHAR(191) NOT NULL,
  participant1Id VARCHAR(191) NOT NULL,
  participant2Id VARCHAR(191) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (participant1Id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (participant2Id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY conversations_productId_participant1Id_participant2Id_key (productId, participant1Id, participant2Id),
  INDEX idx_conversations_updatedAt (updatedAt),
  INDEX idx_conversations_participants (participant1Id, participant2Id)
);

-- Tabulka zpráv
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(191) PRIMARY KEY,
  content TEXT NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  conversationId VARCHAR(191) NOT NULL,
  senderId VARCHAR(191) NOT NULL,
  receiverId VARCHAR(191) NOT NULL,
  FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiverId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_messages_conversationId_createdAt (conversationId, createdAt),
  INDEX idx_messages_receiverId (receiverId)
);

-- Tabulka servisů
CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(191) NOT NULL,
  contactEmail VARCHAR(191) NOT NULL,
  contactPhone VARCHAR(191),
  image VARCHAR(512),
  additionalImages JSON,
  rating DECIMAL(3,2) DEFAULT NULL,
  reviewCount INT NOT NULL DEFAULT 0,
  isActive BOOLEAN NOT NULL DEFAULT true,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL,
  userId VARCHAR(191) NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_services_isActive (isActive),
  INDEX idx_services_location (location),
  INDEX idx_services_userId (userId)
);

-- Tabulka recenzí servisů
CREATE TABLE IF NOT EXISTS service_reviews (
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
);

-- Tabulka nahlášených problémů
CREATE TABLE IF NOT EXISTS reports (
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
);
