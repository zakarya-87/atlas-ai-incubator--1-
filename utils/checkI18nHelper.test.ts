import { expect, describe, it, vi, beforeEach, afterEach } from 'vitest';
import { readLocales } from './checkI18nHelper';
import fs from 'fs';

vi.mock('fs');

describe('readLocales helper (i18n)', () => {
  const mockDir = '/locales';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(readLocales).toBeDefined();
  });

  it('should list only .ts locale files and ignore non-TS files', () => {
    vi.spyOn(fs, 'readdirSync').mockReturnValue([
      'en.ts',
      'fr.ts',
      'notes.txt',
      'image.png',
    ] as any);
    vi.spyOn(fs, 'readFileSync').mockReturnValue('export default {}');

    const result = readLocales(mockDir);
    expect(Object.keys(result)).toEqual(['en', 'fr']);
    expect(Object.keys(result)).not.toContain('notes');
  });

  it('should derive locale keys from filenames', () => {
    vi.spyOn(fs, 'readdirSync').mockReturnValue(['es.ts', 'pt-BR.ts'] as any);
    vi.spyOn(fs, 'readFileSync').mockReturnValue('export default {}');

    const result = readLocales(mockDir);
    expect(result).toHaveProperty('es');
    expect(result).toHaveProperty('pt-BR');
  });

  it('should strip the "export default" prefix and collect remaining content', () => {
    const content = 'export default { hello: "world" }';
    vi.spyOn(fs, 'readdirSync').mockReturnValue(['en.ts'] as any);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(content);

    const result = readLocales(mockDir);
    expect(result.en).toBe('{ hello: "world" }');
  });

  it('should handle whitespace around export statement', () => {
    const content = '   export   default    { nested: 1 }   ';
    vi.spyOn(fs, 'readdirSync').mockReturnValue(['en.ts'] as any);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(content);

    const result = readLocales(mockDir);
    expect(result.en).toBe('{ nested: 1 }');
  });

  it('should store raw content unchanged if missing export default', () => {
    const content = '{ "only": "json" }';
    vi.spyOn(fs, 'readdirSync').mockReturnValue(['en.ts'] as any);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(content);

    const result = readLocales(mockDir);
    expect(result.en).toBe(content);
  });

  it('should produce object keyed by locale code with string values', () => {
    vi.spyOn(fs, 'readdirSync').mockReturnValue(['en.ts', 'fr.ts'] as any);
    vi.spyOn(fs, 'readFileSync').mockImplementation((path: any) => {
      if (path.toString().endsWith('en.ts')) return 'export default { en: 1 }';
      return 'export default { fr: 1 }';
    });

    const result = readLocales(mockDir);
    expect(typeof result.en).toBe('string');
    expect(result.en).toBe('{ en: 1 }');
    expect(result.fr).toBe('{ fr: 1 }');
  });

  it('should not throw when locales directory is empty', () => {
    vi.spyOn(fs, 'readdirSync').mockReturnValue([]);
    expect(() => readLocales(mockDir)).not.toThrow();
    expect(readLocales(mockDir)).toEqual({});
  });

  it('should return empty map if directory does not exist', () => {
    vi.spyOn(fs, 'readdirSync').mockImplementation(() => {
      throw new Error('ENOENT');
    });
    const result = readLocales(mockDir);
    expect(result).toEqual({});
  });
});


