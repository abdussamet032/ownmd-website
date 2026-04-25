const { chromium } = require('playwright');

const BASE = 'http://localhost:8765';
const LANGS = ['en', 'tr', 'de', 'es', 'fr', 'ja', 'pt', 'zh'];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  for (const lang of LANGS) {
    console.log(`Screenshotting: ${lang}`);

    await page.goto(`${BASE}/index.html`);
    await page.evaluate((l) => {
      localStorage.setItem('ownmd-lang', l);
    }, lang);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Full page screenshot
    await page.screenshot({
      path: `screenshots/${lang}-full.png`,
      fullPage: true
    });

    // Hero section
    const hero = await page.$('#hero');
    if (hero) await hero.screenshot({ path: `screenshots/${lang}-hero.png` });

    // Features section
    const features = await page.$('#features');
    if (features) await features.screenshot({ path: `screenshots/${lang}-features.png` });

    // Editor section
    const editor = await page.$('#editor');
    if (editor) await editor.screenshot({ path: `screenshots/${lang}-editor.png` });

    // Themes section
    const themes = await page.$('#themes');
    if (themes) await themes.screenshot({ path: `screenshots/${lang}-themes.png` });

    // CTA section
    const download = await page.$('#download');
    if (download) await download.screenshot({ path: `screenshots/${lang}-cta.png` });
  }

  await browser.close();
  console.log('Done!');
})();
