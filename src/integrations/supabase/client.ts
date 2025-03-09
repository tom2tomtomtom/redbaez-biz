
// This file re-exports the Supabase client from lib/supabase to maintain compatibility
import { supabase, logQuery } from '@/lib/supabase';

// Export the client and utility functions
export { supabase, logQuery };

// Default export for backward compatibility
export default supabase;
