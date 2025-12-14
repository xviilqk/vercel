# API Configuration Setup Guide

## Overview

This project has been refactored to use a centralized API configuration system that prevents the "/undefined" URL issue and ensures all API calls work correctly.

## What Was Fixed

1. **Centralized Configuration**: All API URLs are now managed from `config/api.ts`
2. **Fallback Protection**: Automatic fallback to `http://localhost:8000` if environment variable is missing
3. **Validation**: URL validation to prevent "undefined" in API calls
4. **Type Safety**: TypeScript endpoints with proper typing
5. **Consistency**: All frontend files now use the same API configuration

## Quick Setup

### Option 1: Run Setup Script (Recommended)
```bash
cd whelps
node setup-env.js
```

### Option 2: Manual Setup
Create a `.env.local` file in the `whelps` directory:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Development settings
NODE_ENV=development
```

## Configuration Files

### 1. `config/api.ts` - Centralized API Configuration
```typescript
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const VALIDATED_API_URL = getValidatedApiUrl();

export const API_ENDPOINTS = {
  LOGIN: `${VALIDATED_API_URL}/auth/login/`,
  REGISTER: `${VALIDATED_API_URL}/auth/register/`,
  PROFILE: `${VALIDATED_API_URL}/auth/profile/`,
  // ... all endpoints
};
```

### 2. `app/utils/api.ts` - Backward Compatibility
```typescript
export { VALIDATED_API_URL as apiUrl, API_ENDPOINTS } from '../../config/api';
```

## Updated Files

All frontend files have been updated to use the centralized configuration:

### Pages Updated:
- ✅ `app/login/page.tsx`
- ✅ `app/assessment/page.tsx`
- ✅ `app/matches/page.tsx`
- ✅ `app/page.tsx`
- ✅ `app/dogs/page.tsx`
- ✅ `app/cats/page.tsx`
- ✅ `app/pets/[id]/page.tsx`
- ✅ `app/petprofile/page.tsx`
- ✅ `app/appointments/page.tsx`
- ✅ `app/admin/login/page.tsx`
- ✅ `app/admin/addpet/page.tsx`
- ✅ `app/admin/appointments/page.tsx`
- ✅ `app/admin/pets/page.tsx`
- ✅ `app/api/pets/route.ts`

## API Endpoints Available

### Authentication
- `API_ENDPOINTS.LOGIN` - User login
- `API_ENDPOINTS.REGISTER` - User registration
- `API_ENDPOINTS.PROFILE` - User profile
- `API_ENDPOINTS.ADMIN_LOGIN` - Admin login

### Pets
- `API_ENDPOINTS.PETS` - List all pets
- `API_ENDPOINTS.PET_BY_ID(id)` - Get specific pet
- `API_ENDPOINTS.PET_SEARCH` - Search pets

### Adopters
- `API_ENDPOINTS.ADOPTERS` - List adopters
- `API_ENDPOINTS.SUBMIT_ASSESSMENT` - Submit assessment
- `API_ENDPOINTS.MATCH_PETS(adopterId)` - Get pet matches

### Appointments
- `API_ENDPOINTS.APPOINTMENTS` - List appointments
- `API_ENDPOINTS.APPOINTMENT_ACTION(id, action)` - Approve/decline appointment
- `API_ENDPOINTS.AVAILABLE_TIMES(date)` - Get available times

## Usage Examples

### Before (Problematic)
```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login/`, {
  // This could result in "/undefined/auth/login/"
});
```

### After (Fixed)
```typescript
import { API_ENDPOINTS } from "../../config/api";

const response = await fetch(API_ENDPOINTS.LOGIN, {
  // Always uses correct URL with fallback
});
```

## Development Workflow

1. **Start Backend**: Ensure Django backend is running on port 8000
2. **Set Environment**: Run `node setup-env.js` or create `.env.local`
3. **Start Frontend**: `npm run dev`
4. **Test**: Verify no "/undefined" URLs in network requests

## Production Deployment

For production, set the environment variable to your production API URL:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## Troubleshooting

### Issue: Still seeing "/undefined" URLs
**Solution**: 
1. Check that `.env.local` exists and contains `NEXT_PUBLIC_API_URL=http://localhost:8000`
2. Restart the Next.js development server
3. Clear browser cache

### Issue: API calls failing
**Solution**:
1. Verify Django backend is running on port 8000
2. Check browser network tab for actual URLs being called
3. Ensure CORS is configured on the backend

### Issue: Environment variable not loading
**Solution**:
1. Restart the development server after creating `.env.local`
2. Check file location (must be in `whelps` directory)
3. Verify no spaces around `=` in the environment file

## Validation Features

The new configuration includes:
- ✅ URL validation to prevent "undefined" values
- ✅ Protocol validation (adds `http://` if missing)
- ✅ Console warnings for configuration issues
- ✅ Type-safe endpoint definitions
- ✅ Centralized error handling

## Testing

To verify the fix is working:

1. **Check Network Tab**: No requests should contain "/undefined"
2. **Console Logs**: No warnings about API_URL containing "undefined"
3. **Authentication**: Login/register should work correctly
4. **Pet Loading**: Pet lists should load without errors
5. **Assessment**: Assessment submission should work
6. **Matches**: Pet matching should function properly

## Migration Notes

- All existing functionality is preserved
- Backward compatibility maintained through `app/utils/api.ts`
- No breaking changes to existing API contracts
- Authentication tokens and user sessions remain intact

