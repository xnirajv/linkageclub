/**
 * Structured logging utility
 * Replace all console.log with this logger for production-safe logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogData {
  [key: string]: any;
}

class Logger {
  private env: string;
  private enabledLevels: Set<LogLevel>;

  constructor() {
    this.env = process.env.NODE_ENV || 'development';
    
    // Only show debug logs in development
    this.enabledLevels = new Set<LogLevel>(
      this.env === 'production' 
        ? ['info', 'warn', 'error'] 
        : ['debug', 'info', 'warn', 'error']
    );
  }

  private log(level: LogLevel, message: string, data?: LogData): void {
    if (!this.enabledLevels.has(level)) return;

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(data && { data: this.sanitize(data) }),
      env: this.env,
    };

    // In production, use JSON format for log aggregation
    if (this.env === 'production') {
      console.log(JSON.stringify(logEntry));
    } else {
      // In development, use readable format
      const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
      console.log(`${prefix} ${message}`, data || '');
    }
  }

  /**
   * Sanitize sensitive data from logs
   * Redacts PII like emails, phone numbers, API keys, passwords
   */
  private sanitize(data: LogData): LogData {
    const sensitiveKeys = [
      'password',
      'token',
      'apiKey',
      'secret',
      'authorization',
      'creditCard',
      'ssn',
      'email', // Redact email in production
      'phone',
    ];

    const sanitized: LogData = {};

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      
      // Check if key contains sensitive data
      const isSensitive = sensitiveKeys.some(sk => lowerKey.includes(sk));
      
      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  debug(message: string, data?: LogData): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: LogData): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: LogData): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | LogData): void {
    const data = error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: this.env === 'development' ? error.stack : undefined,
        }
      : error;
    
    this.log('error', message, data);
  }

  /**
   * Log database operations
   */
  db(operation: string, data?: LogData): void {
    this.info(`DB: ${operation}`, data);
  }

  /**
   * Log API requests
   */
  api(method: string, path: string, data?: LogData): void {
    this.info(`API: ${method} ${path}`, data);
  }

  /**
   * Log payment events
   */
  payment(event: string, data?: LogData): void {
    this.info(`Payment: ${event}`, data);
  }

  /**
   * Log webhook events
   */
  webhook(event: string, data?: LogData): void {
    this.info(`Webhook: ${event}`, data);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for testing
export { Logger };
