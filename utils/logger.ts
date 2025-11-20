/**
 * Logger utility that only logs in development mode
 * Prevents console pollution in production
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

class Logger {
    private isDevelopment: boolean;

    constructor() {
        this.isDevelopment = (import.meta as any).env?.MODE !== 'production';
    }

    private shouldLog(): boolean {
        return this.isDevelopment;
    }

    private formatMessage(level: LogLevel, message: string, ...args: any[]): void {
        if (!this.shouldLog()) return;

        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

        switch (level) {
            case 'error':
                console.error(prefix, message, ...args);
                break;
            case 'warn':
                console.warn(prefix, message, ...args);
                break;
            case 'info':
                console.info(prefix, message, ...args);
                break;
            case 'debug':
                console.debug(prefix, message, ...args);
                break;
            default:
                console.log(prefix, message, ...args);
        }
    }

    log(message: string, ...args: any[]): void {
        this.formatMessage('log', message, ...args);
    }

    info(message: string, ...args: any[]): void {
        this.formatMessage('info', message, ...args);
    }

    warn(message: string, ...args: any[]): void {
        this.formatMessage('warn', message, ...args);
    }

    error(message: string, ...args: any[]): void {
        // Always log errors, even in production
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [ERROR]`;
        console.error(prefix, message, ...args);
    }

    debug(message: string, ...args: any[]): void {
        this.formatMessage('debug', message, ...args);
    }

    // Group logging for related messages
    group(label: string, callback: () => void): void {
        if (!this.shouldLog()) return;
        console.group(label);
        callback();
        console.groupEnd();
    }

    // Table logging for structured data
    table(data: any): void {
        if (!this.shouldLog()) return;
        console.table(data);
    }

    // Time measurement
    time(label: string): void {
        if (!this.shouldLog()) return;
        console.time(label);
    }

    timeEnd(label: string): void {
        if (!this.shouldLog()) return;
        console.timeEnd(label);
    }
}

// Export a singleton instance
export const logger = new Logger();

// For backward compatibility, export default
export default logger;
