// Configuration loader
const config = {
  apiBaseUrl: process.env.VITE_BACKEND_URL || 'http://localhost:3000',
  wsUrl: (process.env.VITE_BACKEND_URL || 'http://localhost:3000').replace(/^http/, 'ws'),
  timeout: 30000,
  app: {
    name: 'ATLAS AI Incubator',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
  features: {
    enableDevTools: process.env.NODE_ENV === 'development',
    enableAnalytics: process.env.VITE_ENABLE_ANALYTICS !== 'false',
  },
};

export default config;
