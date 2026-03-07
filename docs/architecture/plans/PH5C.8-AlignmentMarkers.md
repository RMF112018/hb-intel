# Phase 5 Development Plan – Authentication & Shell Foundation Task 5C.8: Code Alignment Markers & ESLint Rule

**Version:** 2.0 (Alignment markers for drift prevention, custom ESLint rule)
**Purpose:** This document defines the implementation steps to add structured alignment markers to four key files and create a custom ESLint rule that guards against code drift, ensuring the authentication and shell foundation remains consistent with locked architectural decisions.
**Audience:** Implementation agent(s), code reviewers, QA engineers
**Implementation Objective:** Deliver structured alignment markers that serve as audit trails in code, plus a custom ESLint rule that automatically detects and warns about missing or violated alignment markers.

---

## 5.C.8 Code Alignment Markers & Drift Prevention

1. **Add alignment markers to `packages/shell/src/ShellCore.tsx`** (D-PH5C-08)
   - Insert marker before DevToolbar import: `<!-- ALIGNMENT: ShellCore.tsx v1.0 - PH5C.4 -->`
   - Insert marker where DevToolbar is rendered: `// ALIGNMENT: DevToolbar Integration PH5C.4`
   - Insert marker at component export: `// ALIGNMENT: ShellCore exports PH5C - Auth shell foundation`
   - Markers document linked decisions: D-PH5C-02 (build-mode gating), D-PH5C-06 (dev toolbar)

2. **Add alignment markers to `packages/auth/src/authStore.ts`** (D-PH5C-08)
   - Insert marker at top: `// ALIGNMENT: authStore v1.0 - PH5C.2, PH5C.3 - Session normalization`
   - Insert marker in session normalization: `// ALIGNMENT: Session normalization per D-PH5C-03`
   - Insert marker for guard resolution: `// ALIGNMENT: Guard resolution per D-PH5C-04`
   - Document which decisions affect this file

3. **Add alignment markers to `packages/auth/src/guardResolution.ts`** (D-PH5C-08)
   - Insert marker at top: `// ALIGNMENT: guardResolution v1.0 - PH5C.3, PH5C.4 - Permission checking`
   - Insert marker for permission matching logic: `// ALIGNMENT: Permission matching per D-PH5C-04`
   - Insert marker for role-to-permission mapping: `// ALIGNMENT: Persona-based permissions per D-PH5C-04`

4. **Add alignment markers to `packages/auth/src/sessionNormalization.ts`** (D-PH5C-08)
   - Insert marker at top: `// ALIGNMENT: sessionNormalization v1.0 - PH5C.2, PH5C.3`
   - Insert marker for session structure: `// ALIGNMENT: Session structure per D-PH5C-03`
   - Insert marker for expiration logic: `// ALIGNMENT: Expiration handling per D-PH5C-03`

5. **Create custom ESLint rule `packages/auth/eslint-alignment-markers.cjs`** (D-PH5C-08)
   - Rule name: `auth/alignment-markers`
   - Check that critical files have alignment markers
   - Flag missing or incomplete markers
   - Suggest correct marker format
   - Configurable list of files that require markers
   - Report style: warning or error (configurable)

6. **Register ESLint rule in eslintrc config** (D-PH5C-08)
   - Add rule to `packages/auth/.eslintrc` (or root ESLint config)
   - Enable rule with default configuration
   - Make it a "warn" level (not error) to not block builds
   - Configure which files require markers

7. **Document marker format and standards** (D-PH5C-08)
   - Single-line comments for markers: `// ALIGNMENT: [description] [decision(s)]`
   - Include file version
   - Include linked PH5C tasks
   - Include linked D-PH5C decisions
   - Keep descriptions under 80 characters

8. **Create `docs/reference/auth/alignment-markers.md`** (D-PH5C-08)
   - Document alignment marker standard
   - Explain what markers are for (audit trail, drift prevention)
   - Show examples of correct vs. incorrect markers
   - List critical files that require markers
   - Explain ESLint rule configuration
   - Document how to add new markers when code changes

9. **Add markers to package READMEs** (D-PH5C-08)
   - Add note in `packages/auth/README.md`: "See alignment markers in source for architectural consistency"
   - Add note in `packages/shell/README.md`: "Auth integration guided by alignment markers in ShellCore.tsx"
   - Point to `docs/reference/auth/alignment-markers.md` for details

10. **Document marker maintenance** (D-PH5C-08)
    - When to add new markers (major code changes)
    - When to update markers (decision changes)
    - How to validate markers are present (ESLint rule)
    - Inclusion in code review checklist

---

## Production-Ready Code: `packages/auth/eslint-alignment-markers.cjs`

```javascript
// packages/auth/eslint-alignment-markers.cjs
// D-PH5C-08: Custom ESLint rule for alignment marker validation
// Version: 1.0
// Last Updated: 2026-03-07
// Purpose: Ensure critical files have alignment markers for audit trail & drift prevention

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce alignment markers in critical authentication files for architectural consistency',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          requiredFiles: {
            type: 'array',
            description: 'List of files that require alignment markers',
            items: { type: 'string' },
            default: [
              'src/ShellCore.tsx',
              'src/authStore.ts',
              'src/guardResolution.ts',
              'src/sessionNormalization.ts',
            ],
          },
          markerPattern: {
            type: 'string',
            description: 'Regex pattern for valid alignment markers',
            default: 'ALIGNMENT:.*(?:PH5C|D-PH5C-\\d{2})',
          },
        },
      },
    ],
  },

  create(context) {
    const sourceCode = context.sourceCode;
    const filename = context.filename;
    const options = context.options[0] || {};

    const requiredFiles = options.requiredFiles || [
      'src/ShellCore.tsx',
      'src/authStore.ts',
      'src/guardResolution.ts',
      'src/sessionNormalization.ts',
    ];

    const markerPattern = new RegExp(
      options.markerPattern || 'ALIGNMENT:.*(?:PH5C|D-PH5C-\\d{2})'
    );

    // Check if current file is in required list
    const isRequiredFile = requiredFiles.some((file) =>
      filename.endsWith(file)
    );

    if (!isRequiredFile) {
      return {};
    }

    // Check if file has alignment markers
    const comments = sourceCode.getAllComments();
    const hasAlignmentMarker = comments.some((comment) =>
      markerPattern.test(comment.value)
    );

    return {
      Program(node) {
        if (!hasAlignmentMarker) {
          context.report({
            node,
            level: 'warn',
            message: `Critical authentication file "${filename}" is missing alignment markers. ` +
              `Add comment: "// ALIGNMENT: [description] [PH5C task] [decisions]" ` +
              `See docs/reference/auth/alignment-markers.md for details.`,
          });
        }
      },
    };
  },
};
```

---

## Production-Ready Code: Alignment Marker Examples

### ShellCore.tsx
```typescript
// packages/shell/src/ShellCore.tsx
// ALIGNMENT: ShellCore.tsx v1.0 - PH5C.4, PH5C.2 - Shell core component with dev toolbar integration

import React from 'react';
import { ShellHeader } from './header/ShellHeader';
import { ShellContent } from './content/ShellContent';

// ALIGNMENT: DevToolbar Integration PH5C.4
// Dev toolbar is integrated here for development mode persona switching
// D-PH5C-02: Build-mode flag ensures dev code absent from production bundle
let DevToolbar: React.ComponentType | null = null;
if (import.meta.env.DEV) {
  DevToolbar = React.lazy(() =>
    import('./devToolbar/DevToolbar').then((m) => ({ default: m.DevToolbar }))
  );
}

export const ShellCore: React.FC = () => {
  return (
    <div className="shell-container">
      <ShellHeader />
      <ShellContent />

      {/* ALIGNMENT: DevToolbar renders in dev mode per D-PH5C-02, D-PH5C-06 */}
      {import.meta.env.DEV && DevToolbar && (
        <React.Suspense fallback={null}>
          <DevToolbar />
        </React.Suspense>
      )}
    </div>
  );
};

// ALIGNMENT: ShellCore exports - Auth shell foundation per PH5C
export default ShellCore;
```

### authStore.ts
```typescript
// packages/auth/src/authStore.ts
// ALIGNMENT: authStore v1.0 - PH5C.2, PH5C.3 - Session storage & normalization

import { create } from 'zustand';
import type { ISessionData } from './adapters/DevAuthBypassAdapter';

interface AuthState {
  currentSession: ISessionData | null;
  setSession: (session: ISessionData | null) => void;
  clearSession: () => void;
}

// ALIGNMENT: Session normalization per D-PH5C-03
// Session data normalized to ISessionData shape: sessionId, userId, email, roles, permissions, expiresAt
export const authStore = create<AuthState>((set) => ({
  currentSession: null,

  setSession: (session: ISessionData | null) =>
    set({
      currentSession: session,
    }),

  // ALIGNMENT: Guard resolution per D-PH5C-04
  // Session permissions used for feature guard evaluation
  clearSession: () =>
    set({
      currentSession: null,
    }),
}));
```

### guardResolution.ts
```typescript
// packages/auth/src/guardResolution.ts
// ALIGNMENT: guardResolution v1.0 - PH5C.3, PH5C.4 - Permission checking & guard enforcement

import { authStore } from './authStore';

// ALIGNMENT: Permission matching per D-PH5C-04
// Match user permissions against required permissions for feature access
export function checkPermission(
  requiredPermissions: string[],
  userPermissions: Record<string, boolean>
): boolean {
  return requiredPermissions.every((perm) => userPermissions[perm] === true);
}

// ALIGNMENT: Persona-based permissions per D-PH5C-04
// Guards evaluate session permissions which derive from user's persona/roles
export function evaluateGuard(requiredPermissions: string[]): boolean {
  const session = authStore.getState().currentSession;
  if (!session) return false;
  return checkPermission(requiredPermissions, session.permissions);
}
```

### sessionNormalization.ts
```typescript
// packages/auth/src/sessionNormalization.ts
// ALIGNMENT: sessionNormalization v1.0 - PH5C.2, PH5C.3 - Session data normalization

import type { IMockIdentity, ISessionData } from './adapters/DevAuthBypassAdapter';

// ALIGNMENT: Session structure per D-PH5C-03
// Normalize raw identity into ISessionData: sessionId, userId, email, roles, permissions, expiresAt
export function normalizeSession(rawIdentity: IMockIdentity): ISessionData {
  return {
    sessionId: rawIdentity.metadata.sessionId,
    userId: rawIdentity.userId,
    displayName: rawIdentity.displayName,
    email: rawIdentity.email,
    roles: rawIdentity.roles,
    permissions: mapRolesToPermissions(rawIdentity.roles),
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    acquiredAt: rawIdentity.metadata.loginTimestamp,
  };
}

// ALIGNMENT: Expiration handling per D-PH5C-03
// Check if session has expired based on expiresAt timestamp
export function isSessionExpired(session: ISessionData): boolean {
  return Date.now() > session.expiresAt;
}

function mapRolesToPermissions(
  roles: string[]
): Record<string, boolean> {
  // Permission mapping per D-PH5C-04
  const permissions: Record<string, boolean> = {
    'feature:view-dashboard': true,
    'feature:view-profile': true,
    'feature:admin-panel': roles.includes('Administrator'),
    'feature:accounting-invoice': roles.includes('AccountingUser'),
    'feature:estimating-projects': roles.includes('EstimatingUser'),
    'feature:project-hub': roles.includes('ProjectUser'),
  };
  return permissions;
}
```

---

## Production-Ready Code: `docs/reference/auth/alignment-markers.md`

```markdown
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
```

---

## Recommended Implementation Sequence

1. PH5C.1 – Vitest Fix
2. PH5C.2 – MockAuthAdapter Upgrade
3. PH5C.3 – PersonaRegistry
4. PH5C.4 – DevToolbar
5. PH5C.5 – Developer How-To Guide
6. PH5C.6 – End-User How-To Guide
7. PH5C.7 – Administrator How-To Guide
8. PH5C.8 – Alignment Markers (this task)
9. PH5C.9 – ADR Updates
10. PH5C.10 – Final Verification

---

## Final Phase 5C Definition of Done

Phase 5C is complete when:
1. All 10 granular task files (PH5C.1 through PH5C.10) are executed in sequence.
2. Phase 5 audit coverage reaches **100%** across all seven categories (security, code quality, documentation, testability, maintainability, completeness, architecture alignment).
3. `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell` succeeds with zero warnings.
4. `pnpm turbo run test --filter=@hbc/auth --filter=@hbc/shell` executes and reports ≥95% coverage.
5. All documentation files exist in correct `docs/` subfolders and follow Diátaxis structure (how-to, reference, explanation).
6. All alignment markers are in place; `pnpm lint` detects no violations.
7. Production bundle contains zero byte references to dev-mode code (verified via string search).
8. Final sign-off table is completed with all roles approved.

---

## 5.C.8 Success Criteria Checklist (Task 5C.8)

- [ ] 5.C.8.1 Alignment markers added to ShellCore.tsx (≥2 markers)
- [ ] 5.C.8.2 Alignment markers added to authStore.ts (≥2 markers)
- [ ] 5.C.8.3 Alignment markers added to guardResolution.ts (≥2 markers)
- [ ] 5.C.8.4 Alignment markers added to sessionNormalization.ts (≥2 markers)
- [ ] 5.C.8.5 All markers follow standard format and reference decisions/tasks
- [ ] 5.C.8.6 Custom ESLint rule created in `eslint-alignment-markers.cjs`
- [ ] 5.C.8.7 ESLint rule registered and configured
- [ ] 5.C.8.8 Reference documentation `docs/reference/auth/alignment-markers.md` created
- [ ] 5.C.8.9 `pnpm lint` passes for all packages with no marker violations
- [ ] 5.C.8.10 All markers are reviewed and approved

---

## Phase 5.C.8 Progress Notes

- 5.C.8.1 [PENDING] — Alignment markers in 4 critical files
- 5.C.8.2 [PENDING] — Custom ESLint rule creation
- 5.C.8.3 [PENDING] — Reference documentation

### Verification Evidence

- Alignment markers present in ShellCore.tsx, authStore.ts, guardResolution.ts, sessionNormalization.ts - [PENDING]
- Custom ESLint rule defined and registered - [PENDING]
- `pnpm lint` passes without marker violations - [PENDING]
- `docs/reference/auth/alignment-markers.md` exists and is complete - [PENDING]

---

**End of Task PH5C.8**

<!-- IMPLEMENTATION PROGRESS & NOTES
Task PH5C.8 created: 2026-03-07
Alignment markers and ESLint rule specification complete.
Next: PH5C.9 (ADR Updates)
-->
