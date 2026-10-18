const { chromium } = require('playwright');
const base = process.env.TEST_BASE_URL || 'http://localhost:8000';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
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
      await page.goto(`${base}/blog/`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.title === 'Blog | Roshan Thapa');
      const previewingDrafts =
        (await page
          .getByText('Local preview includes unpublished drafts.', { exact: true })
          .count()) > 0;
      if (process.env.TEST_BUILD_MODE) {
        assert.strictEqual(previewingDrafts, process.env.TEST_BUILD_MODE === 'development');
      }
      const search = page.getByRole('searchbox', { name: 'Search posts' });
      await search.fill('hello');
      assert.strictEqual(
        await page.getByRole('list', { name: 'Blog posts' }).locator('li').count(),
        1,
      );
      await search.fill('this-search-has-no-results');
      await page.getByRole('heading', { name: 'No matching posts', exact: true }).waitFor();
      await page.getByRole('button', { name: 'Clear filters' }).click();
      await page.getByRole('button', { name: 'Notes', exact: true }).click();
      assert.strictEqual(
        await page.getByRole('button', { name: 'Notes', exact: true }).getAttribute('aria-pressed'),
        'true',
      );
      await page.getByRole('link', { name: 'Hello, world.', exact: true }).click();
      await page.waitForURL('**/blog/hello-world/');
      await page.getByRole('heading', { name: 'Hello, world.', exact: true }).waitFor();
      assert((await page.locator('.blog-prose').innerText()).includes('What I’ll write about'));
      assert.strictEqual(await page.locator('meta[name=description]').count(), 1);
      assert.strictEqual(
        await page.locator('meta[property="og:url"]').getAttribute('content'),
        'https://roshan-thapa.com.np/blog/hello-world/',
      );
      await page.getByRole('link', { name: '#Notes', exact: true }).click();
      await page.waitForFunction(
        () =>
          document.querySelector('.topics button[aria-pressed="true"]')?.textContent === 'Notes',
      );
      await page.getByRole('button', { name: 'All posts', exact: true }).click();
      const draft = await context.request.get(`${base}/blog/my-next-post/`);
      assert.strictEqual(draft.status(), previewingDrafts ? 200 : 404);
      if (previewingDrafts) {
        await page.goto(`${base}/blog/my-next-post/`, { waitUntil: 'domcontentloaded' });
        assert.strictEqual(await page.locator('.blog-prose table').count(), 1);
        assert(
          (await page.locator('.blog-prose .gatsby-highlight').innerText()).includes('transform'),
        );
        const slug = `browser-authoring-check-${Date.now()}`;
        const filename = path.join(__dirname, '../blog', `${slug}.md`);
        try {
          fs.writeFileSync(
            filename,
            `---\ntitle: Browser authoring check\ndate: '2026-10-18'\ndraft: true\n---\nA brand new local draft.\n`,
          );
          const freshPost = await context.request.get(`${base}/blog/${slug}/`);
          assert.strictEqual(freshPost.status(), 200, 'A newly added draft requires a restart');
          assert((await freshPost.text()).includes('A brand new local draft.'));
        } finally {
          fs.rmSync(filename, { force: true });
        }
      }
      const sitemap = await context.request.get(`${base}/sitemap.xml`);
      const sitemapXml = await sitemap.text();
      assert(sitemapXml.includes('https://roshan-thapa.com.np/blog/hello-world/'));
      assert(!sitemapXml.includes('/blog/my-next-post/'));
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
      await page.goto(`${base}/blog/`, { waitUntil: 'domcontentloaded' });
      await page.getByRole('searchbox', { name: 'Search posts' }).fill('hello');
      await page.getByRole('link', { name: 'Hello, world.', exact: true }).click();
      await page.waitForURL('**/blog/hello-world/');
      assert(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        'Blog overflows the mobile viewport',
      );
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
