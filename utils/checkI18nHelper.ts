import fs from 'fs';
import path from 'node:path';

export type LocaleMap = Record<string, string>;

/**
 * Reads locale files from a directory and returns a map of locale code -> raw json-like string
 * Mirrors logic from scripts/check-i18n.mjs (naive parse of `export default { ... }`).
 */
export function readLocales(localesDir: string): LocaleMap {
  const absDir = path.resolve(localesDir);
  let files: string[] = [];
  try {
    files = fs.readdirSync(absDir).filter((f) => f.endsWith('.ts'));
  } catch {
    // Directory might not exist; return empty map per graceful behavior
    return {};
  }

  return files.reduce<LocaleMap>((acc, file) => {
    const content = fs.readFileSync(path.join(absDir, file), 'utf8');
    // naive parse: export default { ... }
    const jsonLike = content.replace(/^\s*export\s+default\s+/, '').trim();
    acc[path.basename(file, '.ts')] = jsonLike;
    return acc;
  }, {});
}
