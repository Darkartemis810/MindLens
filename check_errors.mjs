import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));

    console.log("Navigating to http://localhost:8080...");
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 15000 }).catch(e => console.log('Goto timeout/error:', e.message));

    console.log("Page loaded. Waiting 3 seconds for dynamic content...");
    await page.waitForTimeout(3000);

    const content = await page.content();
    console.log("Body length:", content.length);
    const bodyHtml = await page.evaluate(() => document.body.innerHTML);
    console.log("Body HTML inner: ", bodyHtml.substring(0, 500));

    await browser.close();
})();
