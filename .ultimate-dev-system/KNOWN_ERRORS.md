# Known Errors Database

## Supabase Connection Errors

### Failed to construct 'URL': Invalid URL at supabaseClient.ts
**Date**: 2025-09-29
**Cause**: Environment variables not available in local development
**Root Issue**: Variables set in Netlify dashboard but not available when running `npm run dev` locally
**Solution Options**:

**Option A: Use Netlify Dev (Recommended)**
```bash
netlify link  # One-time setup
netlify dev   # Always use this instead of npm run dev
```

**Option B: Sync Variables to Local .env**
```bash
npm run env:sync  # Downloads from Netlify to .env
npm run dev       # Now works with local .env
```

**Option C: Manual .env Setup**
Copy variables from Netlify dashboard → Site Settings → Environment Variables
and paste into local .env file

**Files Modified**: .env, package.json, scripts/sync-netlify-env.sh
**Prevention**: Always use `netlify dev` or sync env vars before starting development

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