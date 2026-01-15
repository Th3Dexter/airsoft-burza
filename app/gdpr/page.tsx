import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'

export default function GDPRPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
              GDPR - Obecné nařízení o ochraně osobních údajů
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Informace o vašich právech podle GDPR
            </p>
          </div>

          <Card>
            <CardContent className="p-8 space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  Co je GDPR
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Obecné nařízení o ochraně osobních údajů (GDPR) je evropské nařízení, které posiluje a sjednocuje 
                  ochranu osobních údajů všech osob v rámci Evropské unie. Platí od 25. května 2018.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Naše platforma Airsoft Burza plně respektuje všechna ustanovení GDPR a zavazuje se chránit vaše osobní údaje.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  Vaše práva podle GDPR
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
                      1. Právo na informace
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Máte právo být informováni o tom, jak zpracováváme vaše osobní údaje.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Více informací najdete v našich Zásadách ochrany osobních údajů.
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
                      2. Právo na přístup
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Můžete požádat o potvrzení, zda zpracováváme vaše osobní údaje, a pokud ano, o přístup k nim.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Požádat můžete e-mailem na privacy@airsoft-burza.cz
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
                      3. Právo na opravu
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Máte právo na opravu nepřesných osobních údajů a na doplnění neúplných osobních údajů.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Můžete upravit své údaje přímo ve svém profilu nebo nás kontaktovat.
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
                      4. Právo na výmaz ("právo být zapomenut")
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Za určitých okolností máte právo na výmaz vašich osobních údajů.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Toto právo není absolutní a může být omezeno zákonnými povinnostmi.
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
                      5. Právo na omezení zpracování
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Můžete požádat o omezení zpracování vašich osobních údajů za určitých okolností.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Například pokud zpochybňujete přesnost údajů nebo nesouhlasíte se zpracováním.
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
                      6. Právo na přenositelnost
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Máte právo získat vaše osobní údaje ve strukturovaném, běžně používaném a strojově čitelném formátu.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Můžete požádat o export vašich dat z platformy.
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
                      7. Právo vznést námitku
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Můžete namítat proti zpracování vašich osobních údajů pro účely oprávněného zájmu.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Toto právo se týká zejména marketingových účelů.
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
                      8. Práva v souvislosti s automatizovaným rozhodováním
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Máte právo nebýt předmětem rozhodnutí založeného výhradně na automatizovaném zpracování.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Včetně profilování, pokud má právní účinky nebo vás podobně významně ovlivňuje.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  Jak uplatnit svá práva
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Pro uplatnění vašich práv nás můžete kontaktovat:
                  </p>
                  
                  <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
                      Kontaktní údaje
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                      <li><strong>Email:</strong> privacy@airsoft-burza.cz</li>
                      <li><strong>Telefon:</strong> +420 123 456 789</li>
                      <li><strong>Adresa:</strong> Praha, Česká republika</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-black dark:text-white">
                      Co potřebujeme od vás:
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 ml-4">
                      <li>Jasné uvedení, jaké právo chcete uplatnit</li>
                      <li>Doklad o totožnosti (pro identifikaci)</li>
                      <li>Konkrétní popis vašeho požadavku</li>
                      <li>Kontaktní údaje pro odpověď</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  Doba vyřízení
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Podle GDPR máme povinnost vyřídit váš požadavek bez zbytečného odkladu, nejpozději však do jednoho měsíce.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    V složitých případech můžeme lhůtu prodloužit o další dva měsíce, o čemž vás budeme informovat.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  Stížnosti
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Pokud si myslíte, že jsme porušili vaše práva podle GDPR, můžete podat stížnost:
                  </p>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
                      Úřad pro ochranu osobních údajů
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                      <li><strong>Adresa:</strong> Pplk. Sochora 27, 170 00 Praha 7</li>
                      <li><strong>Email:</strong> posta@uoou.cz</li>
                      <li><strong>Telefon:</strong> +420 234 665 111</li>
                      <li><strong>Web:</strong> www.uoou.cz</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  Bezpečnost údajů
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Implementujeme vhodná technická a organizační opatření k ochraně vašich osobních údajů:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                    <li>Šifrování dat při přenosu i uložení</li>
                    <li>Pravidelné bezpečnostní audity</li>
                    <li>Omezený přístup k údajům pouze oprávněným osobám</li>
                    <li>Pravidelné školení zaměstnanců</li>
                  </ul>
                </div>
              </section>

              <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tato stránka je pravidelně aktualizována v souladu s aktuálními právními předpisy. 
                  Poslední aktualizace: 1. ledna 2024
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
