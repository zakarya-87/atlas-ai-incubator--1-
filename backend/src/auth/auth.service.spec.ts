import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';

declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;
declare const jest: any;

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: any;
  let jwtService: any;
  let emailService: any;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashed_password_123',
    role: 'USER',
  };

  beforeEach(async () => {
    usersService = {
      createUser: jest.fn(),
      findOne: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
    };

    emailService = {
      sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('signUp', () => {
    it('should create a new user successfully', async () => {
      const credentials = {
        email: 'newuser@example.com',
        password: 'password123',
      };

      usersService.createUser.mockResolvedValue(undefined);

      await service.signUp(credentials);

      expect(usersService.createUser).toHaveBeenCalledWith(
        credentials.email,
        credentials.password
      );
      expect(usersService.createUser).toHaveBeenCalledTimes(1);
    });

    it('should send a welcome email after registration', async () => {
      const credentials = {
        email: 'newuser@example.com',
        password: 'password123',
      };

      usersService.createUser.mockResolvedValue(undefined);

      await service.signUp(credentials);

      // Note: We don't await the email in the service (fire and forget)
      // But we can verify it was called
      expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(
        credentials.email
      );
    });

    it('should not fail if welcome email fails', async () => {
      const credentials = {
        email: 'newuser@example.com',
        password: 'password123',
      };

      usersService.createUser.mockResolvedValue(undefined);
      emailService.sendWelcomeEmail.mockRejectedValue(
        new Error('Email service down')
      );

      // Should not throw even if email fails
      await expect(service.signUp(credentials)).resolves.toBeUndefined();
    });

    it('should propagate error if user creation fails', async () => {
      const credentials = {
        email: 'duplicate@example.com',
        password: 'password123',
      };

      usersService.createUser.mockRejectedValue(
        new Error('Email already exists')
      );

      await expect(service.signUp(credentials)).rejects.toThrow(
        'Email already exists'
      );
    });
  });

  describe('signIn', () => {
    it('should return access token for valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'correct_password',
      };

      usersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as ReturnType<typeof jest.fn>).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('mock.jwt.token');

      const result = await service.signIn(credentials);

      expect(usersService.findOne).toHaveBeenCalledWith(credentials.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        credentials.password,
        mockUser.password
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        email: credentials.email,
        role: mockUser.role,
        id: mockUser.id,
      });
      expect(result).toEqual({ accessToken: 'mock.jwt.token' });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      usersService.findOne.mockResolvedValue(null);

      await expect(service.signIn(credentials)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.signIn(credentials)).rejects.toThrow(
        'Please check your login credentials'
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrong_password',
      };

      usersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as ReturnType<typeof jest.fn>).mockResolvedValue(false);

      await expect(service.signIn(credentials)).rejects.toThrow(
        UnauthorizedException
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should handle bcrypt comparison error', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      usersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as ReturnType<typeof jest.fn>).mockRejectedValue(
        new Error('Bcrypt error')
      );

      await expect(service.signIn(credentials)).rejects.toThrow('Bcrypt error');
    });
  });
});
