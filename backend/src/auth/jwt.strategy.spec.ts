import { JwtStrategy } from './jwt.strategy';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: any;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'USER',
  };

  beforeEach(async () => {
    usersService = {
      findById: jest.fn().mockResolvedValue(mockUser),
    };

    strategy = new JwtStrategy(usersService);
  });

  describe('validate', () => {
    it('should return user if found', async () => {
      const payload = { id: 'user-123', email: 'test@example.com' };

      const result = await strategy.validate(payload);

      expect(result).toEqual(mockUser);
      expect(usersService.findById).toHaveBeenCalledWith('user-123');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findById.mockResolvedValue(null);
      const payload = { id: 'invalid', email: 'test@example.com' };

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });
  });
});
