
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { Role } from './role.enum';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: any;

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
      getAllAndOverride: jest.fn(),
    };
    guard = new RolesGuard(reflector);
  });

  describe('canActivate', () => {
    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should implement CanActivate', () => {
      expect(guard.canActivate).toBeDefined();
      expect(typeof guard.canActivate).toBe('function');
    });

    it('should always return true for testing', () => {
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should not check reflector in testing mode', () => {
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      guard.canActivate(context);

      expect(reflector.get).not.toHaveBeenCalled();
      expect(reflector.getAllAndOverride).not.toHaveBeenCalled();
    });

    it('should work with different context types', () => {
      const contexts = [
        {} as ExecutionContext,
        { getHandler: () => ({}), getClass: () => ({}) } as ExecutionContext,
        { switchToHttp: () => ({ getRequest: () => ({ user: {} }) }) } as ExecutionContext,
      ];

      for (const context of contexts) {
        const result = guard.canActivate(context);
        expect(result).toBe(true);
      }
    });
  });
});
