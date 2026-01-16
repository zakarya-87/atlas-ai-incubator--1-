// Centralized frontend runtime configuration
// Validates and exposes environment variables used client-side.

export type FrontendConfig = {
  apiBaseUrl: string;
  mode: string;
};

function getEnv(key: string, fallback?: string): string {
  const v = (import.meta as any).env?.[key];
  if (v == null || v === '') {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required env: ${key}`);
  }
  return v;
}

export const config: FrontendConfig = {
  apiBaseUrl: ((import.meta as any).env?.VITE_BACKEND_URL as string) || 'http://localhost:3000',
  mode: ((import.meta as any).env?.MODE as string) || 'development',
};

export default config;
