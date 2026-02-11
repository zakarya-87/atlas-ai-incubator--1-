import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';

export const GetUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<{ user?: User }>();
    // If auth is disabled, return a mock admin user with the seeded user ID
    if (!request.user) {
      return {
        id: 'f4b3c2a1-1234-5678-9abc-def012345678',
        email: 'admin@atlas.com',
        role: 'ADMIN',
        fullName: 'Atlas Admin',
      } as User;
    }
    return request.user;
  }
);

// Mock factory for testing
export const createMockGetUser = (mockUser: User): ((...args: unknown[]) => ParameterDecorator) => {
  return createParamDecorator((_data: unknown, _ctx: ExecutionContext): User => {
    return mockUser;
  });
};
