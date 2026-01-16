/**
 * Application-wide constants
 * Centralized location for magic strings, configuration values, and shared constants
 */

// ==========================================
// LOCAL STORAGE KEYS
// ==========================================

export const STORAGE_KEYS = {
    AUTH_TOKEN: 'atlas_auth_token',
    REFRESH_TOKEN: 'atlas_refresh_token',
    USER_EMAIL: 'atlas_user_email',
    VENTURE_ID: 'atlas_venture_id',
    INPUT_DRAFT: 'atlas_input_draft',
    TASKS: 'atlas-ai-tasks',
    TOUR_COMPLETE: 'atlas-ai-tour-complete',
    THEME: 'atlas_theme',
    LANGUAGE: 'atlas_language',
} as const;

// ==========================================
// API CONFIGURATION
// ==========================================

export const API_CONFIG = {
    BACKEND_URL: (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:3000',
    REQUEST_TIMEOUT: 120000, // 2 minutes - Gemini Pro can take longer for complex analyses
    RETRY_ATTEMPTS: 2,
    RETRY_DELAY: 2000, // 2 seconds
} as const;

// ==========================================
// WEBSOCKET CONFIGURATION
// ==========================================

export const WS_CONFIG = {
    RECONNECT_ATTEMPTS: 5,
    RECONNECT_DELAY: 2000, // 2 seconds
    HEARTBEAT_INTERVAL: 30000, // 30 seconds
    CONNECTION_TIMEOUT: 10000, // 10 seconds
} as const;

// ==========================================
// SUBSCRIPTION PLANS
// ==========================================

export const SUBSCRIPTION_PLANS = {
    FREE: {
        name: 'Free',
        credits: 100,
        price: 0,
    },
    STARTER: {
        name: 'Starter',
        credits: 500,
        price: 29,
    },
    PRO: {
        name: 'Pro',
        credits: 2000,
        price: 99,
    },
    ENTERPRISE: {
        name: 'Enterprise',
        credits: -1, // Unlimited
        price: 299,
    },
} as const;

// ==========================================
// USER ROLES
// ==========================================

export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin',
} as const;

export const VENTURE_ROLES = {
    OWNER: 'owner',
    EDITOR: 'editor',
    VIEWER: 'viewer',
} as const;

// ==========================================
// ANALYSIS MODULES
// ==========================================

export const MODULES = {
    DASHBOARD: 'dashboard',
    FUNDAMENTALS: 'fundamentals',
    STRATEGY: 'strategy',
    MARKET_ANALYSIS: 'marketAnalysis',
    FINANCE: 'finance',
    GROWTH: 'growth',
    FUNDING: 'funding',
    INTEGRATIONS: 'integrations',
    ARCHITECTURE: 'architecture',
    AUDIT: 'audit',
    PRODUCTIVITY: 'productivity',
} as const;

// ==========================================
// ERROR CODES
// ==========================================

export const ERROR_CODES = {
    NETWORK_ERROR: 'errorNetwork',
    AUTH_REQUIRED: 'errorAuthRequired',
    RATE_LIMIT: 'errorRateLimit',
    SERVER_ERROR: 'errorApiServerError',
    GENERIC: 'errorApiGeneric',
    EMPTY_DESCRIPTION: 'errorEmptyDescription',
    TIMEOUT: 'errorTimeout',
} as const;

// ==========================================
// VALIDATION RULES
// ==========================================

export const VALIDATION = {
    MIN_PASSWORD_LENGTH: 8,
    MAX_DESCRIPTION_LENGTH: 5000,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// ==========================================
// UI CONSTANTS
// ==========================================

export const UI_CONSTANTS = {
    TOAST_DURATION: 5000, // 5 seconds
    DEBOUNCE_DELAY: 300, // 300ms
    ANIMATION_DURATION: 200, // 200ms
    MAX_HISTORY_ITEMS: 50,
} as const;

// ==========================================
// AGENT TYPES
// ==========================================

export const AGENT_TYPES = {
    LEAD_STRATEGIST: 'Lead Strategist',
    MARKET_RESEARCHER: 'Market Researcher',
    PRODUCT_OWNER: 'Product Owner',
    CFO: 'CFO',
    GROWTH_HACKER: 'Growth Hacker',
    VENTURE_CAPITALIST: 'Venture Capitalist',
    SYSTEMS_ARCHITECT: 'Systems Architect',
    CREATIVE_DIRECTOR: 'Creative Director',
} as const;

// Type exports for TypeScript
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type VentureRole = typeof VENTURE_ROLES[keyof typeof VENTURE_ROLES];
export type Module = typeof MODULES[keyof typeof MODULES];
export type AgentType = typeof AGENT_TYPES[keyof typeof AGENT_TYPES];
