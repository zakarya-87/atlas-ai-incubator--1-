import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;
declare const jest: any;

// Mock bcrypt
jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: any;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashed_password',
    credits: 5,
    subscriptionStatus: 'free',
    role: 'USER',
  };

  const mockProUser = {
    id: 'user-pro',
    email: 'pro@example.com',
    password: 'hashed_password',
    credits: 100,
    subscriptionStatus: 'active',
    role: 'USER',
  };

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findOne', () => {
    it('should return a user by email', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('test@example.com');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findOne('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById('user-123');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create a user with hashed password', async () => {
      const email = 'newuser@example.com';
      const password = 'plainPassword123';
      const salt = 'mock_salt';
      const hashedPassword = 'hashed_mock_password';

      (bcrypt.genSalt as ReturnType<typeof jest.fn>).mockResolvedValue(salt);
      (bcrypt.hash as ReturnType<typeof jest.fn>).mockResolvedValue(
        hashedPassword
      );
      prismaService.user.create.mockResolvedValue({
        id: 'new-user-id',
        email,
        password: hashedPassword,
      });

      await service.createUser(email, password);

      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(password, salt);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email,
          password: hashedPassword,
          credits: 5,
          role: 'USER',
          subscriptionStatus: 'free',
          subscriptionPlan: 'free',
          fullName: 'newuser',
        },
      });
    });

    it('should set default credits to 5', async () => {
      (bcrypt.genSalt as ReturnType<typeof jest.fn>).mockResolvedValue('salt');
      (bcrypt.hash as ReturnType<typeof jest.fn>).mockResolvedValue('hashed');
      prismaService.user.create.mockResolvedValue({});

      await service.createUser('test@example.com', 'password');

      expect(prismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            credits: 5,
          }),
        })
      );
    });
  });

  describe('updateUser', () => {
    it('should update user with non-password fields', async () => {
      const userId = 'user-123';
      const updateDto = { fullName: 'John Doe' };

      prismaService.user.update.mockResolvedValue({
        ...mockUser,
        fullName: 'John Doe',
      });

      const result = await service.updateUser(userId, updateDto);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { fullName: 'John Doe' },
      });
      expect(result.fullName).toBe('John Doe');
    });

    it('should hash password when updating password', async () => {
      const userId = 'user-123';
      const updateDto = { password: 'newPassword123' };
      const salt = 'new_salt';
      const hashedPassword = 'new_hashed_password';

      (bcrypt.genSalt as ReturnType<typeof jest.fn>).mockResolvedValue(salt);
      (bcrypt.hash as ReturnType<typeof jest.fn>).mockResolvedValue(
        hashedPassword
      );
      prismaService.user.update.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      await service.updateUser(userId, updateDto);

      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', salt);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { password: hashedPassword },
      });
    });

    it('should update both fullName and password', async () => {
      const userId = 'user-123';
      const updateDto = { fullName: 'Jane Doe', password: 'newPass456' };

      (bcrypt.genSalt as ReturnType<typeof jest.fn>).mockResolvedValue('salt');
      (bcrypt.hash as ReturnType<typeof jest.fn>).mockResolvedValue(
        'hashed_new_pass'
      );
      prismaService.user.update.mockResolvedValue({});

      await service.updateUser(userId, updateDto);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          fullName: 'Jane Doe',
          password: 'hashed_new_pass',
        },
      });
    });
  });

  describe('checkAndDeductCredits', () => {
    it('should return -1 for users with active subscription (unlimited)', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockProUser);

      const result = await service.checkAndDeductCredits('user-pro');

      expect(result).toBe(-1);
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });

    it('should deduct 1 credit and return new balance for free users', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue({
        ...mockUser,
        credits: 4,
      });

      const result = await service.checkAndDeductCredits('user-123');

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { credits: { decrement: 1 } },
      });
      expect(result).toBe(4);
    });

    it('should throw ForbiddenException if credits are 0', async () => {
      const userWithNoCredits = { ...mockUser, credits: 0 };
      prismaService.user.findUnique.mockResolvedValue(userWithNoCredits);

      await expect(service.checkAndDeductCredits('user-123')).rejects.toThrow(
        ForbiddenException
      );
      await expect(service.checkAndDeductCredits('user-123')).rejects.toThrow(
        'Insufficient credits. Please upgrade to Pro to continue generating insights.'
      );
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if credits are negative', async () => {
      const userWithNegativeCredits = { ...mockUser, credits: -5 };
      prismaService.user.findUnique.mockResolvedValue(userWithNegativeCredits);

      await expect(service.checkAndDeductCredits('user-123')).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should successfully deduct when user has exactly 1 credit', async () => {
      const userWithOneCredit = { ...mockUser, credits: 1 };
      prismaService.user.findUnique.mockResolvedValue(userWithOneCredit);
      prismaService.user.update.mockResolvedValue({
        ...userWithOneCredit,
        credits: 0,
      });

      const result = await service.checkAndDeductCredits('user-123');

      expect(result).toBe(0);
      expect(prismaService.user.update).toHaveBeenCalledTimes(1);
    });

    it('should bypass deduction for trialing subscription status', async () => {
      const trialingUser = {
        ...mockUser,
        subscriptionStatus: 'active',
        credits: 2,
      };
      prismaService.user.findUnique.mockResolvedValue(trialingUser);

      const result = await service.checkAndDeductCredits('user-123');

      expect(result).toBe(-1);
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });
  });
});
