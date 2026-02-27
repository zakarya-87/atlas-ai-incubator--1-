import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Pick<UsersService, 'findOne' | 'createUserWithName'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync'>>;
  let emailService: jest.Mocked<Pick<EmailService, 'sendWelcomeEmail'>>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashed_password_123',
    fullName: 'Test User',
    role: 'USER',
  };

  beforeEach(async () => {
    usersService = {
      findOne: jest.fn(),
      createUserWithName: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock.jwt.token'),
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

  // ── register() ────────────────────────────────────────────────────────────

  describe('register', () => {
    const registerDto = { email: 'new@example.com', password: 'pass123', name: 'New User' };

    it('should create a user, sign a token and return access_token + user', async () => {
      usersService.findOne.mockResolvedValue(null);
      usersService.createUserWithName.mockResolvedValue(mockUser as any);

      const result = await service.register(registerDto);

      expect(usersService.findOne).toHaveBeenCalledWith(registerDto.email);
      expect(usersService.createUserWithName).toHaveBeenCalledWith(
        registerDto.email,
        registerDto.password,
        registerDto.name
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        email: registerDto.email,
        role: mockUser.role,
        id: mockUser.id,
      });
      expect(result).toEqual({
        access_token: 'mock.jwt.token',
        user: { id: mockUser.id, email: mockUser.email, name: mockUser.fullName },
      });
    });

    it('should throw ConflictException when email is already taken', async () => {
      usersService.findOne.mockResolvedValue(mockUser as any);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(usersService.createUserWithName).not.toHaveBeenCalled();
    });

    it('should fire-and-forget welcome email (not reject on email failure)', async () => {
      usersService.findOne.mockResolvedValue(null);
      usersService.createUserWithName.mockResolvedValue(mockUser as any);
      emailService.sendWelcomeEmail.mockRejectedValue(new Error('SMTP down'));

      await expect(service.register(registerDto)).resolves.toBeDefined();
      expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(registerDto.email);
    });

    it('should fall back email-prefix as name when name is not provided', async () => {
      usersService.findOne.mockResolvedValue(null);
      usersService.createUserWithName.mockResolvedValue(mockUser as any);

      await service.register({ email: 'jane@example.com', password: 'pass' });

      expect(usersService.createUserWithName).toHaveBeenCalledWith(
        'jane@example.com',
        'pass',
        'jane'
      );
    });
  });

  // ── login() ───────────────────────────────────────────────────────────────

  describe('login', () => {
    const credentials = { email: 'test@example.com', password: 'correct_password' };

    it('should return access_token and user for valid credentials', async () => {
      usersService.findOne.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(credentials);

      expect(usersService.findOne).toHaveBeenCalledWith(credentials.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(credentials.password, mockUser.password);
      expect(result).toEqual({
        access_token: 'mock.jwt.token',
        user: { id: mockUser.id, email: mockUser.email, name: mockUser.fullName },
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      usersService.findOne.mockResolvedValue(null);

      await expect(service.login(credentials)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      usersService.findOne.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(credentials)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should propagate bcrypt errors', async () => {
      usersService.findOne.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockRejectedValue(new Error('bcrypt crashed'));

      await expect(service.login(credentials)).rejects.toThrow('bcrypt crashed');
    });
  });
});
