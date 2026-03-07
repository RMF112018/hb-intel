# Code Alignment Markers Reference

## What Are Alignment Markers?

Alignment markers are structured comments in source code that document:
1. **Audit Trail**: Which architectural decisions the code implements
2. **Drift Prevention**: Guards against unintended deviations from locked decisions
3. **Traceability**: Links between code, decisions (D-PH5C-XX), and tasks (PH5C.X)

Example:
```typescript
// ALIGNMENT: ShellCore.tsx v1.0 - PH5C.4, PH5C.2 - Shell integration with dev toolbar
```

---

## Alignment Marker Format

### Standard Format

```
// ALIGNMENT: [file/component] [version] - [PH5C tasks] - [description]
```

### Components

| Component | Example | Purpose |
|-----------|---------|---------|
| Prefix | `// ALIGNMENT:` | Consistent marker identifier |
| File/Component | `ShellCore.tsx v1.0` | Where marker is located, version |
| Tasks | `PH5C.4, PH5C.2` | Which Phase 5C tasks added/modify this |
| Decisions | `D-PH5C-02, D-PH5C-06` | Which locked decisions this implements |
| Description | `Dev toolbar integration` | Brief explanation (under 80 chars) |

### Specific Marker Types

**1. File Header Marker**
```typescript
// ALIGNMENT: authStore.ts v1.0 - PH5C.2, PH5C.3 - Session storage & normalization
```

**2. Feature Integration Marker**
```typescript
// ALIGNMENT: DevToolbar Integration PH5C.4
// D-PH5C-02: Build-mode flag ensures dev code absent from production
```

**3. Decision Implementation Marker**
```typescript
// ALIGNMENT: Session normalization per D-PH5C-03
// Normalize identity into ISessionData shape: sessionId, userId, roles, permissions
```

**4. Critical Logic Marker**
```typescript
// ALIGNMENT: Permission matching per D-PH5C-04
// Guards evaluate session permissions from persona/roles
```

---

## Critical Files Requiring Markers

| File | Decisions | Tasks | Min. Markers |
|------|-----------|-------|--------------|
| `ShellCore.tsx` | D-PH5C-02, D-PH5C-06 | PH5C.4 | 2 (file header + integration) |
| `authStore.ts` | D-PH5C-03, D-PH5C-04 | PH5C.2, PH5C.3 | 2 (file header + session structure) |
| `guardResolution.ts` | D-PH5C-04 | PH5C.3, PH5C.4 | 2 (file header + permission logic) |
| `sessionNormalization.ts` | D-PH5C-03 | PH5C.2, PH5C.3 | 2 (file header + expiration) |

---

## ESLint Rule

The custom ESLint rule `auth/alignment-markers` validates that critical files include alignment markers.

### Configuration

In `packages/auth/.eslintrc`:

```json
{
  "rules": {
    "auth/alignment-markers": [
      "warn",
      {
        "requiredFiles": [
          "src/ShellCore.tsx",
          "src/authStore.ts",
          "src/guardResolution.ts",
          "src/sessionNormalization.ts"
        ],
        "markerPattern": "ALIGNMENT:.*(?:PH5C|D-PH5C-\\d{2})"
      }
    ]
  }
}
```

### Running the Rule

```bash
# Lint auth package with alignment rules
pnpm --filter @hbc/auth run lint

# Check specific file
pnpm --filter @hbc/auth run lint packages/auth/src/authStore.ts

# Auto-fix is not available for this rule (markers require human review)
```

### Sample Output

```
packages/auth/src/authStore.ts
  1:1  warning  Critical authentication file is missing alignment markers.
              Add comment: "// ALIGNMENT: [description] [PH5C task] [decisions]"
              See docs/reference/auth/alignment-markers.md for details.
```

---

## Adding New Markers

When modifying critical files, follow this process:

### 1. Identify What Changed
- Which decision(s) does this change affect?
- Which task(s) introduced/modified this code?

### 2. Add or Update Marker

If adding new file:
```typescript
// ALIGNMENT: filename.ts v1.0 - PH5C.X - Description
```

If adding new critical function:
```typescript
// ALIGNMENT: [Feature name] per D-PH5C-XX
// Brief explanation of what this implements
```

### 3. Verify Marker Format
- Includes file/function name
- Includes version (increment if updating)
- Includes PH5C task number(s)
- Includes D-PH5C decision(s)
- Description under 80 characters

### 4. Run ESLint
```bash
pnpm lint --filter @hbc/auth
```

### 5. Code Review
- Reviewers check that markers accurately reflect decisions
- Markers should not be removed or weakened without approval
- All marker changes require documentation

---

## Maintenance Guidelines

### When to Add Markers
- ✓ Adding new critical files
- ✓ Adding major features (persona switching, session normalization)
- ✓ Implementing locked decisions

### When to Update Markers
- ✓ Code change affects architectural decision implementation
- ✓ Decision changes require new decision marker
- ✓ Version bump if significant refactor

### When NOT to Add Markers
- ✗ Small bug fixes (no architectural impact)
- ✗ Code style/formatting changes
- ✗ Tests or example code (unless critical)
- ✗ Comments or documentation (unless decision-related)

### Code Review Checklist
- [ ] Markers are present in all changed critical files
- [ ] Markers follow standard format
- [ ] Markers reference correct decisions
- [ ] Markers reference correct PH5C tasks
- [ ] ESLint rule passes (`pnpm lint`)
- [ ] No markers were removed without justification

---

## Examples: Correct vs. Incorrect

### ✓ CORRECT
```typescript
// ALIGNMENT: DevToolbar.tsx v1.0 - PH5C.4 - Collapsible dev toolbar
// D-PH5C-02: Build-mode gating, D-PH5C-06: Three-tab interface
```

**Why:** Clear, includes version, files, decisions, description

### ✗ INCORRECT
```typescript
// This file has dev toolbar stuff
```

**Why:** No marker format, no traceability, missing decision links

### ✓ CORRECT
```typescript
// ALIGNMENT: Permission matching per D-PH5C-04
// Users have permissions based on roles; guards check permission set
```

**Why:** Clear decision link, explains implementation

### ✗ INCORRECT
```typescript
// ALIGNMENT: stuff for PH5C
```

**Why:** Too vague, no specific decisions, unclear

---

## Linked References

- **Decisions**: See `docs/architecture/adr/` for full ADR details
- **Tasks**: See `docs/architecture/plans/PH5C-Auth-Shell-Plan.md` for task definitions
- **ESLint Rule**: `packages/auth/eslint-alignment-markers.cjs`

---

**End of Alignment Markers Reference**
