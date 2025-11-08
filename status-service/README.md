# Status Service

TB Group Status Service - Incident tracking and status page management.

## Overview

The Status Service provides a SQLite-backed storage system for managing incidents and status page data. It includes comprehensive incident tracking with severity levels, status transitions, full audit trail capabilities, and a complete admin API for incident management.

## Features

- **SQLite Database Storage**: Lightweight, file-based database with automatic schema creation
- **Admin API**: Complete REST API for incident management with Express.js
- **Incident Management**: Create, list, update, and clear incidents through API or service
- **Status Tracking**: Track incident lifecycle (investigating → identified → monitoring → resolved)
- **Severity Levels**: Categorize incidents by severity (low, medium, high, critical)
- **Input Validation**: Zod schema validation for all API endpoints
- **Error Handling**: Comprehensive error handling with consistent response format
- **Automatic Timestamps**: Automatic creation and update timestamps
- **Audit Trail**: Full history with created_at, updated_at, and resolved_at timestamps
- **Statistics**: Built-in reporting and statistics
- **Environment Configuration**: Database path configurable via environment variables
- **Comprehensive Testing**: Full test suite with Vitest including API endpoint tests

## Quick Start

### Installation

```bash
cd status-service
npm install
```

### Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests in CI mode (with coverage)
npm run test:ci
```

### Database Configuration

The service uses SQLite with automatic database initialization:

- **Default Database Path**: `status-service/data/incidents.sqlite`
- **Environment Override**: Set `INCIDENTS_DB_PATH` environment variable
- **Automatic Schema**: Database schema is created automatically on first use

### Seeding Sample Data

Populate the database with sample incidents for development and testing:

```bash
npm run dev:seed
```

This creates 6 sample incidents with different statuses and severities.

## API Reference

### Admin API

The Status Service provides a complete REST API for incident management through the admin interface. All endpoints are prefixed with `/admin`.

#### Base URL

```
http://localhost:3000/admin
```

#### Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": [ /* optional validation details */ ]
  }
}
```

#### Endpoints

##### `GET /admin/incidents`

List all incidents with statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "incidents": [ /* array of incidents */ ],
    "total": 3,
    "stats": { /* statistics object */ }
  }
}
```

##### `GET /admin/incidents/:id`

Get a specific incident by ID.

**Parameters:**
- `id` (number): Incident ID

**Response:** Incident object

**Errors:**
- `404 NOT_FOUND`: Incident doesn't exist
- `400 INVALID_ID`: Invalid ID format

##### `POST /admin/incidents`

Create a new incident.

**Request Body:**
```json
{
  "title": "Incident Title",        // required, max 200 chars
  "description": "Detailed description", // required, max 2000 chars
  "severity": "high",               // required: "low" | "medium" | "high" | "critical"
  "status": "investigating"         // optional: defaults to "investigating"
}
```

**Response:** Created incident object

**Errors:**
- `400 VALIDATION_ERROR`: Invalid input data
- `500 PERSISTENCE_ERROR`: Database error

##### `POST /admin/incidents/:id/status`

Update incident status.

**Parameters:**
- `id` (number): Incident ID

**Request Body:**
```json
{
  "status": "identified"  // required: "investigating" | "identified" | "monitoring" | "resolved"
}
```

**Response:** Updated incident object

**Special Behavior:**
- When status is `resolved`, automatically sets `resolved_at` timestamp
- Preserves existing `resolved_at` for other status updates

**Errors:**
- `404 NOT_FOUND`: Incident doesn't exist
- `400 VALIDATION_ERROR`: Invalid status value

##### `GET /admin/stats`

Get incident statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "byStatus": {
      "investigating": 2,
      "identified": 1,
      "monitoring": 1,
      "resolved": 1
    },
    "bySeverity": {
      "low": 1,
      "medium": 2,
      "high": 1,
      "critical": 1
    }
  }
}
```

##### `POST /admin/incidents/clear`

Clear all incidents (for testing/admin purposes).

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted": 3
  },
  "message": "Successfully deleted 3 incidents"
}
```

#### Error Codes

| Code | Description |
|------|-------------|
| `INVALID_ID` | Invalid incident ID format |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid input data with details |
| `PERSISTENCE_ERROR` | Database operation failed |
| `INTERNAL_ERROR` | Unexpected server error |
| `NOT_IMPLEMENTED` | Feature not yet implemented |

#### API Examples

**Create Critical Incident:**
```bash
curl -X POST http://localhost:3000/admin/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Database Connection Pool Exhaustion",
    "description": "Connection pool at 100% capacity",
    "severity": "critical",
    "status": "investigating"
  }'
```

**Update Incident Status:**
```bash
curl -X POST http://localhost:3000/admin/incidents/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "resolved"}'
```

**Get Statistics:**
```bash
curl http://localhost:3000/admin/stats
```

### Service API

For direct service integration (used by routes and tests).

#### Methods

See the "Service Methods" section below for detailed service API documentation.

### Incident Type

```typescript
interface Incident {
  id?: number;                    // Auto-generated ID
  title: string;                  // Incident title
  description: string;            // Detailed description
  status: IncidentStatus;         // Current status
  severity: IncidentSeverity;     // Severity level
  created_at?: string;            // Creation timestamp (ISO 8601)
  updated_at?: string;            // Last update timestamp (ISO 8601)
  resolved_at?: string | null;    // Resolution timestamp (nullable)
}
```

### Status Values

```typescript
type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';
```

### Severity Values

```typescript
type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
```

## Usage Examples

### Basic Usage

```typescript
import { getIncidentService } from '@tb/status-service';

// Get service instance
const service = getIncidentService();

// Create an incident
const incident = service.create({
  title: 'API Performance Issue',
  description: 'Response times have increased significantly',
  severity: 'high',
  status: 'investigating'
});

console.log(`Created incident #${incident.id}`);

// List all incidents
const incidents = service.list();
console.log(`Found ${incidents.length} incidents`);

// Update incident status
const updated = service.updateStatus(incident.id!, 'identified');

// Get statistics
const stats = service.getStats();
console.log(`Total incidents: ${stats.total}`);
console.log(`High severity: ${stats.bySeverity.high}`);
```

### Environment Configuration

```bash
# Set custom database path
export INCIDENTS_DB_PATH=/custom/path/incidents.sqlite

# Use with default path
export # Will use status-service/data/incidents.sqlite
```

## Database Schema

### Incidents Table

```sql
CREATE TABLE incidents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('investigating', 'identified', 'monitoring', 'resolved')),
  severity TEXT NOT NULL CHECK(severity IN ('low', 'medium', 'high', 'critical')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME NULL
);
```

### Indexes

- `idx_incidents_status` - Index on status column
- `idx_incidents_severity` - Index on severity column
- `idx_incidents_created_at` - Index on created_at column

## Methods

### `list(): Incident[]`

Returns all incidents ordered by creation date (newest first).

**Returns**: Array of incidents

**Example**:
```typescript
const incidents = service.list();
```

### `create(input: CreateIncidentInput): Incident`

Creates a new incident.

**Parameters**:
- `input.title`: Incident title (required)
- `input.description`: Detailed description (required)
- `input.severity`: Severity level (required)
- `input.status`: Current status (optional, defaults to 'investigating')

**Returns**: Created incident with generated ID

**Example**:
```typescript
const incident = service.create({
  title: 'Database Connection Issues',
  description: 'Connection pool exhausted',
  severity: 'critical'
});
```

### `getById(id: number): Incident | null`

Retrieves an incident by ID.

**Parameters**:
- `id`: Incident ID

**Returns**: Incident or null if not found

**Example**:
```typescript
const incident = service.getById(1);
if (incident) {
  console.log(incident.title);
}
```

### `updateStatus(id: number, status: IncidentStatus): Incident | null`

Updates an incident's status. Automatically sets resolved_at when status is 'resolved'.

**Parameters**:
- `id`: Incident ID
- `status`: New status

**Returns**: Updated incident or null if not found

**Example**:
```typescript
const updated = service.updateStatus(1, 'resolved');
```

### `clear(): { deleted: number }`

Deletes all incidents from the database.

**Returns**: Object with count of deleted incidents

**Example**:
```typescript
const result = service.clear();
console.log(`Deleted ${result.deleted} incidents`);
```

### `getStats(): Statistics`

Returns database statistics.

**Returns**: Object with total counts and breakdowns by status/severity

**Example**:
```typescript
const stats = service.getStats();
console.log(`Total: ${stats.total}`);
console.log(`By Status:`, stats.byStatus);
console.log(`By Severity:`, stats.bySeverity);
```

## Development

### Project Structure

```
status-service/
├── src/
│   ├── services/
│   │   └── incidents.ts      # Main incident service
│   ├── scripts/
│   │   └── seed.ts           # Development seed script
│   └── index.ts              # Main entry point
├── tests/
│   └── incidents.test.ts     # Test suite
├── data/                     # Database directory
├── dist/                     # Build output
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── eslint.config.js
└── .gitignore
```

### Testing

The test suite covers:
- Database initialization
- CRUD operations
- Status updates and transitions
- Statistics and reporting
- Edge cases and error handling

Run tests:
```bash
npm test              # Run tests in watch mode
npm run test:ci       # Run tests once with coverage
```

### Type Safety

Full TypeScript support with strict type checking:
- Type-safe incident data structures
- Compile-time error detection
- IntelliSense support in IDEs

### Code Quality

- **ESLint**: Code linting with TypeScript rules
- **TypeScript**: Strict type checking enabled
- **Testing**: Comprehensive test coverage with Vitest
- **Logging**: Structured logging with Pino

## Production Deployment

### Environment Variables

- `INCIDENTS_DB_PATH`: Custom database file path (optional)
- Other standard Node.js environment variables

### Docker Support

The service is designed to be containerized. Key considerations:

1. **Volume Mounting**: Mount database directory for persistence
2. **Database Initialization**: Schema is created automatically
3. **Health Checks**: Can implement health check endpoints

### Migration to PostgreSQL

The service follows the Repository pattern, making it easy to swap SQLite for PostgreSQL or other databases in production while maintaining the same API.

## Integration

This service is designed to integrate with:
- Admin panels for incident management
- Public status pages for incident display
- Monitoring systems for automated incident creation
- Analytics platforms for incident tracking

## License

Part of TB Group Base Stack project.

---

**Status Service v1.0.0** - Part of TB Group Base Stack
