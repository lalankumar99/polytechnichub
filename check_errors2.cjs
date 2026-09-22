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
  
  // click workspace tab
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const workspaceBtn = buttons.find(b => b.textContent.includes('Workspace'));
    if(workspaceBtn) workspaceBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
