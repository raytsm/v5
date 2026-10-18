const { chromium } = require('playwright');
const base = process.env.TEST_BASE_URL || 'http://localhost:8000';
const assert = require('assert');
const { showProjects } = require('../src/config');
const { outline, fragments } = require('../src/lib/logo.cjs');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    const failures = [];
    for (const reducedMotion of ['reduce', 'no-preference']) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        locale: 'en-US',
        timezoneId: 'America/Los_Angeles',
        reducedMotion,
      });
      await context.route('https://api.github.com/**', route => route.fulfill({ json: {} }));
      const page = await context.newPage();
      page.on('pageerror', error => failures.push(`${page.url()}: ${error.message}`));
      page.on('console', message => {
        if (
          ['error', 'warning'].includes(message.type()) &&
          /Invalid hook call|findDOMNode|Warning:|Hydration failed|hydration mismatch/i.test(
            message.text(),
          )
        ) {
          failures.push(`${page.url()}: ${message.text()}`);
        }
      });
      await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#about', { state: 'attached', timeout: 20000 });
      await page.waitForTimeout(reducedMotion === 'reduce' ? 300 : 3000);
      assert(await page.locator('h1').isVisible(), 'Hero heading missing');
      const logo = page.getByRole('img', { name: 'Roshan Thapa logo', exact: true });
      assert(await logo.isVisible(), 'Honeycomb logo missing');
      assert.strictEqual(await logo.locator('.logo-outline').getAttribute('points'), outline);
      assert.strictEqual(await logo.locator('.logo-letter').count(), 0);
      assert.strictEqual(await logo.locator('.honeycomb-fragment').count(), fragments.length);
      const logoAnimations = await logo.evaluate(
        svg => svg.getAnimations({ subtree: true }).length,
      );
      assert.strictEqual(logoAnimations > 0, reducedMotion === 'no-preference');
      const tabs = page.locator('[role=tab]');
      await tabs.nth(1).click();
      assert.strictEqual(await tabs.nth(1).getAttribute('aria-selected'), 'true');
      assert(
        (await page.locator('[role=tabpanel]:visible').innerText()).includes(
          'Building Data Infrastructure',
        ),
      );
      const cards = page.locator('section').filter({ hasText: 'Other Noteworthy Projects' });
      if (showProjects) {
        assert.strictEqual(await cards.locator('ul.projects-grid > li').count(), 6);
        await page.getByRole('button', { name: 'Show More' }).click();
        await page.getByRole('button', { name: 'Show Less' }).waitFor();
        await page.getByRole('button', { name: 'Show Less' }).click();
        await page.getByRole('button', { name: 'Show More' }).waitFor();
      } else {
        assert.strictEqual(await cards.count(), 0);
      }
      await page.goto(`${base}/archive/`, { waitUntil: 'domcontentloaded' });
      assert.strictEqual(await page.locator('tbody tr').count(), 40);
      await page.goto(`${base}/pensieve/`, { waitUntil: 'domcontentloaded' });
      await page.getByRole('link', { name: 'Dark Mode Toggle', exact: true }).click();
      await page.waitForURL('**/pensieve/dark-mode-toggle/');
      await page.waitForFunction(() => document.title === 'Dark Mode Toggle | Roshan Thapa');
      await page.getByRole('link', { name: '#Theming', exact: true }).click();
      await page.waitForURL('**/pensieve/tags/theming/');
      assert((await page.locator('main').innerText()).includes('Dark Mode Toggle'));
      const response = await page.goto(`${base}/this-does-not-exist/`, {
        waitUntil: 'domcontentloaded',
      });
      assert.strictEqual(response.status(), 404);
      await page.getByRole('link', { name: 'Go Home' }).waitFor();
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#about', { state: 'attached', timeout: 20000 });
      await page.waitForTimeout(reducedMotion === 'reduce' ? 300 : 3000);
      await page.getByRole('button', { name: 'Menu', exact: true }).click();
      assert(await page.locator('body').evaluate(el => el.classList.contains('blur')));
      await page.locator('aside').getByRole('link', { name: 'Experience' }).click();
      assert(!(await page.locator('body').evaluate(el => el.classList.contains('blur'))));
      assert(page.url().endsWith('#jobs'));
      const resume = await context.request.get(`${base}/resume.pdf`);
      assert(resume.ok());
      assert(resume.headers()['content-type'].includes('pdf'));
      const favicon = await context.request.get(`${base}/favicon.svg`);
      assert(favicon.ok());
      const faviconSvg = await favicon.text();
      assert(faviconSvg.includes(outline));
      assert(fragments.every(fragment => faviconSvg.includes(fragment)));
      const manifest = await context.request.get(`${base}/manifest.webmanifest`);
      assert.strictEqual((await manifest.json()).name, 'Roshan Thapa');
      await context.close();
      console.log(`Interactions passed: ${reducedMotion}`);
    }
    assert.deepStrictEqual(failures, []);
    console.log('No browser runtime errors or React warnings in either motion mode.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
