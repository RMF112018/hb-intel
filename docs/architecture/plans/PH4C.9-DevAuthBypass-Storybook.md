# PH4C.9 — Dev Auth Bypass: @hbc/auth MockAdapter in Storybook

**Version:** 1.0
**Date:** 2026-03-07
**Purpose:** Wire @hbc/auth's MockAdapter into Storybook's global preview configuration. Provide all 44 @hbc/ui-kit component stories with consistent mock HB Intel user authentication context, enabling reliable development and accessibility verification without requiring real MSAL/SPFx authentication.
**Audience:** Frontend engineers, UI architects, Storybook maintainers
**Implementation Objective:** Establish dev auth bypass pattern; eliminate manual mock auth setup per story; guarantee all auth-dependent components render correctly in Storybook.

**Dependency Notes:**
- This task should be completed **before PH4C.8** (Verification & Testing), as PH4C.8 relies on Storybook auth being functional
- Independent of other PH4C tasks; may be executed in parallel
- Result: All components (HbcAppShell, HbcUserMenu, HbcHeader, HbcCommandPalette, etc.) can access mock user context automatically

---

## Prerequisites

**Soft Gate — Verify @hbc/auth Package Exists and Includes MockAdapter**

```bash
# Confirm @hbc/auth package exists
test -d packages/auth && echo "✓ @hbc/auth package found" || echo "✗ Package not found"

# Confirm MockAdapter is available
grep -r "MockAdapter" packages/auth/src --include="*.ts" --include="*.tsx" | head -3 && echo "✓ MockAdapter found" || echo "⚠ MockAdapter location unknown"

# Confirm auth exports are accessible
test -f packages/auth/package.json && echo "✓ package.json exists" || echo "✗ Missing"
```

**Soft Gate — Verify Storybook Exists in @hbc/ui-kit**

```bash
# Confirm Storybook config exists
test -d packages/ui-kit/.storybook && echo "✓ Storybook config found" || echo "✗ Missing"

# Confirm preview.tsx or preview.js exists
test -f packages/ui-kit/.storybook/preview.tsx || test -f packages/ui-kit/.storybook/preview.js && echo "✓ Preview config found" || echo "✗ Missing"
```

---

## Implementation Steps

### 4C.9.1 — Audit Current Storybook Configuration

**Context:** Understand the current Storybook setup to identify where the global auth decorator should be added.

**Step 1: Examine Storybook Directory Structure**

```bash
# List Storybook configuration files
ls -la packages/ui-kit/.storybook/
```

**Expected Output:**
```
.storybook/
├── main.ts or main.js          (Storybook main config)
├── preview.tsx or preview.js   (Global preview config — where decorator goes)
├── manager.ts (optional)       (UI customizations)
└── (other config files)
```

**Step 2: Read Current preview.tsx**

```bash
# View the current preview configuration
cat packages/ui-kit/.storybook/preview.tsx
```

**Audit Checklist — Document These Details:**

```
Current Storybook Preview Config:
[ ] Theme provider configured:          [Yes/No] [Provider name: _________]
[ ] Global decorators present:          [Yes/No] [Count: _______]
[ ] Current decorators list:            [_______________, _______________, ...]
[ ] ThemeProvider wrapping:             [Yes/No] [Type: _________]
[ ] Existing mock setup:                [Yes/No] [Details: ________________]
[ ] Auth context provider imported:     [Yes/No]
[ ] Any existing auth bypass logic:     [Yes/No] [Location: ________________]
```

**Step 3: Identify Auth-Dependent Components**

```bash
# Find components that import auth context/hooks
grep -r "useAuth\|AuthContext\|useUser\|useRoles" packages/ui-kit/src --include="*.ts" --include="*.tsx" | grep -v ".stories.tsx" | head -20
```

**Expected Output Examples:**
```
packages/ui-kit/src/HbcAppShell/index.tsx: import { useAuth } from '@hbc/auth';
packages/ui-kit/src/HbcUserMenu/index.tsx: import { useAuth } from '@hbc/auth';
packages/ui-kit/src/HbcHeader/index.tsx: import { useUser } from '@hbc/auth';
packages/ui-kit/src/HbcCommandPalette/index.tsx: import { useRoles } from '@hbc/auth';
```

**Document Auth-Dependent Components:**
```
Auth-Dependent Components Identified:
1. HbcAppShell — requires useAuth() for user display
2. HbcUserMenu — requires useAuth() for logout, profile
3. HbcHeader — requires useUser() for header subtitle
4. HbcCommandPalette — requires useRoles() for command filtering
... (list all found)
```

---

### 4C.9.2 — Verify @hbc/auth MockAdapter API

**Context:** Understand the MockAdapter's constructor signature, configuration options, and exported types before wiring it into Storybook.

**Step 1: Locate MockAdapter Implementation**

```bash
# Find the MockAdapter file
find packages/auth/src -name "*Mock*" -o -name "*mock*" | grep -i adapter
```

**Expected Output:**
```
packages/auth/src/adapters/MockAdapter.ts
```

**Step 2: Examine MockAdapter Interface**

```bash
# Read the MockAdapter implementation
cat packages/auth/src/adapters/MockAdapter.ts
```

**Expected Structure:**
```typescript
export class MockAdapter implements IAuthAdapter {
  constructor(config?: {
    user?: IHbcUser;
    // other options
  });

  // Methods: getUser, logout, login, etc.
}
```

**Step 3: Examine User Type Definition**

```bash
# Find and read the user type/interface
grep -r "interface IHbcUser\|type IHbcUser\|interface HbcUser" packages/auth/src --include="*.ts" -A 20 | head -40
```

**Expected Output:**
```typescript
export interface IHbcUser {
  id: string;
  name: string;
  email: string;
  displayName?: string;
  roles: string[];
  permissions?: string[];
  avatar?: string;
  tenantId?: string;
}
```

**Step 4: Find Auth Context Provider**

```bash
# Find the auth provider component
grep -r "AuthProvider\|export.*Provider" packages/auth/src --include="*.ts" --include="*.tsx" | grep -v test | head -10
```

**Expected Output:**
```
packages/auth/src/AuthProvider.tsx: export const AuthProvider
packages/auth/src/context.ts: export const AuthContext
```

**Documentation Checklist:**

```
@hbc/auth MockAdapter API:
[ ] Class name:                 MockAdapter
[ ] Constructor config:         { user?: IHbcUser, ... }
[ ] AuthProvider location:      packages/auth/src/AuthProvider.tsx
[ ] User interface:             IHbcUser { id, name, email, roles, ... }
[ ] Export method (production): import { MockAdapter } from '@hbc/auth'
[ ] Export method (internal):   import { MockAdapter } from '@hbc/auth/adapters'
[ ] Available roles example:    ['Estimator', 'ProjectManager', 'FieldUser', ...]
```

---

### 4C.9.3 — Add @hbc/auth as devDependency of @hbc/ui-kit

**Context:** @hbc/auth is a dev-only dependency for ui-kit; it must NOT appear in production bundles.

**Step 1: Edit package.json**

**File:** `packages/ui-kit/package.json`

**Before:**
```json
{
  "name": "@hbc/ui-kit",
  "version": "1.0.0",
  "dependencies": {
    "@fluentui/react-components": "^9.x.x",
    "react": "^18.x.x"
  },
  "devDependencies": {
    "@storybook/react": "^8.x.x"
  }
}
```

**After:**
```json
{
  "name": "@hbc/ui-kit",
  "version": "1.0.0",
  "dependencies": {
    "@fluentui/react-components": "^9.x.x",
    "react": "^18.x.x"
  },
  "devDependencies": {
    "@hbc/auth": "workspace:*",
    "@storybook/react": "^8.x.x"
  }
}
```

**Important:** Add `@hbc/auth` **only** to `devDependencies`, never to `dependencies`.

**Step 2: Install Dependencies**

```bash
# Update lock file with new dependency
pnpm install

# Verify installation
test -d node_modules/@hbc/auth && echo "✓ @hbc/auth installed" || echo "✗ Installation failed"
```

---

### 4C.9.4 — Create Mock User Configuration

**Context:** Define the standard mock HB Intel user that will be used across all Storybook stories.

**File:** `packages/ui-kit/.storybook/mockAuth.ts`

**Purpose:** Single source of truth for mock user configuration; reusable across decorators and stories.

**Complete File Content:**

```typescript
/**
 * @file mockAuth.ts
 * @description Mock authentication configuration for Storybook.
 *
 * This file defines the standard mock HB Intel user persona used across
 * all Storybook stories. All auth-dependent components see this user
 * when stories are rendered in Storybook.
 *
 * This is Storybook-only; the mock user is NOT exported from @hbc/ui-kit
 * and is NOT available in production builds.
 */

import type { IHbcUser } from '@hbc/auth';

/**
 * Standard mock HB Intel developer user
 *
 * Roles: Estimator + ProjectManager (typical power user)
 * Permissions: View projects, create estimates, view reports
 * Avatar: undefined (uses default avatar in UI)
 *
 * This persona covers most story requirements. For role-specific testing,
 * use story args to override roles (e.g., args: { roles: ['FieldUser'] })
 */
export const STORYBOOK_MOCK_USER: IHbcUser = {
  id: 'storybook-dev-user-001',
  name: 'HB Dev User',
  email: 'dev.user@hbcorp.com',
  displayName: 'HB Dev User',
  roles: ['Estimator', 'ProjectManager'],
  permissions: [
    'view:projects',
    'edit:estimates',
    'view:reports',
    'manage:team',
    'create:proposals',
  ],
  avatar: undefined, // Uses default avatar in UI
  tenantId: 'hbcorp-dev-tenant',
};

/**
 * Alternative personas for role-specific testing
 * Use in story args: args: { mockUser: ADMIN_PERSONA }
 */

export const ADMIN_PERSONA: IHbcUser = {
  id: 'storybook-admin-001',
  name: 'Admin User',
  email: 'admin@hbcorp.com',
  displayName: 'Admin User',
  roles: ['SystemAdmin', 'Estimator', 'ProjectManager', 'FieldUser'],
  permissions: [
    'view:all',
    'edit:all',
    'manage:users',
    'manage:permissions',
    'view:audit-logs',
  ],
  avatar: undefined,
  tenantId: 'hbcorp-dev-tenant',
};

export const FIELD_USER_PERSONA: IHbcUser = {
  id: 'storybook-field-001',
  name: 'Field User',
  email: 'field.user@hbcorp.com',
  displayName: 'Field User',
  roles: ['FieldUser'],
  permissions: [
    'view:projects',
    'view:estimates',
    'report:daily-logs',
  ],
  avatar: undefined,
  tenantId: 'hbcorp-dev-tenant',
};

export const ESTIMATOR_PERSONA: IHbcUser = {
  id: 'storybook-estimator-001',
  name: 'Estimator User',
  email: 'estimator@hbcorp.com',
  displayName: 'Estimator User',
  roles: ['Estimator'],
  permissions: [
    'view:projects',
    'edit:estimates',
    'view:reports',
    'create:estimates',
  ],
  avatar: undefined,
  tenantId: 'hbcorp-dev-tenant',
};
```

---

### 4C.9.5 — Create the Auth Decorator

**Context:** Build the global decorator that wraps all Storybook stories with a mock auth provider.

**File:** `packages/ui-kit/.storybook/decorators/withMockAuth.tsx`

**Purpose:** Apply MockAdapter-backed auth context to every story without requiring manual setup.

**Complete File Content:**

```typescript
/**
 * @file decorators/withMockAuth.tsx
 * @description Global Storybook decorator for mock authentication.
 *
 * This decorator wraps all stories in an AuthProvider configured with
 * MockAdapter, providing a consistent dev auth context. The decorator
 * guards against production activation.
 *
 * IMPORTANT: This decorator is Storybook-only. It is NOT used in
 * production builds or exported from @hbc/ui-kit.
 */

import React from 'react';
import type { Decorator } from '@storybook/react';
import { MockAdapter } from '@hbc/auth';
import { AuthProvider } from '@hbc/auth';
import { STORYBOOK_MOCK_USER } from '../mockAuth';

/**
 * withMockAuth Decorator
 *
 * Provides all stories with a MockAdapter-backed auth context.
 * Components that call useAuth(), useUser(), useRoles() will receive
 * the mock user data instead of requiring real MSAL authentication.
 *
 * Guard: Only active in Storybook (NODE_ENV !== 'production')
 */
export const withMockAuth: Decorator = (Story, context) => {
  // Guard: Only apply decorator in Storybook (not in production builds)
  if (
    typeof process !== 'undefined' &&
    process.env.NODE_ENV === 'production'
  ) {
    // In production, return story without auth wrapper
    // (production code doesn't use this decorator anyway)
    return <Story {...context} />;
  }

  // Storybook environment: apply mock auth context
  return (
    <AuthProvider
      adapter={
        new MockAdapter({
          user: STORYBOOK_MOCK_USER,
        })
      }
    >
      <Story {...context} />
    </AuthProvider>
  );
};

/**
 * Usage in preview.tsx:
 *
 * import { withMockAuth } from './decorators/withMockAuth';
 *
 * const preview: Preview = {
 *   decorators: [withMockAuth],
 *   // ... other config
 * };
 *
 * export default preview;
 */
```

**Key Implementation Details:**
1. **Guard Condition** — Checks `NODE_ENV !== 'production'` to prevent decorator activation in prod
2. **MockAdapter Initialization** — Simple config with mock user
3. **AuthProvider Wrapping** — Standard React context provider pattern
4. **Passthrough in Production** — Returns story unmodified if somehow called in production

---

### 4C.9.6 — Register the Decorator in preview.tsx

**Context:** Add the global decorator to Storybook's preview config so it applies to all stories.

**File:** `packages/ui-kit/.storybook/preview.tsx`

**Step 1: Add Import at Top**

```typescript
import { withMockAuth } from './decorators/withMockAuth';
```

**Step 2: Add Decorator to Config**

**Before (original preview.tsx):**
```typescript
import type { Preview } from '@storybook/react';
import { defineTheme } from '@storybook/theming';
// ... other imports

const preview: Preview = {
  parameters: {
    layout: 'centered',
    docs: {
      toc: true,
    },
  },
  // ... other config
};

export default preview;
```

**After (with mock auth):**
```typescript
import type { Preview } from '@storybook/react';
import { defineTheme } from '@storybook/theming';
import { withMockAuth } from './decorators/withMockAuth';
// ... other imports

const preview: Preview = {
  decorators: [
    withMockAuth, // Apply mock auth context to all stories
    // ... other decorators if any
  ],
  parameters: {
    layout: 'centered',
    docs: {
      toc: true,
    },
  },
  // ... other config
};

export default preview;
```

**Important Placement:**
- `decorators` array should be at the top level of the Preview config
- Order matters: auth decorator should wrap other decorators (unless other decorators need non-auth context)

**Step 3: Verify Syntax**

```bash
# Check for TypeScript errors in preview.tsx
pnpm --filter @hbc/ui-kit type-check
# Expected: EXIT CODE 0 (no errors)
```

---

### 4C.9.7 — Verify All Auth-Dependent Components Render Correctly

**Context:** Test that components depending on auth hooks render without errors in Storybook with the MockAdapter wired in.

**Step 1: Start Storybook**

```bash
# Start Storybook dev server
pnpm --filter @hbc/ui-kit storybook
# Opens at http://localhost:6006
```

**Step 2: Test Auth-Dependent Components**

For each component that uses auth hooks (identified in step 4C.9.1), verify it renders:

| Component | Hook Used | Expected Behavior | Test Result |
|---|---|---|---|
| **HbcAppShell** | `useAuth()` | Displays mock user name in header | [ ] Pass |
| **HbcUserMenu** | `useAuth()` for logout | User menu shows mock user email | [ ] Pass |
| **HbcHeader** | `useUser()` | Header subtitle shows user name | [ ] Pass |
| **HbcCommandPalette** | `useRoles()` | Commands filtered by mock roles | [ ] Pass |
| **HbcConnectivityBar** | None (but verify it still renders) | Connectivity indicator displays | [ ] Pass |

**Step 3: Manual Verification Process**

1. Open http://localhost:6006 in browser
2. Navigate to **HbcAppShell** story
3. Expected: Story renders with "HB Dev User" displayed in the top-right user menu
4. Click on the user menu → should show "dev.user@hbcorp.com"
5. No errors in browser console (F12 → Console tab)

**Step 4: Browser Console Check**

In Storybook, open DevTools and check console for errors:

```javascript
// Expected: No [ERROR] or [WARN] messages related to auth
// If you see: "useAuth must be called within AuthProvider"
// → The decorator is not applied correctly
```

**Step 5: Check Decorator Application**

```javascript
// In browser console on a Storybook story:
console.log(window.__STORYBOOK_ADDONS_CHANNEL__);
// Should show Storybook is running (decorator is active)
```

---

### 4C.9.8 — Create ADR for Dev Auth Bypass Boundary

**File:** `docs/architecture/adr/ADR-0054-dev-auth-bypass-storybook-boundary.md`

*Note: This ADR is referenced in PH4C.8 (step 4C.8.5). Complete it here in PH4C.9.*

**Complete ADR Content:**

```markdown
# ADR-0054: Dev Auth Bypass — @hbc/auth MockAdapter in Storybook

**Status:** Accepted
**Date:** 2026-03-07
**Blueprint Reference:** §4e — dev-harness and Storybook integration
**Foundation Plan Reference:** PH4C.9 (Storybook MockAdapter Integration)

## Context

@hbc/ui-kit components that depend on authentication context (e.g., HbcAppShell, HbcUserMenu,
HbcHeader, HbcCommandPalette) cannot be properly previewed in Storybook without a real auth
session. This creates friction for UI development:

- Developers must manually mock auth context in each affected story
- Storybook accessibility verification is unreliable (missing auth context causes errors)
- Testing auth-dependent UI states is time-consuming and error-prone

Current state forces developers to:
1. Use a real MSAL session (requires Azure AD setup, slow, tied to dev credentials)
2. Manually create mock auth context in each story (duplicates code, easy to miss)
3. Skip testing auth-dependent components in Storybook (risky, untested UI)

## Decision

### MockAdapter Integration in Storybook

@hbc/auth (from Phase 5) is added as a **devDependency** of @hbc/ui-kit specifically for
Storybook use. The MockAdapter is integrated into Storybook's global preview decorator,
providing all stories with a consistent mock HB Intel user context.

### Implementation Architecture

```
packages/ui-kit/
├── .storybook/
│   ├── preview.tsx                           (import withMockAuth decorator)
│   ├── mockAuth.ts                            (define mock user personas)
│   └── decorators/
│       └── withMockAuth.tsx                   (global decorator wrapping stories)
├── package.json                               (@hbc/auth as devDependency)
└── src/
    ├── HbcAppShell/
    │   ├── index.tsx                          (consumes useAuth())
    │   └── HbcAppShell.stories.tsx            (no auth mocking needed)
    └── (other components...)
```

### Boundary Rules

1. **devDependency Only**
   - @hbc/auth must appear ONLY in `devDependencies` of package.json
   - It must NEVER appear in production `dependencies`
   - CI bundle size check enforces this boundary

2. **Guard Against Production**
   - `withMockAuth` decorator includes environment check:
     ```typescript
     if (process.env.NODE_ENV === 'production') {
       return <Story />;  // Skip decorator in production
     }
     ```
   - Ensures decorator is inert even if accidentally included in prod build

3. **No Production Exports**
   - MockAdapter configuration and mock users (STORYBOOK_MOCK_USER, etc.) are
     internal to `.storybook/` directory
   - They are NOT exported from @hbc/ui-kit's main barrel (packages/ui-kit/index.ts)
   - `grep "STORYBOOK_MOCK_USER" packages/ui-kit/src` should return zero matches

4. **CI Bundle Enforcement**
   - Build pipeline includes bundle-size check:
     ```bash
     pnpm build --filter @hbc/ui-kit
     # Check @hbc/auth is NOT in dist/
     grep -r "@hbc/auth" dist/ && exit 1  # Fail if found
     ```

## Consequences

### Positive
1. **Developer Experience** — All auth-dependent stories render correctly without setup
2. **Accessibility Testing** — Storybook A11y addon can audit auth-dependent components
3. **Consistent Mock** — All stories see the same user (id, roles, permissions)
4. **Decoupling** — UI Kit development is decoupled from MSAL/Azure AD setup

### Constraints
1. **devDependency Boundary** — Must maintain strict separation; any leak into production
   dependencies is a critical bug
2. **Maintenance** — If @hbc/auth's MockAdapter API changes, Storybook integration must
   be updated (low overhead, ~1 file)
3. **Documentation** — Developers must understand that MockAdapter is Storybook-only

## Alternatives Considered

1. **No MockAdapter in Storybook** — Rejected because it forces real auth or manual mocking

2. **Full @hbc/auth as production dependency** — Rejected because:
   - Violates ui-kit's lean dependency model
   - Bloats production bundles by ~50KB
   - Creates circular dependencies (ui-kit ← shell ← auth)

3. **Custom mock auth provider** — Rejected because it duplicates @hbc/auth's MockAdapter
   and creates maintenance burden

4. **Build-time stripping of auth code** — Rejected because @hbc/auth is external package;
   code stripping would be fragile and hard to maintain

## Validation

- [x] MockAdapter API reviewed (step 4C.9.2)
- [x] @hbc/auth added as devDependency only (step 4C.9.3)
- [x] withMockAuth decorator implemented (step 4C.9.5)
- [x] Decorator registered in preview.tsx (step 4C.9.6)
- [x] All auth-dependent components render correctly (step 4C.9.7)
- [x] No @hbc/auth imports in ui-kit/src production code (verified by grep)
- [x] Bundle check passes: @hbc/auth NOT in dist/ (CI gate)

## Enforcement

### Code-Level
```typescript
// packages/ui-kit/.storybook/decorators/withMockAuth.tsx
if (process.env.NODE_ENV === 'production') {
  return <Story />;  // Guard: decorator is no-op in prod
}
```

### CI-Level
```bash
# .github/workflows/build.yml (or equivalent)
- name: Verify bundle integrity
  run: |
    pnpm build --filter @hbc/ui-kit
    ! grep -r "@hbc/auth" packages/ui-kit/dist || exit 1
```

### Review-Level
- Code reviews must catch any new imports of @hbc/auth in ui-kit/src
- Any additions to @hbc/ui-kit package.json require architecture review

## References

- `packages/ui-kit/package.json` — devDependency declaration
- `packages/ui-kit/.storybook/preview.tsx` — Decorator registration
- `packages/ui-kit/.storybook/decorators/withMockAuth.tsx` — Implementation
- `packages/ui-kit/.storybook/mockAuth.ts` — Mock user configuration
- `packages/auth/src/adapters/MockAdapter.ts` — MockAdapter source (Phase 5)
- `docs/how-to/developer/phase-4c-storybook-setup.md` — Developer guide

## Decision Log

**Approved:** 2026-03-07
- Decision: Wire @hbc/auth MockAdapter into Storybook
- Justification: Unblocks UI development; enables reliable A11y testing
- Risks: devDependency boundary leakage (mitigated by CI checks)
- Owner: UI Architecture Lead
```

**Save the ADR:**
```bash
# Create the file
cat > docs/architecture/adr/ADR-0054-dev-auth-bypass-storybook-boundary.md << 'EOF'
# [Paste ADR content above]
EOF

# Verify
test -f docs/architecture/adr/ADR-0054-dev-auth-bypass-storybook-boundary.md && echo "✓ ADR-0054 created"
```

---

### 4C.9.9 — Verify No Production Bundle Leakage

**Context:** Confirm that @hbc/auth does NOT appear in the production build output.

**Step 1: Verify package.json Configuration**

```bash
# Check @hbc/auth is ONLY in devDependencies
cat packages/ui-kit/package.json | grep -A 10 "devDependencies"
# Expected: "@hbc/auth": "workspace:*"

cat packages/ui-kit/package.json | grep -A 10 '"dependencies"'
# Expected: NO @hbc/auth here
```

**Step 2: Build and Check Output**

```bash
# Build the ui-kit package
pnpm --filter @hbc/ui-kit build

# Verify @hbc/auth is NOT in the dist output
grep -r "@hbc/auth" packages/ui-kit/dist 2>/dev/null && echo "✗ FAIL: @hbc/auth found in dist/" || echo "✓ PASS: @hbc/auth not in dist/"
```

**Expected Result:**
```
✓ PASS: @hbc/auth not in dist/
```

**Step 3: Check Production Code Imports**

```bash
# Verify @hbc/auth is NOT imported in production component code
grep -r "import.*from.*@hbc/auth" packages/ui-kit/src --include="*.tsx" --include="*.ts" | grep -v ".stories.tsx" | grep -v ".storybook"
# Expected: zero results
```

**Expected Result:**
```
(no output)
```

**Step 4: Examine Storybook Directory Imports**

```bash
# Confirm @hbc/auth imports are ONLY in .storybook/ directory
grep -r "import.*from.*@hbc/auth" packages/ui-kit/.storybook --include="*.tsx" --include="*.ts"
# Expected: matches in .storybook/ only (okay, not imported in src/)
```

**Expected Result:**
```
packages/ui-kit/.storybook/decorators/withMockAuth.tsx: import { MockAdapter } from '@hbc/auth';
packages/ui-kit/.storybook/decorators/withMockAuth.tsx: import { AuthProvider } from '@hbc/auth';
```

**Step 5: Type-Check to Ensure No Accidental Imports**

```bash
# Run type-check (catches any accidental imports in src/)
pnpm --filter @hbc/ui-kit type-check
# Expected: EXIT CODE 0, zero errors related to @hbc/auth
```

---

### 4C.9.10 — Update UI Kit README with Storybook Setup Instructions

**File:** `packages/ui-kit/README.md` (update or create)

**Section to Add:**

```markdown
## Storybook Development

All @hbc/ui-kit components are documented in Storybook with visual and accessibility testing.

### Starting Storybook

```bash
pnpm --filter @hbc/ui-kit storybook
```

Opens Storybook at http://localhost:6006

### Mock Authentication in Storybook

Auth-dependent components (HbcAppShell, HbcUserMenu, HbcHeader, etc.) automatically receive
a mock authenticated user context. This is configured via the global `withMockAuth` decorator
in `.storybook/preview.tsx`.

**Mock User Details:**
- **Name:** HB Dev User
- **Email:** dev.user@hbcorp.com
- **Roles:** Estimator, ProjectManager
- **ID:** storybook-dev-user-001

The mock user is only available in Storybook; it is **not** exported from @hbc/ui-kit and
is **not** included in production builds.

### Adding New Stories

When creating a story for an auth-dependent component:

```typescript
// HbcAppShell.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { HbcAppShell } from './index';

const meta: Meta<typeof HbcAppShell> = {
  component: HbcAppShell,
  title: 'Components/HbcAppShell',
};

export default meta;
type Story = StoryObj<typeof HbcAppShell>;

export const Default: Story = {
  // No auth mocking needed — global decorator handles it
  render: () => <HbcAppShell>{/* content */}</HbcAppShell>,
};
```

The `withMockAuth` decorator automatically wraps your story with `AuthProvider` +
`MockAdapter`, so components that call `useAuth()`, `useUser()`, or `useRoles()`
will receive the mock user data.

### Testing Role-Specific Behavior

To test a story with different roles (e.g., FieldUser instead of ProjectManager):

```typescript
// In .storybook/decorators/withMockAuth.tsx, you can extend the decorator
// to accept role overrides via story args. See the full decorator implementation.

// For now, the mock user has Estimator + ProjectManager roles, which covers
// most development needs.
```

### Accessibility Testing

Storybook includes the Axe accessibility addon. For every new component:

1. Write stories covering all visual states (light, dark, disabled, etc.)
2. Open Storybook and navigate to your component
3. Bottom-left panel → Addons → Accessibility
4. Verify 0 critical and 0 serious violations
5. Commit stories alongside component code

See `PH4C.8` (Verification & Testing) for the full A11y sweep checklist.

### Building Storybook Static Site

To generate a static Storybook build (for CI/CD or deployment):

```bash
pnpm --filter @hbc/ui-kit build-storybook
# Output: packages/ui-kit/storybook-static/
```

## Architecture

For implementation details, see:
- `docs/architecture/adr/ADR-0054-dev-auth-bypass-storybook-boundary.md` — MockAdapter integration
- `packages/ui-kit/.storybook/mockAuth.ts` — Mock user configuration
- `packages/ui-kit/.storybook/decorators/withMockAuth.tsx` — Decorator implementation
```

---

## Success Criteria Checklist

- [ ] **4C.9.1 Complete** — Current Storybook configuration audited; auth-dependent components identified
- [ ] **4C.9.2 Complete** — @hbc/auth MockAdapter API reviewed and documented
- [ ] **4C.9.3 Complete** — @hbc/auth added as devDependency (NOT in production dependencies)
- [ ] **4C.9.4 Complete** — `packages/ui-kit/.storybook/mockAuth.ts` created with mock user personas
- [ ] **4C.9.5 Complete** — `packages/ui-kit/.storybook/decorators/withMockAuth.tsx` created with guard condition
- [ ] **4C.9.6 Complete** — Decorator registered in `packages/ui-kit/.storybook/preview.tsx`
- [ ] **4C.9.7 Complete** — All auth-dependent components render correctly in Storybook (manual verification)
- [ ] **4C.9.8 Complete** — ADR-0054 created; boundary rules documented
- [ ] **4C.9.9 Complete** — Bundle verification passes; @hbc/auth NOT in dist/
- [ ] **4C.9.10 Complete** — UI Kit README updated with Storybook setup instructions
- [ ] **No TypeScript Errors** — `pnpm turbo type-check` passes for ui-kit
- [ ] **No Lint Errors** — `pnpm --filter @hbc/ui-kit lint` returns zero violations
- [ ] **Storybook Builds** — `pnpm --filter @hbc/ui-kit build-storybook` completes without errors
- [ ] **Production Build Clean** — @hbc/auth NOT found in production bundle

---

## Verification Commands

### Complete Setup Verification
```bash
#!/bin/bash
set -e

echo "=== PH4C.9 — Dev Auth Bypass Verification ==="
echo

echo "[1/6] Type-Check..."
pnpm --filter @hbc/ui-kit type-check || exit 1
echo "✓ Type-check passed"
echo

echo "[2/6] Verifying package.json configuration..."
grep -q '"@hbc/auth".*"workspace:\*"' packages/ui-kit/package.json && echo "✓ @hbc/auth in devDependencies" || (echo "✗ FAIL: @hbc/auth not in devDependencies" && exit 1)
! grep -q '"dependencies".*"@hbc/auth"' packages/ui-kit/package.json && echo "✓ @hbc/auth NOT in dependencies" || (echo "✗ FAIL: @hbc/auth in dependencies" && exit 1)
echo

echo "[3/6] Building package..."
pnpm --filter @hbc/ui-kit build || exit 1
echo "✓ Build passed"
echo

echo "[4/6] Verifying no bundle leakage..."
! grep -r "@hbc/auth" packages/ui-kit/dist 2>/dev/null && echo "✓ @hbc/auth not in dist/" || (echo "✗ FAIL: @hbc/auth found in dist/" && exit 1)
echo

echo "[5/6] Verifying storybook integration..."
test -f packages/ui-kit/.storybook/decorators/withMockAuth.tsx && echo "✓ withMockAuth decorator exists" || (echo "✗ FAIL: decorator missing" && exit 1)
test -f packages/ui-kit/.storybook/mockAuth.ts && echo "✓ mockAuth config exists" || (echo "✗ FAIL: config missing" && exit 1)
grep -q "withMockAuth" packages/ui-kit/.storybook/preview.tsx && echo "✓ Decorator registered in preview.tsx" || (echo "✗ FAIL: not registered" && exit 1)
echo

echo "[6/6] Building Storybook..."
pnpm --filter @hbc/ui-kit build-storybook || exit 1
echo "✓ Storybook build passed"
echo

echo "=== PH4C.9 VERIFICATION COMPLETE ==="
echo "Next: Run Storybook dev server and verify auth-dependent components render"
echo "  pnpm --filter @hbc/ui-kit storybook"
```

**Run the verification:**
```bash
bash scripts/verify-ph4c-9.sh
```

### Manual Storybook Verification
```bash
# Start Storybook
pnpm --filter @hbc/ui-kit storybook

# In browser at http://localhost:6006:
# 1. Navigate to HbcAppShell story
# 2. Verify "HB Dev User" appears in top-right corner
# 3. Click user menu → verify "dev.user@hbcorp.com" shown
# 4. Check browser console (F12) for no auth errors
# 5. Repeat for HbcUserMenu, HbcHeader, HbcCommandPalette stories
```

---

## PH4C.9 Progress Notes

- **Initiated:** 2026-03-07
- **4C.9.1 Status:** [PENDING] Storybook config audit
- **4C.9.2 Status:** [PENDING] MockAdapter API review
- **4C.9.3 Status:** [PENDING] devDependency addition
- **4C.9.4 Status:** [PENDING] Mock user configuration
- **4C.9.5 Status:** [PENDING] Decorator implementation
- **4C.9.6 Status:** [PENDING] Decorator registration
- **4C.9.7 Status:** [PENDING] Component verification
- **4C.9.8 Status:** [PENDING] ADR creation
- **4C.9.9 Status:** [PENDING] Bundle leakage check
- **4C.9.10 Status:** [PENDING] README update
- **Build/Lint Status:** [AWAITING IMPLEMENTATION]

**Critical Path:**
- This task should be complete BEFORE PH4C.8 (Verification & Testing)
- PH4C.8 depends on Storybook auth working correctly
- Recommended completion: 2026-03-07 (same day as PH4C task coordination)

**Sign-Off Plan:**
- UI Architect to review decorator implementation in step 4C.9.5
- DevOps to verify bundle checks in step 4C.9.9
- Architecture Owner to approve ADR-0054 in step 4C.9.8
- Final verification in PH4C.8 when A11y sweep is run

---

## Verification Evidence Template

| Criterion | Status | Evidence | Date |
|---|---|---|---|
| MockAdapter API Reviewed | [ ] | Documentation + code review | |
| @hbc/auth Added (devDeps only) | [ ] | package.json inspection | |
| withMockAuth Decorator Created | [ ] | File exists + review | |
| Decorator Registered | [ ] | preview.tsx inspection | |
| Auth Components Render | [ ] | Browser manual test + screenshots | |
| ADR-0054 Created | [ ] | File exists + approval | |
| Bundle Clean (no @hbc/auth) | [ ] | Build output verification | |
| Type-Check Passes | [ ] | `pnpm turbo type-check` (EXIT 0) | |
| Lint Passes | [ ] | `pnpm lint` (0 violations) | |
| Storybook Builds | [ ] | Build log (EXIT 0) | |
| README Updated | [ ] | File review | |

---

**End of PH4C.9 Plan**
