import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3000", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Click on the first product's 'Zobrazit podrobnosti' button to open the product detail page.
        frame = context.pages[-1]
        # Click on 'Zobrazit podrobnosti' button of the first product to open product detail page
        elem = frame.locator('xpath=html/body/div[2]/main/div/div/main/section[2]/div/div[2]/div/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=L96 full upgrade 2,8 J').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=5 900 Kč').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Prodávám za 6000 Kč, nová stála okolo 12500 Kč. Zbraň Well L96 s přesnou nerezovou hlavní 6,01 mm, hop up komorou na AEG hop up gumičky airsoftpro, hop up gumička Maple Leaf Maracon 70°, přechodka na 14 mm AEG závit hliníkový, ocelový válec, píst s pružinou asi M150, kovový CNC spoušťový mechanismus airsoftpro, nerezová hlava válce, možná ocelová vzpěra trnu, centrovací kroužky 3 černý. K zbrani 3 zásobníky, bipody s kovovou částí, optika 3-9x40 s killflashem, popruh a zbytek 0,45 g kuliček. Doporučuji dokoupit kvalitní tlumič za 1000 Kč, se kterým je zbraň hodně tichá. Při rychlém jednání sleva. Osobní předání v Letohradě, Praze nebo zásilkovna. Kontakt přes e-mail nebo WhatsApp.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=DexterexCZ').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    