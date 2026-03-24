import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { STORAGE_KEYS } from '../utils/constants';

const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockFetchUserProfile = vi.fn();

vi.mock('../services/authService', () => ({
  signIn: (...args: any[]) => mockSignIn(...args),
  signUp: (...args: any[]) => mockSignUp(...args),
  fetchUserProfile: (...args: any[]) => mockFetchUserProfile(...args),
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockFetchUserProfile.mockRejectedValue(new Error('No session'));
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  const TestComponent: React.FC = () => {
    const {
      user,
      isAuthenticated,
      isAdmin,
      login,
      register,
      logout,
      loading,
      refreshAuth,
      signInAsAdminDemo,
      token,
    } = useAuth();

    return (
      <div>
        <span data-testid="user-email">{user?.email || 'null'}</span>
        <span data-testid="user-role">{user?.role || 'null'}</span>
        <span data-testid="user-name">{user?.name || 'null'}</span>
        <span data-testid="token">{token || 'null'}</span>
        <span data-testid="is-authenticated">{isAuthenticated.toString()}</span>
        <span data-testid="is-admin">{isAdmin.toString()}</span>
        <span data-testid="loading">{loading.toString()}</span>
        <button
          onClick={async () => {
            try {
              await login({ email: 'test@example.com', password: 'password123' })
            } catch (e) {}
          }}
        >
          Login
        </button>
        <button
          onClick={async () => {
             await register({ email: 'test@example.com', password: 'password123' })
          }}
        >
          Register
        </button>
        <button onClick={async () => await logout()}>Logout</button>
        <button onClick={async () => await refreshAuth()}>Refresh</button>
        <button onClick={async () => {
            try {
               await signInAsAdminDemo()
            } catch (e) {}
        }}>SignInAsAdminDemo</button>
      </div>
    );
  };

  const renderWithAct = async () => {
    let result: any;
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await act(async () => {
      result = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });
    // Wait for the initialization effect to settle
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    consoleSpy.mockRestore();
    return result;
  };

  it('should provide initial unauthenticated state', async () => {
    await renderWithAct();
    expect(screen.getByTestId('user-email')).toHaveTextContent('null');
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
  });

  it('should set loading to false after initialization', async () => {
    await renderWithAct();
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  it('should load demo admin from localStorage on initialization', async () => {
    localStorage.setItem('demo_admin_user', JSON.stringify({ email: 'demo@atlas.com', role: 'admin', name: 'Demo Admin' }));
    await renderWithAct();

    expect(screen.getByTestId('user-email')).toHaveTextContent('demo@atlas.com');
    expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('is-admin')).toHaveTextContent('true');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  it('should fetch user profile on initialization if session is valid', async () => {
    mockFetchUserProfile.mockResolvedValueOnce({ email: 'real@atlas.com' });
    await renderWithAct();

    expect(screen.getByTestId('user-email')).toHaveTextContent('real@atlas.com');
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
  });

  it('should call signIn on login and set access token if present', async () => {
    mockSignIn.mockResolvedValue({ access_token: 'fake-token' });
    mockFetchUserProfile.mockResolvedValue({ email: 'test@example.com' });

    await renderWithAct();

    const loginButton = screen.getByText('Login');
    await act(async () => {
      loginButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('token')).toHaveTextContent('fake-token');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBe('fake-token');
  });

  it('should logout on login failure', async () => {
    mockSignIn.mockRejectedValue(new Error('Login failed'));

    await renderWithAct();

    const loginButton = screen.getByText('Login');
    await act(async () => {
      loginButton.click();
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', expect.any(Object));
    });
  });

  it('should call signUp on register and auto-login', async () => {
    mockSignUp.mockResolvedValue({});
    mockSignIn.mockResolvedValue({ access_token: 'fake-token-reg' });
    mockFetchUserProfile.mockResolvedValue({ email: 'test@example.com' });

    await renderWithAct();

    const registerButton = screen.getByText('Register');
    await act(async () => {
      registerButton.click();
    });

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should logout correctly', async () => {
    // Set local storage values BEFORE initializing
    localStorage.setItem('demo_admin_user', 'some-data');
    localStorage.setItem('atlas_venture_id', 'venture-123');
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'test-token');

    // AuthContext initialize
    await renderWithAct();

    // Re-set it again because initialization might clear it if session fails
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'test-token');

    const logoutButton = screen.getByText('Logout');
    await act(async () => {
      logoutButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('token')).toHaveTextContent('null');
      expect(screen.getByTestId('user-email')).toHaveTextContent('null');
    });

    expect(localStorage.getItem('demo_admin_user')).toBeNull();
    expect(localStorage.getItem('atlas_venture_id')).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBeNull();

    // AuthContext passes token properly since it reads before removal now
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/auth/logout',
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer test-token' },
        credentials: 'include',
      })
    );
  });

  it('should refresh authentication and verify session', async () => {
    mockFetchUserProfile.mockResolvedValue({ email: 'refreshed@atlas.com' });
    await renderWithAct();

    const refreshButton = screen.getByText('Refresh');
    await act(async () => {
      refreshButton.click();
    });

    await waitFor(() => {
      expect(mockFetchUserProfile).toHaveBeenCalled();
    });
  });

  it('should skip refresh verification if demo admin is active', async () => {
    localStorage.setItem('demo_admin_user', JSON.stringify({ email: 'demo@atlas.com', role: 'admin' }));
    await renderWithAct();

    mockFetchUserProfile.mockClear();

    const refreshButton = screen.getByText('Refresh');
    await act(async () => {
      refreshButton.click();
    });

    // Wait briefly to ensure no effect has run
    await new Promise((r) => setTimeout(r, 0));
    expect(mockFetchUserProfile).not.toHaveBeenCalled();
  });

  it('should log out on refreshAuth failure', async () => {
    mockFetchUserProfile.mockRejectedValue(new Error('Invalid session'));
    await renderWithAct();

    const refreshButton = screen.getByText('Refresh');
    await act(async () => {
      refreshButton.click();
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', expect.any(Object));
    });
  });

  it('should handle signInAsAdminDemo success correctly', async () => {
    await renderWithAct();

    // Setup for fetch sequence in signInAsAdminDemo
    // 1st call: login
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'demo-admin-token' }),
    });

    // 2nd setup: profile fetch
    mockFetchUserProfile.mockResolvedValueOnce({
      email: 'admin@atlas.com',
      fullName: 'Atlas Admin Profile',
      role: 'admin',
      credits: 100,
    });

    const adminButton = screen.getByText('SignInAsAdminDemo');
    await act(async () => {
      adminButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('token')).toHaveTextContent('demo-admin-token');
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/auth/signin',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'admin@atlas.com', password: 'admin123' }),
      })
    );

    expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBe('demo-admin-token');

    const storedDemoUser = JSON.parse(localStorage.getItem('demo_admin_user') || '{}');
    expect(storedDemoUser.email).toBe('admin@atlas.com');
    expect(storedDemoUser.name).toBe('Atlas Admin Profile');

    expect(screen.getByTestId('user-email')).toHaveTextContent('admin@atlas.com');
    expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
  });

  it('should handle signInAsAdminDemo failure and use fallback', async () => {
    // Fail the login specifically
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Server error' }),
    });

    await renderWithAct();

    const adminButton = screen.getByText('SignInAsAdminDemo');

    await act(async () => {
      adminButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('token')).toHaveTextContent('demo-token');
    });

    const storedDemoUser = JSON.parse(localStorage.getItem('demo_admin_user') || '{}');
    expect(storedDemoUser.email).toBe('admin@atlas.com');
    expect(storedDemoUser.name).toBe('Atlas Admin (Demo)');

    expect(screen.getByTestId('user-email')).toHaveTextContent('admin@atlas.com');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Atlas Admin (Demo)');
  });

  it('should throw error when useAuth is used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const TestOutsideProvider = () => {
      useAuth();
      return null;
    };

    expect(() => render(<TestOutsideProvider />)).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });

  it('should render children correctly', async () => {
    let result: any;
    await act(async () => {
      result = render(
        <AuthProvider>
          <div data-testid="child-element">Child Content</div>
        </AuthProvider>
      );
    });

    expect(screen.getByTestId('child-element')).toHaveTextContent('Child Content');
  });
});
