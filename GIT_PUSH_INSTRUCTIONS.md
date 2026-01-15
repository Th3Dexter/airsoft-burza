# Instrukce pro push změn na GitHub

## 1. Instalace Git (pokud není nainstalován)

### Windows:
1. Stáhněte Git z: https://git-scm.com/download/win
2. Spusťte instalátor a použijte výchozí nastavení
3. Po instalaci restartujte terminál/PowerShell

### Nebo použijte winget (Windows 10/11):
```powershell
winget install --id Git.Git -e --source winget
```

## 2. Konfigurace Git (první použití)

```bash
git config --global user.name "Vaše jméno"
git config --global user.email "vas@email.com"
```

## 3. Push změn na GitHub

Otevřete PowerShell nebo Command Prompt v adresáři projektu a spusťte:

```bash
# Zkontrolujte stav
git status

# Přidejte všechny změny
git add .

# Vytvořte commit
git commit -m "Update: přidání placeholder dat, úprava barev, oprava deprekačních varování"

# Zkontrolujte remote repository
git remote -v

# Pokud remote není nastaven, přidejte ho:
git remote add origin https://github.com/Th3Dexter/airsoft-burza.git

# Pushněte změny
git push -u origin main
```

## 4. Pokud potřebujete autentizaci

GitHub vyžaduje autentizaci. Můžete použít:

### Option A: Personal Access Token
1. Jděte na: https://github.com/settings/tokens
2. Vytvořte nový token (classic) s oprávněními `repo`
3. Při push použijte token jako heslo:
   ```
   Username: Th3Dexter
   Password: [váš token]
   ```

### Option B: GitHub CLI
```bash
# Instalace GitHub CLI
winget install --id GitHub.cli

# Přihlášení
gh auth login

# Pak můžete pushnout normálně
git push -u origin main
```

## 5. Alternativní metoda - GitHub Desktop

Pokud preferujete GUI:
1. Stáhněte GitHub Desktop: https://desktop.github.com/
2. Přihlaste se do GitHub účtu
3. Otevřete repozitář
4. Commitněte a pushněte změny přes GUI

---

## Shrnutí změn k pushnutí:

✅ Rozšířený seed skript s placeholder daty (21 produktů, 5 servisů, 7 hodnocení)
✅ Úprava barev textů na bílou (profil, registrace, přihlášení, produkty, servisy)
✅ Oprava deprekačních varování (cross-env)
✅ Vylepšení UI komponent
