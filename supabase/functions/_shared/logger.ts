export default {
  info: (message: string, ...args: any[]) =>
    console.log(`${new Date().toISOString()} info: ${message}`, ...args),
  error: (message: string, ...args: any[]) =>
    console.error(`${new Date().toISOString()} error: ${message}`, ...args),
  warn: (message: string, ...args: any[]) =>
    console.warn(`${new Date().toISOString()} warn: ${message}`, ...args),
  debug: (message: string, ...args: any[]) =>
    console.debug(`${new Date().toISOString()} debug: ${message}`, ...args)
};
