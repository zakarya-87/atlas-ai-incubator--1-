// Frontend constants - comprehensive configuration
export const API_BASE_URL = process.env.VITE_BACKEND_URL || 'http://localhost:3000';
export const WS_URL = process.env.VITE_BACKEND_URL?.replace(/^http/, 'ws') || 'ws://localhost:3000';

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme_preference',
  LANGUAGE: 'language',
  RECENT_JOBS: 'recent_jobs',
};

// WebSocket configuration
export const WS_CONFIG = {
  url: WS_URL,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  CONNECTION_TIMEOUT: 10000,
  HEARTBEAT_INTERVAL: 5000,
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 1000,
};

// API Configuration
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  BACKEND_URL: API_BASE_URL,
  timeout: 30000,
  REQUEST_TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Error codes
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  RATE_LIMIT: 'RATE_LIMIT',
  GENERIC: 'GENERIC',
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  HEALTH: '/api/health',
  JOBS: '/api/jobs',
  MODULES: '/api/modules',
  SUBSCRIPTIONS: '/api/subscriptions',
  USERS: '/api/users',
};

// Cache keys
export const CACHE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme_preference',
};
