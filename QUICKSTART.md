# 🚀 TB Group Base Stack - Quick Start Guide

Welcome to the TB Group Base Stack! This guide will get you up and running in under 10 minutes.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js** (v18+)
  ```bash
  node --version  # Should be >= 18.0.0
  ```

- **pnpm** (v8+)
  ```bash
  npm install -g pnpm@8
  pnpm --version  # Should be >= 8.0.0
  ```

- **Git**
  ```bash
  git --version
  ```

### Optional but Recommended

- **Docker & Docker Compose** (for database and local services)
- **VS Code** (with recommended extensions)
- **Node Version Manager (nvm)** (for managing Node.js versions)

---

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd tb-group-base-stack
```

### 2. Install Dependencies

```bash
# Install all dependencies across all workspaces
pnpm install

# This will install dependencies for:
# - apps/api (Backend API)
# - apps/web (Frontend web app)
# - apps/admin (Admin panel)
# - packages/ui (UI component library)
# - packages/config (Shared configurations)
```

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your actual values
nano .env
```

**Required Environment Variables:**

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tbgroup"

# JWT Secrets (change these!)
JWT_ACCESS_SECRET="your-secure-random-string"
JWT_REFRESH_SECRET="your-secure-random-string"

# Admin bootstrap (change these!)
ADMIN_BOOTSTRAP_EMAIL="admin@example.com"
ADMIN_BOOTSTRAP_PASSWORD="SecurePassword123!"

# reCAPTCHA (for production)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your-recaptcha-site-key"
RECAPTCHA_SECRET_KEY="your-recaptcha-secret"

# SMTP (for email notifications)
SMTP_HOST="your-smtp-host"
SMTP_PORT="587"
SMTP_USER="your-username"
SMTP_PASS="your-password"

# Bitrix24 (optional)
BITRIX24_WEBHOOK_URL="your-webhook-url"
```

### 4. Database Setup

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL and Redis
docker-compose -f docker-compose.db.yml up -d

# Wait for database to be ready
sleep 5
```

#### Option B: Local PostgreSQL

Ensure PostgreSQL is running locally, then:

```bash
# Create database
createdb tbgroup

# Or using psql
psql -U postgres -c "CREATE DATABASE tbgroup;"
```

### 5. Initialize Database

```bash
# Navigate to API package
cd apps/api

# Run Prisma migrations
pnpm prisma migrate dev

# Seed database with initial data
pnpm prisma db seed

# Generate Prisma client
pnpm prisma generate
```

### 6. Build UI Package

```bash
# From root directory
cd packages/ui
pnpm build
cd ../..
```

---

## 🏃 Running the Application

### Development Mode

Start all applications in development mode:

```bash
# Start all services (from root)
pnpm dev

# Or start individually:
pnpm -F @tbgroup/api dev    # API server (port 4000)
pnpm -F @tbgroup/web dev    # Web app (port 3000)
pnpm -F @tbgroup/admin dev  # Admin panel (port 5173)
```

### Access the Applications

- **Web Application**: http://localhost:3000
- **API Server**: http://localhost:4000
- **API Documentation**: http://localhost:4000/docs
- **Admin Panel**: http://localhost:5173
- **Health Check**: http://localhost:4000/health

### Default Credentials

```
Email: admin@example.com
Password: (from ADMIN_BOOTSTRAP_PASSWORD in .env)
```

---

## 📦 Common Commands

### Development

```bash
# Start development servers
pnpm dev

# Watch mode for specific package
pnpm -F @tbgroup/web dev

# Build all packages
pnpm build

# Build specific package
pnpm -F @tbgroup/api build
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run tests for specific package
pnpm -F @tbgroup/ui test
```

### Code Quality

```bash
# Lint all code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type check
pnpm type-check

# Format code
pnpm format
```

### Database Commands

```bash
# Generate Prisma client
pnpm -F @tbgroup/api prisma generate

# Run migrations
pnpm -F @tbgroup/api prisma migrate dev

# Reset database (development only!)
pnpm -F @tbgroup/api prisma migrate reset

# Seed database
pnpm -F @tbgroup/api prisma db seed

# View database in Prisma Studio
pnpm -F @tbgroup/api prisma studio
```

### Package Management

```bash
# Add dependency to root
pnpm add <package>

# Add dependency to specific workspace
pnpm -F @tbgroup/web add <package>

# Add dev dependency
pnpm add -D <package>

# Remove dependency
pnpm remove <package>

# Update dependencies
pnpm update
```

---

## 🛠️ Development Workflow

### Using Task Master AI

This project uses **Task Master AI** for task management:

```bash
# View all tasks
task-master list

# Get next available task
task-master next

# Show task details
task-master show <id>

# Mark task as done
task-master set-status --id=<id> --status=done

# Update task with notes
task-master update-subtask --id=<id> --prompt="implementation notes"
```

**Daily Workflow:**

```bash
# 1. Get next task
task-master next

# 2. Review task details
task-master show <id>

# 3. Implement the feature
# ... write code ...

# 4. Test your changes
pnpm test
pnpm lint

# 5. Mark as complete
task-master set-status --id=<id> --status=done
```

### Using Spec Kit

**Spec Kit** is used for feature specification:

```bash
# Create new feature specification
speckit.specify "Feature description"

# Generate tasks from spec
speckit.tasks

# Sync spec to Task Master
bash .specify/scripts/bash/spec-to-taskmaster.sh
```

---

## 🧪 Testing Your Setup

### 1. Verify All Services are Running

```bash
# Check API health
curl http://localhost:4000/health

# Expected response:
# {"status":"ok","timestamp":"...","uptime":...}
```

### 2. Test Database Connection

```bash
# API should connect to database
curl http://localhost:4000/api/health/db
```

### 3. Test Web Application

Open http://localhost:3000 in your browser:
- Homepage should load
- Navigation should work
- Services page should display content

### 4. Test Admin Panel

1. Open http://localhost:5173
2. Login with credentials from `.env`
3. Dashboard should load
4. Try creating/editing content

---

## 🚨 Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm dev
```

### Module Not Found

```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo service postgresql status

# Start PostgreSQL
sudo service postgresql start

# Or using Docker
docker-compose -f docker-compose.db.yml up -d
```

### Prisma Issues

```bash
# Generate client
pnpm -F @tbgroup/api prisma generate

# Reset database (development only!)
pnpm -F @tbgroup/api prisma migrate reset --force
pnpm -F @tbgroup/api prisma db seed
```

### Environment Variables Not Loading

1. Ensure `.env` file exists in project root
2. Check variable names match exactly
3. Restart development server after changes
4. Verify format: `KEY="value"` (no spaces around `=`)

### Build Errors

```bash
# Clean build artifacts
rm -rf apps/*/dist apps/*/.next
rm -rf packages/*/dist

# Reinstall dependencies
pnpm install

# Rebuild
pnpm build
```

---

## 📚 Additional Resources

### Documentation

- **API Documentation**: http://localhost:4000/docs
- **Technical Specification**: `/docs/main/TECHNICAL_SPECIFICATION.md`
- **Admin Guide**: `/docs/main/ADMIN_GUIDE.md`
- **DevOps Runbook**: `/docs/main/DEVOPS_RUNBOOK.md`
- **Troubleshooting Guide**: `/docs/main/TROUBLESHOOTING_GUIDE.md`

### Configuration Files

- **API Config**: `apps/api/src/config/`
- **Web Config**: `apps/web/next.config.js`
- **UI Config**: `packages/ui/vitest.config.ts`
- **Database Schema**: `apps/api/prisma/schema.prisma`

### Observability

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)

Start with observability:
```bash
docker-compose --profile observability up -d
```

---

## 🎯 Next Steps

1. **Explore the codebase**
   - Review `apps/api/src/` for API structure
   - Check `apps/web/src/app/` for Next.js pages
   - Look at `packages/ui/src/` for components

2. **Run the test suite**
   ```bash
   pnpm test
   pnpm test:coverage
   ```

3. **Get a task from Task Master**
   ```bash
   task-master next
   ```

4. **Start developing!**
   - Pick a task
   - Create a feature branch
   - Implement the feature
   - Test thoroughly
   - Submit a pull request

---

## 🆘 Getting Help

### Run Diagnostics

```bash
# Security audit
./scripts/security-audit.sh

# Full test suite
pnpm test

# Type checking
pnpm type-check
```

### Check Logs

```bash
# View all logs
tail -f logs/*.log

# API logs specifically
tail -f logs/api.log | grep ERROR
```

### Useful Links

- **Health Check**: http://localhost:4000/health
- **Cache Stats**: http://localhost:4000/api/cache/stats
- **GitHub Issues**: [Create an issue](https://github.com/your-repo/issues)

### Common Issues

For more detailed troubleshooting, see:
- [Troubleshooting Guide](./docs/main/TROUBLESHOOTING_GUIDE.md)
- [DevOps Runbook](./docs/main/DEVOPS_RUNBOOK.md)

---

## 🎉 You're Ready!

Congratulations! You now have a fully functional TB Group Base Stack running locally.

### What You Can Do Now:

✅ Run all applications in development mode
✅ Access API documentation
✅ Login to admin panel
✅ Test the features
✅ Start working on tasks

### Recommended Next Actions:

1. Explore the codebase structure
2. Run `task-master next` to get your first task
3. Read the technical specification
4. Start developing!

---

**Happy Coding!** 🚀

For questions or issues, check the troubleshooting section above or create an issue in the repository.
