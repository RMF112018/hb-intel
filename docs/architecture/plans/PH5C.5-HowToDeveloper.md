# Phase 5 Development Plan – Authentication & Shell Foundation Task 5C.5: Developer Integration How-To Guide

**Version:** 2.0 (Developer how-to: auth integration with feature modules)
**Purpose:** This document defines the implementation steps to create a comprehensive how-to guide for developers integrating authentication into their feature modules, complete with numbered steps, worked examples, and copy-paste-ready code patterns.
**Audience:** Implementation agent(s), technical writers, frontend developers
**Implementation Objective:** Deliver a 2–3 page developer-focused how-to guide that demonstrates how to register features, use authentication hooks, guard routes, and implement permission-based UI in the HB Intel platform.

---

## 5.C.5 Developer Integration How-To Guide

1. **Create `docs/how-to/developer/integrate-auth-with-your-feature.md`** (D-PH5C-07)
   - Follow Diátaxis how-to format: goal-oriented, task-based, practical
   - Write for developer audience: clear, concise, code-focused
   - Include 8–10 numbered steps covering full integration workflow
   - Provide worked example: Accounting Invoice List feature
   - Use code blocks with comments explaining key decisions

2. **Structure how-to guide** (D-PH5C-07)
   - Introduction: What you'll achieve (integrate auth into your feature)
   - Prerequisites: Node.js, pnpm, HB Intel monorepo setup
   - Step 1: Create feature module with TypeScript
   - Step 2: Register feature with FeatureRegistry
   - Step 3: Implement feature component with permission checks
   - Step 4: Use useAuthSession hook to access current user
   - Step 5: Use useHasPermission hook for permission-based rendering
   - Step 6: Wrap component with AuthGuard for route protection
   - Step 7: Use withFeatureAuth HOC for automatic permission enforcement
   - Step 8: Test feature with different personas using DevToolbar
   - Step 9: Add permission-based UI state (disabled buttons, hidden sections)
   - Step 10: Verify feature in production build
   - Troubleshooting section: Common issues and solutions

3. **Write worked example: Accounting Invoice List** (D-PH5C-07)
   - Feature definition, registration, component implementation
   - Show full integration from feature definition to UI rendering
   - Include permission checks for invoice actions (view, edit, delete, approve)
   - Include persona-based testing scenarios
   - Copy-paste-ready code blocks

4. **Include code patterns** (D-PH5C-07)
   - Feature registration pattern
   - useAuthSession hook usage
   - useHasPermission hook usage
   - AuthGuard component usage
   - withFeatureAuth HOC usage
   - Permission-based button/section rendering
   - Test user selection via DevToolbar

5. **Document best practices** (D-PH5C-07)
   - Always register features early (before component render)
   - Always check permissions before rendering sensitive features
   - Use useHasPermission for UI state, AuthGuard for route protection
   - Test with edge-case personas (ReadOnly, DegradedMode)
   - Document feature permissions in feature README

6. **Include troubleshooting section** (D-PH5C-07)
   - Common error: Feature not in registry (solution: ensure registerFeature called)
   - Common error: Permissions not updated (solution: restart dev server, switch personas)
   - Common error: AuthGuard not working (solution: ensure component is guarded)
   - Link to reference documentation for further help

---

## Production-Ready Code: `docs/how-to/developer/integrate-auth-with-your-feature.md`

```markdown
# How to Integrate Authentication into Your Feature

## Goal

By the end of this guide, you will have integrated HB Intel's authentication and permission system into your feature module, enabling users to access only features they are authorized to use, with appropriate UI indicators and route protection.

## Prerequisites

- Node.js 18+ and pnpm installed
- HB Intel monorepo cloned and `pnpm install` completed
- Basic familiarity with React, TypeScript, and Zustand
- Understanding of HB Intel's architecture (features, modules, routing)

## What You'll Build

A fully integrated feature module with:
- Feature registration in FeatureRegistry
- Permission-based UI rendering
- Route protection with AuthGuard
- User session access via hooks
- Testing support for multiple personas

Example: Accounting Invoice List feature with view, edit, delete, and approve permissions.

---

## Step 1: Create Your Feature Module

Create a new directory for your feature under `packages/accounting/src/features/`:

```
packages/accounting/src/features/
├── InvoiceList/
│   ├── InvoiceList.tsx
│   ├── InvoiceListContainer.tsx
│   ├── InvoiceList.module.css
│   ├── index.ts
│   └── __tests__/
│       └── InvoiceList.test.tsx
└── index.ts
```

**Create `packages/accounting/src/features/InvoiceList/index.ts`:**

```typescript
// Feature exports
export { InvoiceListContainer } from './InvoiceListContainer';
export { InvoiceList } from './InvoiceList';
```

---

## Step 2: Register Your Feature with FeatureRegistry

Before your component renders, register the feature with its required permissions.

**Create `packages/auth/src/features/accountingFeatures.ts`:**

```typescript
// D-PH5C-04: Feature registration for Accounting module
// These permissions are checked at runtime via useHasPermission hook

export const ACCOUNTING_FEATURES = {
  INVOICE_LIST: {
    id: 'feature:accounting-invoice-list',
    name: 'Invoice List',
    description: 'View and manage invoices',
    requiredPermissions: ['feature:accounting-invoice', 'action:read'],
  },
  INVOICE_DETAIL: {
    id: 'feature:accounting-invoice-detail',
    name: 'Invoice Detail',
    description: 'View invoice details',
    requiredPermissions: ['feature:accounting-invoice', 'action:read'],
  },
  INVOICE_EDIT: {
    id: 'feature:accounting-invoice-edit',
    name: 'Edit Invoice',
    description: 'Edit invoice data',
    requiredPermissions: ['feature:accounting-invoice', 'action:write'],
  },
  INVOICE_DELETE: {
    id: 'feature:accounting-invoice-delete',
    name: 'Delete Invoice',
    description: 'Delete invoices',
    requiredPermissions: ['feature:accounting-invoice', 'action:delete'],
  },
  INVOICE_APPROVE: {
    id: 'feature:accounting-invoice-approve',
    name: 'Approve Invoice',
    description: 'Approve invoices for payment',
    requiredPermissions: ['feature:accounting-invoice', 'action:approve'],
  },
};

// Register features at app startup
export function registerAccountingFeatures() {
  Object.values(ACCOUNTING_FEATURES).forEach((feature) => {
    registerFeature(feature.id, feature.requiredPermissions);
  });
}
```

**Call registration early in your app initialization** (e.g., in `ShellCore.tsx` or app entry point):

```typescript
import { registerAccountingFeatures } from '@hbc/auth';

// In app startup or component mount
useEffect(() => {
  registerAccountingFeatures();
}, []);
```

---

## Step 3: Implement Your Feature Component

Create the component that uses authentication hooks.

**`packages/accounting/src/features/InvoiceList/InvoiceList.tsx`:**

```typescript
import React from 'react';
import { useAuthSession, useHasPermission } from '@hbc/auth';
import { ACCOUNTING_FEATURES } from '@hbc/auth';
import styles from './InvoiceList.module.css';

export interface InvoiceListProps {
  onSelectInvoice?: (invoiceId: string) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  onSelectInvoice,
}) => {
  // Step 1: Access current session to show user context
  const session = useAuthSession();

  // Step 2: Check permissions for specific actions
  const canView = useHasPermission(ACCOUNTING_FEATURES.INVOICE_LIST.requiredPermissions);
  const canEdit = useHasPermission(ACCOUNTING_FEATURES.INVOICE_EDIT.requiredPermissions);
  const canDelete = useHasPermission(ACCOUNTING_FEATURES.INVOICE_DELETE.requiredPermissions);
  const canApprove = useHasPermission(ACCOUNTING_FEATURES.INVOICE_APPROVE.requiredPermissions);

  // Step 3: Render feature based on permissions
  if (!canView) {
    return (
      <div className={styles.container}>
        <div className={styles.accessDenied}>
          <p>You do not have permission to view invoices.</p>
          <p>Contact your administrator for access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Invoices</h1>
        <p>Logged in as: {session?.displayName}</p>
      </div>

      <div className={styles.listContainer}>
        {/* Sample invoice data — in reality, fetch from API */}
        {[
          { id: 'INV-001', amount: 1500, status: 'Draft' },
          { id: 'INV-002', amount: 2500, status: 'Pending Approval' },
          { id: 'INV-003', amount: 500, status: 'Approved' },
        ].map((invoice) => (
          <div key={invoice.id} className={styles.invoiceRow}>
            <span>{invoice.id}</span>
            <span>${invoice.amount}</span>
            <span>{invoice.status}</span>

            {/* Step 4: Permission-based button rendering */}
            <div className={styles.actions}>
              <button
                onClick={() => onSelectInvoice?.(invoice.id)}
                disabled={!canEdit}
                title={canEdit ? 'Edit invoice' : 'No permission to edit'}
              >
                Edit
              </button>

              <button
                onClick={() => {
                  if (confirm(`Delete ${invoice.id}?`)) {
                    console.log('Deleting:', invoice.id);
                  }
                }}
                disabled={!canDelete}
                title={canDelete ? 'Delete invoice' : 'No permission to delete'}
              >
                Delete
              </button>

              {invoice.status === 'Pending Approval' && (
                <button
                  onClick={() => console.log('Approving:', invoice.id)}
                  disabled={!canApprove}
                  title={canApprove ? 'Approve invoice' : 'No permission to approve'}
                >
                  Approve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## Step 4: Wrap with AuthGuard for Route Protection

Use the `AuthGuard` component to prevent access to the feature route entirely.

**`packages/accounting/src/features/InvoiceList/InvoiceListContainer.tsx`:**

```typescript
import React from 'react';
import { AuthGuard } from '@hbc/auth';
import { ACCOUNTING_FEATURES } from '@hbc/auth';
import { InvoiceList } from './InvoiceList';

/**
 * D-PH5C-04: AuthGuard wraps the component and prevents rendering if user lacks permissions
 * Users without permission see fallback message
 */
export const InvoiceListContainer: React.FC = () => {
  return (
    <AuthGuard
      requiredPermissions={ACCOUNTING_FEATURES.INVOICE_LIST.requiredPermissions}
      fallback={
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>
            You do not have access to this feature. Contact your administrator
            to request access.
          </p>
        </div>
      }
    >
      <InvoiceList />
    </AuthGuard>
  );
};
```

---

## Step 5: Use Higher-Order Component (HOC) for Automatic Wrapping

Alternatively, use the `withFeatureAuth` HOC for automatic permission enforcement.

```typescript
import { withFeatureAuth } from '@hbc/auth';
import { InvoiceList } from './InvoiceList';
import { ACCOUNTING_FEATURES } from '@hbc/auth';

// Automatically guard component with permission checks
export const ProtectedInvoiceList = withFeatureAuth(
  InvoiceList,
  ACCOUNTING_FEATURES.INVOICE_LIST.requiredPermissions,
  {
    fallback: <div>Feature not available</div>,
  }
);
```

---

## Step 6: Register Route with Permission Guard

In your routing configuration, register the route with auth protection.

**Example routing setup:**

```typescript
import { createRoot } from 'react-router-dom';
import { AuthGuard } from '@hbc/auth';
import { InvoiceListContainer } from './features/InvoiceList';

const routes = [
  {
    path: '/accounting',
    children: [
      {
        path: 'invoices',
        element: <InvoiceListContainer />,
        requiredPermissions: ['feature:accounting-invoice', 'action:read'],
      },
    ],
  },
];
```

---

## Step 7: Test with Different Personas

Use the DevToolbar to test your feature with different personas.

**Testing steps:**

1. Start dev server: `pnpm dev`
2. Open app in browser
3. Open DevToolbar (bottom of screen, click to expand)
4. Go to "Personas" tab
5. Select **AccountingUser** persona
6. Navigate to your feature route
7. Verify all buttons are enabled
8. Switch to **Member** persona
9. Verify buttons are disabled / feature shows access denied
10. Switch to **Executive** persona
11. Verify read-only access works
12. Test with **ReadOnly** persona for comprehensive read-only testing

---

## Step 8: Add Loading and Error States

Handle async permission checks and session restoration.

```typescript
export const InvoiceList: React.FC = () => {
  const { session, isLoading, error } = useAuthSession();
  const canView = useHasPermission(['feature:accounting-invoice']);

  if (isLoading) {
    return <div>Loading session...</div>;
  }

  if (error) {
    return <div>Error loading session: {error.message}</div>;
  }

  if (!canView) {
    return <div>Access denied</div>;
  }

  return (
    // Feature UI
  );
};
```

---

## Step 9: Document Permissions in Feature README

Create a `packages/accounting/FEATURE_ACCOUNTING_INVOICE.md` documenting required permissions.

```markdown
# Accounting Invoice Feature

## Overview

Invoice list, detail, edit, delete, and approval features for the Accounting module.

## Required Permissions

| Action | Permission | Role(s) |
|--------|-----------|---------|
| View Invoices | `feature:accounting-invoice`, `action:read` | AccountingUser, Executive, Administrator |
| Edit Invoice | `feature:accounting-invoice`, `action:write` | AccountingUser, Administrator |
| Delete Invoice | `feature:accounting-invoice`, `action:delete` | Administrator |
| Approve Invoice | `feature:accounting-invoice`, `action:approve` | AccountingUser, Administrator |

## Testing

Use DevToolbar to test with different personas:
- **AccountingUser**: Full access (view, edit, approve)
- **Executive**: Read-only access
- **Member**: No access (permission denied)
- **ReadOnly**: Read-only access across all actions

## Integration Guide

See `docs/how-to/developer/integrate-auth-with-your-feature.md`.
```

---

## Step 10: Verify in Production Build

Before deploying, verify that dev-mode code is excluded from production.

```bash
# Build for production
pnpm turbo run build

# Check that no auth/dev artifacts are in output
grep -r "DevAuthBypassAdapter" dist/ --include="*.js" # Should return empty
grep -r "PersonaRegistry" dist/ --include="*.js" # Should return empty
grep -r "import.meta.env.DEV" dist/ --include="*.js" # Dev guards should be optimized away

# Verify bundle sizes are as expected
ls -lh dist/accounting/ dist/auth/ dist/shell/
```

---

## Troubleshooting

### Issue: Permission checks always fail

**Solution:**
1. Verify feature is registered with `registerFeature()` before component renders
2. Check permission names match exactly: `feature:accounting-invoice` vs `accounting-invoice`
3. Switch to **Administrator** persona to test if it's a permission definition issue
4. Check browser console for auth warnings

### Issue: DevToolbar doesn't appear

**Solution:**
1. DevToolbar only appears in dev mode (`import.meta.env.DEV`)
2. Run `pnpm dev` (not production build)
3. Check browser DevTools Console for errors
4. Ensure auth package imports are correct

### Issue: Persona switch doesn't update feature access

**Solution:**
1. Component must use `useAuthSession()` to subscribe to session changes
2. Use `useHasPermission()` hook instead of static permission checks
3. Restart dev server if persona selection doesn't take effect
4. Clear sessionStorage: DevToolbar > Settings > "Clear SessionStorage"

### Issue: Feature works locally but fails in production

**Solution:**
1. Verify `import.meta.env.DEV` guards exist and work correctly
2. Check that permissions are registered in production (not dev-only)
3. Verify auth adapter is configured to use production auth provider
4. Test with disabled JavaScript to catch static rendering issues

---

## Next Steps

- Explore `docs/reference/auth/permissions.md` for complete permission reference
- Review `docs/architecture/adr/ADR-PH5C-01-dev-auth-bypass.md` for architecture decisions
- Check other feature integrations in `packages/accounting`, `packages/estimating`, etc.

---

**End of Developer How-To Guide**
```

---

## Recommended Implementation Sequence

1. PH5C.1 – Vitest Fix
2. PH5C.2 – MockAuthAdapter Upgrade
3. PH5C.3 – PersonaRegistry
4. PH5C.4 – DevToolbar
5. PH5C.5 – Developer How-To Guide (this task)
6. PH5C.6 – End-User How-To Guide
7. PH5C.7 – Administrator How-To Guide
8. PH5C.8 – Alignment Markers
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

## 5.C.5 Success Criteria Checklist (Task 5C.5)

- [ ] 5.C.5.1 `docs/how-to/developer/integrate-auth-with-your-feature.md` created
- [ ] 5.C.5.2 Guide includes 10 numbered steps (create module through verify build)
- [ ] 5.C.5.3 Worked example: Accounting Invoice List with full feature integration
- [ ] 5.C.5.4 Code blocks are copy-paste ready with comments explaining decisions
- [ ] 5.C.5.5 Guide covers hooks: useAuthSession, useHasPermission
- [ ] 5.C.5.6 Guide covers components: AuthGuard, withFeatureAuth HOC
- [ ] 5.C.5.7 Testing section explains DevToolbar persona switching
- [ ] 5.C.5.8 Troubleshooting section covers 4+ common issues
- [ ] 5.C.5.9 Document follows Diátaxis how-to format and is goal-oriented
- [ ] 5.C.5.10 File is properly formatted, readable, and actionable

---

## Phase 5.C.5 Progress Notes

- 5.C.5.1 [PENDING] — Guide creation with 10 numbered steps
- 5.C.5.2 [PENDING] — Worked example implementation
- 5.C.5.3 [PENDING] — Testing and troubleshooting sections

### Verification Evidence

- `docs/how-to/developer/integrate-auth-with-your-feature.md` exists and is complete - [PENDING]
- Guide includes worked example (Accounting Invoice List) - [PENDING]
- All code examples are tested and verified - [PENDING]
- File follows Diátaxis how-to structure - [PENDING]

---

**End of Task PH5C.5**

<!-- IMPLEMENTATION PROGRESS & NOTES
Task PH5C.5 created: 2026-03-07
Developer integration how-to guide specification complete with worked example.
Next: PH5C.6 (End-User How-To Guide)
-->
