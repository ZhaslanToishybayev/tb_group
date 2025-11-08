#!/bin/bash
# Archive outdated documentation
mkdir -p docs/archive/task-reports
mkdir -p docs/archive/ai-analyses
mkdir -p docs/archive/optimization-reports
mkdir -p docs/archive/status-reports

# Archive task reports
mv TASK_*.md docs/archive/task-reports/ 2>/dev/null || true

# Archive AI analyses
mv GLM_*.md docs/archive/ai-analyses/ 2>/dev/null || true
mv AI_*.md docs/archive/ai-analyses/ 2>/dev/null || true
mv Z_AI_*.md docs/archive/ai-analyses/ 2>/dev/null || true

# Archive optimization reports
mv OPTIMIZATION_*.md docs/archive/optimization-reports/ 2>/dev/null || true
mv FINAL_*.md docs/archive/optimization-reports/ 2>/dev/null || true

# Archive status reports
mv MASTER-SYNC-REPORT.md docs/archive/status-reports/ 2>/dev/null || true
mv IMPLEMENTATION_COMPLETE.md docs/archive/status-reports/ 2>/dev/null || true
mv PROJECT_COMPLETION_REPORT.md docs/archive/status-reports/ 2>/dev/null || true
mv WEBSITE_ANALYSIS.md docs/archive/status-reports/ 2>/dev/null || true
mv CURRENT_STATUS_ANALYSIS.md docs/archive/status-reports/ 2>/dev/null || true
mv FUTURE_PLANS_ROADMAP.md docs/archive/status-reports/ 2>/dev/null || true

echo "Documentation archived successfully"
ls -la docs/archive/*/
