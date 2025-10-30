# 🗄️ Airsoft Burza - Databázová dokumentace

Tento adresář obsahuje kompletní databázovou strukturu pro Airsoft Burza webovou aplikaci.

## 📁 Soubory

### `airsoft-burza-database.sql`
**Kompletní databázová struktura** - obsahuje:
- Všechny tabulky s kompletními definicemi
- Indexy pro optimalizaci výkonu
- Stored procedures a triggery
- View pro statistiky
- Základní data (kategorie, lokace)
- Komentáře a dokumentaci

### `quick-setup.sql`
**Rychlé nastavení** - obsahuje:
- Základní tabulky pro fungování aplikace
- Minimální indexy
- Testovací data
- Vhodné pro rychlé nasazení

### `schema.sql`
**Původní schéma** - zachováno pro kompatibilitu

## 🚀 Rychlé spuštění

### 1. MySQL Server
Ujistěte se, že máte spuštěný MySQL server na portu 3306.

### 2. Vytvoření databáze
```bash
# Kompletní verze (doporučeno)
mysql -u root -p < airsoft-burza-database.sql

# Nebo rychlá verze
mysql -u root -p < quick-setup.sql
```

### 3. Ověření
```sql
USE airsoft_burza;
SHOW TABLES;
SELECT COUNT(*) as total_tables FROM information_schema.tables 
WHERE table_schema = 'airsoft_burza';
```

## 📊 Struktura databáze

### Hlavní tabulky

#### 👤 `users` - Uživatelé
- Základní informace o uživatelích
- Profilové údaje (nickname, city, bio)
- Reputační systém
- Ověření a ban status

#### 📦 `products` - Produkty
- Inzeráty produktů
- Kategorie a podkategorie
- Stavy produktů (aktivní, prodaný)
- Ceny a lokace

#### 💬 `conversations` - Konverzace
- Konverzace mezi uživateli
- Vázané na konkrétní produkty
- Dva účastníci

#### 📨 `messages` - Zprávy
- Zprávy v konverzacích
- Stav přečtení
- Časové razítko

#### 🔐 `accounts` - OAuth účty
- OAuth poskytovatelé (Google, GitHub)
- Access a refresh tokeny

#### 🔑 `sessions` - Session
- Aktivní uživatelské session
- NextAuth.js integrace

### Rozšířené tabulky

#### 🔔 `notifications` - Notifikace
- Systém upozornění
- Různé typy notifikací

#### ⭐ `reviews` - Hodnocení
- Hodnocení uživatelů
- Komentáře a rating

#### ❤️ `favorites` - Oblíbené
- Oblíbené produkty uživatelů

#### 📂 `categories` - Kategorie
- Hierarchické kategorie produktů
- Podkategorie

#### 📍 `locations` - Lokace
- Dostupné lokace pro produkty
- Regionální rozdělení

## 🔧 Konfigurace

### Environment proměnné
```env
DATABASE_URL="mysql://root:password@localhost:3306/airsoft_burza"
```

### Optimalizace výkonu
Databáze obsahuje:
- **Indexy** pro rychlé vyhledávání
- **Kompozitní indexy** pro složité dotazy
- **Fulltext indexy** pro vyhledávání v textu
- **Stored procedures** pro automatizaci
- **Triggery** pro automatické aktualizace

## 📈 Statistiky a View

### `user_stats` - Uživatelské statistiky
Automaticky počítané statistiky pro každého uživatele:
- Počet produktů (celkem, aktivní, prodané)
- Celková hodnota prodejů
- Počet konverzací a zpráv
- Průměrné hodnocení

## 🛠️ Údržba

### Aktualizace reputace
```sql
CALL UpdateUserReputation('user_id');
```

### Čištění starých session
```sql
DELETE FROM sessions WHERE expires < NOW();
```

### Archivace starých notifikací
```sql
DELETE FROM notifications 
WHERE createdAt < DATE_SUB(NOW(), INTERVAL 30 DAY) 
AND isRead = true;
```

## 🔍 Monitoring

### Kontrola výkonu
```sql
-- Pomalé dotazy
SHOW PROCESSLIST;

-- Statistiky tabulek
SELECT 
    table_name,
    table_rows,
    data_length,
    index_length
FROM information_schema.tables 
WHERE table_schema = 'airsoft_burza';
```

### Kontrola integrity
```sql
-- Kontrola cizích klíčů
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE table_schema = 'airsoft_burza'
AND referenced_table_name IS NOT NULL;
```

## 🚨 Zálohování

### Kompletní záloha
```bash
mysqldump -u root -p airsoft_burza > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Obnovení zálohy
```bash
mysql -u root -p airsoft_burza < backup_file.sql
```

## 📝 Poznámky

- Databáze používá **utf8mb4** pro plnou podporu Unicode
- Všechny ID jsou generovány pomocí **cuid()** pro lepší výkon
- **Soft delete** není implementován - používá se hard delete s CASCADE
- **Timestamps** jsou automaticky spravovány pomocí triggerů

## 🔗 Související soubory

- `../prisma/schema.prisma` - Prisma ORM schéma
- `../scripts/migrate-database.js` - Migrační skript
- `../lib/mysql.ts` - Databázové připojení

---

**Vytvořeno pro Airsoft Burza platformu** 🎯
