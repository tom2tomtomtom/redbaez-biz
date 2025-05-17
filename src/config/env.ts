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

// Helper function to enforce required variables
const getRequiredEnvVariable = (key: string): string => {
  const value = import.meta.env[key];
  if (value === undefined || value === '') {
    throw new Error(`Required environment variable ${key} is missing`);
  }
  return value as string;
};

// Supabase Configuration
export const SUPABASE_URL = getRequiredEnvVariable('VITE_SUPABASE_URL');
export const SUPABASE_ANON_KEY = getRequiredEnvVariable('VITE_SUPABASE_ANON_KEY');

// API Keys (if needed)
export const OPENAI_API_KEY = getRequiredEnvVariable('VITE_OPENAI_API_KEY');
export const PERPLEXITY_API_KEY = getEnvVariable('VITE_PERPLEXITY_API_KEY');

// Feature Flags
export const ENABLE_AI_FEATURES = getEnvVariable('VITE_ENABLE_AI_FEATURES', 'true') === 'true';
export const DEBUG_MODE = getEnvVariable('VITE_DEBUG_MODE', 'false') === 'true';
export const ENABLE_PERFORMANCE_MONITORING = getEnvVariable('VITE_ENABLE_PERFORMANCE_MONITORING', 'false') === 'true';
export const ENABLE_CODE_SPLITTING = getEnvVariable('VITE_ENABLE_CODE_SPLITTING', 'true') === 'true';
export const ENABLE_PREFETCHING = getEnvVariable('VITE_ENABLE_PREFETCHING', 'true') === 'true';

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
  ENABLE_PERFORMANCE_MONITORING,
  ENABLE_CODE_SPLITTING,
  ENABLE_PREFETCHING,
  APP_NAME,
  API_TIMEOUT
};

export default ENV;
