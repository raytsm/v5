const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const { viewBox, outline, fragments } = require('../src/lib/logo.cjs');

const root = path.resolve(__dirname, '..');

function logoSvg(compact = false) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="${viewBox}">
    <rect x="-100" y="-100" width="300" height="300" fill="#0a192f"/>
    <g fill="none" stroke="#64ffda" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="${outline}" stroke-width="${compact ? 8 : 4}"/>
      ${fragments
        .map(
          d =>
            `<path d="${d}" stroke-width="${compact ? 7 : 3}" opacity="${compact ? 0.85 : 0.5}"/>`,
        )
        .join('')}
    </g>
  </svg>`;
}

// ICO entries contain PNG images at the common browser-tab resolutions.
function toIco(images) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, png }, i) => {
    const entry = 6 + i * 16;
    header[entry] = size;
    header[entry + 1] = size;
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map(image => image.png)]);
}

async function generateIcons(publicDir) {
  const compact = Buffer.from(logoSvg(true));
  const full = Buffer.from(logoSvg());
  const sizes = [16, 32, 48];
  const images = await Promise.all(
    sizes.map(async size => ({
      size,
      png: await sharp(compact).resize(size, size).png().toBuffer(),
    })),
  );
  const files = [
    ['src/images/favicons/favicon.svg', 'favicon.svg', compact],
    ['src/images/favicons/favicon.ico', 'favicon.ico', toIco(images)],
    [
      'src/images/favicons/apple-icon-180x180.png',
      'apple-touch-icon.png',
      await sharp(full).resize(180, 180).png().toBuffer(),
    ],
    ['src/images/logo.png', 'icon.png', await sharp(full).png().toBuffer()],
  ];
  for (const [source, destination, contents] of files) {
    await fs.writeFile(path.join(root, source), contents);
    await fs.writeFile(path.join(publicDir, destination), contents);
  }
}

module.exports = { generateIcons };
