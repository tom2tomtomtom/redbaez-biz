
/**
 * This file provides a standardized way to import the Supabase client
 * throughout the application. Always import from this location to maintain
 * consistency and simplify future changes to the Supabase configuration.
 */
import { supabase, logQuery } from '@/lib/supabase';

// Export the client and utility functions
export { supabase, logQuery };

// Default export for backward compatibility
export default supabase;
