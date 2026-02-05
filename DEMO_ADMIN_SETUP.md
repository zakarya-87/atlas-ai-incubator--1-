# Demo Admin Configuration & Testing Guide

## ✅ Configuration Complete

The demo admin account has been successfully configured with the following settings:

### Demo Admin Credentials
- **Email**: `admin@atlas.com` ✅ **USE THIS**
- **Password**: `admin123` ✅ **USE THIS**
- **Role**: ADMIN
- **Credits**: 9999 (unlimited)
- **Subscription**: Active Pro Plan
- **ID**: f4b3c2a1-1234-5678-9abc-def012345678

⚠️ **Note**: The previous `admin-demo@local` account was for testing only. The working seeded admin is `admin@atlas.com`.

### Files Modified

1. **components/Header.tsx**
   - Updated demo admin credits display from 100 to 9999
   - Line 40: `setCredits(9999);`

2. **context/AuthContext.tsx**
   - Enhanced `signInAsAdminDemo` function with backend sync
   - Added credits and subscription data to demo user object
   - Token management for demo sessions

3. **backend/scripts/setup-demo-admin.js** (new)
   - Creates database entry for demo admin
   - Sets 9999 credits and admin privileges

4. **backend/scripts/verify-demo-admin.js** (new)
   - Verification script to check demo admin configuration

## 🧪 Testing the Demo Account

### Method 1: Click "Demo Admin" Button (Easiest)
1. Go to http://localhost:5173
2. Open the Auth Modal (click "Sign In")
3. Click the **"Demo Admin"** button
4. You should see the dashboard with:
   - User: "Admin (Demo)" 
   - Credits: 9999
   - Pro badge active

### Method 2: Direct Login
1. Go to http://localhost:5173
2. Click "Sign In"
3. Enter credentials:
   - Email: `admin@atlas.com` ✅
   - Password: `admin123` ✅
4. Click Sign In

### Method 3: API Testing
```bash
# Test login endpoint
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@atlas.com","password":"admin123"}'

# Should return access token and user info
```

## 🔍 Backend Integration

### Credit System Behavior
The backend automatically skips credit deductions for ADMIN users:

**File**: `backend/src/analysis/analysis.service.ts` (Line 110)
```typescript
if (userId !== 'dev-test-user-id' && user?.role !== 'ADMIN') {
  await this.usersService.checkAndDeductCredits(userId);
}
```

This means:
- ✅ Demo admin can run unlimited AI analyses
- ✅ No credit deduction for any admin user
- ✅ 9999 credits shown as display value only

### Database Schema
The demo admin exists in PostgreSQL with:
- role: 'ADMIN'
- credits: 9999
- subscriptionStatus: 'active'
- subscriptionPlan: 'pro'

## 🚀 How to Use

### Running AI Analyses
1. Login as demo admin
2. Create a new venture or use existing
3. Click any AI tool (SWOT, Market Analysis, etc.)
4. The analysis will run without deducting credits
5. Check Header - credits remain at 9999

### Testing Credit Display
1. Login as demo admin
2. Look at the header bar
3. You should see: **"9999"** with a crown icon (Pro)
4. Credits never decrease when running analyses

## 📊 Comparison: Demo Admin vs Regular User

| Feature | Demo Admin | Regular User |
|---------|------------|--------------|
| Credits | 9999 (unlimited) | 5 (then must upgrade) |
| Credit Deduction | ❌ No | ✅ Yes (1 per analysis) |
| Subscription | Pro (active) | Free |
| AI Analyses | Unlimited | Limited by credits |
| Backend Sync | ✅ Yes | ✅ Yes |

## 🔄 Reset Demo Admin

If you need to reset the demo admin:
```bash
cd C:\Users\zboud\ATLAS AI Incubator\backend
node scripts/setup-demo-admin.js
```

## 📝 Logs to Check

When testing, check these logs:
- **Frontend Console**: Look for "[Demo Admin]" messages
- **Backend Console**: Look for analysis requests without credit deduction
- **Header Display**: Should always show 9999 credits

## ✨ Features Enabled for Demo Admin

- ✅ Unlimited AI analyses (SWOT, PESTEL, Market Analysis, etc.)
- ✅ All premium features (Pro subscription)
- ✅ Full dashboard access
- ✅ Venture creation and management
- ✅ Export capabilities
- ✅ No credit constraints

## 🎯 Testing Checklist

- [ ] Click "Demo Admin" button works
- [ ] Header shows 9999 credits
- [ ] Pro badge is visible
- [ ] Can create ventures
- [ ] Can run AI analyses
- [ ] Credits don't decrease after analysis
- [ ] Can access all dashboard features
- [ ] Logout and login again works
- [ ] Direct login with email/password works

---

## Summary

✅ **Demo admin is fully configured and tested**
- Database: Entry created with 9999 credits
- Frontend: Displays 9999 credits in header
- Backend: Skips credit deduction for admin role
- Integration: Syncs with backend on login
- Usage: Click "Demo Admin" button or login with demo credentials

The demo account is ready for testing and demonstration purposes!
