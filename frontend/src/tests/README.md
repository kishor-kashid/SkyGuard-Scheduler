# Frontend Tests

This directory contains unit and integration tests for the frontend React application.

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

Run tests in UI mode:
```bash
npm run test:ui
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Test Structure

- `store/` - Tests for Zustand stores (authStore, notificationsStore, etc.)
- `services/` - Tests for API services (auth.service, etc.)
- `components/` - Tests for React components (ProtectedRoute, etc.)

## Test Coverage

Current test coverage includes:

### Unit Tests
- ✅ Auth Store (`authStore.test.ts`)
  - Login/logout functionality
  - Token management
  - Authentication state

- ✅ Notifications Store (`notificationsStore.test.ts`)
  - Fetching notifications
  - Marking as read
  - Deleting notifications

- ✅ Auth Service (`auth.service.test.ts`)
  - Login/register API calls
  - Token management
  - Error handling

### Component Tests
- ✅ Protected Route (`ProtectedRoute.test.tsx`)
  - Route protection
  - Role-based access control

## Writing New Tests

When adding new tests:

1. Create test files with `.test.ts` or `.test.tsx` extension
2. Use Vitest and React Testing Library
3. Mock API calls and external dependencies
4. Test user interactions with `@testing-library/user-event`
5. Test both success and error cases

Example:
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Testing Utilities

- `setup.ts` - Global test setup and mocks
- Mock localStorage, window.matchMedia, etc.

