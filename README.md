# Airsoft Burza - Moderní platforma pro prodej airsoftových zbraní

Moderní, zabezpečená webová aplikace pro prodej a nákup airsoftových zbraní a military vybavení. Aplikace je postavena na Next.js 14 s TypeScript a využívá moderní bezpečnostní standardy.

## 🚀 Funkce

### Základní funkce
- **Moderní UI/UX** - Responzivní design s Tailwind CSS
- **Bezpečná autentifikace** - NextAuth.js s podporou OAuth (Google, GitHub)
- **Databáze** - PostgreSQL s Prisma ORM
- **TypeScript** - Plná podpora TypeScript pro lepší vývoj

### Obchodní funkce
- **Kategorie produktů** - Airsoft zbraně, Military vybavení, Ostatní
- **Pokročilé vyhledávání** - Filtry podle ceny, stavu, lokace
- **Správa produktů** - Přidávání, úprava, mazání inzerátů
- **Komunikační systém** - Přímá komunikace mezi uživateli
- **Hodnocení uživatelů** - Systém hodnocení a recenzí

### Bezpečnostní funkce
- **Ověření uživatelů** - Email a telefonní ověření
- **Šifrovaná komunikace** - Všechny zprávy jsou šifrované
- **CSRF ochrana** - Ochrana proti CSRF útokům
- **XSS ochrana** - Sanitizace vstupů
- **Rate limiting** - Ochrana proti spam a DDoS útokům

## 🛠️ Technologie

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes
- **Databáze**: PostgreSQL, Prisma ORM
- **Autentifikace**: NextAuth.js
- **Obrázky**: Next.js Image Optimization
- **Deployment**: Vercel (doporučeno)

## 📋 Požadavky

- Node.js 18+ 
- PostgreSQL 13+
- npm nebo yarn

## 🚀 Rychlé spuštění

### 1. Klonování repozitáře
```bash
git clone <repository-url>
cd airsoft-burza
```

### 2. Instalace závislostí
```bash
npm install
# nebo
yarn install
```

### 3. Nastavení databáze
```bash
# Vytvoření databáze PostgreSQL
createdb airsoft_burza

# Spuštění migrací
npx prisma migrate dev
```

### 4. Konfigurace prostředí
```bash
# Zkopírování příkladu konfigurace
cp env.example .env.local

# Úprava .env.local souboru
DATABASE_URL="mysql://root@127.0.0.1:3306/burza-web"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 5. Spuštění aplikace
```bash
# Vývojový režim
npm run dev

# Produkční build
npm run build
npm start
```

Aplikace bude dostupná na `http://localhost:3000`

## 🔧 Konfigurace

### Databáze
Aplikace používá MySQL s přímým připojením. Ujistěte se, že máte:
- MySQL server běžící na portu 3306
- Databázi `burza_web` vytvořenou
- Uživatele `root` bez hesla

### Autentifikace
Pro OAuth poskytovatele (Google, GitHub) nastavte:
- `GOOGLE_CLIENT_ID` a `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` a `GITHUB_CLIENT_SECRET`

### Bezpečnost
- Nastavte silný `NEXTAUTH_SECRET`
- Konfigurujte `BCRYPT_ROUNDS` pro hashování hesel
- Nastavte `RATE_LIMIT_*` proměnné pro rate limiting

## 📁 Struktura projektu

```
airsoft-burza/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   ├── auth/              # Autentifikační stránky
│   ├── products/          # Stránky produktů
│   └── globals.css        # Globální styly
├── components/            # React komponenty
│   ├── ui/               # Základní UI komponenty
│   ├── layout/           # Layout komponenty
│   ├── products/         # Komponenty pro produkty
│   └── sections/         # Sekce hlavní stránky
├── lib/                  # Utility funkce
│   ├── auth.ts          # NextAuth konfigurace
│   ├── prisma.ts        # Prisma klient
│   └── utils.ts         # Pomocné funkce
├── prisma/              # Databázové schéma
│   └── schema.prisma    # Prisma schéma
└── public/              # Statické soubory
```

## 🔒 Bezpečnost

Aplikace implementuje moderní bezpečnostní standardy:

- **Autentifikace**: NextAuth.js s JWT tokeny
- **Autorizace**: Role-based access control
- **Validace**: Zod pro validaci dat
- **Sanitizace**: Vlastní sanitizační funkce
- **Rate Limiting**: Ochrana API endpointů
- **HTTPS**: Povinné v produkci
- **CSP**: Content Security Policy headers

## 🚀 Deployment

### Vercel (doporučeno)
1. Připojte GitHub repozitář k Vercel
2. Nastavte environment variables
3. Deploy automaticky při push do main branch

### Jiné platformy
Aplikace je kompatibilní s jakoukoliv platformou podporující Node.js:
- Railway
- Heroku
- DigitalOcean
- AWS

## 📝 API Dokumentace

### Autentifikace
- `POST /api/auth/register` - Registrace uživatele
- `POST /api/auth/signin` - Přihlášení
- `GET /api/auth/session` - Aktuální session

### Produkty
- `GET /api/products` - Seznam produktů
- `POST /api/products` - Vytvoření produktu
- `PUT /api/products/[id]` - Úprava produktu
- `DELETE /api/products/[id]` - Smazání produktu

### Komunikace
- `GET /api/messages` - Seznam zpráv
- `POST /api/messages` - Odeslání zprávy
- `GET /api/conversations` - Seznam konverzací

## 🤝 Přispívání

1. Fork repozitáře
2. Vytvořte feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit změny (`git commit -m 'Add some AmazingFeature'`)
4. Push do branch (`git push origin feature/AmazingFeature`)
5. Otevřete Pull Request

## 📄 Licence

Tento projekt je licencován pod MIT licencí - viz [LICENSE](LICENSE) soubor pro detaily.

## 📞 Podpora

Pro podporu nebo dotazy kontaktujte:
- Email: support@airsoft-burza.cz
- GitHub Issues: [Issues](https://github.com/your-username/airsoft-burza/issues)

## 🔄 Changelog

### v1.0.0
- Počáteční verze
- Základní autentifikace
- Správa produktů
- Komunikační systém
- Moderní UI/UX

---

Vytvořeno s ❤️ pro airsoft komunitu v České republice

