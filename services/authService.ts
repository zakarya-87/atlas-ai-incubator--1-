import { AuthCredentials } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

import config from '../utils/config';
const BACKEND_URL = config.apiBaseUrl;

export interface AuthResponse {
  access_token?: string;
  success?: boolean;
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

export const signIn = async (
  credentials: AuthCredentials
): Promise<AuthResponse> => {
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

const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const fetchUserProfile = async (): Promise<UserProfile> => {
  const headers = getAuthHeaders();
  // Remove content-type for GET request if not needed, but keep Auth
  delete headers['Content-Type']; 

  const response = await fetch(`${BACKEND_URL}/users/profile`, {
    headers,
    credentials: 'include', // Include cookies in request
  });

  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
};

export const updateUserProfile = async (data: {
  fullName?: string;
  password?: string;
}): Promise<UserProfile> => {
  const response = await fetch(`${BACKEND_URL}/users/profile`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    credentials: 'include', // Include cookies in request
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to update profile');
  return response.json();
};

export const logout = async (): Promise<void> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/auth/logout`, {
    method: 'POST',
    headers,
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Failed to logout');
};
