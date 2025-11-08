# @tb/ui

Shared UI component library for TB Group applications.

## Components

- **Button** - Versatile button component with variants and sizes
- **Input** - Text input with validation states
- **Label** - Form label component
- **Card** - Container component with padding
- **Badge** - Status and label badges
- **Dialog** - Modal dialog component
- **Dropdown Menu** - Context menu component
- **Switch** - Toggle switch component
- **Avatar** - User avatar component
- **Table** - Data table component
- **Textarea** - Multi-line text input
- **Skeleton** - Loading placeholder

## Testing

This package includes comprehensive unit tests using Vitest and Testing Library.

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Test Structure

```
src/__tests__/
├── setup.ts           # Test environment setup
├── button.test.tsx    # Comprehensive Button tests
└── components.test.tsx # Tests for other components
```

### Coverage Requirements

The test suite is configured to achieve:
- **Lines**: ≥85%
- **Functions**: ≥85%
- **Branches**: ≥85%
- **Statements**: ≥85%

## Development

### Build

```bash
pnpm build
```

### Linting

```bash
pnpm lint
```

## Dependencies

- React 18.3.1+
- Radix UI primitives
- Tailwind CSS
- Class Variance Authority (CVA)
- clsx for conditional classes
- tailwind-merge for class merging
