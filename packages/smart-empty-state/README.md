# @hbc/smart-empty-state

Context-aware empty state classification and guided onboarding for HB Intel modules.

## Overview

This Tier 2 shared-feature package provides intelligent empty state detection that distinguishes between five classification states using D-01 precedence order. It delivers contextual onboarding guidance, actions, and complexity-aware coaching tips appropriate to each classification.

## Classification Model (D-01)

States are evaluated in strict precedence order — the first matching condition wins:

| Priority | Classification | Condition | Description |
|----------|---------------|-----------|-------------|
| 1 | `loading-failed` | `isLoadError === true` | Data fetch or API failure |
| 2 | `permission-empty` | `hasPermission === false` | User lacks access rights |
| 3 | `filter-empty` | `hasActiveFilters === true` | Filters exclude all results |
| 4 | `first-use` | `isFirstVisit === true` | User's first visit to this view |
| 5 | `truly-empty` | *(default)* | No data exists |

## Quick Start

Define a resolver config for your module:

```typescript
import type { ISmartEmptyStateConfig, IEmptyStateContext, IEmptyStateConfig } from '@hbc/smart-empty-state';

export const myModuleConfig: ISmartEmptyStateConfig = {
  resolve(context: IEmptyStateContext): IEmptyStateConfig {
    if (context.isLoadError) {
      return { module: context.module, view: context.view, classification: 'loading-failed',
        heading: 'Unable to load', description: 'Please try again.' };
    }
    // ... handle each classification per D-01 precedence
    return { module: context.module, view: context.view, classification: 'truly-empty',
      heading: 'No records', description: 'Create your first record.' };
  },
};
```

Render in your view:

```tsx
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';

<HbcSmartEmptyState config={myModuleConfig} context={context} variant="full-page" />
```

## Complexity Behavior (D-05)

| Tier | Coaching Tip Behavior |
|------|----------------------|
| **Essential** | Displayed inline as visible text |
| **Standard** | Collapsed behind disclosure ("Need help getting started?") |
| **Expert** | Hidden entirely |

## Storage Adapter (D-04)

Visit tracking uses `localStorage` by default with key format:
```
hbc::empty-state::visited::{module}::{view}
```

When storage is unavailable, falls back to an in-memory `Set`. Custom adapters can be injected via `IEmptyStateVisitStore`. The `noopVisitStore` export always reports not-visited.

## Exports

| Entry Point | Description |
|-------------|-------------|
| `@hbc/smart-empty-state` | Main barrel — types, constants, classification, hooks, components |
| `@hbc/smart-empty-state/testing` | Test fixtures and factories for consumer packages |

### Main Exports

| Export | Type | Description |
|--------|------|-------------|
| `EmptyStateClassification` | Type | Union of 5 classification values |
| `EmptyStateVariant` | Type | `'full-page' \| 'inline'` |
| `ISmartEmptyStateConfig` | Interface | Module resolver contract (D-02) |
| `IEmptyStateContext` | Interface | Classification input context |
| `IEmptyStateConfig` | Interface | Resolved content output |
| `IEmptyStateVisitStore` | Interface | Persistence adapter (D-04) |
| `classifyEmptyState` | Function | D-01 precedence classifier |
| `createEmptyStateVisitStore` | Function | Storage-backed visit store factory |
| `noopVisitStore` | Constant | No-op visit store |
| `useFirstVisit` | Hook | First-visit detection |
| `useEmptyState` | Hook | Combined classification + resolution |
| `HbcSmartEmptyState` | Component | Primary empty state renderer |
| `HbcEmptyStateIllustration` | Component | Classification-mapped illustration |

### Testing Sub-path

```ts
import {
  createMockEmptyStateContext,
  createMockEmptyStateConfig,
  mockEmptyStateClassifications,
} from '@hbc/smart-empty-state/testing';
```

## Architecture Boundaries

- **D-07 — SPFx Compatibility:** Uses `@hbc/ui-kit/icons` only; no external asset dependencies. Safe for app-shell contexts.
- **D-08 — Notification Boundary:** Zero imports from `@hbc/notification-intelligence`. No cross-package coupling.
- Feature packages import `@hbc/smart-empty-state` — never the reverse.

## Peer Dependencies

- `react` ^18.3.0
- `react-dom` ^18.3.0
- `@hbc/complexity` workspace:*
- `@hbc/ui-kit` workspace:*

## Scripts

```bash
pnpm --filter @hbc/smart-empty-state build        # Build
pnpm --filter @hbc/smart-empty-state check-types   # Type check
pnpm --filter @hbc/smart-empty-state test          # Run tests
pnpm --filter @hbc/smart-empty-state test:coverage # Run tests with coverage
pnpm --filter @hbc/smart-empty-state lint          # Lint
```

## References

- [ADR-0100 — Smart Empty State Platform Primitive](../../docs/architecture/adr/ADR-0100-smart-empty-state-platform-primitive.md)
- [Developer Adoption Guide](../../docs/how-to/developer/smart-empty-state-adoption-guide.md)
- [API Reference](../../docs/reference/smart-empty-state/api.md)
- [SF11 Master Plan](../../docs/architecture/plans/shared-features/SF11-Smart-Empty-State.md)
