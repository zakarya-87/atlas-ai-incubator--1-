import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { signIn, signUp, AuthResponse } from '../services/authService';
import { AuthCredentials } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * SECURITY UPDATE:
 * Now using httpOnly cookies for JWT tokens to prevent XSS attacks.
 *
 * The token is stored in an httpOnly cookie and automatically sent with requests.
 * The frontend no longer handles the JWT token directly.
 */

interface AuthContextType {
  user: { email: string } | null;
  token: string | null; // This will now always be null since tokens are in cookies
  isAuthenticated: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (credentials: AuthCredentials) => Promise<void>;
  logout: () => void;
  loading: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [token, setToken] = useState<string | null>(null); // Always null now that we use cookies
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize auth state by verifying current session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try to fetch user profile to verify the current session
        const profile = await fetchUserProfile();
        setUser({ email: profile.email });
      } catch (error) {
        // If the session is invalid, user remains unauthenticated
        console.debug('No valid session found:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: AuthCredentials) => {
    try {
      const response = await signIn(credentials);

      if (response.success) {
        // Fetch user profile to set current user state
        const profile = await fetchUserProfile();
        setUser({ email: profile.email });
        // Token is now in httpOnly cookie, so we don't store it
        setToken(null);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      // Clear any partial state
      logout();
      throw error;
    }
  }, []);

  const register = useCallback(async (credentials: AuthCredentials) => {
    await signUp(credentials);
    // Note: Registration doesn't auto-login, user must sign in
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call backend to clear the authentication cookie
      await fetch(`${(import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:3000'}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Include cookies in request
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth-related state
      setToken(null);
      setUser(null);
    }
  }, []);

  // Refresh authentication (verify current session is still valid)
  const refreshAuth = useCallback(async () => {
    try {
      // Verify the current session by fetching user profile
      await fetchUserProfile();
      // Session is still valid, no action needed
    } catch (error) {
      // Session is invalid, log out the user
      console.debug('Session expired, logging out:', error);
      await logout();
    }
  }, [logout]);

  // Auto-logout on session expiration (basic implementation)
  useEffect(() => {
    if (!user) return;

    // Check session validity periodically (every 5 minutes)
    const intervalId = setInterval(() => {
      refreshAuth();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [user, refreshAuth]);

  const value = {
    user,
    token,
    isAuthenticated: !!user, // Check if user is set instead of token
    login,
    register,
    logout,
    loading,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
