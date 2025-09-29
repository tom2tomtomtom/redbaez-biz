/**
 * Simple rate limiter utility to prevent excessive API calls
 * Particularly useful for third-party APIs with rate limits
 */

interface RateLimitOptions {
  maxRequests: number;
  timeWindowMs: number;
  errorMessage?: string;
}

interface RateLimiterState {
  timestamps: Map<string, number[]>;
}

class RateLimiter {
  private state: RateLimiterState = {
    timestamps: new Map<string, number[]>()
  };

  /**
   * Execute a function with rate limiting
   * @param key - Unique identifier for the rate limit group
   * @param fn - The function to execute
   * @param options - Rate limiting options
   * @returns The result of the function execution
   * @throws Error if rate limit is exceeded
   */
  async execute<T>(
    key: string,
    fn: () => Promise<T>,
    options: RateLimitOptions
  ): Promise<T> {
    const now = Date.now();
    const { maxRequests, timeWindowMs, errorMessage = 'Rate limit exceeded' } = options;

    // Get existing timestamps or create new array
    const timestamps = this.state.timestamps.get(key) || [];
    
    // Filter out timestamps outside the current time window
    const recentTimestamps = timestamps.filter(
      time => now - time < timeWindowMs
    );

    // Check if rate limit is exceeded
    if (recentTimestamps.length >= maxRequests) {
      const oldestTimestamp = Math.min(...recentTimestamps);
      const resetTime = oldestTimestamp + timeWindowMs - now;
      const resetSeconds = Math.ceil(resetTime / 1000);
      
      throw new Error(
        `${errorMessage}. Try again in ${resetSeconds} seconds.`
      );
    }

    // Add current timestamp and update state
    recentTimestamps.push(now);
    this.state.timestamps.set(key, recentTimestamps);

    // Execute the function
    try {
      return await fn();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset rate limits for a specific key
   * @param key - The key to reset, or undefined to reset all
   */
  reset(key?: string): void {
    if (key) {
      this.state.timestamps.delete(key);
    } else {
      this.state.timestamps.clear();
    }
  }

  /**
   * Get remaining requests for a specific key
   * @param key - The key to check
   * @param options - Rate limiting options
   * @returns Number of remaining requests in the current time window
   */
  getRemainingRequests(
    key: string,
    options: { maxRequests: number; timeWindowMs: number }
  ): number {
    const now = Date.now();
    const timestamps = this.state.timestamps.get(key) || [];
    
    // Filter out timestamps outside the current time window
    const recentTimestamps = timestamps.filter(
      time => now - time < options.timeWindowMs
    );
    
    return Math.max(0, options.maxRequests - recentTimestamps.length);
  }
}

// Export a singleton instance
const rateLimiter = new RateLimiter();
export default rateLimiter;