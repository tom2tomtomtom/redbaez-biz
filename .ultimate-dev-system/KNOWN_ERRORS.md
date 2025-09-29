# Known Errors Database

## Supabase Connection Errors

### Failed to construct 'URL': Invalid URL at supabaseClient.ts
**Date**: 2025-09-29
**Cause**: Environment variables returning empty strings, causing URL constructor to fail
**Root Issue**: .env.production file had placeholder values overriding .env file
**Solution**: 
1. Check ALL .env files (.env, .env.production, .env.local, .env.development)
2. Update .env.production with correct values matching .env
3. Restart development server completely (stop and start, not just refresh)
4. Use `getRequiredEnvVariable` for critical config like SUPABASE_URL
**Files Modified**: .env, .env.production, src/config/env.ts
**Prevention**: Always sync all environment files and restart dev server after env changes

## Environment Variable Warnings

### Multiple VITE_* variables not defined
**Date**: 2025-09-29
**Cause**: Missing optional environment variables causing console warnings
**Solution**: Add all expected variables to .env with appropriate defaults
**Variables Added**: 
- VITE_ALLOWED_EMAILS
- VITE_ENABLE_PERFORMANCE_MONITORING
- VITE_ENABLE_CODE_SPLITTING
- VITE_ENABLE_PREFETCHING
**Prevention**: Keep .env.example updated with all possible variables

## Common TypeScript Errors

### Cannot read property 'X' of undefined
**Cause**: Trying to access a property on an undefined object
**Solution**: Add null checks or use optional chaining (?.)
**Example**: `user?.profile?.name` instead of `user.profile.name`

### Property 'X' does not exist on type 'Y'
**Cause**: TypeScript type mismatch
**Solution**: Check interface definitions and ensure proper typing

## React Errors

### Too many re-renders
**Cause**: State update in render or missing dependency array
**Solution**: Move state updates to useEffect or event handlers

### Invalid hook call
**Cause**: Calling hooks outside functional components
**Solution**: Only call hooks at the top level of React functions

## Database Errors

### Connection timeout
**Cause**: Database server unreachable or slow
**Solution**: Check connection string and network settings

## API Errors

### CORS blocked
**Cause**: Cross-origin requests without proper headers
**Solution**: Configure CORS on backend or use proxy

(This file will grow as you encounter and solve new errors)