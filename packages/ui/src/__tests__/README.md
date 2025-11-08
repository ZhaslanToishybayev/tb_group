# UI Component Tests

This directory contains comprehensive unit tests for all UI components in the `@tb/ui` package.

## Test Structure

```
src/__tests__/
├── README.md                 # This file
├── setup.ts                  # Test environment setup
├── button.test.tsx           # Button component tests
├── components.test.tsx       # Generic component tests
├── input.test.tsx            # Input component tests
├── card.test.tsx             # Card component tests
├── badge.test.tsx            # Badge component tests
├── dialog.test.tsx           # Dialog component tests
├── switch.test.tsx           # Switch component tests
├── textarea.test.tsx         # Textarea component tests
└── table.test.tsx            # Table component tests
```

## Test Coverage

### Components Tested ✅

| Component | Test File | Coverage |
|-----------|-----------|----------|
| **Button** | `button.test.tsx` | ✅ Complete |
| **Input** | `input.test.tsx` | ✅ Complete |
| **Label** | `components.test.tsx` | ✅ Partial |
| **Card** | `card.test.tsx` | ✅ Complete |
| **Badge** | `badge.test.tsx` | ✅ Complete |
| **Dialog** | `dialog.test.tsx` | ✅ Complete |
| **Switch** | `switch.test.tsx` | ✅ Complete |
| **Textarea** | `textarea.test.tsx` | ✅ Complete |
| **Table** | `table.test.tsx` | ✅ Complete |

### Coverage Goals

- **Lines**: 85%+
- **Functions**: 85%+
- **Branches**: 85%+
- **Statements**: 85%+

## Running Tests

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## Test Utilities

### Testing Library

We use `@testing-library/react` for component testing:
- `render()` - Render component
- `screen` - Query elements
- `fireEvent` - Simulate events

### Vitest

We use Vitest as the test runner:
- `describe()` - Group tests
- `it()` - Individual test
- `expect()` - Assertions
- `vi` - Test utilities (mocks, spies)

## Test Best Practices

1. **Test Behavior, Not Implementation**
   - Test what the component does, not how it works
   - Use semantic queries (getByRole, getByText)

2. **Test States and Variants**
   - Test all variants (primary, secondary, outline, etc.)
   - Test all sizes (sm, default, lg)
   - Test disabled and loading states

3. **Test Interactions**
   - Test click handlers
   - Test form interactions
   - Test keyboard navigation

4. **Test Accessibility**
   - Use role-based queries
   - Test keyboard interactions
   - Verify ARIA attributes

## Example Test

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../button';

describe('Button', () => {
  it('renders with default variant', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Adding New Tests

1. Create `ComponentName.test.tsx` file
2. Import necessary testing utilities
3. Write tests following the patterns above
4. Run tests: `pnpm test`
5. Check coverage: `pnpm test:coverage`

## Continuous Integration

Tests are run automatically on:
- Every push to any branch
- Every pull request
- Nightly build

Test results are reported in:
- GitHub Actions
- Coverage reports
- Build logs

## Troubleshooting

### Tests Failing

```bash
# Run specific test file
pnpm test button.test.tsx

# Run tests with verbose output
pnpm test --reporter=verbose
```

### Coverage Issues

```bash
# View detailed coverage report
pnpm test:coverage

# Open HTML coverage report
open coverage/index.html
```

## Resources

- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Docs](https://vitest.dev/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Total Test Files**: 10  
**Components Covered**: 9  
**Target Coverage**: 85%+  
**Status**: ✅ Complete
