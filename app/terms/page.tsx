import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
              Obchodní podmínky
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Poslední aktualizace: 1. ledna 2024
            </p>
          </div>

          <Card>
            <CardContent className="p-8 space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  1. Úvodní ustanovení
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Tyto obchodní podmínky upravují používání platformy Airsoft Burza (dále jen "Platforma") 
                  provozované společností Airsoft Burza s.r.o. (dále jen "Společnost").
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Používáním Platformy souhlasíte s těmito podmínkami. Pokud s nimi nesouhlasíte, 
                  nepoužívejte Platformu.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  2. Definice pojmů
                </h2>
                <div className="space-y-3">
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Platforma</strong> - webová aplikace Airsoft Burza umožňující prodej a nákup airsoftových zbraní a military vybavení
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Uživatel</strong> - fyzická nebo právnická osoba registrovaná na Platformě
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Inzerát</strong> - nabídka k prodeji produktu zveřejněná na Platformě
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Produkt</strong> - airsoftová zbraň, military vybavení nebo související zboží
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  3. Registrace a účet
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Pro používání Platformy je nutná registrace. Uživatel se zavazuje poskytovat pravdivé a aktuální informace.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Uživatel je odpovědný za bezpečnost svého účtu a všech aktivit prováděných pod jeho účtem.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Společnost si vyhrazuje právo zrušit účet uživatele, který porušuje tyto podmínky.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  4. Zveřejňování inzerátů
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Uživatelé mohou zveřejňovat inzeráty na prodej airsoftových zbraní a military vybavení.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Všechny inzeráty musí obsahovat pravdivé informace o prodávaném produktu.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Je zakázáno zveřejňovat inzeráty na skutečné zbraně, střelivo nebo jiné nelegální předměty.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Společnost si vyhrazuje právo smazat inzerát, který porušuje tyto podmínky.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  5. Komunikace mezi uživateli
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Platforma poskytuje nástroje pro komunikaci mezi uživateli.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Uživatelé jsou povinni komunikovat slušně a respektovat ostatní uživatele.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Je zakázáno zveřejňovat spam, reklamy nebo nevhodný obsah.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  6. Odpovědnost
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Společnost neodpovídá za kvalitu prodávaných produktů nebo za transakce mezi uživateli.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Uživatelé jsou odpovědní za dodržování všech platných zákonů a předpisů.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Společnost neodpovídá za škody vzniklé používáním Platformy.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  7. Ochrana osobních údajů
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Společnost zpracovává osobní údaje v souladu s GDPR a zásadami ochrany osobních údajů.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Uživatelé mají právo na přístup, opravu a smazání svých osobních údajů.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Osobní údaje nejsou předávány třetím stranám bez souhlasu uživatele.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  8. Závěrečná ustanovení
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Společnost si vyhrazuje právo změnit tyto podmínky kdykoliv.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    V případě sporu se strany pokusí vyřešit spor smírnou cestou.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Tyto podmínky se řídí českým právem.
                  </p>
                </div>
              </section>

              <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Pro jakékoliv dotazy kontaktujte nás na: info@airsoft-burza.cz
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
