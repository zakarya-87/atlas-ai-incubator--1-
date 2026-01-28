import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // If auth is disabled, return a mock admin user with the seeded user ID
    if (!request.user) {
      return {
        id: 'f4b3c2a1-1234-5678-9abc-def012345678',
        email: 'admin@atlas.com',
        role: 'ADMIN',
        fullName: 'Atlas Admin',
      };
    }
    return request.user;
  }
);

// Mock factory for testing
export const createMockGetUser = (mockUser: any) => {
  return createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.user) {
      return mockUser;
    }
    return request.user;
  });
};
