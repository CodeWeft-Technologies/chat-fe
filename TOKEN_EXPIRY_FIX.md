# Token Expiry Auto-Redirect Implementation

## Overview
Fixed the issue where users remained on the dashboard UI after their authentication token expired, unable to perform any actions. Now the application automatically detects expired tokens and redirects users to the login page.

## Changes Made

### 1. **New API Utility (`app/lib/api.ts`)**
Created a centralized API utility that:
- **Auto-injects authentication tokens** from localStorage into all API requests
- **Detects 401 Unauthorized responses** (expired/invalid tokens)
- **Automatically redirects to login** when token is expired
- **Clears stale credentials** from localStorage before redirecting

#### Key Functions:
- `apiCall<T>(path, opts)` - Wrapper for fetch with automatic token handling
- `verifyToken()` - Checks if current token is still valid

### 2. **Enhanced Auth Gate (`app/components/auth-gate.tsx`)**
Updated the authentication guard to:
- **Verify token validity on mount** - Immediately checks if token is valid when user accesses a protected route
- **Periodic token validation** - Checks token every 5 minutes while user is on protected pages
- **Automatic cleanup** - Clears validation interval on route change or unmount

#### Verification Schedule:
- Initial check: When component mounts or route changes
- Periodic check: Every 5 minutes for protected routes
- No checks on public routes: `/login`, `/register`, `/embed/*`

### 3. **Updated Pages to Use New API Utility**
Modified the following pages to use `apiCall` instead of raw fetch:
- `app/bots/page.tsx` - Bot listing and creation
- `app/page.tsx` - Home page bot loading

**Migration Pattern:**
```typescript
// Before
const headers: Record<string, string> = {};
if (typeof window !== "undefined") { 
  const t = localStorage.getItem("token"); 
  if (t) headers["Authorization"] = `Bearer ${t}`; 
}
const r = await fetch(`${B()}/api/endpoint`, { headers });
if (!r.ok) { /* handle error */ }

// After
import { apiCall } from "./lib/api";
const data = await apiCall<ResponseType>("/api/endpoint");
// 401 errors automatically redirect to login
```

## How It Works

### Token Expiry Detection Flow:
1. **User makes API request** via `apiCall()`
2. **Token automatically injected** from localStorage
3. **Backend validates token** and returns 401 if expired
4. **Frontend detects 401** in apiCall utility
5. **Auto-cleanup**: Removes token and orgId from localStorage
6. **Auto-redirect**: Navigates to `/login` page

### Periodic Validation Flow:
1. **User lands on protected page** (e.g., `/bots`)
2. **AuthGate verifies token** immediately on mount
3. **Sets up 5-minute interval** to re-check token
4. **On expiry**: Redirects to login (handled by `verifyToken`)
5. **On route change**: Clears interval and restarts

## Backend Token Validation

The backend JWT validation (in `app/routes/chat.py` and `app/routes/ingest.py`) checks:
```python
exp = int(payload.get('exp', 0))
if exp and int(datetime.datetime.utcnow().timestamp()) > exp:
    raise HTTPException(status_code=401, detail="Token expired")
```

Default token expiry: **120 minutes** (2 hours)

## Testing

### Manual Test Scenarios:
1. **Login and idle past expiry**:
   - Login to dashboard
   - Wait 2+ hours (or modify JWT expiry to 1 minute for testing)
   - Try to perform any action (create bot, load data)
   - ✅ Should auto-redirect to login

2. **Token expiry during active session**:
   - Login to dashboard
   - Keep page open for 2+ hours
   - Periodic check will detect expiry
   - ✅ Should auto-redirect to login within 5 minutes of expiry

3. **Multiple tabs**:
   - Open dashboard in multiple tabs
   - Token expires
   - Make request in any tab
   - ✅ All tabs should redirect to login (localStorage is shared)

### Quick Testing (Reduce Token Expiry):
Modify `backend/app/routes/chat.py` line ~6124:
```python
# Change from 120 minutes to 1 minute for testing
def _jwt_encode(payload: dict, exp_minutes: int = 1) -> str:
```

## Remaining Work

### Pages Still Using Raw Fetch (Need Migration):
The following pages should be updated to use `apiCall` for consistent token expiry handling:

**High Priority** (frequently accessed):
- `app/bots/[botId]/config/page.tsx` - Bot configuration
- `app/ingest/page.tsx` - Document ingestion
- `app/bots/[botId]/leads/page.tsx` - Lead management
- `app/usage/[botId]/page.tsx` - Usage statistics
- `app/bots/[botId]/calendar/page.tsx` - Calendar configuration

**Medium Priority**:
- `app/embed/[botId]/page.tsx` - Embed code page
- `app/bots/[botId]/form-builder/page.tsx` - Form builder
- `app/oauth/google/callback/page.tsx` - OAuth callback

**Low Priority** (read-only or admin):
- `app/components/org-indicator.tsx` - Organization display

### Migration Instructions:
For each page:
1. Add import: `import { apiCall } from "../../lib/api";` (adjust path as needed)
2. Replace all fetch calls that include `Authorization` header with `apiCall`
3. Remove manual token injection code
4. Test token expiry handling

## Benefits

✅ **Better UX**: Users don't get stuck on non-functional dashboard  
✅ **Security**: Expired tokens automatically cleared  
✅ **Consistency**: Centralized auth handling across all pages  
✅ **Maintainability**: Single source of truth for API calls  
✅ **Proactive**: Detects expiry even without user interaction (periodic checks)

## Configuration

### Adjust Periodic Check Interval:
In `app/components/auth-gate.tsx`, line ~35:
```typescript
}, 5 * 60 * 1000); // Current: 5 minutes
}, 3 * 60 * 1000); // Example: 3 minutes
```

### Adjust Token Expiry (Backend):
In `backend/app/routes/chat.py`, line ~6124:
```python
def _jwt_encode(payload: dict, exp_minutes: int = 120) -> str:
    # Change 120 to desired minutes
```

**Recommendation**: Keep periodic check interval < token expiry / 2 to detect expiry before users encounter errors.
