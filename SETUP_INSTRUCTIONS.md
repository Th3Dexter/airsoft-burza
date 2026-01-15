# Instrukce pro nastavení Airsoft Burza

## ✅ Dokončené kroky
- ✅ Repozitář stažen a rozbalen
- ✅ Závislosti nainstalovány (`npm install`)
- ✅ `.env.local` soubor vytvořen

## ⚠️ Potřebné kroky před spuštěním

### 1. Instalace MySQL
Pokud nemáte MySQL nainstalovaný:
- Stáhněte MySQL z: https://dev.mysql.com/downloads/mysql/
- Nebo použijte XAMPP/WAMP, který obsahuje MySQL
- Nebo použijte Docker: `docker run --name mysql -e MYSQL_ROOT_PASSWORD= -p 3306:3306 -d mysql:8.0`

### 2. Vytvoření databáze
Po instalaci MySQL spusťte:

```bash
# Připojení k MySQL (bez hesla, jak je nastaveno v .env.local)
mysql -u root

# Vytvoření databáze
CREATE DATABASE IF NOT EXISTS burza_web;
EXIT;
```

### 3. Spuštění migrace databáze
```bash
node scripts/migrate-database.js
```

Nebo pokud máte schema.sql, můžete ho spustit přímo:
```bash
mysql -u root burza_web < database/schema.sql
```

### 4. Spuštění aplikace
```bash
npm run dev
```

Aplikace bude dostupná na: http://localhost:3000

## 📝 Poznámky
- Databáze je nastavena na `127.0.0.1:3306` s uživatelem `root` bez hesla
- Pokud máte jiné nastavení, upravte `.env.local`
- Redis je volitelný (aplikace může fungovat bez něj)
