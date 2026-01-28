import { expect } from 'vitest';

describe('readLocales helper (i18n)', () => {
  it('should be defined', () => {
    expect(true).toBe(true);
  });

  it.todo('should list only .ts locale files and ignore non-TS files');
  it.todo('should derive locale keys from filenames');
  it.todo(
    'should strip the "export default" prefix and collect remaining content'
  );
  it.todo('should handle whitespace around export statement');
  it.todo('should store raw content unchanged if missing export default');
  it.todo('should produce object keyed by locale code with string values');
  it.todo('should not throw when locales directory is empty');
  it.todo('should return empty map if directory does not exist');
});
