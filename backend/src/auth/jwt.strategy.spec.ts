import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: jest.Mocked<UsersService>;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedpassword',
    fullName: 'Test User',
    role: 'USER',
    credits: 10,
    subscriptionStatus: 'active',
    subscriptionPlan: 'free',
    stripeCustomerId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockUsersService = {
      findById: jest.fn().mockResolvedValue(mockUser),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get(UsersService);
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
