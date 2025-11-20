
import { AuthCredentials } from '../types';

const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:3000';

export interface AuthResponse {
  accessToken: string;
}

export interface UserProfile {
    id: string;
    email: string;
    fullName?: string;
    role: string;
    credits: number;
    subscriptionStatus: string;
    subscriptionPlan: string;
}

export const signUp = async (credentials: AuthCredentials): Promise<void> => {
  const response = await fetch(`${BACKEND_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Include cookies in request
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to sign up');
  }
};

export const signIn = async (credentials: AuthCredentials): Promise<AuthResponse> => {
  const response = await fetch(`${BACKEND_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Include cookies in request
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to sign in');
  }

  return response.json();
};

export const fetchUserProfile = async (): Promise<UserProfile> => {
    const response = await fetch(`${BACKEND_URL}/users/profile`, {
        credentials: 'include' // Include cookies in request
    });

    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
};

export const updateUserProfile = async (data: { fullName?: string; password?: string }): Promise<UserProfile> => {
    const response = await fetch(`${BACKEND_URL}/users/profile`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in request
        body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
};
