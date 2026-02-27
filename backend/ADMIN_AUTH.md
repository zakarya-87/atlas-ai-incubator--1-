# Admin User Authentication

## Overview

Admin user authentication has been enabled in the ATLAS AI Incubator backend. The system now includes role-based access control (RBAC) that distinguishes between regular users and administrators.

## Changes Made

### 1. JWT Payload Enhancement

The authentication service now includes the user's role in the JWT token payload:

- **File**: `src/auth/auth.service.ts`
- **Change**: JWT payload now includes `email`, `role`, and `id`

### 2. Admin User Created

An admin user has been seeded in the database:

- **Email**: `admin@atlas.com`
- **Password**: `admin123`
- **Role**: `ADMIN`
- **Credits**: 999 (unlimited)
- **Subscription**: Enterprise (active)

### 3. Role-Based Access Control

The following infrastructure is in place for role-based authorization:

- **Role Enum**: `src/auth/role.enum.ts` (USER, ADMIN)
- **Roles Decorator**: `src/auth/roles.decorator.ts` - Use `@Roles(Role.ADMIN)` on endpoints
- **Roles Guard**: `src/auth/roles.guard.ts` - Validates user roles against required roles

## How to Use Admin Authentication

### Sign In as Admin

```bash
POST /auth/signin
Content-Type: application/json

{
  "email": "admin@atlas.com",
  "password": "admin123"
}
```

The response will set an httpOnly cookie with the JWT token containing the admin role.

### Protect Admin Endpoints

To restrict an endpoint to admin users only, add the `@Roles` decorator:

```typescript
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';

@Controller('admin')
@UseGuards(RolesGuard) // Apply the roles guard
export class AdminController {
  @Get('dashboard')
  @Roles(Role.ADMIN) // Only ADMIN role can access
  getDashboard() {
    // Admin-only logic
  }
}
```

### Example Admin Endpoint

An example admin endpoint already exists in the history controller:

```typescript
@Get('admin/all')
@Roles(Role.ADMIN)
async getAllAnalysesAdmin() {
  return this.historyService.getAllAnalysesAdmin();
}
```

Access it with: `GET /history/admin/all`

## Security Notes

1. **Production Security**: Change the default admin password immediately in production
2. **JWT Secret**: Use a strong `JWT_SECRET` environment variable in production
3. **Cookie Security**: Cookies are configured as httpOnly and use secure flag in production
4. **Role Verification**: The RolesGuard validates the user's role from the JWT payload

## Testing Admin Access

1. Sign in as admin user
2. Access protected admin endpoints
3. Verify that non-admin users cannot access admin endpoints

## Re-running the Seed Script

To recreate the admin user or update the database:

```bash
cd backend
npx ts-node prisma/seed.ts
```
