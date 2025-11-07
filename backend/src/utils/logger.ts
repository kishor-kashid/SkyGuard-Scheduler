/**
 * Simple logger utility for application logging
 * In production, this could be replaced with a more robust logging library (Winston, Pino, etc.)
 */

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

/**
 * Format log entry with timestamp
 */
function formatLog(level: LogLevel, message: string, data?: any): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
  };
}

/**
 * Log info message
 */
export function logInfo(message: string, data?: any): void {
  const entry = formatLog(LogLevel.INFO, message, data);
  console.log(`[${entry.timestamp}] [${entry.level}] ${entry.message}`, data ? JSON.stringify(data, null, 2) : '');
}

/**
 * Log warning message
 */
export function logWarn(message: string, data?: any): void {
  const entry = formatLog(LogLevel.WARN, message, data);
  console.warn(`[${entry.timestamp}] [${entry.level}] ${entry.message}`, data ? JSON.stringify(data, null, 2) : '');
}

/**
 * Log error message
 */
export function logError(message: string, error?: any): void {
  const entry = formatLog(LogLevel.ERROR, message, error);
  console.error(`[${entry.timestamp}] [${entry.level}] ${entry.message}`, error ? (error instanceof Error ? error.stack : JSON.stringify(error, null, 2)) : '');
}

/**
 * Log debug message (only in development)
 */
export function logDebug(message: string, data?: any): void {
  if (process.env.NODE_ENV === 'development') {
    const entry = formatLog(LogLevel.DEBUG, message, data);
    console.debug(`[${entry.timestamp}] [${entry.level}] ${entry.message}`, data ? JSON.stringify(data, null, 2) : '');
  }
}

