// Mock implementation for testing
export const GetUser = jest.fn((data: unknown, ctx: any) => {
  const request = ctx?.switchToHttp?.()?.getRequest();
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
