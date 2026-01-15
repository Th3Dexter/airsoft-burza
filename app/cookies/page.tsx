import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
              Zásady používání cookies
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Poslední aktualizace: 1. ledna 2024
            </p>
          </div>

          <Card>
            <CardContent className="p-8 space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  1. Co jsou cookies
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Cookies jsou malé textové soubory, které se ukládají do vašeho zařízení při návštěvě webových stránek. 
                  Pomáhají nám zlepšovat funkčnost webu a poskytovat lepší uživatelskou zkušenost.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Naše platforma používá cookies v souladu s platnými právními předpisy, zejména s Nařízením EU 2016/679 (GDPR).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  2. Typy cookies, které používáme
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
                      Nezbytné cookies
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Tyto cookies jsou nezbytné pro základní fungování webu a nelze je vypnout.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 ml-4">
                      <li>Udržování přihlášení uživatele</li>
                      <li>Zabezpečení webu</li>
                      <li>Základní funkčnost platformy</li>
                      <li>Ukládání preferencí jazyka</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
                      Analytické cookies
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Pomáhají nám pochopit, jak návštěvníci používají naše stránky.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 ml-4">
                      <li>Google Analytics - měření návštěvnosti</li>
                      <li>Analýza používání webu</li>
                      <li>Statistiky používání funkcí</li>
                      <li>Optimalizace výkonu</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
                      Marketingové cookies
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Používají se pro zobrazování relevantních reklam a měření jejich účinnosti.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 ml-4">
                      <li>Facebook Pixel - měření účinnosti reklam</li>
                      <li>Google Ads - remarketing</li>
                      <li>Personalizace reklam</li>
                      <li>Měření účinnosti kampaní</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
                      Funkční cookies
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Umožňují pokročilé funkce a personalizaci.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 ml-4">
                      <li>Ukládání preferencí uživatele</li>
                      <li>Pamatování nastavení</li>
                      <li>Chatovací funkce</li>
                      <li>Ukládání košíku</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  3. Doba platnosti cookies
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Různé cookies mají různou dobu platnosti:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                    <li><strong>Session cookies</strong> - platné pouze po dobu návštěvy (odstraní se po zavření prohlížeče)</li>
                    <li><strong>Trvalé cookies</strong> - platné od několika dnů po několik let</li>
                    <li><strong>Analytické cookies</strong> - obvykle 2 roky</li>
                    <li><strong>Marketingové cookies</strong> - obvykle 1 rok</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  4. Správa cookies
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Můžete spravovat cookies několika způsoby:
                  </p>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
                      Nastavení prohlížeče
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Většina prohlížečů umožňuje:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 ml-4">
                      <li>Zobrazit uložené cookies</li>
                      <li>Smazat jednotlivé nebo všechny cookies</li>
                      <li>Blokovat cookies od určitých webů</li>
                      <li>Blokovat cookies třetích stran</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
                      Naše nastavení
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Na naší platformě můžete:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 ml-4">
                      <li>Přijmout nebo odmítnout nepodstatné cookies</li>
                      <li>Upravit své preference kdykoliv</li>
                      <li>Zobrazit seznam všech používaných cookies</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  5. Cookies třetích stran
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Naše platforma používá služby třetích stran, které mohou ukládat vlastní cookies:
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                        Google Analytics
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Služba pro analýzu návštěvnosti webu. Více informací: 
                        <a href="https://policies.google.com/privacy" className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 underline ml-1">
                          Google Privacy Policy
                        </a>
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                        Facebook Pixel
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Služba pro měření účinnosti reklam a remarketing. Více informací: 
                        <a href="https://www.facebook.com/privacy/explanation" className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 underline ml-1">
                          Facebook Data Policy
                        </a>
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                        Google Ads
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Služba pro zobrazování reklam. Více informací: 
                        <a href="https://policies.google.com/privacy" className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 underline ml-1">
                          Google Privacy Policy
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  6. Dopad na funkčnost
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Vypnutí některých cookies může ovlivnit funkčnost webu:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                    <li>Nezbytné cookies - web nebude fungovat správně</li>
                    <li>Funkční cookies - některé funkce nebudou dostupné</li>
                    <li>Analytické cookies - nebudeme moci zlepšovat web</li>
                    <li>Marketingové cookies - reklamy nebudou personalizované</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  7. Kontakt
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Pro dotazy ohledně cookies nás kontaktujte:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                    <li>Email: privacy@airsoft-burza.cz</li>
                    <li>Telefon: +420 123 456 789</li>
                    <li>Adresa: Praha, Česká republika</li>
                  </ul>
                </div>
              </section>

              <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tyto zásady mohou být kdykoliv aktualizovány. O změnách vás budeme informovat oznámením na platformě.
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
