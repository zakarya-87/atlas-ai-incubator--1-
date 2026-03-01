// Simple logger utility
export const logger = {
  log: (message: string, data?: unknown) => {
    console.log(`[LOG] ${message}`, data || '');
  },
  info: (message: string, data?: unknown) => {
    console.info(`[INFO] ${message}`, data || '');
  },
  error: (message: string, error?: unknown) => {
    console.error(`[ERROR] ${message}`, error || '');
  },
  warn: (message: string, data?: unknown) => {
    console.warn(`[WARN] ${message}`, data || '');
  },
  debug: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  },
  group: (label: string, callback?: () => void) => {
    console.group(label);
    if (callback) callback();
    console.groupEnd();
  },
  groupEnd: () => console.groupEnd(),
  time: (label: string) => console.time(label),
  timeEnd: (label: string) => console.timeEnd(label),
  table: (data: unknown) => console.table(data),
};

export default logger;
