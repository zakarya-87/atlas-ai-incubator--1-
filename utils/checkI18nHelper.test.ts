import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'node:path';

// We'll mock fs to simulate the locales directory and files
import * as fs from 'fs';
vi.mock('fs', async () => {
  const readdirSync = vi.fn();
  const readFileSync = vi.fn();
  return {
    default: { readdirSync, readFileSync },
    readdirSync,
    readFileSync,
  } as unknown as typeof import('fs');
});

import { readLocales } from './checkI18nHelper';

describe('readLocales helper (i18n)', () => {
  const localesDir = 'locales';

  beforeEach(() => {
    vi.clearAllMocks();
    // default: no files
    (fs.readdirSync as any).mockReturnValue([]);
    (fs.readFileSync as any).mockImplementation(() => '');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should list only .ts locale files and ignore non-TS files', () => {
    (fs.readdirSync as any).mockReturnValue(['en.ts', 'fr.ts', 'README.md']);
    (fs.readFileSync as any).mockImplementation((file: any) => {
      const base = path.basename(String(file));
      if (base === 'en.ts') return 'export default { en: true }';
      if (base === 'fr.ts') return 'export default { fr: true }';
      return '';
    });

    const result = readLocales(localesDir);
    expect(Object.keys(result).sort()).toEqual(['en', 'fr']);
  });

  it('should derive locale keys from filenames', () => {
    (fs.readdirSync as any).mockReturnValue(['ar.ts']);
    (fs.readFileSync as any).mockReturnValue('export default { ar: true }');

    const result = readLocales(localesDir);
    expect(result).toHaveProperty('ar');
  });

  it('should strip the "export default" prefix and collect remaining content', () => {
    (fs.readdirSync as any).mockReturnValue(['en.ts']);
    (fs.readFileSync as any).mockImplementation(() => 'export default { key: "value" }');

    const result = readLocales(localesDir);
    expect(result.en).toBe('{ key: "value" }');
  });

  it('should handle whitespace around export statement', () => {
    (fs.readdirSync as any).mockReturnValue(['en.ts']);
    (fs.readFileSync as any).mockImplementation(() => '\n  export   default   { a: 1 }  \n');

    const result = readLocales(localesDir);
    // regex removes leading spaces before export and multiple spaces between export/default
    expect(result.en).toBe('{ a: 1 }');
  });

  it('should store raw content unchanged if missing export default', () => {
    (fs.readdirSync as any).mockReturnValue(['en.ts']);
    (fs.readFileSync as any).mockImplementation(() => '{ a: 1 }');

    const result = readLocales(localesDir);
    expect(result.en).toBe('{ a: 1 }');
  });

  it('should produce object keyed by locale code with string values', () => {
    (fs.readdirSync as any).mockReturnValue(['en.ts', 'fr.ts']);
    (fs.readFileSync as any).mockImplementation((file: any) => {
      const base = path.basename(String(file));
      if (base === 'en.ts') return 'export default { en: true }';
      if (base === 'fr.ts') return 'export default { fr: true }';
      return '';
    });

    const result = readLocales(localesDir);
    expect(typeof result.en).toBe('string');
    expect(typeof result.fr).toBe('string');
  });

  it('should not throw when locales directory is empty', () => {
    (fs.readdirSync as any).mockReturnValue([]);

    const result = readLocales(localesDir);
    expect(result).toEqual({});
  });

  it('should return empty map if directory does not exist', () => {
    (fs.readdirSync as any).mockImplementation(() => { throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' }); });
    const result = readLocales(localesDir);
    expect(result).toEqual({});
  });
});
