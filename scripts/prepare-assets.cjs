const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const kebabCase = require('lodash/kebabCase');
const site = require('../src/lib/site');
const { generateIcons } = require('./generate-icons.cjs');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
fs.mkdirSync(publicDir, { recursive: true });

for (const [source, destination] of [
  ['assets/static', ''],
  ['src/fonts', 'fonts'],
  ['assets/optimized', 'media'],
]) {
  fs.cpSync(path.join(root, source), path.join(publicDir, destination), { recursive: true });
}

fs.writeFileSync(
  path.join(publicDir, 'manifest.webmanifest'),
  JSON.stringify({
    name: site.title,
    short_name: site.title,
    start_url: '/',
    background_color: '#020c1b',
    theme_color: '#0a192f',
    display: 'minimal-ui',
    icons: [{ src: '/icon.png?v=honeycomb', sizes: '512x512', type: 'image/png' }],
  }),
);

const walk = directory =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(filename) : [filename];
  });
const posts = walk(path.join(root, 'content/posts'))
  .filter(file => file.endsWith('.md'))
  .map(file => matter.read(file).data);
const routes = new Set(['/', '/archive/', '/pensieve/', '/pensieve/tags/']);
for (const post of posts) {
  routes.add(`${post.slug.replace(/\/$/, '')}/`);
  for (const tag of post.tags || []) routes.add(`/pensieve/tags/${kebabCase(tag)}/`);
}
const urls = [...routes].map(route => `<url><loc>${site.siteUrl}${route}</loc></url>`).join('');
fs.writeFileSync(
  path.join(publicDir, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
);
fs.writeFileSync(
  path.join(publicDir, 'robots.txt'),
  `User-agent: *\nAllow: /\nSitemap: ${site.siteUrl}/sitemap.xml\n`,
);

generateIcons(publicDir)
  .then(() =>
    console.log('Prepared static files, honeycomb icons, original fonts, and optimized images.'),
  )
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
