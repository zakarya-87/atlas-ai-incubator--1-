import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { Role } from './role.enum';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (userRole: Role | undefined, requiredRoles: Role[] | undefined): ExecutionContext => {
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: userRole ? { role: userRole } : undefined,
        }),
      }),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

    return context;
  };

  describe('canActivate', () => {
    it('should return true if no roles are required', () => {
      const context = createMockContext(Role.USER, undefined);
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should return true if user has required role', () => {
      const context = createMockContext(Role.ADMIN, [Role.ADMIN]);
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should return false if user does not have required role', () => {
      const context = createMockContext(Role.USER, [Role.ADMIN]);
      expect(guard.canActivate(context)).toBe(false);
    });

    it('should return false if user is not authenticated', () => {
      const context = createMockContext(undefined, [Role.USER]);
      expect(guard.canActivate(context)).toBe(false);
    });

    it('should return true if user has one of several required roles', () => {
      const context = createMockContext(Role.ADMIN, [Role.USER, Role.ADMIN]);
      expect(guard.canActivate(context)).toBe(true);
    });
  });
});
