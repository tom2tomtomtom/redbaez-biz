
import { createClient } from '@supabase/supabase-js';

// Use proper URL format with https:// protocol
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ryomveanixzshfatalcd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5b212ZWFuaXh6c2hmYXRhbGNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxMjg0NDYsImV4cCI6MjA1MTcwNDQ0Nn0.WP3UUPsFzllI_gvkpYoj4Z8MLkGRt0bJgPAqK80S8JQ';

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
  supabaseUrl,
  supabaseAnonKey,
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
