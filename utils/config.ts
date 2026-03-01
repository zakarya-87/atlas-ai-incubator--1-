// Configuration loader
// Note: In Vite, environment variables must be accessed via literal import.meta.env.VAR_NAME
// to ensure they are correctly replaced at build time.
const config = {
  apiBaseUrl: import.meta.env.VITE_BACKEND_URL || '/api',
  wsUrl: (import.meta.env.VITE_BACKEND_URL || '/api').replace(/^http/, 'ws'),
  timeout: 30000,
  app: {
    name: 'ATLAS AI Incubator',
    version: '1.0.0',
    environment: import.meta.env.MODE || 'development',
  },
  features: {
    enableDevTools: import.meta.env.MODE === 'development',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false',
  },
};


// Double-check base URL logic - ensure it doesn't end with a slash if being used with paths starting with slash
if (config.apiBaseUrl === '/') {
  console.warn('[Config] apiBaseUrl is set to root. Defaulting to /api');
  config.apiBaseUrl = '/api';
}

console.log('[Config] Initialized with apiBaseUrl:', config.apiBaseUrl);


export default config;
