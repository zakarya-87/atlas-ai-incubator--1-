import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('subscriptionService', () => {
  let mockFetch: any;
  let mockLocalStorage: { getItem: any };

  beforeEach(() => {
    mockFetch = vi.spyOn(global, 'fetch').mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ url: 'https://checkout.example.com' }),
      })
    );

    mockLocalStorage = {
      getItem: vi.fn().mockReturnValue('mock-token'),
    };

    vi.spyOn(window.localStorage, 'getItem').mockImplementation(mockLocalStorage.getItem);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createCheckoutSession', () => {
    it('should be defined as a function', async () => {
      const { createCheckoutSession } = await import('./subscriptionService');
      
      expect(typeof createCheckoutSession).toBe('function');
    });

    it('should call fetch with correct parameters', async () => {
      const { createCheckoutSession } = await import('./subscriptionService');
      
      await createCheckoutSession('pro-plan');
      
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const call = mockFetch.mock.calls[0];
      expect(call[0]).toContain('/subscriptions/checkout');
      expect(call[1].method).toBe('POST');
      expect(call[1].headers['Content-Type']).toBe('application/json');
    });

    it('should include planId in request body', async () => {
      const { createCheckoutSession } = await import('./subscriptionService');
      
      await createCheckoutSession('enterprise-plan');
      
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.planId).toBe('enterprise-plan');
    });

    it('should throw error on failed response', async () => {
      const { createCheckoutSession } = await import('./subscriptionService');
      
      mockFetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: false,
        })
      );
      
      await expect(
        createCheckoutSession('pro-plan')
      ).rejects.toThrow('Failed to create checkout session');
    });

    it('should return url on success', async () => {
      const { createCheckoutSession } = await import('./subscriptionService');
      
      const result = await createCheckoutSession('pro-plan');
      
      expect(result).toHaveProperty('url');
    });
  });

  describe('createPortalSession', () => {
    it('should be defined as a function', async () => {
      const { createPortalSession } = await import('./subscriptionService');
      
      expect(typeof createPortalSession).toBe('function');
    });

    it('should call fetch with correct parameters', async () => {
      const { createPortalSession } = await import('./subscriptionService');
      
      await createPortalSession();
      
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const call = mockFetch.mock.calls[0];
      expect(call[0]).toContain('/subscriptions/portal');
      expect(call[1].method).toBe('POST');
    });

    it('should include authorization header', async () => {
      const { createPortalSession } = await import('./subscriptionService');
      
      await createPortalSession();
      
      const call = mockFetch.mock.calls[0];
      expect(call[1].headers['Authorization']).toContain('Bearer');
    });
  });

  describe('getSubscriptionStatus', () => {
    it('should be defined as a function', async () => {
      const { getSubscriptionStatus } = await import('./subscriptionService');
      
      expect(typeof getSubscriptionStatus).toBe('function');
    });

    it('should return default status on failed response', async () => {
      const { getSubscriptionStatus } = await import('./subscriptionService');
      
      mockFetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: false,
        })
      );
      
      const result = await getSubscriptionStatus();
      
      expect(result.status).toBe('free');
      expect(result.plan).toBe('basic');
    });

    it('should call fetch with correct parameters', async () => {
      const { getSubscriptionStatus } = await import('./subscriptionService');
      
      await getSubscriptionStatus();
      
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const call = mockFetch.mock.calls[0];
      expect(call[0]).toContain('/subscriptions/status');
      expect(call[1].method).toBeUndefined();
    });
  });

  describe('exports', () => {
    it('should export createCheckoutSession function', async () => {
      const module = await import('./subscriptionService');
      
      expect(typeof module.createCheckoutSession).toBe('function');
    });

    it('should export createPortalSession function', async () => {
      const module = await import('./subscriptionService');
      
      expect(typeof module.createPortalSession).toBe('function');
    });

    it('should export getSubscriptionStatus function', async () => {
      const module = await import('./subscriptionService');
      
      expect(typeof module.getSubscriptionStatus).toBe('function');
    });

    it('should export all required functions', async () => {
      const module = await import('./subscriptionService');
      
      expect(typeof module.createCheckoutSession).toBe('function');
      expect(typeof module.createPortalSession).toBe('function');
      expect(typeof module.getSubscriptionStatus).toBe('function');
    });
  });
});
