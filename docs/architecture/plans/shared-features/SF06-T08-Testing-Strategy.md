# SF06-T08 — Testing Strategy

**Package:** `packages/versioned-record/`
**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Depends On:** T01–T07 (all implementation tasks)
**Decision Reference:** D-10 (standing) — Standard platform testing sub-path pattern

---

## Objective

Deliver the complete `testing/` sub-path, all Storybook stories, and all Playwright E2E scenarios. The testing sub-path provides consuming packages with everything needed to test their own integrations against `@hbc/versioned-record` without importing production bundle internals.

---

## Testing Sub-Path: `@hbc/versioned-record/testing` (D-10)

### File: `testing/createMockVersionedRecordConfig.ts`

```typescript
import type { IVersionedRecordConfig, IVersionSnapshot, VersionTrigger } from '../src/types';
import { vi } from 'vitest';

/**
 * Creates a typed mock `IVersionedRecordConfig<T>` for use in consuming
 * package tests. All functions are vi.fn() stubs with sensible defaults.
 */
export function createMockVersionedRecordConfig<T>(
  overrides: Partial<IVersionedRecordConfig<T>> = {}
): IVersionedRecordConfig<T> {
  return {
    recordType: 'mock-record',
    triggers: ['on-submit', 'on-approve'] as VersionTrigger[],
    generateChangeSummary: vi.fn().mockReturnValue('Mock change summary'),
    excludeFields: [],
    maxVersions: 0,
    getStakeholders: vi.fn().mockReturnValue(['mock-user-1', 'mock-user-2']),
    onVersionCreated: vi.fn(),
    ...overrides,
  };
}
```

---

### File: `testing/mockVersionedRecordStates.ts`

Six canonical named states covering the full lifecycle and edge cases:

```typescript
import type { IVersionMetadata, IVersionSnapshot } from '../src/types';

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const ALICE: IVersionMetadata['createdBy'] = {
  userId: 'user-alice',
  displayName: 'Alice Chen',
  role: 'Project Manager',
};

const BOB: IVersionMetadata['createdBy'] = {
  userId: 'user-bob',
  displayName: 'Bob Martinez',
  role: 'Director of Preconstruction',
};

const BASE_RECORD = {
  projectName: 'Harbor Bridge Renovation',
  totalScore: 42,
  riskScore: 8,
  bidAmount: 1_250_000,
  notes: 'Initial assessment complete.',
};

// ---------------------------------------------------------------------------
// State 1 — Empty history (no versions yet)
// ---------------------------------------------------------------------------

export const emptyHistoryState = {
  metadata: [] as IVersionMetadata[],
  snapshots: {} as Record<string, IVersionSnapshot<typeof BASE_RECORD>>,
  description: 'Record has no version history',
};

// ---------------------------------------------------------------------------
// State 2 — Single draft version
// ---------------------------------------------------------------------------

const draftMetadata: IVersionMetadata = {
  snapshotId: 'snap-draft-001',
  version: 1,
  createdAt: '2026-01-10T09:00:00Z',
  createdBy: ALICE,
  changeSummary: 'Initial draft created',
  tag: 'draft',
};

export const singleDraftState = {
  metadata: [draftMetadata],
  snapshots: {
    'snap-draft-001': {
      ...draftMetadata,
      snapshot: { ...BASE_RECORD },
    } as IVersionSnapshot<typeof BASE_RECORD>,
  },
  description: 'Record has a single draft version',
};

// ---------------------------------------------------------------------------
// State 3 — Multiple versions across lifecycle stages
// ---------------------------------------------------------------------------

const multiVersionMetadata: IVersionMetadata[] = [
  {
    snapshotId: 'snap-v1',
    version: 1,
    createdAt: '2026-01-10T09:00:00Z',
    createdBy: ALICE,
    changeSummary: 'Initial submission',
    tag: 'submitted',
  },
  {
    snapshotId: 'snap-v2',
    version: 2,
    createdAt: '2026-01-15T14:30:00Z',
    createdBy: BOB,
    changeSummary: 'Score revised after site visit',
    tag: 'submitted',
  },
  {
    snapshotId: 'snap-v3',
    version: 3,
    createdAt: '2026-01-20T10:00:00Z',
    createdBy: BOB,
    changeSummary: 'Approved for bid submission',
    tag: 'approved',
  },
];

export const multiVersionState = {
  metadata: multiVersionMetadata,
  snapshots: {
    'snap-v1': {
      ...multiVersionMetadata[0]!,
      snapshot: { ...BASE_RECORD },
    } as IVersionSnapshot<typeof BASE_RECORD>,
    'snap-v2': {
      ...multiVersionMetadata[1]!,
      snapshot: { ...BASE_RECORD, totalScore: 67, riskScore: 5, notes: 'Updated after site visit.' },
    } as IVersionSnapshot<typeof BASE_RECORD>,
    'snap-v3': {
      ...multiVersionMetadata[2]!,
      snapshot: { ...BASE_RECORD, totalScore: 75, riskScore: 4, notes: 'Final approved state.' },
    } as IVersionSnapshot<typeof BASE_RECORD>,
  },
  description: 'Record with multiple versions across submission and approval stages',
};

// ---------------------------------------------------------------------------
// State 4 — Approved version (legally significant terminal state)
// ---------------------------------------------------------------------------

const approvedMetadata: IVersionMetadata = {
  snapshotId: 'snap-approved',
  version: 3,
  createdAt: '2026-01-20T10:00:00Z',
  createdBy: BOB,
  changeSummary: 'Director approved v3 for bid submission',
  tag: 'approved',
};

export const approvedVersionState = {
  metadata: [
    { ...multiVersionMetadata[0]!, },
    { ...multiVersionMetadata[1]!, },
    approvedMetadata,
  ],
  snapshots: {
    ...multiVersionState.snapshots,
    'snap-approved': {
      ...approvedMetadata,
      snapshot: { ...BASE_RECORD, totalScore: 75, riskScore: 4, notes: 'Final approved state.' },
    } as IVersionSnapshot<typeof BASE_RECORD>,
  },
  description: 'Record has a director-approved terminal version',
};

// ---------------------------------------------------------------------------
// State 5 — Rollback in progress (superseded versions present)
// ---------------------------------------------------------------------------

const supersededMetadata: IVersionMetadata[] = [
  {
    snapshotId: 'snap-base',
    version: 1,
    createdAt: '2026-01-10T09:00:00Z',
    createdBy: ALICE,
    changeSummary: 'Initial submission',
    tag: 'submitted',
  },
  {
    snapshotId: 'snap-sup-1',
    version: 2,
    createdAt: '2026-01-15T14:30:00Z',
    createdBy: ALICE,
    changeSummary: 'Score revised (later superseded)',
    tag: 'superseded',
  },
  {
    snapshotId: 'snap-sup-2',
    version: 3,
    createdAt: '2026-01-18T11:00:00Z',
    createdBy: ALICE,
    changeSummary: 'Another revision (superseded)',
    tag: 'superseded',
  },
  {
    snapshotId: 'snap-restored',
    version: 4,
    createdAt: '2026-01-25T09:00:00Z',
    createdBy: BOB,
    changeSummary: 'Restored from v1 by Bob Martinez',
    tag: 'submitted',
  },
];

export const supersededVersionState = {
  metadata: supersededMetadata,
  snapshots: {
    'snap-base': {
      ...supersededMetadata[0]!,
      snapshot: { ...BASE_RECORD },
    } as IVersionSnapshot<typeof BASE_RECORD>,
    'snap-restored': {
      ...supersededMetadata[3]!,
      snapshot: { ...BASE_RECORD },
    } as IVersionSnapshot<typeof BASE_RECORD>,
  },
  description: 'Record after rollback — v2 and v3 are superseded; v4 is the restored current state',
};

// ---------------------------------------------------------------------------
// State 6 — Rollback in-progress (modal open, awaiting confirmation)
// ---------------------------------------------------------------------------

export const rollbackInProgressState = {
  metadata: multiVersionMetadata,
  rollbackTarget: multiVersionMetadata[0]!, // User has selected v1 for restore
  isRollingBack: false,
  description: 'Rollback confirmation modal is open; user is reviewing v1 restore details',
};

// ---------------------------------------------------------------------------
// Convenience re-export
// ---------------------------------------------------------------------------

export const versionedRecordStates = {
  emptyHistoryState,
  singleDraftState,
  multiVersionState,
  approvedVersionState,
  supersededVersionState,
  rollbackInProgressState,
};
```

---

### File: `testing/mockUseVersionHistory.ts`

```typescript
import { vi } from 'vitest';
import type { IUseVersionHistoryResult } from '../src/types';
import { multiVersionState } from './mockVersionedRecordStates';

/**
 * Mock implementation of `useVersionHistory` with vi.fn() stubs
 * for all mutations. Default state is `multiVersionState`.
 */
export const mockUseVersionHistory = {
  /**
   * Returns a mock result object. Override individual fields as needed.
   */
  mockReturnValue(
    overrides: Partial<IUseVersionHistoryResult> = {}
  ): IUseVersionHistoryResult {
    return {
      metadata: multiVersionState.metadata,
      isLoading: false,
      error: null,
      showSuperseded: false,
      setShowSuperseded: vi.fn(),
      refresh: vi.fn(),
      ...overrides,
    };
  },

  /** Stub that simulates a loading state. */
  loading(): IUseVersionHistoryResult {
    return this.mockReturnValue({ metadata: [], isLoading: true });
  },

  /** Stub that simulates an error state. */
  error(message = 'Failed to load version history'): IUseVersionHistoryResult {
    return this.mockReturnValue({ metadata: [], error: new Error(message) });
  },

  /** Stub that simulates an empty history state. */
  empty(): IUseVersionHistoryResult {
    return this.mockReturnValue({ metadata: [] });
  },

  /** Stub that simulates the rollback mutation. */
  withRollback(): IUseVersionHistoryResult {
    return this.mockReturnValue({
      metadata: multiVersionState.metadata,
    });
  },
};
```

---

### File: `testing/createVersionedRecordWrapper.tsx`

```tsx
import React from 'react';
import type { PropsWithChildren } from 'react';

/**
 * Wraps children with all providers required by `@hbc/versioned-record`
 * components and hooks. Use in consuming package tests.
 *
 * Current requirements:
 * - `@hbc/complexity` ComplexityProvider (defaults to 'expert' tier in tests)
 *
 * Usage:
 * ```typescript
 * import { createVersionedRecordWrapper } from '@hbc/versioned-record/testing';
 * const wrapper = createVersionedRecordWrapper({ complexityTier: 'standard' });
 * renderHook(() => useVersionHistory(...), { wrapper });
 * ```
 */
export interface VersionedRecordWrapperOptions {
  /** Complexity tier to simulate. Defaults to 'expert'. */
  complexityTier?: 'essential' | 'standard' | 'expert';
}

export function createVersionedRecordWrapper(
  options: VersionedRecordWrapperOptions = {}
): React.ComponentType<PropsWithChildren> {
  const { complexityTier = 'expert' } = options;

  // Mock @hbc/complexity at module level in consuming test files:
  // vi.mock('@hbc/complexity', () => ({ useComplexity: () => ({ tier: complexityTier }) }));
  // The wrapper itself provides the React tree context.

  function VersionedRecordWrapper({ children }: PropsWithChildren): React.ReactElement {
    // In real usage, @hbc/complexity wraps the app shell.
    // In tests, the vi.mock in setup.ts provides the tier.
    // This wrapper exists to allow future provider additions (e.g., notification context)
    // without requiring test updates in consuming packages.
    return <>{children}</>;
  }

  VersionedRecordWrapper.displayName = `VersionedRecordWrapper(${complexityTier})`;

  return VersionedRecordWrapper;
}
```

---

### File: `testing/index.ts`

```typescript
export { createMockVersionedRecordConfig } from './createMockVersionedRecordConfig';
export {
  versionedRecordStates,
  emptyHistoryState,
  singleDraftState,
  multiVersionState,
  approvedVersionState,
  supersededVersionState,
  rollbackInProgressState,
} from './mockVersionedRecordStates';
export { mockUseVersionHistory } from './mockUseVersionHistory';
export { createVersionedRecordWrapper } from './createVersionedRecordWrapper';
export type { VersionedRecordWrapperOptions } from './createVersionedRecordWrapper';
```

---

## Unit Test Matrix

| Module | Test File | Key Scenarios | Coverage Target |
|---|---|---|---|
| `diffEngine` | `src/engine/__tests__/diffEngine.test.ts` | Flatten, classify, format delta, char diff, compute integration | ≥95% |
| `versionUtils` | `src/utils/__tests__/versionUtils.test.ts` | Tag classification, serialize, byte size, filter, supersede IDs | ≥90% |
| `useVersionHistory` | `src/hooks/__tests__/useVersionHistory.test.ts` | Load, sort, filter superseded, error, refresh | ≥90% |
| `useVersionSnapshot` | `src/hooks/__tests__/useVersionSnapshot.test.ts` | Idle, fetch, cancel, error | ≥90% |
| `useVersionDiff` | `src/hooks/__tests__/useVersionDiff.test.ts` | Deferred compute, same version, error | ≥90% |
| `VersionApi` | `src/api/__tests__/VersionApi.test.ts` | createSnapshot (v1, vN), getMetadataList, storageRef, notifications | ≥85% |
| `HbcVersionHistory` | `src/components/__tests__/HbcVersionHistory.test.tsx` | Render, rollback modal, superseded toggle, complexity gates | ≥85% |
| `HbcVersionDiff` | `src/components/__tests__/HbcVersionDiff.test.tsx` | Mode toggle, numeric delta, no changes, error | ≥85% |
| `HbcVersionBadge` | `src/components/__tests__/HbcVersionBadge.test.tsx` | All tags, interactive vs static, click handler | ≥90% |

---

## Storybook Stories

### Primary: `HbcVersionHistory` (10+ stories)

```typescript
// src/components/HbcVersionHistory.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { HbcVersionHistory } from './HbcVersionHistory';
import { multiVersionState, supersededVersionState, emptyHistoryState } from '../../testing';

const meta: Meta<typeof HbcVersionHistory> = {
  title: 'versioned-record/HbcVersionHistory',
  component: HbcVersionHistory,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof HbcVersionHistory>;

const baseConfig = {
  recordType: 'bd-scorecard',
  triggers: ['on-submit' as const],
  getStakeholders: () => [],
};

export const Default: Story = {
  args: {
    recordType: 'bd-scorecard',
    recordId: 'rec-1',
    config: baseConfig,
  },
};

export const MultipleVersions: Story = {
  name: 'Multiple versions — submitted and approved',
  // Mock VersionApi to return multiVersionState.metadata
};

export const WithRollback: Story = {
  name: 'With rollback CTA (Expert tier, Director role)',
  args: {
    allowRollback: true,
    currentUser: { userId: 'bob', displayName: 'Bob Martinez', role: 'Director' },
  },
};

export const RollbackModalOpen: Story = {
  name: 'Rollback confirmation modal open',
  // Trigger modal via interaction
};

export const WithSupersededVersions: Story = {
  name: 'With superseded versions — toggle hidden',
  // Mock API to return supersededVersionState.metadata
};

export const SupersededVersionsRevealed: Story = {
  name: 'Superseded versions revealed via toggle',
};

export const EmptyHistory: Story = {
  name: 'Empty history — no versions yet',
  // Mock API to return []
};

export const LoadingState: Story = {
  name: 'Loading state',
};

export const ErrorState: Story = {
  name: 'Error state — API failure',
};

export const StandardComplexity: Story = {
  name: 'Standard complexity — no rollback CTA',
  // Mock useComplexity to return 'standard'
};

export const ApprovedVersionBadge: Story = {
  name: 'Approved version tag badge color',
};
```

### Secondary: `HbcVersionDiff` (6+ stories)

```typescript
// src/components/HbcVersionDiff.stories.tsx
export const SideBySideNumericDelta: Story = {
  name: 'Side by side — numeric delta display',
};

export const SideBySideTextCharDiff: Story = {
  name: 'Side by side — character-level text diff',
};

export const UnifiedMode: Story = {
  name: 'Unified diff mode',
};

export const NoChanges: Story = {
  name: 'No differences between versions',
};

export const LoadingState: Story = {
  name: 'Computing diff — loading state',
};

export const AddedAndRemovedFields: Story = {
  name: 'Added and removed fields',
};
```

### HbcVersionBadge — All tag states (7 stories)

One story per `VersionTag` value: `draft`, `submitted`, `approved`, `rejected`, `archived`, `handoff`, `superseded`, plus an interactive (clickable) variant.

---

## Playwright E2E Scenarios

```typescript
// e2e/versioned-record.spec.ts
import { test, expect } from '@playwright/test';

test.describe('SF06 — Versioned Record E2E', () => {
  test('E2E-01: Version history panel opens from badge click', async ({ page }) => {
    await page.goto('/dev-harness/versioned-record');
    await page.getByRole('button', { name: /v\d+/ }).first().click();
    await expect(page.getByText('Version History')).toBeVisible();
  });

  test('E2E-02: Version list shows correct tags and authors', async ({ page }) => {
    await page.goto('/dev-harness/versioned-record');
    await page.getByRole('button', { name: /v\d+/ }).first().click();
    await expect(page.getByText('Approved')).toBeVisible();
    await expect(page.getByText('Alice Chen')).toBeVisible();
  });

  test('E2E-03: Clicking a version entry opens the diff viewer', async ({ page }) => {
    await page.goto('/dev-harness/versioned-record');
    await page.getByRole('button', { name: /v\d+/ }).first().click();
    await page.getByRole('button', { name: /View version \d+/ }).first().click();
    await expect(page.getByLabelText('Side by side diff')).toBeVisible();
  });

  test('E2E-04: Diff viewer shows numeric delta for changed numeric fields', async ({ page }) => {
    await page.goto('/dev-harness/versioned-record/diff');
    await expect(page.getByText(/\+\d+/)).toBeVisible();
  });

  test('E2E-05: Diff viewer toggles to unified mode', async ({ page }) => {
    await page.goto('/dev-harness/versioned-record/diff');
    await page.getByRole('button', { name: 'Unified' }).click();
    await expect(page.getByLabelText('Unified diff')).toBeVisible();
  });

  test('E2E-06: Rollback CTA opens confirmation modal', async ({ page }) => {
    await page.goto('/dev-harness/versioned-record?role=director');
    await page.getByRole('button', { name: /v\d+/ }).first().click();
    await page.getByRole('button', { name: /Restore to v/ }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/This will create a new version/)).toBeVisible();
  });

  test('E2E-07: Rollback cancel closes modal without restoring', async ({ page }) => {
    await page.goto('/dev-harness/versioned-record?role=director');
    await page.getByRole('button', { name: /v\d+/ }).first().click();
    await page.getByRole('button', { name: /Restore to v/ }).first().click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('E2E-08: Rollback confirm creates new version and tags superseded', async ({ page }) => {
    await page.goto('/dev-harness/versioned-record?role=director');
    await page.getByRole('button', { name: /v\d+/ }).first().click();
    const restoreButtons = page.getByRole('button', { name: /Restore to v/ });
    const targetVersionText = await restoreButtons.last().textContent();
    await restoreButtons.last().click();
    await page.getByRole('button', { name: /Restore to v/ }).last().click();
    // Version list should refresh with new version at top
    await expect(page.getByText('Restored from')).toBeVisible();
  });

  test('E2E-09: "Show archived versions" toggle reveals superseded entries', async ({ page }) => {
    await page.goto('/dev-harness/versioned-record?state=with-superseded');
    await page.getByRole('button', { name: /v\d+/ }).first().click();
    const toggle = page.getByText('Show archived versions');
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.getByText('Superseded')).toBeVisible();
  });

  test('E2E-10: Version badge renders correct tag color for approved state', async ({ page }) => {
    await page.goto('/dev-harness/versioned-record?tag=approved');
    const badge = page.getByLabel(/Version \d+, Approved/);
    await expect(badge).toBeVisible();
    await expect(badge).toHaveCSS('color', /success/);
  });
});
```

---

## Verification Commands

```bash
cd packages/versioned-record

# Full test suite with coverage report
pnpm test:coverage

# Storybook build check (no visual errors)
pnpm storybook:build

# E2E (requires dev-harness running on port 3000)
pnpm turbo run dev --filter dev-harness &
npx playwright test e2e/versioned-record.spec.ts --reporter=list

# Testing sub-path type check
npx tsc --noEmit --project tsconfig.json testing/index.ts
```
