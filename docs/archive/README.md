# Documentation Archive

This directory contains outdated, duplicate, or superseded documentation that has been moved here to keep the main documentation clean and focused.

## Directory Structure

### /old-ai-analyses/
AI integration analysis and status reports (superseded by new analysis)
- glm-only-integration-guide.md
- glm-working-solution.md
- honest-integration-status.md
- universal-integration-guide.md
- ai-implementation-template.md

### /old-session-summaries/
Session summary reports (retained for historical reference)
- session-summary-2025-02-19.md
- session-summary-2025-10-21.md

### /old-versions/
Old version documentation and release notes
- base-stack-v0.1.0.md
- base-stack-v0.1.1.md

### /duplicated-analyses/
Duplicate or redundant analysis documents
- DOCUMENTATION_MAINTENANCE.md (duplicate of admin guide)
- spec-kit-sync-status.md (superseded by SYNC-ALL-TOOLS-REPORT.md)

### /operations-backup/
Operational documents (backup, not in active use)
- analytics.md
- deployment.md
- observability.md
- secrets.md
- security-baseline.md

## Active Documentation

The main `/docs/` directory now contains only essential, current documentation:

### Core Documentation
- ADMIN_GUIDE.md - Admin panel user guide
- DEVOPS_RUNBOOK.md - Operational procedures
- integration-overview.md - Workflow documentation
- development-workflow.md - Developer guide
- overview.md - Project overview
- README.md - Project introduction

### Technical Documentation
- ALL-TASKS-CATALOG.md - Task management catalog
- SYNC-ALL-TOOLS-REPORT.md - Tool synchronization report

### Architecture Decision Records
- adr-001-platform-overview.md
- adr-002-backend-stack.md
- adr-003-frontend-ui.md

### Spec Kit Workflow
- spec-kit-workflow.md

## Archive Management

When archiving new files:
1. Create appropriate subdirectory
2. Add note about why it was archived
3. Update this README
4. Remove from active docs

## Retrieval

To restore archived documentation:
```bash
git show <commit>:<path> > <destination>
```

Or manually copy from archive directory.
