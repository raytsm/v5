const fs = require('fs');
const path = require('path');

for (const directory of ['.next', 'out', 'public']) {
  fs.rmSync(path.resolve(__dirname, '..', directory), { recursive: true, force: true });
}
console.log('Cleared generated Next.js files. Stop the dev server before running this command.');
