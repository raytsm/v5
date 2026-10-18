const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const walk = directory =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(filename) : [filename];
  });
const buildId = fs.readFileSync(path.join(root, '.next/BUILD_ID'), 'utf8').trim();
const version = crypto.createHash('sha256').update(buildId).digest('hex').slice(0, 16);
const urls = [
  '/',
  '/archive/',
  '/pensieve/',
  '/pensieve/tags/',
  ...walk(path.join(root, '.next/static')).map(
    file =>
      `/_next/static/${path
        .relative(path.join(root, '.next/static'), file)
        .split(path.sep)
        .join('/')}`,
  ),
  ...walk(path.join(root, 'public/fonts')).map(
    file =>
      `/fonts/${path.relative(path.join(root, 'public/fonts'), file).split(path.sep).join('/')}`,
  ),
];

fs.writeFileSync(
  path.join(root, 'public/sw.js'),
  `
const CACHE = 'portfolio-next-${version}';
const PRECACHE = ${JSON.stringify(urls)};
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE && (key.startsWith('portfolio-next-') || key.startsWith('gatsby-') || key.startsWith('workbox-'))).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname === '/sw.js') return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); }
      return response;
    }).catch(() => caches.match(event.request).then(response => response || caches.match('/'))));
  } else if (/^\\/(?:_next\\/static|fonts|media)\\//.test(url.pathname)) {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); }
      return response;
    })));
  }
});
`,
);
console.log('Generated production offline worker.');
