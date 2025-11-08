# Repository Pattern Implementation

## Overview

The status service implements the **Repository Pattern** to abstract database persistence operations from business logic. This architecture allows for easy switching between different database backends (SQLite, PostgreSQL, MySQL, etc.) without changing the service layer or route handlers.

## Architecture

```
┌─────────────────────────────────────────┐
│           Route Handlers                │
│     (Express Controllers)              │
└──────────────┬─────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│       IncidentService                    │
│    (Business Logic Layer)               │
└──────────────┬─────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      IIncidentRepository                 │
│       (Interface Contract)               │
└──────────────┬─────────────────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
┌─────────────┐  ┌─────────────────┐
│ SQLite      │  │ PostgreSQL      │
│ Repository  │  │ Repository      │
└─────────────┘  └─────────────────┘
```

## Components

### 1. IIncidentRepository Interface

Defines the contract for all persistence operations:

```typescript
export interface IIncidentRepository {
  list(): Promise<Incident[]>;
  create(input: CreateIncidentInput): Promise<Incident>;
  getById(id: number): Promise<Incident | null>;
  updateStatus(id: number, status: IncidentStatus): Promise<Incident | null>;
  clear(): Promise<{ deleted: number }>;
  getStats(): Promise<IncidentStats>;
  close(): Promise<void>;
}
```

### 2. SQLiteIncidentRepository

Default implementation using SQLite:

- **Location**: `src/services/incidents.ts`
- **Database**: SQLite (better-sqlite3)
- **Features**: WAL mode, foreign keys, indexes

### 3. PostgresIncidentRepository

Alternative implementation using PostgreSQL:

- **Location**: `src/repositories/postgres-incident-repository.ts`
- **Database**: PostgreSQL (pg)
- **Features**: Connection pooling, SSL support

### 4. IncidentService

Business logic layer that uses repository:

- Decouples business logic from persistence
- Can work with any `IIncidentRepository` implementation
- Provides both async and sync methods for backward compatibility

## Usage

### Using the Default SQLite Repository

```typescript
import { getIncidentService } from '../services/incidents.js';

const service = getIncidentService();

// Async operations (recommended)
const incidents = await service.list();
const incident = await service.create({
  title: 'API Outage',
  description: 'Main API is down',
  severity: 'critical'
});
await service.updateStatus(incident.id, 'resolved');

// Sync operations (backward compatible)
const stats = service.getStatsSync();
```

### Using PostgreSQL Repository

```typescript
import { PostgresIncidentRepository } from '../repositories/postgres-incident-repository.js';
import { createIncidentService } from '../services/incidents.js';

// Create PostgreSQL repository
const postgresRepo = new PostgresIncidentRepository();

// Create service with dependency injection
const incidentService = createIncidentService(postgresRepo);

// Use normally - same API as SQLite version
const incidents = await incidentService.list();
const stats = await incidentService.getStats();
```

### Creating Custom Repository

Implement the `IIncidentRepository` interface:

```typescript
import { IIncidentRepository } from './services/incidents.js';

export class MyCustomRepository implements IIncidentRepository {
  async list(): Promise<Incident[]> {
    // Your implementation
  }

  async create(input: CreateIncidentInput): Promise<Incident> {
    // Your implementation
  }

  // ... implement all methods
}
```

Then use it:

```typescript
const customRepo = new MyCustomRepository();
const service = createIncidentService(customRepo);
```

## Switching Databases

### Option 1: Environment Variable (Recommended)

Update `getIncidentService()` in `src/services/incidents.ts`:

```typescript
export function getIncidentService(): IncidentService {
  if (!incidentServiceInstance || !repositoryInstance) {
    // Choose repository based on DATABASE_URL
    if (process.env.DATABASE_URL) {
      repositoryInstance = new PostgresIncidentRepository();
    } else {
      repositoryInstance = new SQLiteIncidentRepository();
    }
    incidentServiceInstance = new IncidentService(repositoryInstance);
  }
  return incidentServiceInstance;
}
```

### Option 2: Dependency Injection (Better)

For testing or multiple repositories:

```typescript
// Create service with specific repository
const repo = new SQLiteIncidentRepository();
const service = createIncidentService(repo);

// Use in tests
const mockRepo = new MockRepository();
const testService = createIncidentService(mockRepo);
```

## Benefits

### 1. **Database Agnostic**

Switch databases without changing business logic:

```typescript
// Works with SQLite, PostgreSQL, MySQL, etc.
const service = getIncidentService();
const incidents = await service.list();
```

### 2. **Testability**

Easy to mock in tests:

```typescript
class MockRepository implements IIncidentRepository {
  async list(): Promise<Incident[]> {
    return [
      { id: 1, title: 'Test', ... }
    ];
  }
  // ... other methods
}

const mockService = createIncidentService(new MockRepository());
const incidents = await mockService.list();
```

### 3. **Maintainability**

Clean separation of concerns:
- **Routes**: Handle HTTP
- **Service**: Business logic
- **Repository**: Data persistence

### 4. **Extensibility**

Add new repositories without breaking existing code:

```typescript
// MySQL repository
class MySqlRepository implements IIncidentRepository { ... }

// Elasticsearch repository
class ElasticRepository implements IIncidentRepository { }

// Redis repository (caching layer)
class RedisRepository implements IIncidentRepository { ... }
```

## Best Practices

### 1. **Always Use Interface**

Never depend on concrete implementations:

```typescript
// ❌ Bad - tightly coupled
const service = new SQLiteIncidentRepository();

// ✅ Good - loosely coupled
const service = createIncidentService(new SQLiteIncidentRepository());
```

### 2. **Use Dependency Injection**

For testability and flexibility:

```typescript
// ✅ Good - easy to test
function createIncidentService(repo: IIncidentRepository) {
  return new IncidentService(repo);
}

// ❌ Bad - hard to test
class IncidentService {
  constructor() {
    this.repo = new SQLiteIncidentRepository(); // Fixed implementation
  }
}
```

### 3. **Handle Errors Appropriately**

Repositories should handle database-specific errors:

```typescript
async list(): Promise<Incident[]> {
  try {
    const result = await this.pool.query('SELECT ...');
    return result.rows;
  } catch (error) {
    // Log error
    logger.error({ err }, 'Failed to fetch incidents');

    // Re-throw or return empty array
    throw new DatabaseError('Failed to fetch incidents', error);
  }
}
```

### 4. **Close Connections**

Always close repository connections:

```typescript
// In tests
afterEach(async () => {
  await closeIncidentService();
});

// In production
process.on('SIGINT', async () => {
  await closeIncidentService();
  process.exit(0);
});
```

## Migration Examples

### From SQLite to PostgreSQL

1. **Install PostgreSQL driver**:
   ```bash
   npm install pg
   ```

2. **Update DATABASE_URL**:
   ```bash
   export DATABASE_URL="postgresql://user:password@localhost:5432/status_db"
   ```

3. **Switch repository** (see switching section above)

4. **No code changes needed** - service layer unchanged!

### Adding Caching Layer

```typescript
class CachedRepository implements IIncidentRepository {
  constructor(
    private primaryRepo: IIncidentRepository,
    private cache: Redis
  ) {}

  async list(): Promise<Incident[]> {
    const cached = await this.cache.get('incidents:list');
    if (cached) return JSON.parse(cached);

    const incidents = await this.primaryRepo.list();
    await this.cache.set('incidents:list', JSON.stringify(incidents), 'EX', 60);
    return incidents;
  }

  // ... delegate other methods
}
```

## Testing

Test with mock repository:

```typescript
import { describe, it, expect } from 'vitest';
import { createIncidentService } from '../services/incidents.js';

describe('IncidentService', () => {
  it('should create incident', async () => {
    const mockRepo = {
      async create(input: CreateIncidentInput): Promise<Incident> {
        return { id: 1, ...input };
      },
      // ... implement all interface methods
    };

    const service = createIncidentService(mockRepo as any);
    const incident = await service.create({
      title: 'Test',
      description: 'Test description',
      severity: 'high'
    });

    expect(incident.id).toBe(1);
    expect(incident.title).toBe('Test');
  });
});
```

## Limitations

### Current Implementation

1. **SQLite-specific schema**: Database schema is defined in SQLite repository
   - **Solution**: Extract schema DDL to separate files or use ORM

2. **Sync/Async mix**: Currently has both sync and async methods
   - **Solution**: Future version may be async-only

3. **No migrations**: SQLite and Postgres have different migration strategies
   - **Solution**: Use tools like Prisma, TypeORM, or Knex for migrations

### Future Improvements

- [ ] Extract schema to migration files
- [ ] Add ORM integration (Prisma/TypeORM)
- [ ] Implement connection pooling for SQLite
- [ ] Add retry logic for transient failures
- [ ] Implement caching layer
- [ ] Add event sourcing support

## References

- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection)
- [Clean Architecture](https://8thlight.com/blog/uncle-bob/2012/08/13/the-clean-architecture.html)
