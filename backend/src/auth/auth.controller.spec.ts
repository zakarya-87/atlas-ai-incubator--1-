import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response } from 'express';

const mockAuthResult = {
  access_token: 'mock-token',
  user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
};

const mockResponse = {
  cookie: jest.fn().mockReturnThis(),
  clearCookie: jest.fn().mockReturnThis(),
} as unknown as Response;

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<Pick<AuthService, 'register' | 'login'>>;

  beforeEach(async () => {
    authService = {
      register: jest.fn().mockResolvedValue(mockAuthResult),
      login: jest.fn().mockResolvedValue(mockAuthResult),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  // ── POST /auth/register ───────────────────────────────────────────────────

  describe('POST /auth/register', () => {
    const dto = { email: 'new@example.com', password: 'pass123', name: 'New User' };

    it('should call authService.register and return access_token + user', async () => {
      const result = await controller.register(dto, mockResponse);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAuthResult);
    });

    it('should set an httpOnly cookie with the access token', async () => {
      await controller.register(dto, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'accessToken',
        'mock-token',
        expect.objectContaining({
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        })
      );
    });

    it('should propagate service errors', async () => {
      authService.register.mockRejectedValue(new Error('Conflict'));
      await expect(controller.register(dto, mockResponse)).rejects.toThrow('Conflict');
    });
  });

  // ── POST /auth/login ──────────────────────────────────────────────────────

  describe('POST /auth/login', () => {
    const dto = { email: 'test@example.com', password: 'correct' };

    it('should call authService.login and return access_token + user', async () => {
      const result = await controller.login(dto, mockResponse);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAuthResult);
    });

    it('should set an httpOnly cookie with the access token', async () => {
      await controller.login(dto, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'accessToken',
        'mock-token',
        expect.objectContaining({ httpOnly: true })
      );
    });

    it('should set a secure cookie in production', async () => {
      process.env.NODE_ENV = 'production';
      await controller.login(dto, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'accessToken',
        'mock-token',
        expect.objectContaining({ secure: true })
      );
      process.env.NODE_ENV = 'test';
    });

    it('should propagate service errors', async () => {
      authService.login.mockRejectedValue(new Error('Unauthorized'));
      await expect(controller.login(dto, mockResponse)).rejects.toThrow('Unauthorized');
    });
  });

  // ── POST /auth/logout ─────────────────────────────────────────────────────

  describe('POST /auth/logout', () => {
    it('should clear the auth cookie and return success', () => {
      const result = controller.logout(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'accessToken',
        expect.objectContaining({ httpOnly: true })
      );
      expect(result).toEqual({ success: true });
    });

    it('should clear a secure cookie in production', () => {
      process.env.NODE_ENV = 'production';
      controller.logout(mockResponse);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'accessToken',
        expect.objectContaining({ secure: true })
      );
      process.env.NODE_ENV = 'test';
    });
  });

  // ── POST /auth/refresh ────────────────────────────────────────────────────

  describe('POST /auth/refresh', () => {
    it('should return success when auth guard passes', () => {
      expect(controller.refresh(mockResponse)).toEqual({ success: true });
    });
  });

  // ── Legacy aliases ────────────────────────────────────────────────────────

  describe('POST /auth/signup (legacy alias)', () => {
    it('should delegate to register()', async () => {
      const dto = { email: 'new@example.com', password: 'pass', name: 'Name' };
      const result = await controller.signUp(dto, mockResponse);
      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAuthResult);
    });
  });

  describe('POST /auth/signin (legacy alias)', () => {
    it('should delegate to login()', async () => {
      const dto = { email: 'test@example.com', password: 'pass' };
      const result = await controller.signIn(dto, mockResponse);
      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAuthResult);
    });
  });
});
