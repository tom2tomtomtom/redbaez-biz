import logger from '../logger';

describe('Logger', () => {
  beforeEach(() => {
    // Spy on console methods
    jest.spyOn(console, 'debug').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'group').mockImplementation();
    jest.spyOn(console, 'groupEnd').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log debug messages', () => {
    logger.debug('Test debug message');
    expect(console.debug).toHaveBeenCalled();
  });

  it('should log info messages', () => {
    logger.info('Test info message');
    expect(console.info).toHaveBeenCalled();
  });

  it('should log warning messages', () => {
    logger.warn('Test warning message');
    expect(console.warn).toHaveBeenCalled();
  });

  it('should log error messages', () => {
    logger.error('Test error message');
    expect(console.error).toHaveBeenCalled();
  });

  it('should log error messages with error objects', () => {
    const error = new Error('Test error');
    logger.error('Test error message', error);
    expect(console.error).toHaveBeenCalled();
  });

  it('should start and end log groups', () => {
    logger.startLogGroup('Test Group');
    logger.endLogGroup();
    
    expect(console.group).toHaveBeenCalledWith('=== Test Group ===');
    expect(console.groupEnd).toHaveBeenCalled();
  });

  it('should log request information', () => {
    logger.logRequest('GET', '/api/test', { id: 1 });
    expect(console.debug).toHaveBeenCalled();
  });

  it('should log response information for successful responses', () => {
    logger.logResponse('GET', '/api/test', 200, { success: true });
    expect(console.debug).toHaveBeenCalled();
  });

  it('should log response information for error responses', () => {
    logger.logResponse('GET', '/api/test', 404, { error: 'Not found' });
    expect(console.error).toHaveBeenCalled();
  });
});
