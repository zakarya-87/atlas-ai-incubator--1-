import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Logger Utility', () => {
  let consoleSpy: {
    log: any;
    info: any;
    warn: any;
    error: any;
    debug: any;
    group: any;
    groupEnd: any;
    table: any;
    time: any;
    timeEnd: any;
  };

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      group: vi.spyOn(console, 'group').mockImplementation(() => {}),
      groupEnd: vi.spyOn(console, 'groupEnd').mockImplementation(() => {}),
      table: vi.spyOn(console, 'table').mockImplementation(() => {}),
      time: vi.spyOn(console, 'time').mockImplementation(() => {}),
      timeEnd: vi.spyOn(console, 'timeEnd').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log messages', async () => {
    const { logger } = await import('./logger');
    logger.log('Test message');

    expect(consoleSpy.log).toHaveBeenCalled();
  });

  it('should log info messages', async () => {
    const { logger } = await import('./logger');
    logger.info('Info message');

    expect(consoleSpy.info).toHaveBeenCalled();
  });

  it('should log warning messages', async () => {
    const { logger } = await import('./logger');
    logger.warn('Warning message');

    expect(consoleSpy.warn).toHaveBeenCalled();
  });

  it('should always log error messages', async () => {
    const { logger } = await import('./logger');
    logger.error('Error message');

    expect(consoleSpy.error).toHaveBeenCalled();
  });

  it('should log debug messages', async () => {
    const { logger } = await import('./logger');
    logger.debug('Debug message');

    expect(consoleSpy.debug).toHaveBeenCalled();
  });

  it('should support grouping log messages', async () => {
    const { logger } = await import('./logger');
    const callback = vi.fn();
    logger.group('Test Group', callback);

    expect(consoleSpy.group).toHaveBeenCalledWith('Test Group');
    expect(callback).toHaveBeenCalled();
    expect(consoleSpy.groupEnd).toHaveBeenCalled();
  });

  it('should support table logging', async () => {
    const { logger } = await import('./logger');
    const data = [{ name: 'Test', value: 1 }];
    logger.table(data);

    expect(consoleSpy.table).toHaveBeenCalledWith(data);
  });

  it('should support time measurement', async () => {
    const { logger } = await import('./logger');
    logger.time('test-timer');

    expect(consoleSpy.time).toHaveBeenCalledWith('test-timer');
  });

  it('should support timeEnd measurement', async () => {
    const { logger } = await import('./logger');
    logger.timeEnd('test-timer');

    expect(consoleSpy.timeEnd).toHaveBeenCalledWith('test-timer');
  });

  it('should include log level in output', async () => {
    const { logger } = await import('./logger');
    logger.log('Test');

    const call = consoleSpy.log.mock.calls[0][0];
    expect(call).toContain('[LOG]');
  });

  it('should have error method', async () => {
    const { logger } = await import('./logger');
    expect(typeof logger.error).toBe('function');
  });

  it('should have warn method', async () => {
    const { logger } = await import('./logger');
    expect(typeof logger.warn).toBe('function');
  });

  it('should have info method', async () => {
    const { logger } = await import('./logger');
    expect(typeof logger.info).toBe('function');
  });

  it('should have debug method', async () => {
    const { logger } = await import('./logger');
    expect(typeof logger.debug).toBe('function');
  });

  it('should have group method', async () => {
    const { logger } = await import('./logger');
    expect(typeof logger.group).toBe('function');
  });

  it('should have table method', async () => {
    const { logger } = await import('./logger');
    expect(typeof logger.table).toBe('function');
  });

  it('should have time method', async () => {
    const { logger } = await import('./logger');
    expect(typeof logger.time).toBe('function');
  });

  it('should have timeEnd method', async () => {
    const { logger } = await import('./logger');
    expect(typeof logger.timeEnd).toBe('function');
  });

  it('should export default logger instance', async () => {
    const defaultExport = await import('./logger');
    expect(defaultExport.default).toBeDefined();
    expect(typeof defaultExport.default.log).toBe('function');
  });

  it('should export named logger instance', async () => {
    const { logger: namedLogger } = await import('./logger');
    expect(namedLogger).toBeDefined();
    expect(typeof namedLogger.log).toBe('function');
  });
});
