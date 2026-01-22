# ATLAS AI Incubator - Test Best Practices

## Overview
This document outlines the testing best practices for the ATLAS AI Incubator project, designed to ensure high-quality, maintainable, and reliable code through effective testing strategies.

## Testing Philosophy

### 1. Testing Pyramid Implementation
Follow the testing pyramid approach with the following distribution:
- **Unit Tests (60%)**: Fast, isolated tests for individual functions, components, and services
- **Integration Tests (30%)**: Tests for interactions between components and external systems
- **E2E Tests (10%)**: Critical user journey tests simulating real user interactions

### 2. Test Quality Standards
- Tests should be fast, reliable, and deterministic
- Each test should focus on a single concern
- Tests should be readable and maintainable
- Tests should provide meaningful feedback on failures

## Frontend Testing Best Practices

### Component Testing (React + Vitest + React Testing Library)
```typescript
// ✅ DO: Follow this pattern
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly with default props', () => {
    render(<MyComponent />);
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });

  it('handles user interactions properly', async () => {
    const mockCallback = vi.fn();
    render(<MyComponent onClick={mockCallback} />);
    
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(mockCallback).toHaveBeenCalledTimes(1));
  });
});
```

### Accessibility Testing
- All components must pass automated accessibility checks using axe-core
- Test keyboard navigation and screen reader compatibility
- Ensure proper ARIA attributes and semantic HTML usage

### Custom Hook Testing
- Test all possible states and transitions
- Verify side effects and cleanup functions
- Mock external dependencies appropriately

## Backend Testing Best Practices

### API Endpoint Testing (Supertest + Jest)
```typescript
// ✅ DO: Follow this pattern
import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('Authentication Endpoints', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/register (POST) - should register a new user successfully', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.email).toBe('test@example.com');
      });
  });
});
```

### Service Testing
- Mock external dependencies and databases
- Test business logic in isolation
- Verify proper error handling and validation

## Test Organization and Naming

### File Structure
```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx
├── hooks/
│   ├── useWebSocket/
│   │   ├── useWebSocket.ts
│   │   └── useWebSocket.test.tsx
├── services/
│   ├── authService.ts
│   └── authService.test.ts
└── __tests__/
    └── integration/
        ├── api.test.ts
        └── database.test.ts
```

### Test Naming Convention
- Use Given-When-Then or Describe-It pattern
- Be specific about what is being tested
- Include expected behavior in test names

```typescript
// ✅ DO: Descriptive test names
it('should render the component with default props', () => { ... });
it('should handle form submission with valid data', () => { ... });
it('should show error message when API call fails', () => { ... });

// ❌ AVOID: Vague test names
it('works', () => { ... });
it('test', () => { ... });
```

## Test Data Management

### Test Fixtures
Create reusable test data fixtures for consistent testing:

```typescript
// test/fixtures/user.fixture.ts
export const createUserDto = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
};

export const mockUser = {
  id: '123',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date(),
};
```

### Database Testing
- Use in-memory databases for faster unit tests
- Create fresh database state for each test or test suite
- Clean up test data after each test run

## Error Handling and Edge Cases

### Negative Testing
- Test error scenarios and exception handling
- Verify proper error messages are displayed
- Test boundary conditions and invalid inputs

### Robustness Testing
- Test with malformed data
- Verify graceful degradation
- Test network failure scenarios

## Performance and Reliability

### Test Performance
- Keep tests fast (< 100ms for unit tests)
- Minimize external dependencies in unit tests
- Use mocks and stubs appropriately

### Flaky Test Prevention
- Ensure tests are deterministic
- Avoid shared state between tests
- Use proper async/await patterns
- Implement proper cleanup routines

## Code Coverage and Quality Metrics

### Coverage Targets
- Aim for 80%+ statement coverage
- Aim for 80%+ branch coverage
- Focus on critical paths and business logic

### Quality Checks
- Run linting as part of test process
- Include type checking in test pipeline
- Validate accessibility in CI

## Continuous Integration Best Practices

### Test Execution Order
1. Linting and type checking
2. Unit tests
3. Integration tests
4. E2E tests (only on main branch)

### Parallel Execution
- Run test suites in parallel when possible
- Isolate tests that share resources
- Use unique identifiers for test data

## Security Testing

### Authentication & Authorization
- Test unauthorized access attempts
- Verify JWT token validation
- Test role-based access controls

### Input Validation
- Test for SQL injection vulnerabilities
- Test for XSS protection
- Validate all user inputs

## Documentation and Maintenance

### Test Documentation
- Document complex test scenarios
- Maintain README files for test environments
- Keep test strategy documentation updated

### Test Maintenance
- Regularly review and update tests
- Remove obsolete or redundant tests
- Refactor tests when code changes significantly

## Tools and Configuration

### Recommended Tools
- **Unit/Integration Tests**: Vitest for frontend, Jest for backend
- **E2E Tests**: Playwright
- **API Testing**: Supertest
- **Accessibility**: Jest-axe
- **Coverage**: @vitest/coverage-v8 or Jest coverage

### Configuration Files
Maintain proper configuration for each testing environment:
- Separate configurations for unit, integration, and E2E tests
- Environment-specific settings
- Consistent test runner configurations

## Common Anti-Patterns to Avoid

1. **Over-Mocking**: Don't mock everything; test real integrations where appropriate
2. **Brittle Tests**: Avoid testing implementation details, focus on behavior
3. **Shared State**: Don't let tests depend on each other's state
4. **Slow Tests**: Keep tests fast; optimize or remove slow tests
5. **Inconsistent Patterns**: Follow consistent patterns across the codebase
6. **Insufficient Assertions**: Verify the right things, not just that code runs
7. **Missing Edge Cases**: Always consider boundary conditions and error scenarios

## Implementation Checklist

Before considering a feature complete, ensure:
- [ ] All critical paths are covered by unit tests
- [ ] API endpoints have proper integration tests
- [ ] Key user journeys are covered by E2E tests
- [ ] Error handling is tested
- [ ] Accessibility requirements are verified
- [ ] Performance benchmarks are met
- [ ] Security considerations are tested
- [ ] Tests pass in CI environment