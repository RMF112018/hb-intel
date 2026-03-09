# @hbc/bic-next-move

**Version:** 0.1.0
**Status:** Tier-1 Platform Primitive
**Phase:** PH7.4 — Shared-Feature Tier-1 Normalization

---

## Purpose

`@hbc/bic-next-move` is the platform-wide accountability primitive that answers the single most critical question in construction management: **"Who owns the next move on this item?"**

Every actionable item in every HB Intel module — scorecards, pursuits, permit log entries, constraints, PMP approval cycles — renders BIC ownership state through this package. It extends Procore's Ball-In-Court concept beyond its per-tool inconsistency into a cross-platform primitive that no competitor currently provides.

Any feature that tracks ownership, accountability, or "who acts next" on actionable records **must** use this package.

---

## Concern Area

Ownership tracking, urgency tier calculation, transfer detection, cross-module item registry, blocked-state visibility.

---

## Installation

```bash
pnpm add @hbc/bic-next-move
```

### Peer Dependencies

- `react` ^18.3.0
- `react-dom` ^18.3.0

### Internal Dependencies

- `@hbc/ui-kit` — design system components
- `@tanstack/react-query` — data fetching and caching

---

## Quick Start

### 1. Register your module at bootstrap

```typescript
import { registerBicModule } from '@hbc/bic-next-move';

registerBicModule({
  key: 'bd-scorecard',                        // Must appear in BIC_MODULE_MANIFEST
  queryFn: async (userId: string) => items,   // Fetch BIC items for this user
  label: 'Go/No-Go Scorecards',              // Human label for dev-mode warnings
});
```

### 2. Resolve BIC state for an item

```tsx
import { useBicNextMove } from '@hbc/bic-next-move';

function MyItemRow({ item }: { item: MyItem }) {
  const bicState = useBicNextMove(item, myBicConfig);
  // bicState: { currentOwner, urgencyTier, isOverdue, isBlocked, ... }
  return <HbcBicBadge state={bicState} />;
}
```

### 3. Render BIC components

```tsx
import {
  HbcBicBadge,
  HbcBicDetail,
  HbcBicBlockedBanner,
} from '@hbc/bic-next-move';
```

### 4. Aggregate cross-module items

```tsx
import { useBicMyItems } from '@hbc/bic-next-move';

function MyWorkFeed() {
  const { items, isLoading, errors } = useBicMyItems(userId);
  // items: aggregated BIC items from all registered modules
}
```

---

## Public API

### Types

- `IBicNextMoveConfig<T>` — generic configuration contract (8 required resolvers + 2 optional)
- `IBicOwner` — owner identity shape
- `IBicNextMoveState` — resolved BIC state (urgencyTier, isOverdue, isBlocked, transferHistory)
- `IBicTransfer` — ownership transfer record

### Constants

- `urgencyThresholds` — default watch/immediate threshold configuration
- `manifest` / `BIC_MODULE_MANIFEST` — typed module key manifest
- `BIC_AGGREGATION_MODE` — client/server aggregation feature flag

### Registry

- `registerBicModule()` — register a domain module for cross-module aggregation
- `BicModuleRegistry` — module registry manager

### Hooks

- `useBicNextMove(item, config)` — resolve full BIC state for a single item
- `resolveFullBicState(item, config)` — pure function for BIC state resolution
- `useBicMyItems(userId)` — aggregate BIC items across all registered modules

### Transfer

- `recordBicTransfer(payload)` — explicitly record an ownership transfer
- `BIC_TRANSFER_EVENT` — DOM custom event name for transfer notifications
- `shouldFireTransfer(key)` — deduplication check

### Components

- `HbcBicBadge` — compact list-row badge showing owner + urgency (Essential/Standard/Expert tiers)
- `HbcBicDetail` — full ownership detail panel with transfer history (Expert mode)
- `HbcBicBlockedBanner` — blocked-state banner with navigation callback

---

## Testing

Import testing utilities from the `/testing` sub-path:

```typescript
import {
  MockBicItem,
  createMockBicConfig,
  mockBicStates,
  createMockBicOwner,
} from '@hbc/bic-next-move/testing';
```

These utilities have zero production bundle impact.

---

## Complexity Mode Integration

All three BIC components respect the Complexity Dial (`@hbc/complexity`):

| Component | Essential | Standard | Expert |
|-----------|-----------|----------|--------|
| `HbcBicBadge` | Avatar + name | + urgency dot | + action text |
| `HbcBicDetail` | Current owner + action | + due date + blocked | + transfer history |
| `HbcBicBlockedBanner` | Reason text | + blocked-by link | + escalation path |

Use `forceVariant` prop to override the user's global complexity setting per instance.

---

## Cross-References

- [Platform Primitives Registry](../../docs/reference/platform-primitives.md)
- [ADR-0080 — BIC Next Move as Platform Primitive](../../docs/architecture/adr/ADR-0080-bic-next-move-platform-primitive.md)
- [SF02 Master Plan](../../docs/architecture/plans/shared-features/SF02-BIC-Next-Move.md)
- [Current-State Architecture Map](../../docs/architecture/current-state-map.md) §3 Category C

<!-- PH7.4 — Package README created as part of Shared-Feature Tier-1 Normalization (§7.4.2) -->
