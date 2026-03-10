# SF10-T09 — Testing Strategy and Deployment: `@hbc/notification-intelligence`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-10-Shared-Feature-Notification-Intelligence.md`
**Decisions Applied:** All D-01 through D-10
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T01–T08

> **Doc Classification:** Canonical Normative Plan — SF10-T09 testing/deployment task; sub-plan of `SF10-Notification-Intelligence.md`.

---

## Objective

Implement the `@hbc/notification-intelligence/testing` sub-path with canonical fixtures and state factories. Write unit tests for the registry, API layer, hooks, and all four components. Write Playwright E2E scenarios covering the full notification lifecycle. Gate all mechanical enforcement checks, produce ADR-0099, and publish the developer adoption guide and API reference.

---

## 3-Line Plan

1. Implement the `testing/` sub-path: `createMockNotification`, `createMockNotificationPreferences`, `createMockNotificationRegistration`, `mockNotificationTiers`, `mockNotificationChannels`.
2. Write unit tests for `NotificationRegistry`, `NotificationApi`, `PreferencesApi`, all three hooks, and all four components; produce Storybook stories; write 3 Playwright E2E scenarios.
3. Run all four mechanical enforcement gates, create ADR-0099, and publish `docs/how-to/developer/notification-intelligence-adoption-guide.md` and `docs/reference/notification-intelligence/api.md`.

---

## Testing Sub-Path: `testing/`

### `testing/createMockNotification.ts`

```typescript
import type { INotificationEvent, NotificationTier } from '../src/types/INotification';

let _idCounter = 1;

export function createMockNotification(
  overrides: Partial<INotificationEvent> = {}
): INotificationEvent {
  const id = String(_idCounter++);
  const tier: NotificationTier = overrides.computedTier ?? 'watch';
  return {
    id,
    eventType: 'test.event',
    sourceModule: 'test-module',
    sourceRecordType: 'test-record',
    sourceRecordId: `record-${id}`,
    recipientUserId: 'user-001',
    computedTier: tier,
    userTierOverride: null,
    effectiveTier: tier,
    title: `Test notification ${id}`,
    body: `This is the body of test notification ${id}.`,
    actionUrl: `/test/records/${id}`,
    actionLabel: 'View',
    createdAt: new Date().toISOString(),
    readAt: null,
    dismissedAt: null,
    ...overrides,
  };
}
```

### `testing/createMockNotificationPreferences.ts`

```typescript
import type { INotificationPreferences } from '../src/types/INotification';

export function createMockNotificationPreferences(
  overrides: Partial<INotificationPreferences> = {}
): INotificationPreferences {
  return {
    userId: 'user-001',
    tierOverrides: {},
    pushEnabled: false,
    digestDay: 0,   // Sunday
    digestHour: 8,  // 08:00
    ...overrides,
  };
}
```

### `testing/createMockNotificationRegistration.ts`

```typescript
import type { INotificationRegistration, NotificationTier } from '../src/types/INotification';

export function createMockNotificationRegistration(
  overrides: Partial<INotificationRegistration> = {}
): INotificationRegistration {
  return {
    eventType: 'mock.event',
    defaultTier: 'watch' as NotificationTier,
    description: 'Mock notification event for testing',
    tierOverridable: true,
    channels: ['in-app'],
    ...overrides,
  };
}
```

### `testing/mockNotificationTiers.ts`

```typescript
import type { NotificationTier } from '../src/types/INotification';

export const mockNotificationTiers: NotificationTier[] = [
  'immediate',
  'watch',
  'digest',
];
```

### `testing/mockNotificationChannels.ts`

```typescript
import type { NotificationChannel } from '../src/types/INotification';

export const mockNotificationChannels: NotificationChannel[] = [
  'push',
  'email',
  'in-app',
  'digest-email',
];
```

---

## Unit Test Coverage Plan

### Registry (`NotificationRegistry.test.ts`) — T03 provides full tests
Key coverage: successful registration, duplicate key error, getAll ordering, getByEventType miss, getByModule prefix filtering, object immutability.

### API Layer (`NotificationApi.test.ts`, `PreferencesApi.test.ts`) — T04 provides core tests
Key additional coverage: `getCenter` query string construction for all filter combinations; `markAllRead` with all tier options; `updatePreferences` PATCH body construction; error handling on non-OK responses.

### Hooks (`useNotificationCenter.test.ts`, `useNotificationBadge.test.ts`, `useNotificationPreferences.test.ts`)

```typescript
// Example: useNotificationBadge test outline
describe('useNotificationBadge', () => {
  it('returns 0 immediateUnreadCount when no notifications', async () => { ... });
  it('returns the immediateUnreadCount from the API response', async () => { ... });
  it('sets hasImmediateUnread true when count > 0', async () => { ... });
  it('sets hasImmediateUnread false when count === 0', async () => { ... });
  it('polls the API at 60-second intervals', async () => { ... });
});
```

### Components

```typescript
// HbcNotificationBadge tests
describe('HbcNotificationBadge', () => {
  it('renders null in Essential complexity mode', () => { ... });
  it('renders bell icon in Standard mode', () => { ... });
  it('shows red badge when immediateUnreadCount > 0', () => { ... });
  it('shows grey badge when only Watch items are unread', () => { ... });
  it('shows "99+" when count exceeds 99', () => { ... });
  it('calls onClick when clicked', () => { ... });
});

// HbcNotificationCenter tests
describe('HbcNotificationCenter', () => {
  it('renders null in Essential mode', () => { ... });
  it('renders all four tier tabs', () => { ... });
  it('filters to Immediate tab on click', () => { ... });
  it('shows empty state when items array is empty', () => { ... });
  it('renders notification cards for returned items', () => { ... });
  it('marks notification read on action CTA click', () => { ... });
  it('dismisses notification on dismiss button click', () => { ... });
});

// HbcNotificationBanner tests
describe('HbcNotificationBanner', () => {
  it('renders null in Essential mode', () => { ... });
  it('renders null when notification is null', () => { ... });
  it('renders null for Watch-tier notifications', () => { ... });
  it('renders for Immediate-tier notifications in Standard mode', () => { ... });
  it('auto-dismisses after 30 seconds', async () => { vi.useFakeTimers(); ... });
  it('cancels auto-dismiss on action CTA click', async () => { ... });
  it('calls onDismiss with the notification ID', () => { ... });
});

// HbcNotificationPreferences tests
describe('HbcNotificationPreferences', () => {
  it('renders null in Standard mode', () => { ... });
  it('renders event type list grouped by module in Expert mode', () => { ... });
  it('disables tier selector for non-overridable event types', () => { ... });
  it('calls updatePreferences on tier change', () => { ... });
  it('hides push toggle in SPFx context', () => { ... });
});
```

---

## E2E Scenarios (Playwright)

### E2E-01: BIC Transfer → Immediate Notification → In-App Center

```
Given a BIC transfer is submitted for user A
When the Azure Functions event processor runs
Then user A's notification center shows an Immediate notification
And the badge count increments by 1
And clicking "View" navigates to the source record
```

### E2E-02: Digest Tier → Weekly Digest Email

```
Given a version.created event is fired for user B
And user B's digestDay is the current day and digestHour is the current hour
When the SendDigestEmail timer function runs
Then user B receives a digest email containing the version.created event
And the in-app notification center shows the item in the Digest tab
```

### E2E-03: User Overrides Watch → Immediate

```
Given user C has a tier override for 'annotation.created' set to 'immediate'
When an annotation.created event is fired for user C
Then the ProcessNotification function routes to push + email + in-app channels
And the effectiveTier stored in HbcNotifications is 'immediate' (not 'watch')
```

---

## Documentation Checklist

Wave 4 — Documentation and governance closure (all items required before SF10 is considered complete):

- [ ] **ADR-0099** — `docs/architecture/adr/0099-notification-intelligence-tiered-model.md` written and accepted
- [ ] **Adoption guide** — `docs/how-to/developer/notification-intelligence-adoption-guide.md` written for module integration
- [ ] **API reference** — `docs/reference/notification-intelligence/api.md` documenting all exported types, API methods, hooks, and components
- [ ] **Package README** — `packages/notification-intelligence/README.md` written with quickstart and registry pattern
- [ ] **ADR Index** — `docs/README.md` updated with ADR-0099 row
- [ ] **Current-state-map** — `current-state-map.md §2` updated with SF10 task file rows

---

## Package README: `packages/notification-intelligence/README.md`

```markdown
# `@hbc/notification-intelligence`

Priority-tiered smart notification system for HB Intel.

**ADR:** ADR-0099 | **Phase:** SF10 | **Priority:** P1 Foundation

## Overview

Solves notification fatigue in construction management platforms via a three-tier model:
- **Immediate** — Push + email + in-app. Non-downgradable. Action required within 24h.
- **Watch** — In-app + optional daily email. Situation awareness.
- **Digest** — Weekly email + in-app archive. Informational roll-up.

## Quick Start: Registering Event Types

In your package initialization file, register all notification events:

```typescript
import { NotificationRegistry } from '@hbc/notification-intelligence';

NotificationRegistry.register([
  {
    eventType: 'mymodule.action-required',
    defaultTier: 'immediate',
    description: 'An action is required in My Module',
    tierOverridable: false,
    channels: ['push', 'email', 'in-app'],
  },
]);
```

## Sending a Notification

```typescript
import { NotificationApi } from '@hbc/notification-intelligence';

await NotificationApi.send({
  eventType: 'mymodule.action-required',
  sourceModule: 'my-module',
  sourceRecordType: 'my-record',
  sourceRecordId: record.id,
  recipientUserId: user.userId,
  title: 'Action Required — My Module',
  body: 'Please review this item.',
  actionUrl: `/my-module/records/${record.id}`,
  actionLabel: 'Review Now',
});
```

## Components

| Component | Complexity | Description |
|-----------|-----------|-------------|
| `HbcNotificationCenter` | Standard+ | Full panel: tab bar (All/Immediate/Watch/Digest) |
| `HbcNotificationBadge` | Standard+ | Header bell with Immediate unread count |
| `HbcNotificationBanner` | Standard+ | Immediate-tier in-page dismissible alert |
| `HbcNotificationPreferences` | Expert | Event type overrides + digest settings |

## Hooks

| Hook | Description |
|------|-------------|
| `useNotificationCenter(filter?)` | Paginated center items with mutations |
| `useNotificationBadge()` | Immediate unread count with 60s polling |
| `useNotificationPreferences()` | Get/update user preferences |

## SPFx Constraints

Push notifications require a PWA service worker — unavailable in SPFx context.
SPFx users receive email + in-app notifications only.
`HbcNotificationBadge` and `HbcNotificationCenter` are SPFx-compatible via Application Customizer.

## Testing Sub-Path

```typescript
import {
  createMockNotification,
  createMockNotificationPreferences,
  createMockNotificationRegistration,
  mockNotificationTiers,
} from '@hbc/notification-intelligence/testing';
```

## See Also

- `docs/architecture/adr/0096-notification-intelligence-tiered-model.md`
- `docs/how-to/developer/notification-intelligence-adoption-guide.md`
- `docs/reference/notification-intelligence/api.md`
```

---

## ADR Index Update

Add the following row to the ADR index table in `docs/README.md`. Insert in numeric order after ADR-0095:

```markdown
| [ADR-0099](architecture/adr/0099-notification-intelligence-tiered-model.md) | Notification Intelligence Tiered Model | Accepted | 2026-03-10 |
```

---

## Blueprint Progress Comment

After all acceptance criteria are met, add this comment block to `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md`:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
SF10 completed: {DATE}
@hbc/notification-intelligence — priority-tiered smart notification system.
Three-tier model (Immediate/Watch/Digest); NotificationRegistry singleton; Azure Functions event processor.
Push: Azure Notification Hubs. Email: SendGrid. In-app: HbcNotifications SharePoint list.
Components: HbcNotificationCenter, HbcNotificationBadge, HbcNotificationBanner, HbcNotificationPreferences.
Hooks: useNotificationCenter, useNotificationBadge, useNotificationPreferences.
ADR created: docs/architecture/adr/0096-notification-intelligence-tiered-model.md
All four mechanical enforcement gates passed.
current-state-map.md §2 updated: SF10 rows added.
Next: platform modules register event types; SF10 enables module-level notification integration.
-->
```

---

## Verification Commands

```bash
# ── Documentation Deliverables ────────────────────────────────────────────────

# 1. Confirm ADR file exists
test -f docs/architecture/adr/0099-notification-intelligence-tiered-model.md \
  && echo "ADR-0099 OK" || echo "ADR-0099 MISSING"

# 2. Confirm ADR-0099 row is in the ADR index
grep -c "ADR-0099" docs/README.md
# Expected: 1

# 3. Confirm package README exists
test -f packages/notification-intelligence/README.md \
  && echo "README OK" || echo "README MISSING"

# 4. Confirm adoption guide exists
test -f docs/how-to/developer/notification-intelligence-adoption-guide.md \
  && echo "Adoption guide OK" || echo "MISSING"

# ── Mechanical Enforcement Gates (CLAUDE.md §6.3.3) ───────────────────────────

pnpm turbo run build
pnpm turbo run lint
pnpm turbo run check-types
pnpm turbo run test \
  --filter=@hbc/auth-core \
  --filter=@hbc/shell \
  --filter=@hbc/ui-kit \
  --filter=@hbc/shared-kernel \
  --filter=@hbc/app-types

# ── Package-Specific Tests ────────────────────────────────────────────────────

pnpm --filter @hbc/notification-intelligence test
# Expected: all tests pass; branches: 95 maintained

# ── Coverage Check ────────────────────────────────────────────────────────────

pnpm --filter @hbc/notification-intelligence test --coverage
# Expected: lines ≥95, branches ≥95, functions ≥95, statements ≥95
```

---

<!-- IMPLEMENTATION PROGRESS & NOTES
SF10-T09 not yet started.
Depends on: T01 (scaffold), T02 (contracts), T03 (registry), T04 (API),
            T05 (hooks), T06 (core components), T07 (interaction components), T08 (backend).
Next: All tasks complete → record Blueprint Progress Comment → SF10 closed.
-->
