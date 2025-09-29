import rateLimiter from '../rateLimiter';

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Reset rate limiter before each test
    rateLimiter.reset();
    
    // Mock Date.now to control time
    jest.spyOn(Date, 'now').mockImplementation(() => 1000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should execute a function when under the rate limit', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    
    const result = await rateLimiter.execute('test', mockFn, {
      maxRequests: 2,
      timeWindowMs: 1000
    });
    
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(result).toBe('success');
  });

  it('should throw an error when rate limit is exceeded', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    
    // First call should succeed
    await rateLimiter.execute('test', mockFn, {
      maxRequests: 1,
      timeWindowMs: 1000
    });
    
    // Second call should fail
    await expect(
      rateLimiter.execute('test', mockFn, {
        maxRequests: 1,
        timeWindowMs: 1000,
        errorMessage: 'Custom error message'
      })
    ).rejects.toThrow('Custom error message');
    
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should allow execution after time window has passed', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    
    // First call
    await rateLimiter.execute('test', mockFn, {
      maxRequests: 1,
      timeWindowMs: 1000
    });
    
    // Advance time beyond the time window
    jest.spyOn(Date, 'now').mockImplementation(() => 2001);
    
    // Second call should succeed
    const result = await rateLimiter.execute('test', mockFn, {
      maxRequests: 1,
      timeWindowMs: 1000
    });
    
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(result).toBe('success');
  });

  it('should track different keys separately', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    
    // Call with key1
    await rateLimiter.execute('key1', mockFn, {
      maxRequests: 1,
      timeWindowMs: 1000
    });
    
    // Call with key2 should succeed even though key1 is at limit
    const result = await rateLimiter.execute('key2', mockFn, {
      maxRequests: 1,
      timeWindowMs: 1000
    });
    
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(result).toBe('success');
  });

  it('should return correct remaining requests', () => {
    // No requests made yet
    expect(
      rateLimiter.getRemainingRequests('test', { maxRequests: 5, timeWindowMs: 1000 })
    ).toBe(5);
    
    // Make a request
    rateLimiter.execute('test', () => Promise.resolve(), {
      maxRequests: 5,
      timeWindowMs: 1000
    });
    
    // Should have 4 remaining
    expect(
      rateLimiter.getRemainingRequests('test', { maxRequests: 5, timeWindowMs: 1000 })
    ).toBe(4);
  });

  it('should reset rate limits correctly', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    
    // First call
    await rateLimiter.execute('test', mockFn, {
      maxRequests: 1,
      timeWindowMs: 1000
    });
    
    // Reset the rate limiter
    rateLimiter.reset('test');
    
    // Second call should succeed
    const result = await rateLimiter.execute('test', mockFn, {
      maxRequests: 1,
      timeWindowMs: 1000
    });
    
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(result).toBe('success');
  });
});
