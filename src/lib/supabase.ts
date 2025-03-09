
import { createClient } from '@supabase/supabase-js';

// Use proper URL format with https:// protocol
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ryomveanixzshfatalcd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5b212ZWFuaXh6c2hmYXRhbGNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxMjg0NDYsImV4cCI6MjA1MTcwNDQ0Nn0.WP3UUPsFzllI_gvkpYoj4Z8MLkGRt0bJgPAqK80S8JQ';

// Create Supabase client with a simple but effective configuration
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    },
    global: {
      // Set simple headers that prevent caching
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    }
  }
);
