# 📐 Technical Specification

**Version**: 1.0
**Last Updated**: 2025-10-31
**Status**: Production Ready

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Frontend Architecture](#frontend-architecture)
7. [Deployment Architecture](#deployment-architecture)
8. [Security Architecture](#security-architecture)
9. [Integration Points](#integration-points)
10. [Development Workflow](#development-workflow)
11. [Testing Strategy](#testing-strategy)
12. [Performance Requirements](#performance-requirements)
13. [Future Considerations](#future-considerations)

---

## System Overview

TB Group Base Stack is a modern, full-stack web application designed for corporate website management with integrated CRM, analytics, and AI-powered insights.

### Key Features

- **Corporate Website**: Next.js-based public website with dynamic content
- **Content Management System**: React-based admin panel for content management
- **API Backend**: Express.js REST API with comprehensive endpoints
- **Database**: PostgreSQL with Prisma ORM for type-safe database access
- **Caching Layer**: Redis for session management and API caching
- **CRM Integration**: Bitrix24 webhook integration for lead management
- **Analytics**: GA4, Yandex Metrica, and custom analytics tracking
- **AI Analytics**: OpenAI-powered behavioral analysis and insights
- **Email System**: SMTP-based notification system with fallback

### Business Context

**Purpose**: Corporate website and lead generation platform for TB Group
**Users**: Public visitors, content editors, administrators
**Traffic**: Expected 10K+ monthly unique visitors
**Uptime SLA**: 99.9% availability
**Compliance**: GDPR compliance for user data

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  Public Website  │   Admin Panel    │   Mobile/Other       │
│   (Next.js)      │    (React)       │    Clients           │
└─────────┬───────┴─────────┬─────────┴───────────┬───────────┘
          │                 │                       │
          └─────────────────┼───────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                     LOAD BALANCER                            │
│                       (Nginx)                                │
└────────────┬──────────────┴──────────────┬──────────────────┘
             │                             │
    ┌────────▼────────┐         ┌─────────▼────────┐
    │  API Gateway    │         │  Static Assets   │
    │   (Express)     │         │    (Nginx)       │
    └────────┬────────┘         └─────────┬────────┘
             │                            │
    ┌────────▼────────┐         ┌─────────▼────────┐
    │   Microservices │         │   CDN / Cache    │
    │   Layer         │         │   (Redis)        │
    └────────┬────────┘         └──────────────────┘
             │
    ┌────────▼──────────────────────────────────────────────┐
    │                  DATA LAYER                            │
    ├────────────────────────────────────────────────────────┤
    │  PostgreSQL  │  Redis Cache │  File Storage (Local)   │
    │  Database    │  + Sessions  │  (or S3/Cloud)          │
    └────────────────────────────────────────────────────────┘
```

### Module Architecture (API)

```
api/src/
├── app.ts                 # Express app configuration
├── server.ts              # Server entry point
├── config/
│   └── env.ts             # Environment validation (Zod)
├── modules/
│   ├── auth/              # Authentication module
│   │   ├── auth.router.ts
│   │   ├── auth.service.ts
│   │   ├── auth.types.ts
│   │   └── auth.validators.ts
│   ├── services/          # Services management
│   ├── cases/             # Case studies
│   ├── reviews/           # Client reviews
│   ├── banners/           # Banner management
│   ├── contact/           # Contact form handling
│   ├── media/             # File uploads
│   ├── cache/             # Redis cache management
│   └── analytics/         # Analytics & AI
├── integrations/
│   ├── bitrix24.ts        # CRM integration
│   ├── mailer.ts          # Email service
│   └── recaptcha.ts       # reCAPTCHA validation
├── middleware/
│   ├── auth.ts            # JWT authentication
│   ├── cache.ts           # Response caching
│   ├── analytics-ai.ts    # AI analytics tracking
│   └── validation.ts      # Request validation
└── openapi/
    ├── registry.ts        # OpenAPI registry
    └── generate.ts        # OpenAPI generator
```

### Data Flow

**User Request Flow**:
1. Client → Nginx (Load Balancer)
2. Nginx → API (Express.js)
3. API → Middleware (Auth, Cache, Analytics)
4. API → Business Logic (Modules)
5. Business Logic → Database (Prisma/PostgreSQL)
6. Response cached in Redis (if applicable)
7. Response → Client

**Content Management Flow**:
1. Admin Panel → API (Authenticated)
2. API → Business Logic
3. Business Logic → Database
4. Cache invalidation (Redis)
5. Success response → Admin Panel

---

## Technology Stack

### Backend Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Runtime** | Node.js | 18+ | JavaScript runtime |
| **Framework** | Express.js | 4.21.2 | Web framework |
| **Language** | TypeScript | 5.6.3 | Type-safe JavaScript |
| **ORM** | Prisma | 6.1.0 | Database ORM |
| **Database** | PostgreSQL | 15+ | Primary data store |
| **Cache** | Redis | 7+ | Session & data caching |
| **Validation** | Zod | 3.25.8 | Runtime type checking |
| **Authentication** | JWT + Argon2 | 9.0.2 / 0.40.1 | Auth tokens & hashing |
| **Security** | Helmet, CORS, Rate Limit | 7.0.0 / 2.8.5 / 7.2.0 | Security middleware |
| **Email** | NodeMailer | 6.9.8 | Email notifications |
| **Logging** | Pino | 10.0.0 | Structured logging |
| **File Uploads** | Multer | 1.4.5 | File handling |

### Frontend Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Framework** | React | 18.3.1 | UI library |
| **Next.js** | Next.js | 14.2.11 | React framework |
| **Language** | TypeScript | 5.6.3 | Type safety |
| **Styling** | Tailwind CSS | 3.4.13 | Utility-first CSS |
| **Animations** | Framer Motion | 11.1.7 | UI animations |
| **Forms** | React Hook Form | 7.53.0 | Form management |
| **State Management** | TanStack Query | 5.59.16 | Server state |
| **UI Components** | Radix UI | Various | Headless components |
| **Icons** | Lucide React | 0.460.0 | Icon library |
| **Testing** | Vitest + Testing Library | 1.6.0 | Testing framework |

### Admin Panel Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Framework** | React | 18.3.1 | UI library |
| **Build Tool** | Vite | 5.4.10 | Fast build tool |
| **Router** | React Router | 6.28.0 | Client-side routing |
| **UI Library** | Radix UI | Various | Component primitives |
| **Forms** | React Hook Form + Zod | 7.53.0 / 3.23.8 | Form handling |
| **HTTP Client** | Axios | 1.7.7 | API requests |
| **Date Handling** | date-fns | 4.1.0 | Date utilities |

### DevOps Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **CI/CD** | GitHub Actions | Automated testing & deployment |
| **Containerization** | Docker + Docker Compose | Application packaging |
| **Web Server** | Nginx | Reverse proxy & static files |
| **Process Manager** | PM2 | Node.js process management |
| **Testing** | Vitest + Playwright | Unit, integration, E2E tests |
| **Linting** | ESLint | Code quality |
| **Package Manager** | pnpm | Dependency management |
| **Monorepo** | pnpm Workspaces | Multi-package management |

---

## Database Schema

### Core Entities

#### Users

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String   // Argon2 hashed
  role          Role     @default(EDITOR)
  firstName     String
  lastName      String
  isActive      Boolean  @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  services      Service[]
  cases         Case[]
  reviews       Review[]

  @@map("users")
}

enum Role {
  ADMIN
  EDITOR
  VIEWER
}
```

#### Services

```prisma
model Service {
  id            String   @id @default(cuid())
  title         String
  slug          String   @unique
  shortDesc     String?
  description   String?
  icon          String?
  imageUrl      String?
  content       String?  // Rich text (HTML/Markdown)
  seoTitle      String?
  seoDesc       String?
  seoKeywords   String?
  status        ServiceStatus @default(DRAFT)
  order         Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Foreign Keys
  createdById   String
  createdBy     User     @relation(fields: [createdById], references: [id])

  // Relations
  cases         Case[]

  @@map("services")
}

enum ServiceStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

#### Cases

```prisma
model Case {
  id            String   @id @default(cuid())
  title         String
  slug          String   @unique
  clientName    String
  industry      String
  challenge     String
  solution      String
  results       String?
  metrics       Json?    // Flexible metrics storage
  testimonial   String?
  testimonialAuthor String?
  gallery       String[] // Array of image URLs
  publishedAt   DateTime?
  status        CaseStatus @default(DRAFT)
  order         Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Foreign Keys
  serviceId     String
  service       Service  @relation(fields: [serviceId], references: [id])
  createdById   String
  createdBy     User     @relation(fields: [createdById], references: [id])

  // Relations
  reviews       Review[]

  @@map("cases")
}

enum CaseStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

#### Reviews

```prisma
model Review {
  id            String   @id @default(cuid())
  clientName    String
  clientPosition String?
  company       String?
  rating        Int      // 1-5 stars
  text          String
  videoUrl      String?
  imageUrl      String?
  isApproved    Boolean  @default(false)
  isFeatured    Boolean  @default(false)
  publishedAt   DateTime?
  order         Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Foreign Keys
  caseId        String?
  case          Case?    @relation(fields: [caseId], references: [id])
  serviceId     String?
  service       Service? @relation(fields: [serviceId], references: [id])
  createdById   String
  createdBy     User     @relation(fields: [createdById], references: [id])

  @@map("reviews")
}
```

#### Contact Requests

```prisma
model ContactRequest {
  id            String   @id @default(cuid())
  name          String
  email         String
  phone         String?
  company       String?
  message       String
  source        String?  // Which form/modal
  utmSource     String?
  utmMedium     String?
  utmCampaign   String?
  ipAddress     String?
  userAgent     String?
  status        ContactStatus @default(PENDING)
  bitrix24Id    String?  // ID from Bitrix24 CRM
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("contact_requests")
}

enum ContactStatus {
  PENDING
  CONTACTED
  CONVERTED
  ARCHIVED
}
```

#### Banners

```prisma
model Banner {
  id            String   @id @default(cuid())
  title         String
  subtitle      String?
  content       String?
  imageUrl      String?
  videoUrl      String?
  buttonText    String?
  buttonUrl     String?
  startDate     DateTime?
  endDate       DateTime?
  targetAudience String?
  priority      Int      @default(0)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("banners")
}
```

#### Analytics Events

```prisma
model AnalyticsEvent {
  id            String   @id @default(cuid())
  eventName     String
  eventData     Json?
  sessionId     String?
  userId        String?
  ipAddress     String?
  userAgent     String?
  referrer      String?
  utmSource     String?
  utmMedium     String?
  utmCampaign   String?
  pageUrl       String?
  createdAt     DateTime @default(now())

  @@index([eventName, createdAt])
  @@map("analytics_events")
}
```

### Relationships Diagram

```
User (1) ──< (M) Services
User (1) ──< (M) Cases
User (1) ──< (M) Reviews

Service (1) ──< (M) Cases
Service (1) ──< (M) Reviews

Case (1) ──< (M) Reviews

ContactRequest (1) ── (0..1) Bitrix24
```

---

## API Endpoints

### Base URL
```
Production: https://api.tbgroup.kz
Staging: https://api-staging.tbgroup.kz
Local: http://localhost:3001
```

### Authentication

**Login**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "securePassword123"
}

Response 200:
{
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "user": { "id": "...", "email": "...", "role": "ADMIN" }
}
```

**Refresh Token**
```
POST /api/auth/refresh
Authorization: Bearer <refresh_token>

Response 200:
{
  "accessToken": "new_jwt_token"
}
```

**Logout**
```
POST /api/auth/logout
Authorization: Bearer <access_token>

Response 200:
{ "message": "Logged out successfully" }
```

### Public Endpoints

**Get Services**
```
GET /api/services?status=PUBLISHED&limit=10&page=1

Response 200:
{
  "data": [
    {
      "id": "...",
      "title": "...",
      "slug": "...",
      "shortDesc": "...",
      "icon": "...",
      "imageUrl": "..."
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

**Get Service by Slug**
```
GET /api/services/:slug

Response 200:
{
  "id": "...",
  "title": "...",
  "description": "...",
  "content": "...",
  "seoTitle": "...",
  "seoDesc": "...",
  "cases": [...]
}
```

**Get Cases**
```
GET /api/cases?serviceId=:id&limit=10&page=1

Response 200:
{
  "data": [...],
  "pagination": {...}
}
```

**Get Reviews**
```
GET /api/reviews?approved=true&featured=true&limit=5

Response 200:
{
  "data": [
    {
      "id": "...",
      "clientName": "...",
      "rating": 5,
      "text": "...",
      "videoUrl": "...",
      "case": {...}
    }
  ]
}
```

**Submit Contact Form**
```
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+7...",
  "company": "ACME Corp",
  "message": "I'm interested in..."
}

Response 201:
{
  "message": "Contact request submitted successfully",
  "id": "..."
}
```

### Admin Endpoints

**Services CRUD**
```
GET    /api/admin/services          # List all
POST   /api/admin/services          # Create
GET    /api/admin/services/:id      # Get one
PUT    /api/admin/services/:id      # Update
DELETE /api/admin/services/:id      # Delete
POST   /api/admin/services/:id/upload # Upload media
```

**Cases CRUD**
```
GET    /api/admin/cases
POST   /api/admin/cases
GET    /api/admin/cases/:id
PUT    /api/admin/cases/:id
DELETE /api/admin/cases/:id
```

**Users Management**
```
GET  /api/admin/users
POST /api/admin/users
PUT  /api/admin/users/:id
DELETE /api/admin/users/:id
POST /api/admin/users/:id/reset-password
```

**Analytics**
```
GET /api/admin/analytics/overview?period=30d
GET /api/admin/analytics/events
GET /api/admin/analytics/contact-requests
GET /api/admin/analytics/ai-insights
```

**Cache Management**
```
GET    /api/admin/cache/stats
DELETE /api/admin/cache/clear
DELETE /api/admin/cache/clear/:pattern
```

### Error Responses

**Validation Error (400)**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**Unauthorized (401)**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

**Forbidden (403)**
```json
{
  "error": "FORBIDDEN",
  "message": "Insufficient permissions"
}
```

**Not Found (404)**
```json
{
  "error": "NOT_FOUND",
  "message": "Resource not found"
}
```

**Server Error (500)**
```json
{
  "error": "INTERNAL_ERROR",
  "message": "An unexpected error occurred"
}
```

---

## Frontend Architecture

### Next.js App Structure

```
apps/web/src/
├── app/                          # Next.js 14 App Router
│   ├── (site)/                  # Route groups
│   │   ├── page.tsx            # Home page
│   │   ├── services/
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── cases/
│   │   │   └── page.tsx
│   │   ├── reviews/
│   │   │   └── page.tsx
│   │   └── contact/
│   │       └── page.tsx
│   ├── admin/                  # Admin routes (protected)
│   └── api/                    # API routes (optional)
├── components/
│   ├── home/                   # Home page components
│   ├── services/               # Service-related components
│   ├── cases/                  # Case study components
│   ├── reviews/                # Review components
│   ├── ui/                     # Reusable UI components
│   └── ContactForm.tsx         # Contact form
├── lib/
│   ├── api.ts                  # API client
│   ├── utils.ts                # Utilities
│   └── validations.ts          # Zod schemas
├── types/                      # TypeScript types
└── styles/                     # Global styles
```

### Admin Panel Structure

```
apps/admin/src/
├── pages/
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Services/
│   │   ├── List.tsx
│   │   ├── Create.tsx
│   │   └── Edit.tsx
│   ├── Cases/
│   ├── Reviews/
│   └── Settings/
├── components/
│   ├── Layout/
│   ├── Forms/
│   └── UI/
├── hooks/
│   ├── useAuth.ts
│   └── useApi.ts
├── context/
│   └── AuthContext.tsx
└── services/
    └── api.ts
```

---

## Deployment Architecture

### Production Environment

**Application Servers** (2x minimum)
```
- CPU: 4 cores
- Memory: 8 GB RAM
- Storage: 100 GB SSD
- OS: Ubuntu 22.04 LTS
```

**Database Server**
```
- CPU: 4 cores
- Memory: 16 GB RAM
- Storage: 200 GB SSD
- PostgreSQL 15
- Automated backups (daily)
```

**Cache Server**
```
- CPU: 2 cores
- Memory: 4 GB RAM
- Storage: 50 GB SSD
- Redis 7
- Persistence enabled
```

### Container Deployment

**Docker Compose (Production)**

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - api
      - web

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    environment:
      - NEXT_PUBLIC_API_URL=${API_URL}

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## Security Architecture

### Authentication & Authorization

**JWT Strategy**
- Access Token: 15 minutes expiration
- Refresh Token: 30 days expiration
- Stored in httpOnly cookies (secure)
- Argon2 password hashing (memory: 65536, time: 3, parallelism: 2)

**Role-Based Access Control (RBAC)**

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full system access, user management, all CRUD operations |
| **EDITOR** | Content management (services, cases, reviews), no user management |
| **VIEWER** | Read-only access, cannot modify content |

### Security Middleware

```typescript
// Helmet - Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.google.com/recaptcha"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.tbgroup.kz"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS - Cross-Origin Resource Sharing
app.use(cors({
  origin: env.ALLOWED_ORIGINS.split(','),
  credentials: true,
}));

// Rate Limiting - 120 requests per minute
app.use(rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
}));
```

### Data Protection

**Encryption**
- Passwords: Argon2 hashing (memory-hard)
- JWT: RS256 asymmetric encryption
- Database: TLS 1.3 for connections
- Files: Optional encryption at rest

**Input Validation**
- All inputs validated using Zod schemas
- SQL injection protection via Prisma (parameterized queries)
- XSS protection via input sanitization
- CSRF protection on state-changing operations

**reCAPTCHA Integration**
- reCAPTCHA v3 on contact forms
- Server-side verification
- Score threshold: 0.5

---

## Integration Points

### Bitrix24 CRM

**Integration Type**: Webhook-based
**Purpose**: Automatic lead creation from contact forms

**Configuration**:
```typescript
BITRIX24_WEBHOOK_URL="https://bitrix24.kz/rest/1/xxx/webhook/"
BITRIX24_DOMAIN="tbgroup.bitrix24.kz"
BITRIX24_ASSIGNED_ID="1"
BITRIX24_CATEGORY_ID="15"
BITRIX24_STATUS_ID="NEW"
```

**Flow**:
1. User submits contact form
2. API validates and stores request
3. Webhook sent to Bitrix24 (with retry logic)
4. Bitrix24 creates lead
5. Lead ID stored in database
6. Email notification sent to sales team

**Error Handling**:
- Failed webhooks retried 3 times with exponential backoff
- Failed requests logged for manual review
- Fallback: Store in database for batch processing

### Email Notifications

**Provider**: SMTP (primary) + fallback
**Library**: NodeMailer

**Email Types**:
1. **New Contact Request**: To sales team
2. **Lead Created**: Confirmation to user
3. **Admin Alert**: System errors, high traffic
4. **Password Reset**: To user

**Configuration**:
```typescript
SMTP_HOST="smtp.provider.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="${SMTP_USERNAME}"
SMTP_PASS="${SMTP_PASSWORD}"
SMTP_FROM="TB Group <no-reply@tbgroup.kz>"

# Fallback
SMTP_BACKUP_HOST="backup-smtp.example.com"
SMTP_BACKUP_PORT="587"
```

### Analytics Integration

**Google Analytics 4**
- Measurement ID: `GA4_MEASUREMENT_ID`
- Enhanced ecommerce tracking
- Custom events for contact forms

**Yandex Metrica**
- Counter ID: `YANDEX_METRICA_COUNTER_ID`
- Goal tracking for conversions
- Session replay (with consent)

**Custom Analytics**
- Event tracking middleware
- Stored in PostgreSQL
- AI-powered insights via OpenAI
- Admin dashboard for analytics

---

## Development Workflow

### Task Management

**Tools**:
- **Task Master AI**: Primary task tracking
- **Spec Kit**: Feature specification and planning
- **GitHub**: Code repository and issues

**Workflow**:
```
1. Create feature specification (Spec Kit)
2. Generate tasks (speckit.tasks)
3. Sync to Task Master (speckit-to-taskmaster.sh)
4. Implement tasks (Task Master driven)
5. Code review (GitHub PR)
6. Testing (CI/CD pipeline)
7. Deploy (automated)
```

### Git Workflow

**Branch Strategy**: Git Flow
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `hotfix/*`: Production fixes
- `release/*`: Release preparation

**Commit Convention**: Conventional Commits
```
feat: add new service page component
fix: resolve cache invalidation issue
docs: update API documentation
refactor: simplify authentication middleware
test: add unit tests for contact form
```

### Code Quality

**Pre-commit Hooks** (Husky):
```bash
# Run automatically on git commit
npm run lint              # ESLint
npm run typecheck         # TypeScript
npm run test:unit         # Unit tests
npm run security-audit    # npm audit
```

**CI/CD Pipeline** (GitHub Actions):
```yaml
# Workflow stages
1. Lint & Type Check
2. Unit Tests
3. Integration Tests
4. Build Applications
5. Security Scan
6. Deploy to Staging
7. E2E Tests
8. Deploy to Production
```

---

## Testing Strategy

### Test Types

**Unit Tests** (Vitest)
- Location: `*.test.ts`
- Coverage: ≥85%
- Focus: Functions, components, utilities
- Run: On every commit

**Integration Tests** (Vitest + Supertest)
- Location: `tests/*.test.ts`
- Coverage: API endpoints, database operations
- Run: On PR to develop

**E2E Tests** (Playwright)
- Location: `e2e/tests/*.spec.ts`
- Coverage: Critical user journeys
- Scenarios:
  - Contact form submission
  - Admin login and content management
  - Public website browsing
- Run: Before production deployment

**Performance Tests** (k6/Lighthouse)
- API load testing
- Frontend performance (Lighthouse CI)
- Database query performance
- Run: Weekly

### Test Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 85,
          statements: 85,
        },
      },
    },
  },
});
```

---

## Performance Requirements

### API Performance

- **Response Time**: < 200ms (95th percentile)
- **Throughput**: 1000 requests/minute
- **Concurrent Users**: 100
- **Database Queries**: < 50ms average

**Optimization Strategies**:
- Redis caching for frequent queries
- Database query optimization
- Connection pooling (PostgreSQL)
- Response compression

### Frontend Performance

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1
- **Lighthouse Score**: ≥90

**Optimization Strategies**:
- Next.js Image Optimization
- Static generation where possible
- Code splitting
- Lazy loading
- Bundle size < 500KB (gzipped)

### Database Performance

- **Connection Pool**: 10 connections (default)
- **Query Cache**: Redis
- **Slow Query Log**: > 1 second
- **Index Strategy**: Optimized indexes on foreign keys and frequently queried fields

---

## Future Considerations

### Planned Enhancements

**Short-term (Q1 2025)**:
- [ ] Mobile app (React Native)
- [ ] Multi-language support (i18n)
- [ ] Advanced search with Elasticsearch
- [ ] WebSocket real-time notifications

**Medium-term (Q2-Q3 2025)**:
- [ ] Microservices architecture
- [ ] Kubernetes deployment
- [ ] Advanced AI insights
- [ ] A/B testing framework

**Long-term (2025+)**:
- [ ] GraphQL API
- [ ] Serverless functions (Vercel/AWS Lambda)
- [ ] Multi-region deployment
- [ ] Advanced analytics ML models

### Scalability Considerations

**Database**:
- Read replicas for read-heavy workloads
- Sharding for horizontal scaling
- Connection pooling with PgBouncer

**Application**:
- Horizontal scaling with load balancer
- Stateless application design
- CDN for static assets

**Caching**:
- Multi-layer caching (CDN, Nginx, Redis)
- Cache warming for predictable traffic
- Invalidation strategy

### Technology Roadmap

**Backend**:
- Consider NestJS for better modularity
- GraphQL for flexible API
- Event-driven architecture (Kafka/RabbitMQ)

**Frontend**:
- React 19 (when stable)
- Suspense for data fetching
- Server Components optimization

**DevOps**:
- Infrastructure as Code (Terraform)
- GitOps deployment (ArgoCD)
- Observability platform (Datadog/New Relic)

---

## Appendix

### API Documentation

- **OpenAPI Spec**: `/docs/openapi.json`
- **Interactive Docs**: `/docs/api` (Swagger UI)
- **Postman Collection**: Available in `/docs/postman/`

### Environment Variables

See `.env.example` for complete list of environment variables with descriptions.

### Database Migrations

All database changes managed via Prisma migrations:
```bash
pnpm --filter @tb/api prisma migrate dev  # Development
pnpm --filter @tb/api prisma migrate deploy  # Production
```

### Monitoring Dashboards

- **Grafana**: `http://localhost:3000`
- **API Metrics**: Prometheus format
- **Logs**: Centralized logging with Loki (optional)

### Support & Contact

- **Technical Lead**: [Name]
- **DevOps**: [Name]
- **Documentation**: This file + `/docs/main/`
- **Issues**: GitHub Issues

---

**End of Technical Specification**

*This document is maintained alongside the codebase. Last updated: 2025-10-31*
