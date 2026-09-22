const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('PAGE ERROR:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('PAGE UNCAUGHT EXCEPTION:', error.message);
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  try {
    const buttons = await page.$$('button');
    for (let btn of buttons) {
      await btn.click().catch(() => {});
      await new Promise(r => setTimeout(r, 500));
    }
  } catch (err) {
    console.log('Crawl error', err.message);
  }
  
  await browser.close();
})();
