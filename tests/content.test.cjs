const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const sharp = require('sharp');
const { getImage } = require('../src/lib/images.cjs');
const {
  renderMarkdown,
  getCollection,
  getHomeData,
  getTagGroups,
} = require('../src/lib/content.cjs');

test('existing homepage content loads with optional CTA links and responsive images', async () => {
  const data = await getHomeData();
  assert.equal(data.jobs.edges.length, 3);
  assert.deepEqual(
    data.featured.edges.map(({ node }) => node.frontmatter.title),
    ['Magar Kura', 'Pesha.work'],
  );
  for (const { node } of data.featured.edges) {
    assert.equal(node.frontmatter.cta, null);
    assert.ok(node.html.includes('<p>'));
    assert.ok(node.frontmatter.tech.length);
    assert.ok(
      fs.existsSync(path.join(process.cwd(), 'public', node.frontmatter.cover.images.fallback.src)),
    );
  }
  assert.ok(data.headshot.width === 500);
});

test('draft posts keep their direct routes but stay out of the published index', async () => {
  const all = await getCollection('posts');
  const published = await getCollection('posts', { publishedOnly: true });
  assert.ok(all.some(node => node.frontmatter.slug === '/pensieve/markdown-playground'));
  assert.ok(!published.some(node => node.frontmatter.draft));
  assert.equal(published.length, 4);
  assert.ok(!(await getTagGroups()).some(tag => tag.fieldValue === 'Testing'));
  assert.ok(
    (await getTagGroups({ includeDrafts: true })).some(tag => tag.fieldValue === 'Testing'),
  );
});

test('Markdown preserves raw HTML, code titles, highlighting, and external link attributes', async () => {
  const html = await renderMarkdown(
    '[Example](https://example.com)\n\n<span>HTML</span>\n\n`inline`\n\n```js:title=app.js\nconst answer = 42; // highlight-line\n```',
    __filename,
  );
  assert.match(html, /target="_blank" rel="nofollow noopener noreferrer"/);
  assert.match(html, /<span>HTML<\/span>/);
  assert.match(html, /class="language-text">inline/);
  assert.match(html, /class="gatsby-code-title">app.js/);
  assert.match(html, /class="gatsby-highlight-code-line"/);
  assert.match(html, /class="token keyword">const/);
});

test('archive includes projects hidden from homepage cards', async () => {
  const archive = await getCollection('projects');
  const home = await getHomeData();
  assert.ok(archive.length > home.projects.edges.length);
  assert.ok(home.projects.edges.every(({ node }) => node.frontmatter.showInProjects !== false));
});

test('new images generate native responsive assets without Gatsby or Intel binaries', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-image-'));
  try {
    const source = path.join(directory, 'image.png');
    await sharp({ create: { width: 80, height: 40, channels: 3, background: '#64ffda' } })
      .png()
      .toFile(source);
    const image = await getImage(source, { width: 40, quality: 80 });
    assert.equal(image.width, 40);
    assert.equal(image.height, 20);
    assert.deepEqual(
      image.images.sources.map(source => source.type),
      ['image/avif', 'image/webp'],
    );
    assert.ok(fs.existsSync(path.join(process.cwd(), 'public', image.images.fallback.src)));
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('existing range and block highlight directives are preserved in draft posts', async () => {
  const html = await renderMarkdown(
    '```jsx\n// highlight-range{1,3}\nconst a = 1;\nconst b = 2;\nconst c = 3;\n```',
    __filename,
  );
  assert.equal((html.match(/class="gatsby-highlight-code-line"/g) || []).length, 2);
  assert.ok(!html.includes('highlight-range'));
  const declaration = await renderMarkdown(
    '```js\nclass Example { // highlight-line\n}\n```',
    __filename,
  );
  assert.match(declaration, /class="token punctuation">\{<\/span>/);
});
