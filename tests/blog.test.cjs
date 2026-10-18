const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const sharp = require('sharp');
const { getBlogPosts, getBlogPost } = require('../src/lib/blog.cjs');

function fixtures(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-blog-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const write = (name, source) => {
    const filename = path.join(directory, name);
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    fs.writeFileSync(filename, source);
    return filename;
  };
  return { directory, write };
}

test('root blog reads flat and nested Markdown, sorts dates, and ignores authoring guides', t => {
  const { directory, write } = fixtures(t);
  write('older-note.md', '---\ntitle: Older\ndate: "2026-01-01"\n---\nAn older note.');
  write(
    'newer-note/index.md',
    '---\ntitle: Newer\ndate: "2026-10-18"\ntags: [Data, Data]\n---\nA newer note.',
  );
  write('README.md', '# Writing instructions');
  write('_template.md', 'This is not a post.');
  const posts = getBlogPosts({ directory });
  assert.deepEqual(
    posts.map(post => post.url),
    ['/blog/newer-note/', '/blog/older-note/'],
  );
  assert.deepEqual(posts[0].tags, ['Data']);
  assert.equal(posts[0].description, 'A newer note.');
  assert.ok(!('content' in posts[0]) && !('filename' in posts[0]));
});

test('draft content is inaccessible by default and available only when preview is enabled', async t => {
  const { directory, write } = fixtures(t);
  write('private.md', '---\ntitle: Unpublished\ndate: "2026-10-18"\ndraft: true\n---\nDraft body.');
  assert.deepEqual(getBlogPosts({ directory }), []);
  assert.equal(await getBlogPost('private', { directory }), null);
  const preview = await getBlogPost('private', { directory, includeDrafts: true });
  assert.equal(preview.draft, true);
  assert.match(preview.html, /Draft body/);
});

test('new blog articles render relative images, code, and GFM tables', async t => {
  const { directory, write } = fixtures(t);
  write(
    'article/index.md',
    '---\ntitle: Article\ndate: "2026-10-18"\nslug: custom-url\n---\n![Diagram](./diagram.png)\n\n```python\nprint("hello")\n```\n\n| Name | Value |\n| --- | --- |\n| A | 1 |',
  );
  await sharp({ create: { width: 40, height: 20, channels: 3, background: '#64ffda' } })
    .png()
    .toFile(path.join(directory, 'article/diagram.png'));
  const post = await getBlogPost('custom-url', { directory });
  assert.equal(post.url, '/blog/custom-url/');
  assert.match(post.html, /alt="Diagram"/);
  assert.match(post.html, /srcset=/);
  assert.match(post.html, /class="token/);
  assert.match(post.html, /<table>/);
});

test('ambiguous draft flags and duplicate URLs fail with an actionable filename', t => {
  const { directory, write } = fixtures(t);
  write('note.md', '---\ntitle: Note\ndate: "2026-10-18"\ndraft: "false"\n---\nText.');
  assert.throws(() => getBlogPosts({ directory }), /note\.md: draft must be true or false/);
  write('note.md', '---\ntitle: Note\ndate: "2026-10-18"\nslug: same-url\n---\nText.');
  write('another.md', '---\ntitle: Another\ndate: "2026-10-18"\nslug: same-url\n---\nText.');
  assert.throws(() => getBlogPosts({ directory }), /Duplicate blog slug "same-url"/);
});

test('invalid dates fail before publishing; an empty blog is supported', t => {
  const { directory, write } = fixtures(t);
  assert.deepEqual(getBlogPosts({ directory }), []);
  write('bad-date.md', '---\ntitle: Note\ndate: "2026-02-31"\n---\nText.');
  assert.throws(() => getBlogPosts({ directory }), /bad-date\.md: Use a valid date/);
});
