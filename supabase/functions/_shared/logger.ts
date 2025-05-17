const logger = {
  info: (...args: any[]) => console.log(new Date().toISOString(), 'info:', ...args),
  error: (...args: any[]) => console.error(new Date().toISOString(), 'error:', ...args),
  warn: (...args: any[]) => console.warn(new Date().toISOString(), 'warn:', ...args),
  debug: (...args: any[]) => console.debug(new Date().toISOString(), 'debug:', ...args)
};

export default logger;
