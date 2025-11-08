# @tb/config

Shared configuration for TB Group Base Stack.

## Vitest Configuration

This package provides shared Vitest configuration for all applications and packages in the monorepo.

### Usage

#### In apps/api (API Tests)

```typescript
// apps/api/vitest.config.ts
import { defineConfig } from 'vitest/config';
import sharedConfig from '../../packages/config/vitest.config';

export default defineConfig(sharedConfig);
```

#### In apps/web (Web/Next.js Tests)

```typescript
// apps/web/vitest.config.ts
import { defineConfig } from 'vitest/config';
import sharedConfig from '../../packages/config/vitest.config';

export default defineConfig(sharedConfig);
```

#### In apps/admin (Admin Panel Tests)

```typescript
// apps/admin/vitest.config.ts
import { defineConfig } from 'vitest/config';
import sharedConfig from '../../packages/config/vitest.config';

export default defineConfig(sharedConfig);
```

#### In packages/ui (UI Component Tests)

```typescript
// packages/ui/vitest.config.ts
import { defineConfig } from 'vitest/config';
import sharedConfig from '../../packages/config/vitest.config';

export default defineConfig(sharedConfig);
```

### Available Configurations

- **`sharedConfig`** - Base configuration for all packages
- **`apiConfig`** - API/backend specific configuration
- **`webConfig`** - Frontend/Next.js specific configuration  
- **`uiConfig`** - UI component specific configuration
- **`adminConfig`** - Admin panel specific configuration
- **`integrationConfig`** - Integration test configuration
- **`e2eConfig`** - End-to-end test configuration

### Configuration Features

#### Coverage Thresholds
```typescript
thresholds: {
  global: {
    branches: 80,
    functions: 80,
    lines: 85,
    statements: 85,
  },
}
```

#### Test Environments
- **Node**: For API and backend tests
- **JSDOM**: For React component tests

#### Reporters
- **Default**: Console output
- **JUnit**: XML output for CI/CD
- **HTML**: Coverage reports

### Adding New Configurations

To add a new package-specific configuration:

1. Export a new config from `vitest.config.ts`
2. Document it in this README
3. Update the relevant package's `vitest.config.ts`

### Best Practices

1. **Use shared configurations** - Don't duplicate configuration
2. **Set coverage thresholds** - Maintain quality standards
3. **Use appropriate environments** - Node for backend, JSDOM for frontend
4. **Configure test timeouts** - Different environments need different timeouts
5. **Exclude unnecessary files** - Reduce noise in coverage reports

## Scripts

### Run Tests

```bash
# API tests
pnpm --filter @tb/api test

# Web tests
pnpm --filter @tb/web test

# Admin tests
pnpm --filter @tb/admin test

# UI tests
pnpm --filter @tb/ui test

# All tests
pnpm test
```

### Run with Coverage

```bash
pnpm test:coverage
```

### Run in Watch Mode

```bash
pnpm test:watch
```

### Run Specific Test File

```bash
pnpm test -- button.test.tsx
```

## CI/CD Integration

The shared configuration is designed to work seamlessly with GitHub Actions:

```yaml
# .github/workflows/test.yml
- name: Run Tests
  run: |
    pnpm test:coverage
    pnpm test:e2e
```

Coverage reports are automatically uploaded and tracked.
