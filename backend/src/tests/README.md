# Backend Tests

This directory contains unit and integration tests for the backend API.

## Setup

Install dependencies:
```bash
npm install
```

## Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Test Structure

- `utils/` - Tests for utility functions (weatherMinimums, etc.)
- `services/` - Tests for service layer (authService, conflictDetectionService, etc.)
- `controllers/` - Tests for controller layer (auth.controller, etc.)

## Test Coverage

Current test coverage includes:

### Unit Tests
- ✅ Weather Minimums (`weatherMinimums.test.ts`)
  - Tests for different training levels
  - Weather condition validation
  - Violation detection

- ✅ Auth Service (`authService.test.ts`)
  - Password hashing and comparison
  - JWT token generation and verification
  - Token extraction from headers

- ✅ Conflict Detection Service (`conflictDetectionService.test.ts`)
  - Weather evaluation against training levels
  - Violation detection for different scenarios

### Integration Tests
- ✅ Auth Controller (`auth.controller.test.ts`)
  - User registration
  - User login
  - Error handling

## Writing New Tests

When adding new tests:

1. Create test files with `.test.ts` extension
2. Use Jest testing framework
3. Mock external dependencies (database, APIs)
4. Follow AAA pattern (Arrange, Act, Assert)
5. Test both success and error cases

Example:
```typescript
describe('MyService', () => {
  it('should do something correctly', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = myService.doSomething(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

