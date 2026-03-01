import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from './AuthContext';

const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockFetchUserProfile = vi.fn();

vi.mock('../services/authService', () => ({
  signIn: (...args: any[]) => mockSignIn(...args),
  signUp: (...args: any[]) => mockSignUp(...args),
  fetchUserProfile: (...args: any[]) => mockFetchUserProfile(...args),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockFetchUserProfile.mockRejectedValue(new Error('No session'));
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
    } = useAuth();
    return (
      <div>
        <span data-testid="user-email">{user?.email || 'null'}</span>
        <span data-testid="is-authenticated">{isAuthenticated.toString()}</span>
        <span data-testid="is-admin">{isAdmin.toString()}</span>
        <span data-testid="loading">{loading.toString()}</span>
        <button
          onClick={() =>
            login({ email: 'test@example.com', password: 'password123' })
          }
        >
          Login
        </button>
        <button
          onClick={() =>
            register({ email: 'test@example.com', password: 'password123' })
          }
        >
          Register
        </button>
        <button onClick={logout}>Logout</button>
        <button onClick={refreshAuth}>Refresh</button>
      </div>
    );
  };

  it('should provide initial unauthenticated state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-email')).toHaveTextContent('null');
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
  });

  it('should set loading to false after initialization', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  it('should call signIn on login', async () => {
    mockSignIn.mockResolvedValue({ user: { email: 'test@example.com' } });
    mockFetchUserProfile.mockResolvedValue({ email: 'test@example.com' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    await act(async () => {
      loginButton.click();
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should call signUp on register', async () => {
    mockSignUp.mockResolvedValue({ user: { email: 'test@example.com' } });
    mockSignIn.mockResolvedValue({ user: { email: 'test@example.com' } });
    mockFetchUserProfile.mockResolvedValue({ email: 'test@example.com' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const registerButton = screen.getByText('Register');
    await act(async () => {
      registerButton.click();
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should throw error when useAuth is used outside provider', () => {
    const TestOutsideProvider = () => {
      expect(() => useAuth()).toThrow(
        'useAuth must be used within an AuthProvider'
      );
      return null;
    };

    render(<TestOutsideProvider />);
  });

  it('should render children correctly', () => {
    render(
      <AuthProvider>
        <div data-testid="child-element">Child Content</div>
      </AuthProvider>
    );

    expect(screen.getByTestId('child-element')).toHaveTextContent(
      'Child Content'
    );
  });
});
