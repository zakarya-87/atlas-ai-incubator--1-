import { ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';

// Mock implementation for testing
export const GetUser = jest.fn((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request & { user?: User }>();
  if (!request?.user) {
    return {
      id: 'user-123',
      email: 'test@example.com',
      role: 'USER',
      fullName: 'Test User',
    };
  }
  return request.user;
});
