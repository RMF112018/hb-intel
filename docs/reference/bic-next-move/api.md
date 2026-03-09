# `@hbc/bic-next-move` API Reference

**Package:** `@hbc/bic-next-move`
**Version:** 0.1.0
**Tier:** Tier-1 Platform Primitive
**ADR:** [ADR-0080](../../architecture/adr/ADR-0080-bic-next-move-platform-primitive.md)
**Audience:** Developers, Feature Authors

---

## Platform Ownership Vocabulary

The following 10 terms form the canonical vocabulary for all ownership-related semantics in HB Intel. All modules must use these terms consistently.

| Term | Definition | Resolved By |
|------|-----------|-------------|
| **Current Owner** | The person who holds the ball right now — the human accountable for the next action | `resolveCurrentOwner(item)` |
| **Next Move** | The pending action the current owner must take to advance the item | `resolveExpectedAction(item)` |
| **Expected Action** | Plain-language description of what the current owner needs to do | `resolveExpectedAction(item)` |
| **Previous Owner** | The person who held the ball before the current owner | `resolvePreviousOwner(item)` |
| **Next Owner** | The person who will receive the ball after the current owner acts | `resolveNextOwner(item)` |
| **Escalation Owner** | The person notified if the current owner does not act by the due date | `resolveEscalationOwner(item)` |
| **Blocked** | A boolean state indicating the item cannot advance due to an external dependency | `resolveIsBlocked(item)` |
| **Unassigned** | The state when `currentOwner` is `null` — renders `Unassigned` amber warning; urgency forced to `immediate` (D-04) | `resolveCurrentOwner(item) => null` |
| **Urgency Tier** | Computed priority: `upcoming`, `watch`, or `immediate` — based on due date proximity and blocked/unassigned state | `computeUrgencyTier()` + D-04 null-owner override |
| **Transfer History** | Ordered list of ownership transfers showing who passed the ball to whom and when | `resolveTransferHistory(item)` (optional) |

---

## Types

### `BicOwnershipModel`

```typescript
type BicOwnershipModel = 'direct-assignee' | 'workflow-state-derived';
```

- `'direct-assignee'` — Owner is an explicit assignee field on the item.
- `'workflow-state-derived'` — Owner is computed from the item's workflow state.

### `BicUrgencyTier`

```typescript
type BicUrgencyTier = 'immediate' | 'watch' | 'upcoming';
```

### `BicComplexityVariant`

```typescript
type BicComplexityVariant = 'essential' | 'standard' | 'expert';
```

### `IBicOwner`

```typescript
interface IBicOwner {
  userId: string;        // Azure AD user object ID
  displayName: string;
  role: string;          // Role title within item context (e.g. "BD Manager")
  groupContext?: string; // Optional group shown in Expert mode (e.g. "Estimating Department")
}
```

### `IBicTransfer`

```typescript
interface IBicTransfer {
  fromOwner: IBicOwner | null;
  toOwner: IBicOwner;
  transferredAt: string;  // ISO 8601 timestamp
  action: string;         // Plain-language trigger (e.g. "Submitted for Director Review")
}
```

### `IBicUrgencyThresholds`

```typescript
interface IBicUrgencyThresholds {
  watchThresholdDays?: number;      // Default: 3 business days
  immediateThresholdDays?: number;  // Default: null (overdue/today only)
}
```

### `IBicNextMoveConfig<T>`

The core configuration contract. One instance per item type.

```typescript
interface IBicNextMoveConfig<T> {
  ownershipModel: BicOwnershipModel;

  // 8 required resolvers
  resolveCurrentOwner: (item: T) => IBicOwner | null;
  resolveExpectedAction: (item: T) => string;
  resolveDueDate: (item: T) => string | null;
  resolveIsBlocked: (item: T) => boolean;
  resolveBlockedReason: (item: T) => string | null;
  resolvePreviousOwner: (item: T) => IBicOwner | null;
  resolveNextOwner: (item: T) => IBicOwner | null;
  resolveEscalationOwner: (item: T) => IBicOwner | null;

  // 2 optional resolvers
  resolveTransferHistory?: (item: T) => IBicTransfer[];  // D-08
  urgencyThresholds?: IBicUrgencyThresholds;              // D-01
}
```

### `IBicNextMoveState`

Output of `useBicNextMove` and `resolveFullBicState`.

```typescript
interface IBicNextMoveState {
  currentOwner: IBicOwner | null;
  expectedAction: string;
  dueDate: string | null;
  isOverdue: boolean;
  isBlocked: boolean;
  blockedReason: string | null;
  previousOwner: IBicOwner | null;
  nextOwner: IBicOwner | null;
  escalationOwner: IBicOwner | null;
  transferHistory: IBicTransfer[];
  urgencyTier: BicUrgencyTier;
}
```

### `IBicRegisteredItem`

Represents a single item in the cross-module registry.

```typescript
interface IBicRegisteredItem {
  itemKey: string;        // Globally unique, e.g. "bd-scorecard::a1b2c3"
  moduleKey: string;      // Registry key, e.g. "bd-scorecard"
  moduleLabel: string;    // Human-readable label
  state: IBicNextMoveState;
  href: string;           // Detail page navigation href
  title: string;          // Display title
}
```

### `IBicModuleRegistration`

Registration payload for `registerBicModule()`.

```typescript
interface IBicModuleRegistration {
  key: string;   // Must match a key in BIC_MODULE_MANIFEST
  label: string; // Human-readable label for dev-mode warnings
  queryFn: (userId: string) => Promise<IBicRegisteredItem[]>;
}
```

### `IBicMyItemsResult`

Return type of `useBicMyItems`.

```typescript
interface IBicMyItemsResult {
  items: IBicRegisteredItem[];
  failedModules: string[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}
```

---

## Hooks

### `useBicNextMove(item, config, options?)`

Resolves full BIC state for a single item with TanStack Query caching.

```typescript
function useBicNextMove<T>(
  item: T,
  config: IBicNextMoveConfig<T>,
  options?: { refetchInterval?: number }
): { state: IBicNextMoveState; isLoading: boolean; isError: boolean };
```

**Behavior:**
- Calls `resolveFullBicState(item, config)` to compute `IBicNextMoveState`.
- Stale time: 60 seconds (`BIC_STALE_TIME_SINGLE_ITEM_MS`).
- Performs hook-level diff detection on `currentOwner` changes between renders — fires `recordBicTransfer()` automatically when ownership changes (D-03).
- Forces `urgencyTier` to `'immediate'` when `currentOwner` is `null` (D-04).

### `useBicMyItems(options?)`

Cross-module aggregation of all items owned by the current user.

```typescript
function useBicMyItems(
  options?: { refetchInterval?: number }
): IBicMyItemsResult;
```

**Behavior:**
- Routes through `BIC_AGGREGATION_MODE`: `'client'` uses `executeBicFanOut()` (Promise.allSettled across all registered modules); `'server'` calls `executeServerAggregation()`.
- Stale time: 3 minutes (`BIC_STALE_TIME_MY_ITEMS_MS`).
- Refetches on window focus.
- Partial results: failed modules are reported in `failedModules` — successful modules still return their items.

### `resolveFullBicState(item, config)`

Pure function (no hooks). Exported for use in module `queryFn` implementations.

```typescript
function resolveFullBicState<T>(
  item: T,
  config: IBicNextMoveConfig<T>
): IBicNextMoveState;
```

---

## Components

### Complexity Tier Rendering Matrix

| Component | Essential | Standard | Expert |
|-----------|-----------|----------|--------|
| `HbcBicBadge` | Avatar + name only | Avatar + name + urgency dot | Avatar + name + urgency dot + action text (truncated 40 chars) |
| `HbcBicDetail` | Current owner + expected action | + due date + blocked banner if blocked | + previous owner + next owner + escalation owner + collapsible transfer history (D-08) |
| `HbcBicBlockedBanner` | Reason text only | Reason text + blocked-by link (D-09) | Reason text + blocked-by link + escalation path |

### `HbcBicBadge<T>`

Compact badge for list rows.

```tsx
interface HbcBicBadgeProps<T> {
  item: T;
  config: IBicNextMoveConfig<T>;
  forceVariant?: BicComplexityVariant;  // Overrides global complexity tier
}

<HbcBicBadge item={myItem} config={myConfig} />
<HbcBicBadge item={myItem} config={myConfig} forceVariant="essential" />  // SPFx narrow column
```

**Behavior:**
- Renders `Unassigned` amber warning when `currentOwner` is `null` (D-04).
- Reads complexity context via `@hbc/ui-kit/app-shell` for SPFx bundle compliance.
- `forceVariant` overrides the user's global complexity setting for this instance.

### `HbcBicDetail<T>`

Full ownership detail panel.

```tsx
interface HbcBicDetailProps<T> {
  item: T;
  config: IBicNextMoveConfig<T>;
  showChain?: boolean;        // Show ownership chain (previous → current → next)
  onNavigate?: (href: string) => void;  // Router callback for blocked-by items (D-09)
  blockedByItem?: { href: string; title: string };
  forceVariant?: BicComplexityVariant;
}

<HbcBicDetail item={myItem} config={myConfig} showChain onNavigate={(href) => router.navigate({ to: href })} />
```

**Behavior:**
- Expert mode renders collapsible "Full Ownership History" when `resolveTransferHistory` is present (D-08).
- Prominent `Unassigned` callout when owner is null (D-04).

### `HbcBicBlockedBanner`

Blocked state banner with cross-module navigation.

```tsx
interface HbcBicBlockedBannerProps {
  reason: string;
  blockedByHref?: string;
  blockedByTitle?: string;
  onNavigate?: (href: string) => void;  // Router-agnostic callback (D-09)
  escalationOwner?: IBicOwner;
  forceVariant?: BicComplexityVariant;
}

<HbcBicBlockedBanner reason="Waiting for permit approval" blockedByHref="/permits/123" onNavigate={navigate} />
```

**Behavior:**
- Uses `onNavigate` callback for SPA navigation when provided; falls back to plain `<a>` anchor (D-09).
- Dev-mode warning when `onNavigate` is missing and `href` is a relative PWA path.

---

## Registry

### `registerBicModule(registration)`

Called at module bootstrap to register a BIC-aware module.

```typescript
function registerBicModule(registration: IBicModuleRegistration): void;
```

**Dev-mode manifest guard (D-02):**
- Warns if `registration.key` is not in `BIC_MODULE_MANIFEST` (likely typo).
- After `BIC_MANIFEST_GUARD_DELAY_MS` (5 seconds), warns about manifest keys that never registered (forgotten bootstrap call).

### `BIC_MODULE_MANIFEST`

Typed list of all expected module registration keys.

```typescript
const BIC_MODULE_MANIFEST = [
  'bd-scorecard',
  'bd-department-sections',
  'estimating-pursuit',
  'estimating-kickoff',
  'project-hub-pmp',
  'project-hub-turnover',
  'project-hub-constraints',
  'project-hub-permits',
  'project-hub-monthly-review',
  'admin-provisioning',
] as const;

type BicModuleKey = typeof BIC_MODULE_MANIFEST[number];
```

### `executeBicFanOut(userId)`

Internal function used by `useBicMyItems` when `BIC_AGGREGATION_MODE === 'client'`. Calls each registered module's `queryFn` via `Promise.allSettled` and merges results.

---

## Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `BIC_AGGREGATION_MODE` | `'client'` (default) | Controls client vs. server aggregation for `useBicMyItems` (D-06) |
| `BIC_STALE_TIME_SINGLE_ITEM_MS` | `60_000` | TanStack Query stale time for `useBicNextMove` (D-07) |
| `BIC_STALE_TIME_MY_ITEMS_MS` | `180_000` | TanStack Query stale time for `useBicMyItems` (D-07) |
| `BIC_REFETCH_INTERVAL_IMMEDIATE_MS` | `45_000` | Polling interval for `immediate`-tier items — passed by consumer (D-07) |
| `BIC_TRANSFER_DEDUP_BUCKET_MS` | `60_000` | Deduplication window for transfer events (D-03) |
| `BIC_MANIFEST_GUARD_DELAY_MS` | `5_000` | Delay before dev-mode guard warns about missing registrations |
| `BIC_DEFAULT_WATCH_THRESHOLD_DAYS` | `3` | Default business days for `upcoming` → `watch` transition (D-01) |
| `BIC_DEFAULT_IMMEDIATE_THRESHOLD_DAYS` | `null` | Default immediate threshold — only overdue/today triggers `immediate` (D-01) |
| `BIC_TRANSFER_EVENT` | `'bic-transfer'` | DOM custom event name fired on transfer detection |

---

## Testing Sub-Path

**Import:** `@hbc/bic-next-move/testing`

Zero production bundle impact — the testing sub-path is excluded from the main entry point.

### `MockBicItem`

```typescript
interface MockBicItem {
  id: string;
  title: string;
  assignee: IBicOwner | null;
  pendingAction: string;
  dueDate: string | null;
  isBlocked: boolean;
  blockedReason: string | null;
}
```

### `createMockBicConfig(overrides?)`

```typescript
function createMockBicConfig(
  overrides?: Partial<IBicNextMoveConfig<MockBicItem>>
): IBicNextMoveConfig<MockBicItem>;
```

Returns a fully populated `IBicNextMoveConfig<MockBicItem>` with all 8 required resolvers mapped to `MockBicItem` fields.

### `mockBicStates`

```typescript
const mockBicStates: Record<string, IBicNextMoveState>;
```

7 canonical state fixtures:
- `upcoming` — normal state, due date far away
- `watch` — due date within 3 business days
- `immediate` — overdue or due today
- `overdue` — past due date
- `blocked` — item cannot advance
- `unassigned` — null owner, urgency forced to immediate
- `withFullChain` — complete ownership chain with transfer history

### `createMockBicOwner(overrides?)`

```typescript
function createMockBicOwner(
  overrides?: Partial<IBicOwner>
): IBicOwner;
```

---

## BIC Registration Standard

### Compliance Requirements

Any module with action-owning workflows **must** meet all of the following to be BIC-compliant:

1. **Registry call** — Must call `registerBicModule()` at bootstrap with a key from `BIC_MODULE_MANIFEST`.
2. **Full config** — Must implement `IBicNextMoveConfig<T>` with all 8 required resolvers.
3. **Unassigned handling** — Must handle null owner state (`resolveCurrentOwner` returning `null` renders `Unassigned` amber warning; urgency forced to `immediate`). Do not implement "fallback owner" patterns.
4. **Canonical urgency** — Must use platform urgency semantics via `computeUrgencyTier()` and config thresholds. Do not implement local urgency logic.
5. **Standard components** — Must use `HbcBicBadge` and `HbcBicDetail` for rendering. Do not build local ownership UI components.
6. **Transfer recording** — Must use `recordBicTransfer()` for explicit transfers. Do not build local transfer tracking.
7. **No shadow models** — No local reimplementation of ownership resolution, urgency calculation, or transfer detection without an ADR exception (see [Non-Duplication Rule](../platform-primitives.md#non-duplication-rule)).

### Exception Process

If a module genuinely cannot meet the BIC Registration Standard:

1. Draft an ADR in `docs/architecture/adr/` with technical rationale.
2. Reference [ADR-0080](../../architecture/adr/ADR-0080-bic-next-move-platform-primitive.md) and this document.
3. Get architecture owner approval.
4. Record the exception in the [BIC Adoption Detail](../platform-primitives.md#bic-adoption-detail) table.

---

## PH7.8 Readiness

**Test coverage:** 113 tests across 9 test files with >=95% coverage on all thresholds (lines: 99.06%, functions: 100%, branches: 95.77%, statements: 99.06%).

**Testing sub-path exports confirmed:** `MockBicItem`, `createMockBicConfig`, `mockBicStates`, `createMockBicOwner` are all exported from `@hbc/bic-next-move/testing` and available for PH7.8 root test governance integration.

**Coverage enforcement:** `vitest.config.ts` enforces >=95% thresholds on all four metrics. The testing sub-path, Storybook stories, and type files are excluded from coverage collection.

---

## See Also

- [How To: Add BIC Next Move to a New Module](../../how-to/developer/bic-module-adoption.md)
- [How To: Migrate BIC Aggregation to Server-Side](../../how-to/developer/bic-server-aggregation-migration.md)
- [Platform Primitives Registry](../platform-primitives.md)
- [ADR-0080 — BIC Next Move as Platform Primitive](../../architecture/adr/ADR-0080-bic-next-move-platform-primitive.md)
- [`packages/bic-next-move/README.md`](../../../packages/bic-next-move/README.md)
