# Airsoft Burza - Moderní platforma pro prodej airsoftových zbraní

Moderní, zabezpečená webová aplikace pro prodej a nákup airsoftových zbraní a military vybavení. Aplikace je postavena na Next.js 14 s TypeScript a využívá moderní bezpečnostní standardy.

## 🚀 Hlavní funkce

### Systém inzerátů
- **Dual listing system** - Rozdělení na Nabídka (nabízím) a Poptávka (sháním)
- **Kategorie produktů** - Airsoft zbraně, Military vybavení, Ostatní
- **Více obrázků na produkt** - Podpora více fotografií s možností volby hlavního obrázku
- **Lightbox galerie** - Plnoobrazovkové zobrazení obrázků s navigací šipkami
- **Počítadlo zobrazení** - Sledování popularity produktů s ochranou proti spamu
- **Filtrování a vyhledávání** - Podle kategorie, stavu, ceny, lokace
- **Správa inzerátů** - Přidávání, úprava a správa vlastních inzerátů

### Uživatelské funkce
- **Profil uživatele** - Kompletní profil s reputací, verifikací, statistikami
- **Reputační systém** - Hodnocení uživatelů (VERY_GOOD, GOOD, NEUTRAL, BAD, VERY_BAD)
- **Verifikace uživatelů** - Systém ověření účtů
- **Statistiky uživatele** - Přehled aktivních inzerátů, prodaných produktů, zpráv

### Komunikační systém
- **Přímé zprávy** - Komunikace mezi uživateli v reálném čase
- **Nahrávání souborů** - Podpora fotografií (max 5MB) a videí (max 50MB) ve zprávách
- **Podpora formátů** - JPEG, PNG, WEBP, GIF, HEIC (iPhone), MOV (iPhone)
- **Historie konverzací** - Ukládání a zobrazení historie zpráv

### Statistiky a analýzy
- **Globální statistiky** - Celkový počet aktivních inzerátů, nových za 24h/7d/30d
- **Statistiky zobrazení** - Celkový počet a průměr zobrazení na produkt
- **Počítadlo aktivních prodejců** - Počet uživatelů s aktivními inzeráty
- **Uživatelské statistiky** - Detailní přehled aktivity každého uživatele

### UI/UX funkce
- **Responzivní design** - Optimalizováno pro desktop, tablet i mobil
- **Dark mode** - Podpora tmavého a světlého režimu
- **Animované pozadí** - Dynamické pozadí s animovanými obrázky
- **Cookie consent** - GDPR kompatibilní souhlas s cookies
- **Toast notifikace** - Uživatelské notifikace pomocí react-hot-toast
- **Loading stavy** - Elegantní loading indikátory během načítání

## 🛠️ Technologie

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI, Framer Motion
- **Backend**: Next.js API Routes
- **Databáze**: MySQL 8.0+ (přímé připojení)
- **Autentifikace**: NextAuth.js s OAuth (Google)
- **Obrázky**: Next.js Image Optimization, File System Storage
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📋 Požadavky

- Node.js 18+ 
- MySQL 8.0+
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
# Vytvoření databáze MySQL
mysql -u root -e "CREATE DATABASE airsoft_burza;"

# Spuštění migrací
node scripts/migrate-database.js
```

### 4. Konfigurace prostředí
```bash
# Zkopírování příkladu konfigurace
cp env.example .env.local
```

Úprava `.env.local`:
```env
# MySQL Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=airsoft_burza

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (volitelné)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
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

## 📁 Struktura projektu

```
airsoft-burza/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   ├── auth/          # Autentifikace (NextAuth, registrace)
│   │   ├── products/      # Produkty API
│   │   ├── stats/         # Globální statistiky
│   │   └── user/          # Uživatelské API
│   ├── auth/              # Autentifikační stránky
│   ├── products/          # Stránky produktů
│   │   ├── [id]/          # Detail produktu
│   │   └── new/           # Nový inzerát
│   ├── nabidka/           # Sekce Nabídka
│   ├── poptavka/          # Sekce Poptávka
│   ├── profile/           # Profil uživatele
│   ├── messages/          # Zprávy
│   └── ...
├── components/            # React komponenty
│   ├── ui/               # Základní UI komponenty
│   ├── layout/           # Layout komponenty (Sidebar, Footer)
│   ├── products/         # Komponenty pro produkty
│   ├── sections/         # Sekce hlavní stránky
│   └── cookies/          # Cookie consent
├── lib/                  # Utility funkce
│   ├── auth.ts          # NextAuth konfigurace
│   ├── mysql.ts         # MySQL připojení
│   └── utils.ts         # Pomocné funkce
├── database/            # Databázové schéma
│   └── schema.sql       # MySQL schéma
├── scripts/             # Utility skripty
│   └── migrate-database.js  # Migrace databáze
└── public/              # Statické soubory
    ├── uploads/         # Nahrané soubory uživatelů (v .gitignore)
    └── images/          # Obrázky aplikace
```

## 📝 API Dokumentace

### Autentifikace
- `GET /api/auth/[...nextauth]` - NextAuth endpoint (session, signin, signout)
- `POST /api/auth/register` - Registrace nového uživatele

### Produkty
- `GET /api/products` - Seznam produktů (podpora filtrů: category, listingType, limit, sort)
- `POST /api/products` - Vytvoření nového inzerátu (FormData s obrázky)
- `GET /api/products/[id]` - Detail produktu (podpora ?trackView=true pro increment zobrazení)
- `PATCH /api/products/[id]` - Úprava produktu

### Statistiky
- `GET /api/stats` - Globální statistiky inzerátů (celkem, nové za 24h/7d/30d, zobrazení)

### Uživatel
- `GET /api/user/profile` - Profil přihlášeného uživatele
- `PUT /api/user/profile` - Aktualizace profilu
- `GET /api/user/products` - Inzeráty uživatele (podpora ?status=active/sold)
- `GET /api/user/stats` - Statistiky uživatele

## 🔒 Bezpečnost

Aplikace implementuje moderní bezpečnostní standardy:

- **Autentifikace**: NextAuth.js s JWT tokeny a OAuth (Google)
- **Autorizace**: Session-based kontrola přístupu k API
- **Sanitizace**: Vlastní sanitizační funkce pro uživatelské vstupy
- **File Upload Security**: Validace MIME typů, velikostí souborů a rozšíření
- **XSS ochrana**: Sanitizace všech uživatelských vstupů
- **Spam Protection**: Ochrana proti spamu u počítadla zobrazení (localStorage cooldown)
- **HTTPS**: Povinné v produkci (Next.js automaticky)
- **CSP Headers**: Content Security Policy v next.config.js

## 🎨 Design a UX

### Komponenty
- **ProductGrid** - Mřížkové zobrazení produktů s fixními rozměry
- **StatsSection** - Statistiky s automatickou aktualizací
- **FeaturedProducts** - Sekce s nejnovějšími inzeráty
- **HeroSection** - Hero sekce na hlavní stránce
- **Lightbox** - Plnoobrazovkové zobrazení obrázků produktů

### Features
- **Responsive Design** - Mobile-first přístup
- **Dark Mode** - Podpora tmavého režimu přes next-themes
- **Animations** - Framer Motion pro smooth transitions
- **Loading States** - Loading spinnery a skeleton loaders

## 🚀 Deployment

### Vercel (doporučeno)
1. Připojte GitHub repozitář k Vercel
2. Nastavte environment variables v dashboardu
3. Deploy automaticky při push do main branch
4. Nastavte MySQL databázi (např. PlanetScale, Railway, nebo vlastní server)

### Jiné platformy
Aplikace je kompatibilní s jakoukoliv platformou podporující Node.js:
- Railway (s MySQL addon)
- DigitalOcean App Platform
- AWS (EC2 + RDS)
- Heroku (s ClearDB addon)

**Poznámka**: Ujistěte se, že máte správně nastavené proměnné prostředí a že uploads složka (`public/uploads`) je persistentní na serveru.

## 📊 Databázové schéma

Hlavní tabulky:
- `users` - Uživatelé (id, name, email, image, nickname, city, bio, reputation, isVerified)
- `products` - Produkty (id, title, description, price, category, mainImage, images, listingType, viewCount, userId)
- `messages` - Zprávy mezi uživateli (s podporou souborů)

Pro kompletní schéma viz `database/schema.sql`

## 🔄 Changelog

### v1.1.0 (aktuální)
- ✨ Přidána sekce statistik na hlavní stránce
- ✨ Lightbox pro zobrazení obrázků produktů v plné velikosti
- ✨ Počítadlo zobrazení produktů s ochranou proti spamu
- ✨ Systém hlavního obrázku produktu
- ✨ Nahrávání fotografií a videí ve zprávách
- ✨ Podpora iPhone formátů (HEIC, MOV)
- 🔄 Přesun z nabízím/sháním na nabídka/poptávka
- 🔄 Optimalizace zobrazení produktů (fixní rozměry, konzistentní layout)
- 🐛 Opravy chyb v zobrazování obrázků a navigaci

### v1.0.0
- 🎉 Počáteční verze
- ✅ Základní autentifikace (NextAuth + Google OAuth)
- ✅ Správa produktů (CRUD operace)
- ✅ Komunikační systém
- ✅ Profil uživatele s reputací
- ✅ Moderní UI/UX s Tailwind CSS

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
- GitHub Issues: [Issues](https://github.com/Th3Dexter/airsoft-burza/issues)

---

Vytvořeno s ❤️ pro airsoft komunitu v České republice
