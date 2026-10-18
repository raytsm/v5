const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const cache = require('./image-cache.json');

const root = process.cwd();
const escape = value =>
  String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const hashFile = absolute =>
  crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');

async function getImage(relative, { width = 700, quality = 50 } = {}) {
  const absolute = path.resolve(root, relative);
  const hash = hashFile(absolute);
  const retained = cache[relative];
  if (
    retained?.hash === hash &&
    retained.image &&
    retained.options?.width === width &&
    retained.options?.quality === quality
  ) {
    return retained.image;
  }

  const metadata = await sharp(absolute).metadata();
  const displayWidth = Math.min(width, metadata.width);
  const height = Math.round((metadata.height / metadata.width) * displayWidth);
  const widths = [
    ...new Set(
      [0.25, 0.5, 1, 2].map(scale => Math.min(Math.round(displayWidth * scale), metadata.width)),
    ),
  ];
  const directory = `/media/${hash.slice(0, 24)}-${width}-${quality}`;
  fs.mkdirSync(path.join(root, 'public', directory), { recursive: true });

  const formats = ['avif', 'webp', metadata.format === 'png' ? 'png' : 'jpeg'];
  const sets = {};
  for (const format of formats) {
    const sources = [];
    for (const size of widths) {
      const src = `${directory}/${size}.${format}`;
      const output = path.join(root, 'public', src);
      if (!fs.existsSync(output)) {
        await sharp(absolute)
          .rotate()
          .resize({ width: size })
          .toFormat(format, { quality })
          .toFile(output);
      }
      sources.push({ src, size });
    }
    sets[format] = sources;
  }

  const sizes = `(min-width: ${displayWidth}px) ${displayWidth}px, 100vw`;
  const srcSet = sources => sources.map(source => `${source.src} ${source.size}w`).join(',\n');
  const fallbackFormat = formats[2];
  return {
    layout: 'constrained',
    width: displayWidth,
    height,
    images: {
      fallback: {
        src: sets[fallbackFormat].find(source => source.size === displayWidth).src,
        srcSet: srcSet(sets[fallbackFormat]),
        sizes,
      },
      sources: formats
        .slice(0, 2)
        .map(format => ({ type: `image/${format}`, srcSet: srcSet(sets[format]), sizes })),
    },
  };
}

async function markdownImage(relative, alt = '', title) {
  const absolute = path.resolve(root, relative);
  const retained = cache[relative];
  if (retained?.hash === hashFile(absolute) && retained.html) {
    return retained.html
      .replace(/alt="[^"]*"/, `alt="${escape(alt)}"`)
      .replace(/title="[^"]*"/, `title="${escape(title || alt)}"`);
  }

  const image = await getImage(relative, { width: 700, quality: 90 });
  return `<span class="gatsby-resp-image-wrapper" style="position:relative;display:block;margin-left:auto;margin-right:auto;max-width:${
    image.width
  }px">
<a class="gatsby-resp-image-link" href="${
    image.images.fallback.src
  }" style="display:block" target="_blank" rel="noopener">
<span class="gatsby-resp-image-background-image" style="padding-bottom:${
    (image.height / image.width) * 100
  }%;position:relative;display:block"></span>
<picture>${image.images.sources
    .map(
      source => `<source type="${source.type}" srcset="${source.srcSet}" sizes="${source.sizes}">`,
    )
    .join('')}
<img class="gatsby-resp-image-image" alt="${escape(alt)}" title="${escape(title || alt)}" src="${
    image.images.fallback.src
  }" srcset="${image.images.fallback.srcSet}" sizes="${
    image.images.fallback.sizes
  }" style="width:100%;height:100%;margin:0;vertical-align:middle;position:absolute;top:0;left:0" loading="lazy"></picture></a></span>`;
}

module.exports = { getImage, markdownImage };
