#!/bin/bash

# 🔗 Spec Kit → Task Master Automation Bridge
# Version: 1.0
# Purpose: Seamlessly sync Spec Kit tasks to Task Master AI
# Usage: ./scripts/spec-to-taskmaster.sh [--append] [--force] [feature_name]
#
# This script:
# 1. Detects the active feature (SPECIFY_FEATURE env var or git branch)
# 2. Finds and parses the tasks.md file
# 3. Converts to Task Master PRD format
# 4. Invokes task-master parse-prd with proper options
# 5. Provides clear feedback and error handling

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Flags
APPEND_MODE=false
FORCE_MODE=false
VERBOSE=false
HELP_REQUESTED=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --append|-a)
      APPEND_MODE=true
      shift
      ;;
    --force|-f)
      FORCE_MODE=true
      shift
      ;;
    --verbose|-v)
      VERBOSE=true
      shift
      ;;
    --help|-h)
      HELP_REQUESTED=true
      shift
      ;;
    *)
      if [ -z "${FEATURE_NAME:-}" ]; then
        FEATURE_NAME="$1"
      else
        echo -e "${RED}Error: Unexpected argument: $1${NC}"
        exit 1
      fi
      shift
      ;;
  esac
done

# Show help
if [ "$HELP_REQUESTED" = true ]; then
  echo -e "${CYAN}Spec Kit → Task Master Automation Bridge${NC}"
  echo ""
  echo "Usage: $0 [OPTIONS] [FEATURE_NAME]"
  echo ""
  echo "Options:"
  echo "  --append, -a    Append tasks to existing Task Master (don't overwrite)"
  echo "  --force, -f     Force sync (ignore errors and overwrite existing)"
  echo "  --verbose, -v   Show detailed output"
  echo "  --help, -h      Show this help message"
  echo ""
  echo "Arguments:"
  echo "  FEATURE_NAME    Optional: Specific feature to sync (e.g., 001-demo)"
  echo "                  If not provided, will detect from SPECIFY_FEATURE or git branch"
  echo ""
  echo "Environment Variables:"
  echo "  SPECIFY_FEATURE Override automatic feature detection"
  echo "  SPECIFY_FEATURE_DIR Directory containing specs (default: ./specs)"
  echo "  PYTHON_BIN       Python interpreter (default: python3)"
  echo ""
  echo "Examples:"
  echo "  $0                           # Auto-detect feature and sync"
  echo "  $0 --append 002-demo         # Append tasks from 002-demo"
  echo "  $0 --force 003-corporate-site # Force sync (overwrite existing)"
  echo ""
  exit 0
fi

# Helper functions
log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[⚠]${NC} $1"
}

log_error() {
  echo -e "${RED}[✗]${NC} $1"
}

log_verbose() {
  if [ "$VERBOSE" = true ]; then
    echo -e "${CYAN}[VERBOSE]${NC} $1"
  fi
}

# Check prerequisites
check_prerequisites() {
  log_info "Checking prerequisites..."

  # Check for task-master CLI or npx
  if ! command -v task-master &> /dev/null && ! command -v npx &> /dev/null; then
    log_error "Task Master CLI not found. Please install task-master-ai globally or ensure npx is available."
    log_info "Install: npm install -g task-master-ai"
    exit 1
  fi

  # Check for Python
  if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    log_error "Python not found. Please install Python 3.6+"
    exit 1
  fi

  # Set Python binary
  PYTHON_BIN="${PYTHON_BIN:-python3}"
  if ! command -v "$PYTHON_BIN" &> /dev/null; then
    PYTHON_BIN="python"
  fi

  log_success "Prerequisites check passed"
}

# Detect active feature
detect_feature() {
  log_info "Detecting active feature..."

  # Priority 1: Explicit feature name argument
  if [ ! -z "${FEATURE_NAME:-}" ]; then
    log_verbose "Using explicitly provided feature: $FEATURE_NAME"
    return 0
  fi

  # Priority 2: Environment variable
  if [ ! -z "${SPECIFY_FEATURE:-}" ]; then
    FEATURE_NAME="$SPECIFY_FEATURE"
    log_verbose "Using SPECIFY_FEATURE env var: $FEATURE_NAME"
    return 0
  fi

  # Priority 3: Git branch
  if command -v git &> /dev/null && git rev-parse --git-dir > /dev/null 2>&1; then
    BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")

    if [ ! -z "$BRANCH" ] && [[ "$BRANCH" =~ ^[0-9]+- ]]; then
      FEATURE_NAME="$BRANCH"
      log_verbose "Using git branch: $FEATURE_NAME"
      return 0
    fi

    log_verbose "Current branch: ${BRANCH:-'detached'}"
  else
    log_verbose "Not a git repository or git not available"
  fi

  # Priority 4: Interactive selection
  log_warning "Could not auto-detect feature. Please specify explicitly."
  echo ""
  echo "Available features in ${SPECIFY_FEATURE_DIR:-./specs}:"
  FEATURE_DIR="${SPECIFY_FEATURE_DIR:-./specs}"

  if [ -d "$FEATURE_DIR" ]; then
    FEATURES=()
    for feature in "$FEATURE_DIR"/*; do
      if [ -d "$feature" ] && [ -f "$feature/tasks.md" ]; then
        feature_name=$(basename "$feature")
        FEATURES+=("$feature_name")
        echo "  - $feature_name"
      fi
    done

    if [ ${#FEATURES[@]} -eq 0 ]; then
      log_error "No features with tasks.md found in $FEATURE_DIR"
      exit 1
    fi

    echo ""
    echo -n "Enter feature name to sync: "
    read -r FEATURE_NAME

    if [ -z "$FEATURE_NAME" ]; then
      log_error "No feature selected"
      exit 1
    fi
  else
    log_error "Specs directory not found: $FEATURE_DIR"
    exit 1
  fi
}

# Validate feature
validate_feature() {
  local feature_dir="${SPECIFY_FEATURE_DIR:-./specs}/${FEATURE_NAME}"

  log_info "Validating feature: $FEATURE_NAME"

  if [ ! -d "$feature_dir" ]; then
    log_error "Feature directory not found: $feature_dir"
    log_info "Available features:"
    ls -1 "${SPECIFY_FEATURE_DIR:-./specs}" 2>/dev/null | grep -v "spec\|taskmaster" || true
    exit 1
  fi

  if [ ! -f "$feature_dir/tasks.md" ]; then
    log_error "tasks.md not found in feature directory: $feature_dir"
    log_info "Expected location: $feature_dir/tasks.md"
    exit 1
  fi

  log_success "Feature validation passed"
}

# Convert tasks.md to Task Master PRD format
convert_tasks_to_prd() {
  local tasks_file="${SPECIFY_FEATURE_DIR:-./specs}/${FEATURE_NAME}/tasks.md"
  local prd_file="${SPECIFY_FEATURE_DIR:-./specs}/${FEATURE_NAME}/prd-for-taskmaster.txt"

  log_info "Converting tasks.md to Task Master PRD format..."

  # Create Python script for conversion
  cat > /tmp/convert_tasks.py << 'PYTHON_EOF'
#!/usr/bin/env python3

import sys
import re
from pathlib import Path

def convert_tasks_md_to_prd(input_file, output_file):
    """Convert Spec Kit tasks.md to Task Master PRD format."""

    with open(input_file, 'r') as f:
        content = f.read()

    lines = content.split('\n')
    prd_lines = []
    prd_lines.append(f"# {Path(input_file).parent.name} - Task List for Task Master")
    prd_lines.append("")
    prd_lines.append("Generated from Spec Kit tasks.md")
    prd_lines.append("")
    prd_lines.append("## Task List")
    prd_lines.append("")

    current_phase = ""
    task_count = 0

    for line in lines:
        line = line.strip()

        # Detect phase headers
        if line.startswith('## '):
            current_phase = line[3:].strip()
            prd_lines.append(f"### {current_phase}")
            prd_lines.append("")
            continue

        # Skip empty lines and non-task lines
        if not line or not ('[ ]' in line or '[x]' in line):
            continue

        # Extract task ID and description
        # Format: - [ ] T001 Task description
        #         - [x] T002 Completed task
        match = re.match(r'- \[(x|X| )\]\s+(T\d+(-\d+)?)\s+(.+)', line)

        if match:
            task_id = match.group(2)
            task_desc = match.group(4).strip()

            # Check if task is completed
            is_completed = match.group(1).lower() == 'x'

            # Format for Task Master
            prd_lines.append(f"**{task_id}**: {task_desc}")

            if is_completed:
                prd_lines.append(f"   Status: DONE")

            prd_lines.append("")
            task_count += 1

    prd_lines.append("")
    prd_lines.append(f"---\\n")
    prd_lines.append(f"Total tasks: {task_count}")
    prd_lines.append(f"Generated from: {input_file}")
    prd_lines.append(f"Feature: {Path(input_file).parent.name}")

    with open(output_file, 'w') as f:
        f.write('\n'.join(prd_lines))

    return task_count

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: convert_tasks.py <input_tasks.md> <output_prd.txt>", file=sys.stderr)
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    try:
        count = convert_tasks_md_to_prd(input_file, output_file)
        print(f"Successfully converted {count} tasks", file=sys.stderr)
        sys.exit(0)
    except Exception as e:
        print(f"Error converting tasks: {e}", file=sys.stderr)
        sys.exit(1)

PYTHON_EOF

  # Run conversion
  local task_count
  task_count=$("$PYTHON_BIN" /tmp/convert_tasks.py "$tasks_file" "$prd_file" 2>&1 | grep "Successfully converted" | grep -oE '[0-9]+' | head -1 || echo "0")

  if [ "$task_count" = "0" ]; then
    log_error "Failed to convert tasks or no tasks found"
    cat "$prd_file" 2>/dev/null || true
    exit 1
  fi

  log_success "Converted $task_count tasks to PRD format"
  log_verbose "PRD file: $prd_file"

  # Clean up
  rm -f /tmp/convert_tasks.py

  # Store PRD file path for next step
  CONVERTED_PRD="$prd_file"
}

# Sync to Task Master
sync_to_taskmaster() {
  local prd_file="$CONVERTED_PRD"
  local taskmaster_cmd="npx -y task-master-ai"

  log_info "Syncing to Task Master..."

  # Build command
  local cmd_array=()
  if [ -n "$TASKMASTER_BIN" ]; then
    cmd_array+=("$TASKMASTER_BIN")
  else
    cmd_array+=("npx" "-y" "task-master-ai")
  fi

  cmd_array+=("parse-prd" "$prd_file")

  if [ "$APPEND_MODE" = true ]; then
    cmd_array+=("--append")
    log_verbose "Append mode enabled"
  fi

  if [ "$FORCE_MODE" = true ]; then
    cmd_array+=("--force")
    log_verbose "Force mode enabled"
  fi

  log_verbose "Command: ${cmd_array[*]}"

  # Execute command
  local output
  local exit_code

  output=$("${cmd_array[@]}" 2>&1) || exit_code=$? || exit_code=$?

  if [ $exit_code -eq 0 ]; then
    log_success "Successfully synced to Task Master"
    if [ "$VERBOSE" = true ]; then
      echo "$output"
    else
      log_verbose "$output"
    fi
  else
    log_error "Failed to sync to Task Master"
    echo "$output"
    exit 1
  fi

  # Generate task files
  log_info "Generating Task Master task files..."

  local gen_output
  gen_output=$("${cmd_array[@]/parse-prd/generate}" 2>&1) || exit_code=$?

  if [ $exit_code -eq 0 ]; then
    log_success "Task files generated"
  else
    log_warning "Task file generation had issues (non-critical)"
  fi
}

# Show summary
show_summary() {
  echo ""
  echo "=========================================="
  echo -e "${GREEN}✓ Sync Complete!${NC}"
  echo "=========================================="
  echo ""
  echo "Feature: $FEATURE_NAME"
  echo "Tasks File: ${SPECIFY_FEATURE_DIR:-./specs}/${FEATURE_NAME}/tasks.md"
  echo "Converted PRD: $CONVERTED_PRD"
  echo ""

  # Show next steps
  echo -e "${CYAN}Next Steps:${NC}"
  echo "  • View all tasks: task-master list"
  echo "  • Get next task: task-master next"
  echo "  • Show task details: task-master show <id>"
  echo "  • Update task: task-master set-status --id=<id> --status=in-progress"
  echo ""

  # Show Task Master commands
  echo -e "${CYAN}Useful Commands:${NC}"
  echo "  task-master list --with-subtasks    # Show all tasks with subtasks"
  echo "  task-master analyze-complexity      # Analyze task complexity"
  echo "  task-master expand --id=<id>        # Expand task into subtasks"
  echo "  task-master generate                # Regenerate task markdown files"
  echo ""

  if [ "$FORCE_MODE" = true ]; then
    echo -e "${YELLOW}Note: Force mode was used (existing tasks may have been overwritten)${NC}"
  elif [ "$APPEND_MODE" = true ]; then
    echo -e "${YELLOW}Note: Append mode was used (tasks added to existing list)${NC}"
  else
    echo -e "${YELLOW}Note: Default mode (existing tasks preserved unless conflicts)${NC}"
  fi
}

# Main execution
main() {
  echo -e "${CYAN}"
  echo "╔════════════════════════════════════════════════╗"
  echo "║  Spec Kit → Task Master Automation Bridge     ║"
  echo "╚════════════════════════════════════════════════╝"
  echo -e "${NC}"
  echo ""

  check_prerequisites
  detect_feature
  validate_feature
  convert_tasks_to_prd
  sync_to_taskmaster
  show_summary

  exit 0
}

# Run main
main
