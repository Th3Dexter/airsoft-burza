-- Přidání tabulky servisů do existující databáze
USE burza_web;

-- Tabulka servisů
CREATE TABLE IF NOT EXISTS services (
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
);





