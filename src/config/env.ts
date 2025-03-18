/**
 * Centralized environment configuration module.
 * This helps ensure consistent access to environment variables
 * throughout the application.
 */

// Helper function to get environment variables with fallbacks
const getEnvVariable = (key: string, defaultValue: string = ''): string => {
  const value = import.meta.env[key];
  if (value === undefined) {
    console.warn(`Environment variable ${key} not defined, using default value`);
    return defaultValue;
  }
  return value as string;
};

// Supabase Configuration
export const SUPABASE_URL = getEnvVariable('VITE_SUPABASE_URL', 'https://ryomveanixzshfatalcd.supabase.co');
export const SUPABASE_ANON_KEY = getEnvVariable('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5b212ZWFuaXh6c2hmYXRhbGNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxMjg0NDYsImV4cCI6MjA1MTcwNDQ0Nn0.WP3UUPsFzllI_gvkpYoj4Z8MLkGRt0bJgPAqK80S8JQ');

// API Keys (if needed)
export const OPENAI_API_KEY = getEnvVariable('VITE_OPENAI_API_KEY');
export const PERPLEXITY_API_KEY = getEnvVariable('VITE_PERPLEXITY_API_KEY');

// Feature Flags
export const ENABLE_AI_FEATURES = getEnvVariable('VITE_ENABLE_AI_FEATURES', 'true') === 'true';
export const DEBUG_MODE = getEnvVariable('VITE_DEBUG_MODE', 'false') === 'true';

// Other Application Settings
export const APP_NAME = getEnvVariable('VITE_APP_NAME', 'Business Dashboard');
export const API_TIMEOUT = parseInt(getEnvVariable('VITE_API_TIMEOUT', '30000'), 10);

// Export all environment variables as a single object
export const ENV = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  OPENAI_API_KEY,
  PERPLEXITY_API_KEY,
  ENABLE_AI_FEATURES,
  DEBUG_MODE,
  APP_NAME,
  API_TIMEOUT
};

export default ENV;
