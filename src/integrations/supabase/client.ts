
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use the same URL and key as in src/lib/supabase.ts
const SUPABASE_URL = "https://ryomveanixzshfatalcd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5b212ZWFuaXh6c2hmYXRhbGNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxMjg0NDYsImV4cCI6MjA1MTcwNDQ0Nn0.WP3UUPsFzllI_gvkpYoj4Z8MLkGRt0bJgPAqK80S8JQ";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: localStorage // Explicitly set storage to localStorage
    },
    global: {
      headers: {
        'cache-control': 'no-cache', // Tell the Supabase Client not to cache responses
        'pragma': 'no-cache',
        'expires': '0',
        'x-custom-timestamp': Date.now().toString()
      },
    },
    db: {
      schema: 'public',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);
