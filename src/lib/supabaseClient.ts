
/**
 * Centralized Supabase client for consistent access throughout the application.
 * This file unifies the previous dual implementations from:
 * - src/lib/supabase.ts
 * - src/integrations/supabase/client.ts
 */
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/config/env';
import logger from '@/utils/logger';

// Enhanced caching prevention headers with timestamp to ensure uniqueness
const getCacheHeaders = () => ({
  'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
  'X-Request-ID': `req_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`,
  'X-Custom-Timestamp': new Date().toISOString()
});

// Validate Supabase configuration
if (!SUPABASE_URL) {
  logger.error('Missing Supabase URL. Please check environment variables.');
  console.error('CRITICAL ERROR: Missing Supabase URL in environment variables');
}

if (!SUPABASE_ANON_KEY) {
  logger.error('Missing Supabase Anon Key. Please check environment variables.');
  console.error('CRITICAL ERROR: Missing Supabase Anon Key in environment variables');
}

// Create Supabase client with aggressive anti-caching configuration
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

// Simple diagnostics helper with added debug output
export const logQuery = (table: string, action: string) => {
  const timestamp = new Date().toISOString();
  logger.info(`Supabase ${action} from ${table} at ${timestamp}`);
  console.log(`[${timestamp}] Debug: Supabase ${action} query on ${table}`);
};

// Helper to log Supabase responses and errors
export const logResponse = (response: any, error: any, source: string) => {
  if (error) {
    logger.error(`Supabase error in ${source}:`, error);
    console.error(`Debug: Supabase error in ${source}:`, error);
    return;
  }
  
  const count = response?.data?.length || 0;
  logger.info(`Supabase success in ${source}: Retrieved ${count} records`);
  console.log(`Debug: Supabase success in ${source}: Retrieved ${count} records`, 
    count > 0 ? response.data[0] : 'No data');
};

// Default export for backward compatibility
export default supabase;
