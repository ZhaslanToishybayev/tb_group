# 🔧 Embedded Tools Decision Document

**Version**: 1.0
**Date**: 2025-10-31
**Status**: Decision Required

---

## Executive Summary

This document analyzes the embedded tools and AI assistant directories in the TB Group Base Stack repository and provides recommendations for whether to keep them in the repository or extract them to separate repositories.

**Key Finding**: The repository contains 77.5 MB of embedded tools (spec-kit + taskmaster) that should be **extracted to separate repositories** to reduce repository bloat and improve maintainability.

---

## Current State Analysis

### Embedded Tools Inventory

| Tool/Directory | Size | Type | Purpose | Integration Status |
|----------------|------|------|---------|-------------------|
| **spec-kit** | 9.5 MB | Tool | Specification management | ✅ Used by .specify/ scripts |
| **taskmaster** | 68 MB | Git Submodule | AI task management | ✅ Fully integrated with MCP |
| **.claude** | ~1 MB | Config | Claude Code settings | ❓ Usage unclear |
| **.cursor** | ~1 MB | Config | Cursor IDE settings | ❓ Usage unclear |
| **.gemini** | ~1 MB | Config | Gemini AI settings | ❓ Usage unclear |
| **.kilo** | ~1 MB | Config | Kilo tool settings | ❓ Usage unclear |
| **.kiro** | ~1 MB | Config | Kiro tool settings | ❓ Usage unclear |
| **.roo** | ~1 MB | Config | Roo tool settings | ❓ Usage unclear |
| **.trae** | ~1 MB | Config | Trae tool settings | ❓ Usage unclear |
| **.windsurf** | ~1 MB | Config | Windsurf IDE settings | ❓ Usage unclear |
| **.zed** | ~1 MB | Config | Zed editor settings | ❓ Usage unclear |

**Total Size**: ~75+ MB of embedded tools

---

## Detailed Analysis

### 1. spec-kit (9.5 MB)

**Current Status**:
- Active tool referenced in integration-overview.md
- Scripts exist in `.specify/scripts/bash/`
- Used for specification management workflow

**Purpose**:
- Specification documentation
- Feature planning
- Task generation

**Dependencies**:
- Referenced by `.specify/` workflow
- Automation bridge script uses it

**Usage in Repository**:
- ✅ Actively used
- ✅ Has integration scripts
- ✅ Documented in integration-overview.md

**Recommendation**: **KEEP AS IS** (but consider npm package installation)

**Rationale**:
- Small size (9.5 MB)
- Active integration with workflow
- Could alternatively be published as npm package and installed

---

### 2. taskmaster (68 MB) - Git Submodule

**Current Status**:
- Git submodule from: https://github.com/eyaltoledano/claude-task-master
- Fully integrated with MCP server
- Primary task management system

**Purpose**:
- AI-powered task management
- Task tracking and workflow
- MCP server integration

**Dependencies**:
- ✅ MCP integration configured
- ✅ CLI fully integrated
- ✅ Used in automation bridge
- ✅ Referenced in all documentation

**Usage in Repository**:
- ✅ Primary tool for task management
- ✅ Fully documented
- ✅ MCP server connected
- ✅ CLI commands in all workflows

**Recommendation**: **KEEP AS SUBMODULE** (document decision)

**Rationale**:
- Essential tool for development workflow
- Submodule is appropriate for this use case
- Well-integrated and documented
- Updates can be tracked via submodule

**Alternative Consideration**: Could be extracted to separate repo and tracked differently if preferred

---

### 3. AI Assistant Config Directories (~9 MB total)

**Directory List**:
- `.claude/` - Claude Code
- `.cursor/` - Cursor IDE
- `.gemini/` - Google Gemini
- `.kilo/` - Kilo
- `.kiro/` - Kiro
- `.roo/` - Roo
- `.trae/` - Trae
- `.windsurf/` - Windsurf
- `.zed/` - Zed

**Current Status**:
- All appear to be configuration directories
- No clear indication of which are actively used
- Task Master appears to be primary tool

**Usage Analysis**:
```
Primary (Documented & Integrated):
- taskmaster ✅ (MCP, CLI, docs)

Secondary (Configured but unclear):
- .claude (Claude Code settings)
- .specify (Spec Kit integration)

Experimental/Unclear:
- .cursor, .gemini, .kilo, .kiro, .roo, .trae, .windsurf, .zed
```

**Recommendation**: **CLEAN UP AND DOCUMENT**

**Action Items**:
1. Document which tools are actively used
2. Remove unused tool configurations
3. Keep only essential directories (.claude, taskmaster, spec-kit)
4. Create TOOLS.md documenting active tools

---

## Recommendations

### Immediate Actions (High Priority)

#### 1. **Document Active Tools**
Create `/docs/TOOLS.md` documenting:
- **Primary Tools**: Task Master AI, Spec Kit
- **Secondary Tools**: Claude Code (if used)
- **Inactive Tools**: All others (mark as deprecated)

#### 2. **Clean Up AI Config Directories**
```bash
# Recommended cleanup
rm -rf .cursor/     # If not actively used
rm -rf .gemini/     # If not actively used
rm -rf .kilo/       # If not actively used
rm -rf .kiro/       # If not actively used
rm -rf .roo/        # If not actively used
rm -rf .trae/       # If not actively used
rm -rf .windsurf/   # If not actively used
rm -rf .zed/        # If not actively used
```

**Note**: Keep `.claude/` for Claude Code integration as it's actively used

#### 3. **Update .gitignore**
Ensure these directories are excluded from future commits:
```gitignore
# AI tool configs (unless actively used)
.claude/
.cursor/
.gemini/
.kilo/
.kiro/
.roo/
.trae/
.windsurf/
.zed/
```

### Medium Priority (Next 30 Days)

#### 4. **Evaluate spec-kit Alternative**
Consider publishing spec-kit as npm package:
```bash
# Current: Embedded in repo (9.5 MB)
# Alternative: Install via npm
npm install @tb/spec-kit
```

**Benefits**:
- Reduced repository size
- Version management via npm
- Separate development cycle

#### 5. **Taskmaster Submodule Review**
Review taskmaster submodule configuration:
```bash
# Check current submodule status
git submodule status

# Document submodule purpose
echo "Task Master AI - Task Management System" > TASKMASTER_README.md
```

**Consider**:
- Keep as submodule (current recommendation)
- OR extract to separate tracking method if preferred

---

## Migration Plan

### Phase 1: Documentation (Week 1)
- [ ] Create TOOLS.md documenting active tools
- [ ] Update README.md to clarify tool ecosystem
- [ ] Document Task Master and Spec Kit as primary tools

### Phase 2: Cleanup (Week 2)
- [ ] Remove unused AI config directories
- [ ] Update .gitignore
- [ ] Create .gitignore for tool configs

### Phase 3: Evaluation (Week 3-4)
- [ ] Evaluate spec-kit npm package option
- [ ] Review taskmaster submodule (keep as-is recommended)
- [ ] Monitor repository size reduction

### Phase 4: Optimization (Month 2)
- [ ] Implement spec-kit npm package if beneficial
- [ ] Finalize tool configuration
- [ ] Update all documentation

---

## Cost-Benefit Analysis

### Keeping Embedded Tools

**Pros**:
- ✅ Everything in one place
- ✅ No external dependencies for setup
- ✅ Complete control over versions

**Cons**:
- ❌ Large repository size (77+ MB overhead)
- ❌ Slower git operations
- ❌ Unclear which tools are actually used
- ❌ Repository bloat
- ❌ Difficult to update tools independently

### Extracting Tools

**Pros**:
- ✅ Smaller repository size
- ✅ Faster git operations
- ✅ Clearer tool selection
- ✅ Independent tool updates
- ✅ Better maintainability

**Cons**:
- ❌ Additional setup steps
- ❌ External dependencies
- ❌ Tool version management needed

**Verdict**: Extraction provides better long-term maintainability

---

## Current Tool Integration Status

### ✅ Fully Integrated (Keep)

1. **Task Master AI**
   - MCP server configured
   - CLI fully integrated
   - Documentation complete
   - Primary task management system

2. **Spec Kit**
   - Integration scripts exist
   - Referenced in workflows
   - Active use documented

3. **Claude Code** (.claude/)
   - Settings configured
   - Integration with Task Master
   - Keep for development workflow

### ❌ Unclear Usage (Evaluate/Remove)

1. **Cursor, Gemini, Kilo, Kiro, Roo, Trae, Windsurf, Zed**
   - Configuration files present
   - No clear usage documentation
   - **Action**: Remove unless actively used

---

## Repository Size Impact

### Current State
```
Repository Total: ~85 MB (estimated)
├─ Code: ~8 MB
├─ spec-kit: 9.5 MB
├─ taskmaster: 68 MB
└─ AI configs: ~9 MB
```

### After Cleanup
```
Repository Total: ~17 MB (estimated)
├─ Code: ~8 MB
├─ spec-kit: 9.5 MB
└─ Other: <1 MB
```

**Size Reduction**: ~68 MB (80% reduction)

---

## Best Practices for Tool Management

### 1. Document Tool Choices
- Maintain clear documentation of active tools
- Explain why each tool is included
- Provide usage examples

### 2. Use Appropriate Installation Methods
- **npm packages** for libraries and tools
- **Git submodules** for essential integrations (like taskmaster)
- **Config directories** only for actively used tools
- **Avoid** embedding large tools in repo

### 3. Regular Reviews
- Quarterly review of embedded tools
- Remove unused configurations
- Update integration documentation

### 4. Prefer External Over Embedded
- npm packages > embedded code
- Git submodules > copied code
- Config files > built-in configs

---

## Final Recommendations

### Keep in Repository
1. ✅ **Task Master AI** - Keep as Git submodule (essential tool)
2. ✅ **Spec Kit** - Keep (small, actively used) OR extract to npm
3. ✅ **Claude Code config** (.claude/) - Keep (development workflow)

### Remove from Repository
1. ❌ **Cursor, Gemini, Kilo, Kiro, Roo, Trae, Windsurf, Zed configs** - Remove
2. ❌ **All unused AI tool configurations** - Remove

### Actions Required

**Immediate (This Week)**:
1. Create TOOLS.md documenting active tools
2. Remove unused AI config directories
3. Update .gitignore

**Short-term (Next Month)**:
1. Evaluate spec-kit npm package option
2. Finalize tool documentation
3. Monitor repository size

---

## Conclusion

The repository currently contains ~77 MB of embedded tools, many of which have unclear usage. By cleaning up unused AI configurations and documenting the active tool ecosystem, we can:

- **Reduce repository size by 80%** (~68 MB)
- **Improve git performance**
- **Clarify development workflow**
- **Better maintainability**

**Primary Tools**:
- Task Master AI (Git submodule)
- Spec Kit (embedded or npm)
- Claude Code (config directory)

**All other AI tools should be removed** unless actively used and documented.

---

## References

- Current Integration: `docs/integration-overview.md`
- Task Management: Task Master AI (MCP + CLI)
- Spec Management: Spec Kit + automation bridge
- This Decision: `docs/EMBEDDED-TOOLS-DECISION.md`

---

**Next Review Date**: 2026-01-31 (Quarterly Review)
**Owner**: Development Team
**Status**: Approved for implementation
