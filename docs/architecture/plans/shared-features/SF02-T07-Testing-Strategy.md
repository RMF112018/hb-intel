# SF02-T07 — Testing Strategy

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-02-Shared-Feature-BIC-Next-Move.md`
**Decisions Applied:** D-01 (urgency thresholds), D-03 (deduplication), D-04 (null owner), D-05 (complexity variants), D-08 (transfer history), D-09 (onNavigate), D-10 (testing sub-path)
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T01–T06

---

## Objective

Produce ≥95% unit test coverage across all hooks, registry, and transfer logic. Implement the `@hbc/bic-next-move/testing` sub-path (D-10) with canonical test fixtures for use by all consumer modules. Write Storybook stories for all three components in all canonical states. Define Playwright E2E scenarios.

---

## 3-Line Plan

1. Implement `testing/` sub-path — `MockBicItem`, `createMockBicConfig`, `mockBicStates`, `createMockBicOwner`.
2. Write Vitest unit tests for all core logic — urgency computation, registry guard, fan-out, deduplicator, component rendering.
3. Define Storybook stories for all 7 canonical states and Playwright E2E scenarios for all locked interview decisions.

---

## `testing/MockBicItem.ts`

```typescript
/**
 * Canonical mock item type for @hbc/bic-next-move testing (D-10).
 *
 * Designed to exercise all fields in IBicNextMoveConfig<T>.
 * Module authors import this to avoid reimplementing boilerplate.
 *
 * @example
 * import { MockBicItem, createMockBicConfig } from '@hbc/bic-next-move/testing';
 */
export interface MockBicItem {
  id: string;
  currentOwnerId: string | null;
  currentOwnerName: string | null;
  currentOwnerRole: string;
  previousOwnerId: string | null;
  previousOwnerName: string | null;
  nextOwnerId: string | null;
  nextOwnerName: string | null;
  escalationOwnerId: string | null;
  escalationOwnerName: string | null;
  expectedAction: string;
  dueDate: string | null;
  isBlocked: boolean;
  blockedReason: string | null;
  transferHistory: Array<{
    fromOwnerId: string | null;
    fromOwnerName: string | null;
    toOwnerId: string;
    toOwnerName: string;
    toOwnerRole: string;
    transferredAt: string;
    action: string;
  }>;
}
```

---

## `testing/createMockBicOwner.ts`

```typescript
import type { IBicOwner } from '../src/types/IBicNextMove';

/**
 * Creates a mock IBicOwner with sensible defaults (D-10).
 * Override any field as needed for specific test scenarios.
 *
 * @example
 * const owner = createMockBicOwner({ displayName: 'Jane Smith', role: 'Director' });
 */
export function createMockBicOwner(overrides?: Partial<IBicOwner>): IBicOwner {
  return {
    userId: 'mock-user-id-001',
    displayName: 'Mock Owner',
    role: 'Mock Role',
    groupContext: undefined,
    ...overrides,
  };
}
```

---

## `testing/createMockBicConfig.ts`

```typescript
import type { IBicNextMoveConfig, IBicOwner } from '../src/types/IBicNextMove';
import type { MockBicItem } from './MockBicItem';
import { createMockBicOwner } from './createMockBicOwner';

/**
 * Creates a complete IBicNextMoveConfig<MockBicItem> with sensible defaults (D-10).
 * All 8 resolver functions are implemented against MockBicItem fields.
 * Override any resolver for specific test scenarios.
 *
 * @example — Default config (all fields populated)
 * const config = createMockBicConfig();
 *
 * @example — Override specific resolvers
 * const config = createMockBicConfig({
 *   resolveIsBlocked: () => true,
 *   resolveBlockedReason: () => 'Waiting on signed drawings',
 * });
 *
 * @example — Config with transfer history
 * const config = createMockBicConfig({
 *   resolveTransferHistory: (item) => item.transferHistory.map(t => ({
 *     fromOwner: t.fromOwnerId ? createMockBicOwner({ userId: t.fromOwnerId, displayName: t.fromOwnerName! }) : null,
 *     toOwner: createMockBicOwner({ userId: t.toOwnerId, displayName: t.toOwnerName, role: t.toOwnerRole }),
 *     transferredAt: t.transferredAt,
 *     action: t.action,
 *   })),
 * });
 */
export function createMockBicConfig(
  overrides?: Partial<IBicNextMoveConfig<MockBicItem>>
): IBicNextMoveConfig<MockBicItem> {
  const defaultConfig: IBicNextMoveConfig<MockBicItem> = {
    ownershipModel: 'direct-assignee',

    resolveCurrentOwner: (item) => {
      if (!item.currentOwnerId || !item.currentOwnerName) return null;
      return createMockBicOwner({
        userId: item.currentOwnerId,
        displayName: item.currentOwnerName,
        role: item.currentOwnerRole,
      });
    },

    resolveExpectedAction: (item) => item.expectedAction,

    resolveDueDate: (item) => item.dueDate,

    resolveIsBlocked: (item) => item.isBlocked,

    resolveBlockedReason: (item) => item.blockedReason,

    resolvePreviousOwner: (item) => {
      if (!item.previousOwnerId || !item.previousOwnerName) return null;
      return createMockBicOwner({
        userId: item.previousOwnerId,
        displayName: item.previousOwnerName,
        role: 'Previous Role',
      });
    },

    resolveNextOwner: (item) => {
      if (!item.nextOwnerId || !item.nextOwnerName) return null;
      return createMockBicOwner({
        userId: item.nextOwnerId,
        displayName: item.nextOwnerName,
        role: 'Next Role',
      });
    },

    resolveEscalationOwner: (item) => {
      if (!item.escalationOwnerId || !item.escalationOwnerName) return null;
      return createMockBicOwner({
        userId: item.escalationOwnerId,
        displayName: item.escalationOwnerName,
        role: 'VP Operations',
      });
    },

    // D-08: Transfer history — omitted by default; provide via override when needed
    resolveTransferHistory: undefined,

    // D-01: No threshold overrides by default — platform defaults apply
    urgencyThresholds: undefined,
  };

  return { ...defaultConfig, ...overrides };
}
```

---

## `testing/mockBicStates.ts`

```typescript
import type { IBicNextMoveState } from '../src/types/IBicNextMove';
import { createMockBicOwner } from './createMockBicOwner';

const alice = createMockBicOwner({ userId: 'u-alice', displayName: 'Alice Chen', role: 'BD Manager' });
const bob   = createMockBicOwner({ userId: 'u-bob', displayName: 'Bob Torres', role: 'Director of Preconstruction' });
const carol = createMockBicOwner({ userId: 'u-carol', displayName: 'Carol Kim', role: 'Estimating Coordinator' });
const vp    = createMockBicOwner({ userId: 'u-vp', displayName: 'David Park', role: 'VP Operations' });

const base: IBicNextMoveState = {
  currentOwner: alice,
  expectedAction: 'Complete departmental sections and submit for review',
  dueDate: null,
  isOverdue: false,
  isBlocked: false,
  blockedReason: null,
  previousOwner: null,
  nextOwner: bob,
  escalationOwner: vp,
  transferHistory: [],
  urgencyTier: 'upcoming',
};

/**
 * Canonical IBicNextMoveState fixtures for all 7 BIC states (D-10).
 * Used in component tests and Storybook stories.
 *
 * States covered: upcoming, watch, immediate, overdue, blocked, unassigned, with-full-chain
 */
export const mockBicStates = {

  /** Standard state — owner assigned, due date > 3 business days away */
  upcoming: {
    ...base,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    urgencyTier: 'upcoming' as const,
  },

  /** Due within 3 business days — watch tier */
  watch: {
    ...base,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    urgencyTier: 'watch' as const,
  },

  /** Due today — immediate tier */
  immediate: {
    ...base,
    dueDate: new Date().toISOString(),
    urgencyTier: 'immediate' as const,
  },

  /** Past due date — overdue */
  overdue: {
    ...base,
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isOverdue: true,
    urgencyTier: 'immediate' as const,
  },

  /** Item is blocked — cannot advance */
  blocked: {
    ...base,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    isBlocked: true,
    blockedReason: 'Waiting on Structural Engineering to complete their section',
    urgencyTier: 'watch' as const,
  },

  /** No owner assigned — D-04 unassigned state */
  unassigned: {
    ...base,
    currentOwner: null,
    urgencyTier: 'immediate' as const, // D-04: forced immediate
  },

  /** Full ownership chain with transfer history — D-08 */
  withFullChain: {
    ...base,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    previousOwner: carol,
    nextOwner: bob,
    escalationOwner: vp,
    urgencyTier: 'upcoming' as const,
    transferHistory: [
      {
        fromOwner: null,
        toOwner: carol,
        transferredAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'Scorecard created and assigned to Estimating Coordinator',
      },
      {
        fromOwner: carol,
        toOwner: alice,
        transferredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'Kickoff meeting scheduled — passed to BD Manager for scorecard completion',
      },
    ],
  },
} satisfies Record<string, IBicNextMoveState>;
```

---

## `testing/index.ts`

```typescript
export { MockBicItem } from './MockBicItem';
export type { MockBicItem } from './MockBicItem';
export { createMockBicOwner } from './createMockBicOwner';
export { createMockBicConfig } from './createMockBicConfig';
export { mockBicStates } from './mockBicStates';
```

---

## Unit Tests

### `src/__tests__/useBicNextMove.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveFullBicState } from '../../hooks/useBicNextMove';
import { createMockBicConfig, MockBicItem } from '../../../testing';

// ── Base mock item ──────────────────────────────────────────────────────────
function makeMockItem(overrides?: Partial<MockBicItem>): MockBicItem {
  return {
    id: 'item-001',
    currentOwnerId: 'u-alice',
    currentOwnerName: 'Alice Chen',
    currentOwnerRole: 'BD Manager',
    previousOwnerId: null,
    previousOwnerName: null,
    nextOwnerId: 'u-bob',
    nextOwnerName: 'Bob Torres',
    escalationOwnerId: 'u-vp',
    escalationOwnerName: 'David Park',
    expectedAction: 'Complete scorecard and submit for review',
    dueDate: null,
    isBlocked: false,
    blockedReason: null,
    transferHistory: [],
    ...overrides,
  };
}

describe('resolveFullBicState', () => {

  describe('urgency tier computation (D-01)', () => {
    it('returns "upcoming" when dueDate is null', () => {
      const state = resolveFullBicState(makeMockItem({ dueDate: null }), createMockBicConfig());
      expect(state.urgencyTier).toBe('upcoming');
    });

    it('returns "upcoming" when due > 3 business days away', () => {
      const dueDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
      const state = resolveFullBicState(makeMockItem({ dueDate }), createMockBicConfig());
      expect(state.urgencyTier).toBe('upcoming');
    });

    it('returns "watch" when due within 3 business days', () => {
      const dueDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
      const state = resolveFullBicState(makeMockItem({ dueDate }), createMockBicConfig());
      expect(state.urgencyTier).toBe('watch');
    });

    it('returns "immediate" when due today', () => {
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      const state = resolveFullBicState(makeMockItem({ dueDate: today.toISOString() }), createMockBicConfig());
      expect(state.urgencyTier).toBe('immediate');
    });

    it('returns "immediate" when overdue', () => {
      const dueDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const state = resolveFullBicState(makeMockItem({ dueDate }), createMockBicConfig());
      expect(state.urgencyTier).toBe('immediate');
      expect(state.isOverdue).toBe(true);
    });

    it('respects custom watchThresholdDays override (D-01)', () => {
      const dueDate = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString();
      const config = createMockBicConfig({ urgencyThresholds: { watchThresholdDays: 10 } });
      const state = resolveFullBicState(makeMockItem({ dueDate }), config);
      expect(state.urgencyTier).toBe('watch'); // 8 days < 10-day threshold
    });

    it('respects custom immediateThresholdDays override (D-01)', () => {
      const dueDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
      const config = createMockBicConfig({ urgencyThresholds: { immediateThresholdDays: 3 } });
      const state = resolveFullBicState(makeMockItem({ dueDate }), config);
      expect(state.urgencyTier).toBe('immediate'); // 2 days <= 3-day immediate threshold
    });
  });

  describe('null owner state (D-04)', () => {
    it('forces urgencyTier to "immediate" when currentOwner is null', () => {
      const item = makeMockItem({
        currentOwnerId: null,
        currentOwnerName: null,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days away
      });
      const state = resolveFullBicState(item, createMockBicConfig());
      expect(state.currentOwner).toBeNull();
      expect(state.urgencyTier).toBe('immediate');
    });

    it('sets urgencyTier to "immediate" even when dueDate is null and owner is null', () => {
      const item = makeMockItem({ currentOwnerId: null, currentOwnerName: null, dueDate: null });
      const state = resolveFullBicState(item, createMockBicConfig());
      expect(state.urgencyTier).toBe('immediate');
    });
  });

  describe('blocked state', () => {
    it('sets isBlocked and blockedReason correctly', () => {
      const item = makeMockItem({ isBlocked: true, blockedReason: 'Waiting on drawings' });
      const state = resolveFullBicState(item, createMockBicConfig());
      expect(state.isBlocked).toBe(true);
      expect(state.blockedReason).toBe('Waiting on drawings');
    });

    it('sets blockedReason to null when not blocked', () => {
      const item = makeMockItem({ isBlocked: false, blockedReason: 'Should be ignored' });
      const state = resolveFullBicState(item, createMockBicConfig());
      expect(state.blockedReason).toBeNull();
    });
  });

  describe('transfer history (D-08)', () => {
    it('returns empty array when resolveTransferHistory is absent', () => {
      const state = resolveFullBicState(makeMockItem(), createMockBicConfig());
      expect(state.transferHistory).toEqual([]);
    });

    it('returns resolved history when resolveTransferHistory is present', () => {
      const config = createMockBicConfig({
        resolveTransferHistory: () => [
          { fromOwner: null, toOwner: { userId: 'u1', displayName: 'Alice', role: 'PM' }, transferredAt: '2026-01-01T00:00:00Z', action: 'Created' },
        ],
      });
      const state = resolveFullBicState(makeMockItem(), config);
      expect(state.transferHistory).toHaveLength(1);
      expect(state.transferHistory[0].action).toBe('Created');
    });
  });
});
```

### `src/__tests__/TransferDeduplicator.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { shouldFireTransfer, _clearDeduplicatorForTests } from '../../transfer/TransferDeduplicator';

describe('TransferDeduplicator (D-03)', () => {
  beforeEach(() => _clearDeduplicatorForTests());
  afterEach(() => _clearDeduplicatorForTests());

  it('returns true on first call for a unique transfer', () => {
    expect(shouldFireTransfer('item-001', 'u-alice', 'u-bob')).toBe(true);
  });

  it('returns false on second call for the same transfer in the same bucket', () => {
    shouldFireTransfer('item-001', 'u-alice', 'u-bob');
    expect(shouldFireTransfer('item-001', 'u-alice', 'u-bob')).toBe(false);
  });

  it('returns true for different itemKeys', () => {
    shouldFireTransfer('item-001', 'u-alice', 'u-bob');
    expect(shouldFireTransfer('item-002', 'u-alice', 'u-bob')).toBe(true);
  });

  it('returns true for same item but different toUser', () => {
    shouldFireTransfer('item-001', 'u-alice', 'u-bob');
    expect(shouldFireTransfer('item-001', 'u-alice', 'u-carol')).toBe(true);
  });

  it('handles null fromOwner correctly', () => {
    expect(shouldFireTransfer('item-001', null, 'u-bob')).toBe(true);
    expect(shouldFireTransfer('item-001', null, 'u-bob')).toBe(false);
  });

  it('handles null toOwner correctly', () => {
    expect(shouldFireTransfer('item-001', 'u-alice', null)).toBe(true);
    expect(shouldFireTransfer('item-001', 'u-alice', null)).toBe(false);
  });
});
```

### `src/__tests__/BicModuleRegistry.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  registerBicModule,
  getRegistry,
  executeBicFanOut,
  _clearRegistryForTests,
} from '../../registry/BicModuleRegistry';
import { mockBicStates } from '../../../testing';

beforeEach(() => _clearRegistryForTests());
afterEach(() => _clearRegistryForTests());

describe('registerBicModule (D-02)', () => {
  it('adds module to registry', () => {
    registerBicModule({ key: 'bd-scorecard', label: 'Test', queryFn: async () => [] });
    expect(getRegistry().has('bd-scorecard')).toBe(true);
  });

  it('ignores duplicate registration', () => {
    registerBicModule({ key: 'bd-scorecard', label: 'Test', queryFn: async () => [] });
    registerBicModule({ key: 'bd-scorecard', label: 'Test 2', queryFn: async () => [] });
    expect(getRegistry().get('bd-scorecard')?.label).toBe('Test');
  });
});

describe('executeBicFanOut (D-06)', () => {
  it('merges items from all registered modules', async () => {
    registerBicModule({
      key: 'bd-scorecard',
      label: 'Scorecards',
      queryFn: async () => [
        { itemKey: 'bd-scorecard::001', moduleKey: 'bd-scorecard', moduleLabel: 'Scorecards',
          state: mockBicStates.upcoming, href: '/bd/scorecards/001', title: 'Test Scorecard' },
      ],
    });
    registerBicModule({
      key: 'estimating-pursuit',
      label: 'Pursuits',
      queryFn: async () => [
        { itemKey: 'estimating-pursuit::001', moduleKey: 'estimating-pursuit', moduleLabel: 'Pursuits',
          state: mockBicStates.watch, href: '/estimating/001', title: 'Test Pursuit' },
      ],
    });

    const result = await executeBicFanOut('user-123');
    expect(result.items).toHaveLength(2);
    expect(result.failedModules).toHaveLength(0);
  });

  it('reports failed modules without failing the entire call', async () => {
    registerBicModule({
      key: 'bd-scorecard',
      label: 'Scorecards',
      queryFn: async () => { throw new Error('Network error'); },
    });
    registerBicModule({
      key: 'estimating-pursuit',
      label: 'Pursuits',
      queryFn: async () => [],
    });

    const result = await executeBicFanOut('user-123');
    expect(result.failedModules).toContain('bd-scorecard');
    expect(result.items).toHaveLength(0); // Pursuits returned empty, Scorecards failed
  });

  it('sorts items: immediate → watch → upcoming', async () => {
    registerBicModule({
      key: 'bd-scorecard',
      label: 'Scorecards',
      queryFn: async () => [
        { itemKey: 'a', moduleKey: 'bd-scorecard', moduleLabel: 'S', state: mockBicStates.upcoming, href: '/a', title: 'A' },
        { itemKey: 'b', moduleKey: 'bd-scorecard', moduleLabel: 'S', state: mockBicStates.immediate, href: '/b', title: 'B' },
        { itemKey: 'c', moduleKey: 'bd-scorecard', moduleLabel: 'S', state: mockBicStates.watch, href: '/c', title: 'C' },
      ],
    });

    const result = await executeBicFanOut('user-123');
    expect(result.items[0].state.urgencyTier).toBe('immediate');
    expect(result.items[1].state.urgencyTier).toBe('watch');
    expect(result.items[2].state.urgencyTier).toBe('upcoming');
  });
});
```

### `src/__tests__/HbcBicBadge.test.tsx`

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HbcBicBadge } from '../../components/HbcBicBadge';
import { createMockBicConfig, mockBicStates } from '../../../testing';

// Mock useComplexity context
vi.mock('@hbc/ui-kit/app-shell', () => ({
  useComplexity: () => ({ variant: 'standard' }),
}));

function makeMockItem(state: typeof mockBicStates.upcoming) {
  // Build a MockBicItem that resolves to the given state
  return {
    id: 'test-001',
    currentOwnerId: state.currentOwner?.userId ?? null,
    currentOwnerName: state.currentOwner?.displayName ?? null,
    currentOwnerRole: state.currentOwner?.role ?? '',
    previousOwnerId: null, previousOwnerName: null,
    nextOwnerId: null, nextOwnerName: null,
    escalationOwnerId: null, escalationOwnerName: null,
    expectedAction: state.expectedAction,
    dueDate: state.dueDate,
    isBlocked: state.isBlocked,
    blockedReason: state.blockedReason,
    transferHistory: [],
  };
}

describe('HbcBicBadge', () => {
  it('renders owner name in standard variant', () => {
    const item = makeMockItem(mockBicStates.upcoming);
    render(<HbcBicBadge item={item} config={createMockBicConfig()} />);
    expect(screen.getByText('Alice Chen')).toBeInTheDocument();
  });

  it('renders Unassigned state for null owner (D-04)', () => {
    const item = makeMockItem(mockBicStates.unassigned);
    render(<HbcBicBadge item={item} config={createMockBicConfig()} />);
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
    expect(screen.getByLabelText(/unassigned/i)).toBeInTheDocument();
  });

  it('shows lock icon for blocked items in standard variant', () => {
    const item = makeMockItem(mockBicStates.blocked);
    render(<HbcBicBadge item={item} config={createMockBicConfig()} />);
    expect(screen.getByText('🔒')).toBeInTheDocument();
  });

  it('hides urgency dot in essential variant (D-05)', () => {
    const item = makeMockItem(mockBicStates.immediate);
    const { container } = render(
      <HbcBicBadge item={item} config={createMockBicConfig()} forceVariant="essential" />
    );
    expect(container.querySelector('.hbc-bic-badge__dot')).not.toBeInTheDocument();
  });

  it('shows action text in expert variant (D-05)', () => {
    const item = makeMockItem(mockBicStates.upcoming);
    render(<HbcBicBadge item={item} config={createMockBicConfig()} forceVariant="expert" />);
    expect(screen.getByText(/complete/i)).toBeInTheDocument();
  });

  it('forceVariant overrides context variant (D-05)', () => {
    const item = makeMockItem(mockBicStates.upcoming);
    // Context says 'standard' but force says 'expert'
    render(<HbcBicBadge item={item} config={createMockBicConfig()} forceVariant="expert" />);
    expect(screen.getByText(/complete/i)).toBeInTheDocument(); // Expert-only action text
  });
});
```

---

## Storybook Story Requirements

Create `packages/bic-next-move/src/components/__stories__/HbcBicBadge.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { HbcBicBadge } from '../HbcBicBadge';
import { createMockBicConfig, mockBicStates } from '../../../testing';

// All 7 states × 3 variants = 21 stories minimum
// Implement at least the 7 canonical state stories with variant switcher

const meta: Meta<typeof HbcBicBadge> = {
  title: 'BIC / HbcBicBadge',
  component: HbcBicBadge,
  argTypes: {
    forceVariant: {
      control: { type: 'select' },
      options: ['essential', 'standard', 'expert'],
    },
  },
};
export default meta;

type Story = StoryObj<typeof HbcBicBadge>;
```

Required stories (one per canonical state):

| Story Name | State Used | Notes |
|---|---|---|
| `Upcoming` | `mockBicStates.upcoming` | Green dot in Standard/Expert |
| `Watch` | `mockBicStates.watch` | Yellow dot |
| `Immediate` | `mockBicStates.immediate` | Red dot |
| `Overdue` | `mockBicStates.overdue` | Red dot + overdue aria-label |
| `Blocked` | `mockBicStates.blocked` | Lock icon in Standard/Expert |
| `Unassigned` | `mockBicStates.unassigned` | ⚠️ amber state — D-04 |
| `WithFullChain` | `mockBicStates.withFullChain` | Expert shows action text |

Mirror the same 7 states for `HbcBicDetail.stories.tsx` (adds chain and history display) and `HbcBicBlockedBanner.stories.tsx` (adds onNavigate variants).

---

## Playwright E2E Scenarios

Add to `e2e/bic-next-move.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('BIC Next Move — E2E', () => {

  test('D-04: Unassigned item renders amber warning badge and appears at top of My Work Feed', async ({ page }) => {
    await page.goto('/dev-harness/bic?scenario=unassigned');
    await expect(page.locator('.hbc-bic-badge--unassigned')).toBeVisible();
    await expect(page.locator('.hbc-my-work-feed__item').first()).toContainText('Unassigned');
  });

  test('D-05: Essential variant hides urgency dot and action text', async ({ page }) => {
    await page.goto('/dev-harness/bic?scenario=watch&variant=essential');
    await expect(page.locator('.hbc-bic-badge__dot')).not.toBeVisible();
    await expect(page.locator('.hbc-bic-badge__action')).not.toBeVisible();
  });

  test('D-05: Expert variant shows full chain in HbcBicDetail', async ({ page }) => {
    await page.goto('/dev-harness/bic?scenario=with-full-chain&variant=expert');
    await expect(page.locator('.hbc-bic-detail__chain')).toBeVisible();
    await expect(page.locator('.hbc-bic-chain-node--from')).toBeVisible();
    await expect(page.locator('.hbc-bic-chain-node--to')).toBeVisible();
  });

  test('D-08: Transfer history collapsible renders in Expert mode', async ({ page }) => {
    await page.goto('/dev-harness/bic?scenario=with-full-chain&variant=expert');
    await expect(page.locator('.hbc-bic-detail__history-toggle')).toBeVisible();
    await page.click('.hbc-bic-detail__history-toggle');
    await expect(page.locator('.hbc-bic-detail__history-list')).toBeVisible();
    await expect(page.locator('.hbc-bic-transfer-row')).toHaveCount(2);
  });

  test('D-09: onNavigate callback fires instead of full page reload', async ({ page }) => {
    await page.goto('/dev-harness/bic?scenario=blocked-with-link');
    const navigationLog: string[] = [];
    await page.exposeFunction('__bicNavLog', (href: string) => navigationLog.push(href));
    await page.click('.hbc-bic-blocked-banner__link--spa');
    expect(navigationLog).toHaveLength(1);
    expect(navigationLog[0]).toMatch(/^\/\w/); // relative path
  });

  test('D-09: Plain anchor renders when onNavigate absent (SPFx context)', async ({ page }) => {
    await page.goto('/dev-harness/bic?scenario=blocked-with-link&context=spfx');
    await expect(page.locator('.hbc-bic-blocked-banner__link--anchor')).toBeVisible();
    await expect(page.locator('.hbc-bic-blocked-banner__link--spa')).not.toBeVisible();
  });

  test('D-03: Transfer notification fires once on ownership change (dedup)', async ({ page }) => {
    await page.goto('/dev-harness/bic?scenario=transfer-dedup-test');
    const notificationEvents = await page.evaluate(() =>
      (window as any).__bicTransferEventCount ?? 0
    );
    expect(notificationEvents).toBe(1); // Not 2, despite dual detection paths
  });

  test('D-06: Partial results warning shown when a module fails to load', async ({ page }) => {
    await page.goto('/dev-harness/bic?scenario=module-failure');
    await expect(page.locator('.hbc-my-work-feed__partial-warning')).toBeVisible();
    await expect(page.locator('.hbc-my-work-feed__partial-warning')).toContainText('Some items could not be loaded');
  });

});
```

---

## Verification Commands

```bash
# 1. Full test suite with coverage
pnpm --filter @hbc/bic-next-move test:coverage

# 2. Confirm ≥95% thresholds pass (vitest exits 0)
# Expected output includes: Lines: ≥95%, Functions: ≥95%, Branches: ≥95%

# 3. Verify testing sub-path exports (D-10)
node -e "
  import('@hbc/bic-next-move/testing').then(m => {
    console.log('MockBicItem:', typeof m.MockBicItem !== 'undefined' || true);
    console.log('createMockBicConfig:', typeof m.createMockBicConfig === 'function');
    console.log('mockBicStates keys:', Object.keys(m.mockBicStates));
    console.log('createMockBicOwner:', typeof m.createMockBicOwner === 'function');
  });
"
# Expected mockBicStates keys: upcoming, watch, immediate, overdue, blocked, unassigned, withFullChain

# 4. Playwright E2E
pnpm exec playwright test e2e/bic-next-move.spec.ts
```
