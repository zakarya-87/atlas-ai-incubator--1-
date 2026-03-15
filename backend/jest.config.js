require('dotenv').config({ path: './.env' });

module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.(spec|test)\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!**/*.dto.ts',
    '!**/*.entity.ts',
    '!**/main.ts',
    '!**/prisma-mock.factory.ts',
    '!**/ai-defensive-parser.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  forceExit: true, // Required for NestJS integration tests that leave open handles (HTTP servers, WebSocket gateways)
  coverageThreshold: {
    global: {
      statements: 85,
      branches: 85,
      functions: 85,
      lines: 85,
    },
    '**/*.service.ts': {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
    '**/health.controller.ts': {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    '**/integrations.service.ts': {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    '**/ventures.service.ts': {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    '**/auth.service.ts': {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
};
