-- Přidání isAdmin sloupce do existující databáze
USE burza_web;

-- Přidání sloupce isAdmin do tabulky users
ALTER TABLE users 
ADD COLUMN isAdmin BOOLEAN NOT NULL DEFAULT false AFTER isBanned;



