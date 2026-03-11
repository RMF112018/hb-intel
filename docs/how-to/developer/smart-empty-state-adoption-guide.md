# How-To: Adopt `@hbc/smart-empty-state` in a Module

> **Doc Classification:** Living Reference (Diátaxis) — How-to quadrant; developer audience; smart-empty-state module adoption.

**Package:** `packages/smart-empty-state/`
**Locked ADR:** [ADR-0100](../../architecture/adr/ADR-0100-smart-empty-state-platform-primitive.md)

---

## 1. When to Use `@hbc/smart-empty-state`

Use this package whenever a list view, dashboard, or data panel can render in an "empty" state. The package classifies the reason for emptiness using D-01 precedence (`loading-failed > permission-empty > filter-empty > first-use > truly-empty`) and renders contextual guidance, actions, and coaching tips appropriate to each classification.

**Do not** use this package for:
- Skeleton/loading placeholders (use `@hbc/ui-kit` loading components)
- Error boundaries (use React error boundaries for unrecoverable errors)
- Non-data surfaces (e.g., settings pages with no empty concept)

---

## 2. Implementing `ISmartEmptyStateConfig.resolve(context)`

Each module provides a resolver that maps an `IEmptyStateContext` to an `IEmptyStateConfig`. The resolver is the single place where all copy, actions, and coaching tips are defined (D-02).

```typescript
import type { ISmartEmptyStateConfig, IEmptyStateContext, IEmptyStateConfig } from '@hbc/smart-empty-state';

export const myModuleEmptyStateConfig: ISmartEmptyStateConfig = {
  resolve(context: IEmptyStateContext): IEmptyStateConfig {
    // D-01 precedence is handled by classifyEmptyState — you provide content per classification
    switch (true) {
      case context.isLoadError:
        return {
          module: context.module,
          view: context.view,
          classification: 'loading-failed',
          heading: 'Unable to load data',
          description: 'Something went wrong while loading. Please try again.',
          primaryAction: { label: 'Retry', onClick: () => window.location.reload() },
        };

      case !context.hasPermission:
        return {
          module: context.module,
          view: context.view,
          classification: 'permission-empty',
          heading: 'Access restricted',
          description: 'You do not have permission to view this data.',
          coachingTip: 'Contact your administrator to request access.',
        };

      case context.hasActiveFilters:
        return {
          module: context.module,
          view: context.view,
          classification: 'filter-empty',
          heading: 'No matching results',
          description: 'Your current filters returned no data.',
          filterClearAction: { label: 'Clear filters', onClick: () => { /* clear filter logic */ } },
        };

      case context.isFirstVisit:
        return {
          module: context.module,
          view: context.view,
          classification: 'first-use',
          heading: 'Welcome to My Module',
          description: 'Get started by creating your first record.',
          primaryAction: { label: 'Create Record', href: '/my-module/new' },
          coachingTip: 'Records you create will appear in this list.',
        };

      default:
        return {
          module: context.module,
          view: context.view,
          classification: 'truly-empty',
          heading: 'No records yet',
          description: 'Create a new record to get started.',
          primaryAction: { label: 'Create Record', href: '/my-module/new' },
        };
    }
  },
};
```

---

## 3. Integrating `HbcSmartEmptyState` in a List or Dashboard View

Render the component when your data query returns zero results:

```tsx
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { IEmptyStateContext } from '@hbc/smart-empty-state';
import { myModuleEmptyStateConfig } from './myModuleEmptyStateConfig';

function MyModuleListView() {
  const { data, isError } = useMyDataQuery();
  const { hasPermission, role } = useCurrentUser();

  const context: IEmptyStateContext = {
    module: 'my-module',
    view: 'list',
    hasActiveFilters: hasActiveFilterState(),
    hasPermission,
    isFirstVisit: false, // managed by useFirstVisit hook internally
    currentUserRole: role,
    isLoadError: isError,
  };

  if (data && data.length > 0) {
    return <MyDataTable data={data} />;
  }

  return (
    <HbcSmartEmptyState
      config={myModuleEmptyStateConfig}
      context={context}
      variant="full-page"
      onActionFired={(label, classification) => {
        analytics.track('empty-state-action', { label, classification });
      }}
    />
  );
}
```

For inline panels (e.g., a sidebar widget), use `variant="inline"` (D-06).

---

## 4. First-Visit Persistence Strategies

By default, the `useFirstVisit` hook uses `createEmptyStateVisitStore()` which persists to `localStorage` with the key format `hbc::empty-state::visited::{module}::{view}` (D-04).

**Default behavior (no configuration needed):**
```tsx
// The HbcSmartEmptyState component handles first-visit internally
<HbcSmartEmptyState config={myConfig} context={context} />
```

**Custom storage adapter** (e.g., for SPFx or server-side persistence):
```typescript
import type { IEmptyStateVisitStore } from '@hbc/smart-empty-state';
import { createEmptyStateVisitStore, noopVisitStore } from '@hbc/smart-empty-state';

// Option A: Use sessionStorage instead of localStorage
const sessionStore = createEmptyStateVisitStore(window.sessionStorage);

// Option B: No-op store (always treats as first visit)
const alwaysFirstVisit = noopVisitStore;

// Option C: Custom adapter implementing IEmptyStateVisitStore
const customStore: IEmptyStateVisitStore = {
  hasVisited: (module, view) => myApiClient.checkVisited(module, view),
  markVisited: (module, view) => myApiClient.recordVisit(module, view),
};
```

When storage is unavailable or throws, the default store falls back to an in-memory `Set` — no runtime crash occurs (D-04).

---

## 5. Complexity-Specific Guidance Authoring

The `HbcSmartEmptyState` component adapts coaching tip display based on the user's complexity tier (D-05). Author your `coachingTip` strings accordingly:

| Tier | Coaching Tip Behavior | Authoring Guidance |
|------|----------------------|-------------------|
| **Essential** | Displayed inline as visible text | Write clear, beginner-friendly tips |
| **Standard** | Collapsed behind a disclosure ("Need help getting started?") | Write tips that add value when expanded |
| **Expert** | Hidden entirely | Tips are suppressed — no content needed |

Include a `coachingTip` in your `IEmptyStateConfig` return for `first-use` and `truly-empty` classifications. Omit it for `loading-failed` and `permission-empty` where coaching is not actionable.

---

## 6. Using `@hbc/smart-empty-state/testing` Fixtures

Import test utilities from the `/testing` sub-path (D-10). These are excluded from the production bundle:

```typescript
import {
  createMockEmptyStateContext,
  createMockEmptyStateConfig,
  mockEmptyStateClassifications,
} from '@hbc/smart-empty-state/testing';

// Create a mock context with defaults (module: 'estimating', view: 'pursuits', role: 'Estimator')
const context = createMockEmptyStateContext();

// Override specific fields
const filteredContext = createMockEmptyStateContext({ hasActiveFilters: true });

// Create a mock config (returns IEmptyStateConfig directly)
const config = createMockEmptyStateConfig();

// Access all 5 classification values for parameterized tests
mockEmptyStateClassifications.forEach((classification) => {
  it(`renders ${classification} state`, () => {
    const ctx = createMockEmptyStateContext();
    // ... test logic
  });
});
```

---

## References

- [ADR-0100 — Smart Empty State Platform Primitive](../../architecture/adr/ADR-0100-smart-empty-state-platform-primitive.md)
- [API Reference](../../reference/smart-empty-state/api.md)
- [SF11 Master Plan](../../architecture/plans/shared-features/SF11-Smart-Empty-State.md)
- [Package README](../../../packages/smart-empty-state/README.md)
