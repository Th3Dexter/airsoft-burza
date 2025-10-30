import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
              Zásady ochrany osobních údajů
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Poslední aktualizace: 1. ledna 2024
            </p>
          </div>

          <Card>
            <CardContent className="p-8 space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  1. Úvod
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Společnost Airsoft Burza s.r.o. (dále jen "Společnost") se zavazuje chránit vaše osobní údaje 
                  v souladu s Nařízením EU 2016/679 (GDPR) a zákonem č. 110/2019 Sb., o zpracování osobních údajů.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Tento dokument popisuje, jak zpracováváme vaše osobní údaje při používání naší platformy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  2. Správce osobních údajů
                </h2>
                <div className="space-y-3">
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Název:</strong> Airsoft Burza s.r.o.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>IČO:</strong> 12345678
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Adresa:</strong> Praha, Česká republika
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Email:</strong> info@airsoft-burza.cz
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  3. Jaké údaje zpracováváme
                </h2>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-black dark:text-white">
                    Údaje poskytnuté přímo vámi:
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                    <li>Jméno a příjmení</li>
                    <li>Emailová adresa</li>
                    <li>Telefonní číslo</li>
                    <li>Adresa bydliště</li>
                    <li>Informace o prodávaných produktech</li>
                    <li>Fotografie produktů</li>
                    <li>Zprávy v rámci platformy</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-black dark:text-white">
                    Údaje shromážděné automaticky:
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                    <li>IP adresa</li>
                    <li>Typ prohlížeče a operačního systému</li>
                    <li>Čas a datum návštěvy</li>
                    <li>Stránky, které jste navštívili</li>
                    <li>Cookies a podobné technologie</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  4. Účel zpracování
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Vaše osobní údaje zpracováváme za následujícími účely:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                    <li>Poskytování služeb platformy</li>
                    <li>Komunikace mezi uživateli</li>
                    <li>Registrace uživatelů</li>
                    <li>Zabezpečení platformy</li>
                    <li>Zlepšování služeb</li>
                    <li>Placení zákonných povinností</li>
                    <li>Marketingové účely (pouze se souhlasem)</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  5. Právní základ zpracování
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Zpracováváme vaše osobní údaje na základě:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                    <li><strong>Souhlasu</strong> - pro marketingové účely</li>
                    <li><strong>Smlouvy</strong> - pro poskytování služeb platformy</li>
                    <li><strong>Oprávněného zájmu</strong> - pro zabezpečení a zlepšování služeb</li>
                    <li><strong>Zákonné povinnosti</strong> - pro plnění daňových a účetních povinností</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  6. Sdílení údajů
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Vaše osobní údaje nesdílíme s třetími stranami, kromě:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                    <li>Poskytovatelů technických služeb (hosting, analýzy)</li>
                    <li>Úřadů na základě zákonné povinnosti</li>
                    <li>Ostatních uživatelů platformy (pouze veřejné informace z profilu)</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  7. Vaše práva
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    V souvislosti se zpracováním osobních údajů máte následující práva:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                    <li><strong>Právo na přístup</strong> - můžete požádat o informace o zpracování vašich údajů</li>
                    <li><strong>Právo na opravu</strong> - můžete požádat o opravu nepřesných údajů</li>
                    <li><strong>Právo na výmaz</strong> - můžete požádat o smazání vašich údajů</li>
                    <li><strong>Právo na omezení</strong> - můžete požádat o omezení zpracování</li>
                    <li><strong>Právo na přenositelnost</strong> - můžete požádat o předání údajů</li>
                    <li><strong>Právo vznést námitku</strong> - můžete namítat proti zpracování</li>
                    <li><strong>Právo odvolat souhlas</strong> - můžete kdykoliv odvolat souhlas</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  8. Zabezpečení údajů
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Implementujeme vhodná technická a organizační opatření k ochraně vašich osobních údajů:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                    <li>Šifrování dat při přenosu i uložení</li>
                    <li>Pravidelné bezpečnostní aktualizace</li>
                    <li>Omezený přístup k údajům pouze oprávněným osobám</li>
                    <li>Pravidelné zálohování dat</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  9. Doba uchování
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Osobní údaje uchováváme pouze po dobu nezbytně nutnou:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                    <li>Údaje o účtu - po dobu existence účtu + 3 roky</li>
                    <li>Údaje o inzerátech - po dobu existence inzerátu + 1 rok</li>
                    <li>Komunikační údaje - 3 roky od poslední komunikace</li>
                    <li>Účetní doklady - 10 let (zákonná povinnost)</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  10. Kontakt
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Pro jakékoliv dotazy ohledně zpracování osobních údajů nás kontaktujte:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                    <li>Email: privacy@airsoft-burza.cz</li>
                    <li>Telefon: +420 123 456 789</li>
                    <li>Adresa: Praha, Česká republika</li>
                  </ul>
                  <p className="text-gray-600 dark:text-gray-300">
                    Máte také právo podat stížnost u Úřadu pro ochranu osobních údajů.
                  </p>
                </div>
              </section>

              <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tyto zásady mohou být kdykoliv aktualizovány. O změnách vás budeme informovat e-mailem nebo oznámením na platformě.
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
