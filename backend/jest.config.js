
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transformIgnorePatterns: ['/node_modules/(?!(@google/generative-ai|@nestjs|@prisma)/)'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  testPathIgnorePatterns: [
    '<rootDir>/../node_modules/',
    '<rootDir>/../../components/',
    '<rootDir>/../../services/',
    '<rootDir>/../../e2e/',
    '<rootDir>/../../hooks/',
    '<rootDir>/../../utils/',
    '<rootDir>/../../locales/',
    '<rootDir>/../../context/',
    '<rootDir>/../../public/',
    '<rootDir>/../../scripts/',
    '<rootDir>/../../test-mocks/',
    '<rootDir>/../../coverage/',
    '<rootDir>/../../playwright-report/',
    '<rootDir>/../../testsprite_tests/',
  ],

  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
  coverageThreshold: {
    global: {
      statements: 20, // Start low, increase gradually
      branches: 15,
      functions: 10,
      lines: 20,
    },
    // Specific thresholds for key services
    './analysis/analysis.service.ts': {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
    './analysis/analysis.controller.ts': {
      statements: 75,
      branches: 65,
      functions: 80,
      lines: 75,
    },
  },
};