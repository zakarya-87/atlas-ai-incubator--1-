import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;

  const mockResponse = {
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  } as unknown as Response;

  beforeEach(async () => {
    authService = {
      signUp: jest.fn().mockResolvedValue(undefined),
      signIn: jest.fn().mockResolvedValue({ accessToken: 'mock-token' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('POST /auth/signup', () => {
    it('should call signUp with credentials', async () => {
      const dto: AuthCredentialsDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      await controller.signUp(dto);

      expect(authService.signUp).toHaveBeenCalledWith(dto);
    });

    it('should handle signup errors', async () => {
      authService.signUp.mockRejectedValue(new Error('Email exists'));
      const dto: AuthCredentialsDto = {
        email: 'existing@example.com',
        password: 'password123',
      };

      await expect(controller.signUp(dto)).rejects.toThrow('Email exists');
    });
  });

  describe('POST /auth/signin', () => {
    it('should sign in and set cookie', async () => {
      const dto: AuthCredentialsDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await controller.signIn(dto, mockResponse);

      expect(authService.signIn).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ success: true, access_token: 'mock-token' });
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'accessToken',
        'mock-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000,
        })
      );
    });

    it('should set secure cookie in production', async () => {
      process.env.NODE_ENV = 'production';
      const dto: AuthCredentialsDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      await controller.signIn(dto, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'accessToken',
        'mock-token',
        expect.objectContaining({
          secure: true,
        })
      );
      process.env.NODE_ENV = 'test';
    });

    it('should handle signin errors', async () => {
      authService.signIn.mockRejectedValue(new Error('Invalid credentials'));
      const dto: AuthCredentialsDto = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      await expect(controller.signIn(dto, mockResponse)).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });

  describe('POST /auth/logout', () => {
    it('should clear the access token cookie', () => {
      const result = controller.logout(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'accessToken',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
        })
      );
      expect(result).toEqual({ success: true });
    });

    it('should clear secure cookie in production', () => {
      process.env.NODE_ENV = 'production';
      controller.logout(mockResponse);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'accessToken',
        expect.objectContaining({
          secure: true,
        })
      );
      process.env.NODE_ENV = 'test';
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return success', () => {
      const result = controller.refresh(mockResponse);

      expect(result).toEqual({ success: true });
    });
  });
});
