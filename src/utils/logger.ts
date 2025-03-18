
/**
 * Centralized logging utility to standardize log formatting
 * and provide consistent logging patterns across the application.
 */

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Determine if we're in development mode
const isDev = import.meta.env.DEV;

// Default to INFO level in production, DEBUG in development
const defaultLogLevel = isDev ? LogLevel.DEBUG : LogLevel.INFO;

// Get log level from environment or use default
const currentLogLevel = (() => {
  const envLevel = import.meta.env.VITE_LOG_LEVEL?.toUpperCase();
  if (envLevel) {
    const level = LogLevel[envLevel as keyof typeof LogLevel];
    return typeof level === 'number' ? level : defaultLogLevel;
  }
  return defaultLogLevel;
})();

// Current log group - helps group related logs together
let currentLogGroup: string | null = null;

/**
 * Internal function to format log messages
 */
const formatLog = (level: string, message: string, context?: any): string => {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level}]${currentLogGroup ? ` [${currentLogGroup}]` : ''} ${message}${contextStr}`;
};

/**
 * Begin a logical grouping of logs
 */
export const startLogGroup = (name: string): void => {
  currentLogGroup = name;
  if (isDev) {
    console.group(`=== ${name} ===`);
  }
};

/**
 * End the current logical grouping of logs
 */
export const endLogGroup = (): void => {
  currentLogGroup = null;
  if (isDev) {
    console.groupEnd();
  }
};

/**
 * Log a debug message
 */
export const debug = (message: string, context?: any): void => {
  if (currentLogLevel <= LogLevel.DEBUG) {
    console.debug(formatLog('DEBUG', message, context));
  }
};

/**
 * Log an informational message
 */
export const info = (message: string, context?: any): void => {
  if (currentLogLevel <= LogLevel.INFO) {
    console.info(formatLog('INFO', message, context));
  }
};

/**
 * Log a warning message
 */
export const warn = (message: string, context?: any): void => {
  if (currentLogLevel <= LogLevel.WARN) {
    console.warn(formatLog('WARN', message, context));
  }
};

/**
 * Log an error message
 */
export const error = (message: string, error?: any, context?: any): void => {
  if (currentLogLevel <= LogLevel.ERROR) {
    const errorDetails = error ? { error: error.message, stack: error.stack } : undefined;
    console.error(formatLog('ERROR', message, { ...context, ...errorDetails }));
  }
};

/**
 * Log a network request
 */
export const logRequest = (method: string, url: string, data?: any): void => {
  if (currentLogLevel <= LogLevel.DEBUG) {
    debug(`${method} ${url}`, { data });
  }
};

/**
 * Log a network response
 */
export const logResponse = (method: string, url: string, status: number, data?: any): void => {
  if (status >= 400) {
    error(`${method} ${url} [${status}]`, null, { data });
  } else if (currentLogLevel <= LogLevel.DEBUG) {
    debug(`${method} ${url} [${status}]`, { data });
  }
};

// Export a default object with all logging functions
export default {
  debug,
  info,
  warn,
  error,
  startLogGroup,
  endLogGroup,
  logRequest,
  logResponse,
};
