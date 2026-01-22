import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('authService', () => {
  let mockFetch: any;

  beforeEach(() => {
    mockFetch = vi.spyOn(global, 'fetch').mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ accessToken: 'test-token' }),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('signUp', () => {
    it('should be defined as a function', async () => {
      const { signUp } = await import('./authService');
      
      expect(typeof signUp).toBe('function');
    });

    it('should call fetch with correct parameters', async () => {
      const { signUp } = await import('./authService');
      
      await signUp({ email: 'test@example.com', password: 'password123' });
      
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const call = mockFetch.mock.calls[0];
      expect(call[0]).toContain('/auth/signup');
      expect(call[1].method).toBe('POST');
      expect(call[1].headers['Content-Type']).toBe('application/json');
    });

    it('should throw error on failed response', async () => {
      const { signUp } = await import('./authService');
      
      mockFetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Signup failed' }),
        })
      );
      
      await expect(
        signUp({ email: 'test@example.com', password: 'password123' })
      ).rejects.toThrow('Signup failed');
    });
  });

  describe('signIn', () => {
    it('should be defined as a function', async () => {
      const { signIn } = await import('./authService');
      
      expect(typeof signIn).toBe('function');
    });

    it('should call fetch with correct parameters', async () => {
      const { signIn } = await import('./authService');
      
      await signIn({ email: 'test@example.com', password: 'password123' });
      
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const call = mockFetch.mock.calls[0];
      expect(call[0]).toContain('/auth/signin');
      expect(call[1].method).toBe('POST');
      expect(call[1].credentials).toBe('include');
    });

    it('should return auth response on success', async () => {
      const { signIn } = await import('./authService');
      
      const result = await signIn({ email: 'test@example.com', password: 'password123' });
      
      expect(result).toHaveProperty('accessToken');
    });

    it('should throw error on failed response', async () => {
      const { signIn } = await import('./authService');
      
      mockFetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Invalid credentials' }),
        })
      );
      
      await expect(
        signIn({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('fetchUserProfile', () => {
    it('should be defined as a function', async () => {
      const { fetchUserProfile } = await import('./authService');
      
      expect(typeof fetchUserProfile).toBe('function');
    });

    it('should call fetch with correct parameters', async () => {
      const { fetchUserProfile } = await import('./authService');
      
      await fetchUserProfile();
      
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const call = mockFetch.mock.calls[0];
      expect(call[0]).toContain('/users/profile');
      expect(call[1].credentials).toBe('include');
    });

    it('should throw error on failed response', async () => {
      const { fetchUserProfile } = await import('./authService');
      
      mockFetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: false,
        })
      );
      
      await expect(fetchUserProfile()).rejects.toThrow('Failed to fetch profile');
    });
  });

  describe('updateUserProfile', () => {
    it('should be defined as a function', async () => {
      const { updateUserProfile } = await import('./authService');
      
      expect(typeof updateUserProfile).toBe('function');
    });
  });

  describe('exports', () => {
    it('should export signUp function', async () => {
      const module = await import('./authService');
      
      expect(typeof module.signUp).toBe('function');
    });

    it('should export signIn function', async () => {
      const module = await import('./authService');
      
      expect(typeof module.signIn).toBe('function');
    });

    it('should export fetchUserProfile function', async () => {
      const module = await import('./authService');
      
      expect(typeof module.fetchUserProfile).toBe('function');
    });

    it('should export updateUserProfile function', async () => {
      const module = await import('./authService');
      
      expect(typeof module.updateUserProfile).toBe('function');
    });

    it('should export all required auth functions', async () => {
      const module = await import('./authService');
      
      expect(typeof module.signUp).toBe('function');
      expect(typeof module.signIn).toBe('function');
      expect(typeof module.fetchUserProfile).toBe('function');
      expect(typeof module.updateUserProfile).toBe('function');
    });
  });
});
