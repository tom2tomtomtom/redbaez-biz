
/**
 * @deprecated Use @/lib/supabaseClient instead
 * This file is maintained for backward compatibility but will be removed in a future update.
 */
import { supabase, logQuery, logResponse } from '@/lib/supabaseClient';

// Re-export everything for backward compatibility
export { supabase, logQuery, logResponse };
export default supabase;
