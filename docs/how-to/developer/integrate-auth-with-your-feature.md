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

## Tier-1 Platform Primitives: Mandatory Use

If your feature's concern area overlaps with any Tier-1 Platform Primitive, you **must** consume the primitive package. Reimplementing the same capability is prohibited.

| Primitive | Concern Area | Package | ADR |
|-----------|-------------|---------|-----|
| BIC Next Move | Ball-in-court / ownership tracking | `@hbc/bic-next-move` | [ADR-0080](../../architecture/adr/ADR-0080-bic-next-move-platform-primitive.md) |
| Complexity Dial | UI density adaptation | `@hbc/complexity` | [ADR-0081](../../architecture/adr/ADR-0081-complexity-dial-platform-primitive.md) |
| SharePoint Docs | Document lifecycle management | `@hbc/sharepoint-docs` | [ADR-0082](../../architecture/adr/ADR-0082-sharepoint-docs-pre-provisioning-storage.md) |

Use the decision tree in the [Platform Primitives Registry](../../reference/platform-primitives.md) to determine if your feature must adopt a primitive. See also [ADR-0079](../../architecture/adr/ADR-0079-shared-feature-packages.md) for the shared-feature package policy.

---

## Next Steps

- Explore `docs/reference/auth/permissions.md` for complete permission reference
- Review `docs/architecture/adr/ADR-PH5C-01-dev-auth-bypass.md` for architecture decisions
- Check other feature integrations in `packages/accounting`, `packages/estimating`, etc.

---

**End of Developer How-To Guide**
