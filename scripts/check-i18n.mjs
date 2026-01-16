import fs from 'node:fs';
import path from 'node:path';

const localesDir = path.resolve('locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.ts'));

const localeData = files.reduce((acc, file) => {
  const mod = fs.readFileSync(path.join(localesDir, file), 'utf8');
  // naive parse: export default { ... }
  const jsonLike = mod.replace(/^export default /, '').trim();
  acc[path.basename(file, '.ts')] = jsonLike;
  return acc;
}, {});

console.log('i18n files detected:', Object.keys(localeData));
// In a real setup, parse TS and compare keys across locales.
process.exit(0);
