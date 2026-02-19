require('dotenv').config({ path: './.env' });

module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.(spec|test)\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  forceExit: true, // Required for NestJS integration tests that leave open handles (HTTP servers, WebSocket gateways)
  coverageThreshold: {
    global: {
      statements: 15,
      branches: 10,
      functions: 10,
      lines: 15,
    },
    './src/**/*.service.ts': {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
    './src/**/health.controller.ts': {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    './src/**/integrations.service.ts': {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    './src/**/ventures.service.ts': {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    './src/**/auth.service.ts': {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
};
