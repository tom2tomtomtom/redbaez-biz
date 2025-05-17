
/**
 * Centralized Supabase client for consistent access throughout the application.
 */
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/config/env';
import logger from '@/utils/logger';

// Validate Supabase configuration
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  logger.error('Missing Supabase URL or Anon Key. Please check environment variables.');
  logger.error('CRITICAL ERROR: Missing Supabase configuration in environment variables');
}

// Enhanced caching prevention headers
const getCacheHeaders = () => ({
  'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
  'X-Request-ID': `req_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`
});

// Create Supabase client with anti-caching configuration
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: localStorage
    },
    global: {
      headers: getCacheHeaders()
    },
    db: {
      schema: 'public'
    }
  }
);

// Simple diagnostics helper for tracking queries
export const logQuery = (table: string, action: string) => {
  const timestamp = new Date().toISOString();
  logger.info(`Supabase ${action} from ${table} at ${timestamp}`);
};

// Helper to log Supabase responses and errors
export const logResponse = (response: any, error: any, source: string) => {
  if (error) {
    logger.error(`Supabase error in ${source}:`, error);
    logger.error(`Supabase error in ${source}:`, error);
    return;
  }
  
  const count = response?.data?.length || 0;
  logger.info(`Supabase success in ${source}: Retrieved ${count} records`);
};

export default supabase;
