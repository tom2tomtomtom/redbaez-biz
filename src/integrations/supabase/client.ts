
/**
 * This file provides a standardized way to import the Supabase client
 * throughout the application. Always import from this location to maintain
 * consistency and simplify future changes to the Supabase configuration.
 */
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/config/env';

// Enhanced caching prevention headers with timestamp to ensure uniqueness
const getCacheHeaders = () => ({
  'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
  'X-Request-ID': `req_${Math.random().toString(36).substring(2, 15)}`,
  'X-Custom-Timestamp': new Date().toISOString()
});

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

// Simple diagnostics helper
export const logQuery = (table: string, action: string) => {
  console.log(`Supabase ${action} from ${table} at ${new Date().toISOString()}`);
};

// Default export for backward compatibility
export default supabase;
