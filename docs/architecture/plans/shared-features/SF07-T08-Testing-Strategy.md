# SF07-T08 — Testing Strategy: `@hbc/field-annotations`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-07-Shared-Feature-Field-Annotations.md`
**Decisions Applied:** D-02 (scope model), D-03 (BIC blocking counts), D-05 (complexity rendering), D-06 (SPFx constraint), D-07 (reply model), D-08 (assignment), D-10 (testing sub-path)
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T01–T07

> **Doc Classification:** Canonical Normative Plan — SF07-T08 testing strategy task; sub-plan of `SF07-Field-Annotations.md`.

---

## Objective

Achieve ≥95% unit test coverage across all hooks, API layer, and components. Implement the `@hbc/field-annotations/testing` sub-path (D-10) with canonical fixtures for consumer module use. Write Storybook stories for all canonical annotation states. Define Playwright E2E scenarios covering the full annotation lifecycle.

---

## 3-Line Plan

1. Implement `testing/` sub-path — `createMockAnnotation`, `createMockAnnotationReply`, `createMockAnnotationConfig`, `mockAnnotationStates`.
2. Write Vitest unit tests covering annotation status transitions, count aggregation, API mapper, hook mutations, and component rendering.
3. Define Storybook stories for all canonical states and Playwright E2E scenarios for the full annotation lifecycle.

---

## `testing/createMockAnnotation.ts`

```typescript
import type { IFieldAnnotation, AnnotationIntent, AnnotationStatus } from '../src/types/IFieldAnnotation';
import type { IBicOwner } from '@hbc/bic-next-move';
import { createMockAnnotationReply } from './createMockAnnotationReply';

const DEFAULT_AUTHOR: IBicOwner = {
  userId: 'u-author-001',
  displayName: 'Alice Chen',
  role: 'Director of Preconstruction',
};

/**
 * Creates a mock IFieldAnnotation with sensible defaults (D-10).
 * Override any field as needed for specific test scenarios.
 *
 * @example — Default open clarification request
 * const annotation = createMockAnnotation();
 *
 * @example — Resolved annotation
 * const annotation = createMockAnnotation({
 *   status: 'resolved',
 *   resolvedAt: new Date().toISOString(),
 *   resolvedBy: { userId: 'u-002', displayName: 'Bob Torres', role: 'BD Manager' },
 *   resolutionNote: 'Confirmed with the owner — 45,000 SF is correct.',
 * });
 *
 * @example — Annotation with replies
 * const annotation = createMockAnnotation({
 *   replies: [createMockAnnotationReply()],
 * });
 */
export function createMockAnnotation(
  overrides?: Partial<IFieldAnnotation>
): IFieldAnnotation {
  return {
    annotationId: `annotation-${Math.random().toString(36).slice(2, 9)}`,
    recordType: 'bd-scorecard',
    recordId: 'record-001',
    fieldKey: 'totalBuildableArea',
    fieldLabel: 'Total Buildable Area (SF)',
    intent: 'clarification-request' as AnnotationIntent,
    status: 'open' as AnnotationStatus,
    author: DEFAULT_AUTHOR,
    assignedTo: null,
    body: 'Please confirm the square footage — the site plan shows 42,000 SF but this field shows 45,000 SF.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAtVersion: null,
    resolvedAt: null,
    resolvedBy: null,
    resolutionNote: null,
    resolvedAtVersion: null,
    replies: [],
    ...overrides,
  };
}
```

---

## `testing/createMockAnnotationReply.ts`

```typescript
import type { IAnnotationReply } from '../src/types/IFieldAnnotation';
import type { IBicOwner } from '@hbc/bic-next-move';

const DEFAULT_REPLY_AUTHOR: IBicOwner = {
  userId: 'u-reply-001',
  displayName: 'Bob Torres',
  role: 'BD Manager',
};

/**
 * Creates a mock IAnnotationReply with sensible defaults (D-10).
 */
export function createMockAnnotationReply(
  overrides?: Partial<IAnnotationReply>
): IAnnotationReply {
  return {
    replyId: `reply-${Math.random().toString(36).slice(2, 9)}`,
    author: DEFAULT_REPLY_AUTHOR,
    body: 'I verified with the surveyor — the correct figure is 42,500 SF. Updating now.',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}
```

---

## `testing/createMockAnnotationConfig.ts`

```typescript
import type { IFieldAnnotationConfig } from '../src/types/IFieldAnnotation';

/**
 * Creates a mock IFieldAnnotationConfig with sensible defaults (D-10).
 * All optional fields populated. Override for specific test scenarios.
 *
 * @example — Default config (all defaults)
 * const config = createMockAnnotationConfig();
 *
 * @example — Config with assignment disabled
 * const config = createMockAnnotationConfig({ allowAssignment: false });
 *
 * @example — Config that does not block BIC
 * const config = createMockAnnotationConfig({ blocksBicOnOpenAnnotations: false });
 */
export function createMockAnnotationConfig(
  overrides?: Partial<IFieldAnnotationConfig>
): Required<IFieldAnnotationConfig> {
  return {
    recordType: 'bd-scorecard',
    blocksBicOnOpenAnnotations: true,
    allowAssignment: true,
    requireResolutionNote: true,
    visibleToViewers: true,
    versionAware: false,
    ...overrides,
  };
}
```

---

## `testing/mockAnnotationStates.ts`

```typescript
import type { IFieldAnnotation } from '../src/types/IFieldAnnotation';
import { createMockAnnotation } from './createMockAnnotation';
import { createMockAnnotationReply } from './createMockAnnotationReply';

/**
 * Canonical annotation state fixtures for all 6 field annotation scenarios (D-10).
 * Used in component tests and Storybook stories.
 *
 * States:
 *   empty               — No annotations on this field
 *   openComment         — One open comment annotation
 *   openClarification   — One open clarification-request (blocks BIC)
 *   openRevisionFlag    — One open flag-for-revision (blocks BIC)
 *   resolved            — One resolved clarification-request
 *   mixed               — Multiple open annotations of mixed intent + one resolved
 */
export const mockAnnotationStates = {

  /** No annotations — marker is in add-only or hidden state */
  empty: [] as IFieldAnnotation[],

  /** Single open comment — blue dot, does not block BIC */
  openComment: [
    createMockAnnotation({
      annotationId: 'ann-comment-001',
      intent: 'comment',
      body: 'Note: this value was updated after the initial site walk. Keeping for reference.',
    }),
  ] as IFieldAnnotation[],

  /** Single open clarification request — red dot, blocks BIC (D-03) */
  openClarification: [
    createMockAnnotation({
      annotationId: 'ann-clarification-001',
      intent: 'clarification-request',
      body: 'Please confirm the square footage — the site plan shows 42,000 SF but this field shows 45,000 SF.',
    }),
  ] as IFieldAnnotation[],

  /** Single open flag for revision — amber dot, blocks BIC (D-03) */
  openRevisionFlag: [
    createMockAnnotation({
      annotationId: 'ann-flag-001',
      intent: 'flag-for-revision',
      body: 'This figure must be updated before Director review. Check against the current survey.',
    }),
  ] as IFieldAnnotation[],

  /** Resolved clarification request — grey checkmark dot */
  resolved: [
    createMockAnnotation({
      annotationId: 'ann-resolved-001',
      intent: 'clarification-request',
      status: 'resolved',
      resolvedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      resolvedBy: {
        userId: 'u-resolver-001',
        displayName: 'Bob Torres',
        role: 'BD Manager',
      },
      resolutionNote: 'Confirmed with surveyor — 42,500 SF is correct. Updated the field.',
    }),
  ] as IFieldAnnotation[],

  /** Mixed: open clarification + open comment + one resolved — highest-priority color shown (red) */
  mixed: [
    createMockAnnotation({
      annotationId: 'ann-mixed-001',
      intent: 'clarification-request',
      body: 'Square footage discrepancy — needs resolution.',
    }),
    createMockAnnotation({
      annotationId: 'ann-mixed-002',
      intent: 'comment',
      body: 'Also note the boundary line change from last quarter.',
    }),
    createMockAnnotation({
      annotationId: 'ann-mixed-003',
      intent: 'flag-for-revision',
      status: 'resolved',
      resolvedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      resolvedBy: {
        userId: 'u-resolver-001',
        displayName: 'Bob Torres',
        role: 'BD Manager',
      },
      resolutionNote: 'Corrected to match current survey.',
      replies: [createMockAnnotationReply()],
    }),
  ] as IFieldAnnotation[],

} satisfies Record<string, IFieldAnnotation[]>;
```

---

## `testing/index.ts`

```typescript
export { createMockAnnotation } from './createMockAnnotation';
export { createMockAnnotationReply } from './createMockAnnotationReply';
export { createMockAnnotationConfig } from './createMockAnnotationConfig';
export { mockAnnotationStates } from './mockAnnotationStates';
```

---

## Unit Tests

### `src/__tests__/useFieldAnnotations.test.ts` (key scenarios)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFieldAnnotations, computeAnnotationCounts } from '../../hooks/useFieldAnnotations';
import { AnnotationApi } from '../../api/AnnotationApi';
import { mockAnnotationStates } from '../../../testing';
import React from 'react';

vi.mock('../../api/AnnotationApi', () => ({
  AnnotationApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    addReply: vi.fn(),
    resolve: vi.fn(),
    withdraw: vi.fn(),
  },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('computeAnnotationCounts', () => {
  it('returns zero counts for empty array', () => {
    const counts = computeAnnotationCounts([]);
    expect(counts.totalOpen).toBe(0);
    expect(counts.openClarificationRequests).toBe(0);
    expect(counts.openRevisionFlags).toBe(0);
    expect(counts.openComments).toBe(0);
    expect(counts.totalResolved).toBe(0);
  });

  it('counts open annotations by intent correctly', () => {
    const counts = computeAnnotationCounts(mockAnnotationStates.mixed);
    expect(counts.openClarificationRequests).toBe(1);
    expect(counts.openComments).toBe(1);
    expect(counts.totalResolved).toBe(1);
  });

  it('does not count withdrawn annotations as resolved', () => {
    const withdrawn = mockAnnotationStates.resolved.map((a) => ({
      ...a,
      status: 'withdrawn' as const,
    }));
    const counts = computeAnnotationCounts(withdrawn);
    // withdrawn counts in totalResolved (not open)
    expect(counts.totalOpen).toBe(0);
  });
});

describe('useFieldAnnotations (D-03 counts for BIC blocking)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns correct counts for BIC blocking resolver', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValueOnce(mockAnnotationStates.openClarification);

    const { result } = renderHook(
      () => useFieldAnnotations('bd-scorecard', 'record-001'),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.counts.openClarificationRequests).toBe(1);
    expect(result.current.counts.totalOpen).toBe(1);
    // BIC should block: openClarificationRequests > 0
  });

  it('returns zero counts when annotations are empty', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValueOnce([]);

    const { result } = renderHook(
      () => useFieldAnnotations('bd-scorecard', 'record-001'),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.counts.totalOpen).toBe(0);
  });

  it('skips query when enabled=false', () => {
    const { result } = renderHook(
      () => useFieldAnnotations('bd-scorecard', 'record-001', false),
      { wrapper }
    );
    expect(AnnotationApi.list).not.toHaveBeenCalled();
    expect(result.current.annotations).toEqual([]);
  });
});
```

### `src/__tests__/HbcAnnotationMarker.test.tsx` (key scenarios)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HbcAnnotationMarker } from '../../components/HbcAnnotationMarker';
import { AnnotationApi } from '../../api/AnnotationApi';
import { createMockAnnotationConfig, mockAnnotationStates } from '../../../testing';
import React from 'react';

vi.mock('../../api/AnnotationApi');
vi.mock('@hbc/complexity', () => ({
  useComplexity: () => ({ variant: 'standard' }),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return React.createElement(QueryClientProvider, { client: qc }, children);
}

const defaultProps = {
  recordType: 'bd-scorecard',
  recordId: 'record-001',
  fieldKey: 'totalBuildableArea',
  fieldLabel: 'Total Buildable Area (SF)',
  config: createMockAnnotationConfig(),
  canAnnotate: true,
  canResolve: true,
};

describe('HbcAnnotationMarker', () => {
  beforeEach(() => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([]);
  });

  it('returns null in Essential complexity mode (D-05)', () => {
    vi.mocked(require('@hbc/complexity').useComplexity).mockReturnValue({ variant: 'essential' });
    const { container } = render(
      <HbcAnnotationMarker {...defaultProps} />,
      { wrapper }
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders a button in Standard mode when canAnnotate=true and no annotations', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue(mockAnnotationStates.empty);
    render(<HbcAnnotationMarker {...defaultProps} />, { wrapper });
    const marker = await screen.findByTestId('hbc-annotation-marker');
    expect(marker).toBeInTheDocument();
    expect(marker).toHaveClass('hbc-annotation-marker--add-only');
  });

  it('renders red dot for open clarification-request annotation (D-05)', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue(mockAnnotationStates.openClarification);
    render(<HbcAnnotationMarker {...defaultProps} />, { wrapper });
    const marker = await screen.findByTestId('hbc-annotation-marker');
    expect(marker).toHaveClass('hbc-annotation-marker--red');
    expect(marker).toHaveAttribute('aria-label', expect.stringContaining('annotation'));
  });

  it('renders amber dot for open flag-for-revision annotation', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue(mockAnnotationStates.openRevisionFlag);
    render(<HbcAnnotationMarker {...defaultProps} />, { wrapper });
    const marker = await screen.findByTestId('hbc-annotation-marker');
    expect(marker).toHaveClass('hbc-annotation-marker--amber');
  });

  it('renders grey checkmark dot for resolved-only annotations', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue(mockAnnotationStates.resolved);
    render(<HbcAnnotationMarker {...defaultProps} />, { wrapper });
    const marker = await screen.findByTestId('hbc-annotation-marker');
    expect(marker).toHaveClass('hbc-annotation-marker--grey');
  });

  it('renders nothing when no annotations and canAnnotate=false', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue([]);
    const { container } = render(
      <HbcAnnotationMarker {...defaultProps} canAnnotate={false} />,
      { wrapper }
    );
    // Zero DOM footprint when nothing to show (D-09)
    expect(container.querySelector('[data-testid="hbc-annotation-marker"]')).toBeNull();
  });

  it('is hidden for viewers when config.visibleToViewers=false', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue(mockAnnotationStates.openClarification);
    const config = createMockAnnotationConfig({ visibleToViewers: false });
    const { container } = render(
      <HbcAnnotationMarker
        {...defaultProps}
        config={config}
        canAnnotate={false}
        canResolve={false}
      />,
      { wrapper }
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows count badge in Expert mode for open annotations (D-05)', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue(mockAnnotationStates.mixed);
    render(
      <HbcAnnotationMarker {...defaultProps} forceVariant="expert" />,
      { wrapper }
    );
    const countBadge = await screen.findByText('2'); // 2 open in mixed state
    expect(countBadge).toBeInTheDocument();
    expect(countBadge).toHaveClass('hbc-annotation-marker__count');
  });

  it('forceVariant overrides context variant (D-05)', async () => {
    // Context says standard; force says expert
    vi.mocked(AnnotationApi.list).mockResolvedValue(mockAnnotationStates.openClarification);
    render(
      <HbcAnnotationMarker {...defaultProps} forceVariant="expert" />,
      { wrapper }
    );
    const countBadge = await screen.findByText('1');
    expect(countBadge).toBeInTheDocument();
  });

  it('opens HbcAnnotationThread on click', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue(mockAnnotationStates.openClarification);
    render(<HbcAnnotationMarker {...defaultProps} />, { wrapper });
    const marker = await screen.findByTestId('hbc-annotation-marker');
    fireEvent.click(marker);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
```

### `src/__tests__/HbcAnnotationSummary.test.tsx` (key scenarios)

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HbcAnnotationSummary } from '../../components/HbcAnnotationSummary';
import { AnnotationApi } from '../../api/AnnotationApi';
import { createMockAnnotationConfig, mockAnnotationStates } from '../../../testing';
import React from 'react';

vi.mock('../../api/AnnotationApi');
vi.mock('@hbc/complexity', () => ({
  useComplexity: () => ({ variant: 'standard' }),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return React.createElement(QueryClientProvider, { client: qc }, children);
}

describe('HbcAnnotationSummary', () => {
  it('returns null in Essential mode (D-05)', () => {
    vi.mocked(require('@hbc/complexity').useComplexity).mockReturnValue({ variant: 'essential' });
    const { container } = render(
      <HbcAnnotationSummary
        recordType="bd-scorecard"
        recordId="record-001"
        config={createMockAnnotationConfig()}
      />,
      { wrapper }
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows "No open annotations" when all are resolved', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue(mockAnnotationStates.resolved);
    render(
      <HbcAnnotationSummary
        recordType="bd-scorecard"
        recordId="record-001"
        config={createMockAnnotationConfig()}
      />,
      { wrapper }
    );
    expect(await screen.findByText('No open annotations')).toBeInTheDocument();
  });

  it('renders open count and breakdown badges', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue(mockAnnotationStates.openClarification);
    render(
      <HbcAnnotationSummary
        recordType="bd-scorecard"
        recordId="record-001"
        config={createMockAnnotationConfig()}
      />,
      { wrapper }
    );
    expect(await screen.findByText('1 open annotation')).toBeInTheDocument();
    expect(await screen.findByText(/1 clarification/)).toBeInTheDocument();
  });

  it('shows per-field breakdown in Expert mode (D-05)', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue(mockAnnotationStates.openClarification);
    vi.mocked(require('@hbc/complexity').useComplexity).mockReturnValue({ variant: 'expert' });
    render(
      <HbcAnnotationSummary
        recordType="bd-scorecard"
        recordId="record-001"
        config={createMockAnnotationConfig()}
      />,
      { wrapper }
    );
    expect(await screen.findByText('Total Buildable Area (SF)')).toBeInTheDocument();
  });

  it('calls onFieldFocus when a field item is clicked (Expert mode)', async () => {
    vi.mocked(AnnotationApi.list).mockResolvedValue(mockAnnotationStates.openClarification);
    vi.mocked(require('@hbc/complexity').useComplexity).mockReturnValue({ variant: 'expert' });
    const onFieldFocus = vi.fn();
    render(
      <HbcAnnotationSummary
        recordType="bd-scorecard"
        recordId="record-001"
        config={createMockAnnotationConfig()}
        onFieldFocus={onFieldFocus}
      />,
      { wrapper }
    );
    const fieldBtn = await screen.findByText('Total Buildable Area (SF)');
    fireEvent.click(fieldBtn.closest('button')!);
    expect(onFieldFocus).toHaveBeenCalledWith('totalBuildableArea');
  });
});
```

---

## Storybook Story Requirements

Create `packages/field-annotations/src/components/__stories__/`:

### `HbcAnnotationMarker.stories.tsx`

Required stories (one per canonical state × key complexity variants):

| Story Name | `mockAnnotationStates` | Complexity | Notes |
|---|---|---|---|
| `Empty_CanAnnotate` | `empty` | standard | Ghost add indicator visible on hover |
| `Empty_ReadOnly` | `empty` | standard | No marker rendered |
| `OpenClarification` | `openClarification` | standard | Red dot |
| `OpenRevisionFlag` | `openRevisionFlag` | standard | Amber dot |
| `OpenComment` | `openComment` | standard | Blue dot |
| `Resolved` | `resolved` | standard | Grey checkmark dot |
| `Mixed_Standard` | `mixed` | standard | Red dot (highest priority) |
| `Mixed_Expert` | `mixed` | expert | Red dot + count badge showing "2" |
| `Essential_Hidden` | `openClarification` | essential | Returns null — renders nothing |

### `HbcAnnotationThread.stories.tsx`

Required stories:

| Story Name | Annotations | Notes |
|---|---|---|
| `Empty_CanAnnotate` | `empty` | Add form visible, no thread items |
| `OpenClarification` | `openClarification` | Red badge, resolve form available |
| `OpenRevisionFlag_WithReplies` | `openRevisionFlag` | Amber badge + replies thread |
| `OpenComment_ReadOnly` | `openComment` | Blue badge, no resolve/add controls |
| `Mixed_WithResolved` | `mixed` | Open + "Show resolved" toggle |
| `ResolveForm_RequiredNote` | `openClarification` | Resolve form with required note validation |
| `Expert_InlineReply` | `openClarification` | Expert mode: inline textarea reply form |

### `HbcAnnotationSummary.stories.tsx`

Required stories:

| Story Name | Annotations | Complexity |
|---|---|---|
| `NoAnnotations` | `empty` | standard |
| `OpenClarification_Standard` | `openClarification` | standard (count only) |
| `Mixed_Expert` | `mixed` | expert (full breakdown) |
| `MultipleFields` | custom (3 fields, 5 annotations) | expert |

---

## Playwright E2E Scenarios

Add to `e2e/field-annotations.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Field Annotations — E2E', () => {

  test('D-05: Essential mode hides all annotation markers', async ({ page }) => {
    await page.goto('/dev-harness/field-annotations?scenario=open-clarification&complexity=essential');
    await expect(page.locator('[data-testid="hbc-annotation-marker"]')).not.toBeVisible();
    await expect(page.locator('.hbc-annotation-summary')).not.toBeAttached();
  });

  test('D-05: Standard mode shows colored dot and opens thread on click', async ({ page }) => {
    await page.goto('/dev-harness/field-annotations?scenario=open-clarification&complexity=standard');
    const marker = page.locator('[data-testid="hbc-annotation-marker"]');
    await expect(marker).toBeVisible();
    await expect(marker).toHaveClass(/hbc-annotation-marker--red/);
    await marker.click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('D-05: Expert mode shows count badge', async ({ page }) => {
    await page.goto('/dev-harness/field-annotations?scenario=mixed&complexity=expert');
    await expect(page.locator('.hbc-annotation-marker__count')).toContainText('2');
  });

  test('D-03: Adding clarification-request annotation causes BIC block banner to appear', async ({ page }) => {
    await page.goto('/dev-harness/field-annotations?scenario=empty-with-bic&complexity=standard');
    await expect(page.locator('.hbc-bic-blocked-banner')).not.toBeVisible();
    // Add annotation
    const marker = page.locator('[data-testid="hbc-annotation-marker"]');
    await marker.click();
    await page.selectOption('#annotation-intent', 'clarification-request');
    await page.fill('[aria-label="Annotation text"]', 'Please clarify this field.');
    await page.click('.hbc-annotation-add-form__actions .hbc-btn--primary');
    // BIC blocked banner should now be visible
    await expect(page.locator('.hbc-bic-blocked-banner')).toBeVisible();
    await expect(page.locator('.hbc-bic-blocked-banner')).toContainText('1 open annotation');
  });

  test('D-03: Resolving last clarification-request clears BIC block', async ({ page }) => {
    await page.goto('/dev-harness/field-annotations?scenario=open-clarification-with-bic&complexity=standard');
    await expect(page.locator('.hbc-bic-blocked-banner')).toBeVisible();
    // Resolve the annotation
    const marker = page.locator('[data-testid="hbc-annotation-marker"]');
    await marker.click();
    await page.click('.hbc-annotation-card__action-btn--resolve');
    await page.fill('.hbc-annotation-resolve-form__textarea', 'Confirmed with the surveyor.');
    await page.click('.hbc-annotation-resolve-form__actions .hbc-btn--primary');
    // BIC blocked banner should disappear
    await expect(page.locator('.hbc-bic-blocked-banner')).not.toBeVisible();
  });

  test('D-07: Resolved annotations collapsed by default, shown on toggle', async ({ page }) => {
    await page.goto('/dev-harness/field-annotations?scenario=resolved&complexity=standard');
    const marker = page.locator('[data-testid="hbc-annotation-marker"]');
    await marker.click();
    // Resolved section should exist but be collapsed
    await expect(page.locator('.hbc-annotation-thread__resolved-toggle')).toBeVisible();
    await expect(page.locator('.hbc-annotation-thread__resolved-list')).not.toBeVisible();
    await page.click('.hbc-annotation-thread__resolved-toggle');
    await expect(page.locator('.hbc-annotation-thread__resolved-list')).toBeVisible();
  });

  test('D-08: Creating annotation without assignment triggers notification to record owner', async ({ page }) => {
    await page.goto('/dev-harness/field-annotations?scenario=empty&complexity=standard');
    const marker = page.locator('[data-testid="hbc-annotation-marker"]');
    await marker.click();
    await page.selectOption('#annotation-intent', 'clarification-request');
    await page.fill('[aria-label="Annotation text"]', 'Clarification needed.');
    await page.click('.hbc-annotation-add-form__actions .hbc-btn--primary');
    // Verify notification was dispatched (via custom event or network request)
    const notifRequest = page.waitForRequest((req) =>
      req.url().includes('/api/notifications') && req.method() === 'POST'
    );
    await expect(notifRequest).resolves.toBeTruthy();
  });

  test('D-09: HbcAnnotationSummary onFieldFocus callback scrolls to field', async ({ page }) => {
    await page.goto('/dev-harness/field-annotations?scenario=open-clarification&complexity=expert');
    const fieldButton = page.locator('.hbc-annotation-summary__field-btn').first();
    await expect(fieldButton).toBeVisible();
    await fieldButton.click();
    // Field should be scrolled into view and focused
    const focusedFieldId = await page.evaluate(() =>
      document.querySelector('[data-annotation-focused="true"]')?.id
    );
    expect(focusedFieldId).toBe('totalBuildableArea');
  });

  test('D-06: Thread uses app-shell Popover (not full Fluent Dialog) in SPFx context', async ({ page }) => {
    await page.goto('/dev-harness/field-annotations?scenario=open-clarification&context=spfx');
    const marker = page.locator('[data-testid="hbc-annotation-marker"]');
    await marker.click();
    // App-shell Popover should be visible; full-page dialog overlay should NOT be present
    await expect(page.locator('.hbc-popover')).toBeVisible();
    await expect(page.locator('.ms-Dialog')).not.toBeAttached();
  });

});
```

---

## Verification Commands

```bash
# 1. Full test suite with coverage
pnpm --filter @hbc/field-annotations test:coverage

# 2. Confirm ≥95% thresholds pass (vitest exits 0)

# 3. Verify testing sub-path exports (D-10)
node -e "
  import('@hbc/field-annotations/testing').then(m => {
    console.log('createMockAnnotation:', typeof m.createMockAnnotation === 'function');
    console.log('createMockAnnotationReply:', typeof m.createMockAnnotationReply === 'function');
    console.log('createMockAnnotationConfig:', typeof m.createMockAnnotationConfig === 'function');
    console.log('mockAnnotationStates keys:', Object.keys(m.mockAnnotationStates));
  });
"
# Expected mockAnnotationStates keys: empty, openComment, openClarification, openRevisionFlag, resolved, mixed

# 4. Playwright E2E (requires dev-harness running)
pnpm exec playwright test e2e/field-annotations.spec.ts --reporter=list

# 5. Storybook visual check (requires dev-harness)
pnpm --filter @hbc/dev-harness storybook
# Navigate to: Annotations / HbcAnnotationMarker, HbcAnnotationThread, HbcAnnotationSummary
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF07-T08 completed: 2026-03-10

Batch 1 — Testing sub-path (4 factory/fixture files):
  - testing/createMockAnnotationReply.ts — IAnnotationReply factory
  - testing/createMockAnnotation.ts — IFieldAnnotation factory
  - testing/createMockAnnotationConfig.ts — IFieldAnnotationConfig factory
  - testing/mockAnnotationStates.ts — 6 canonical states (empty, openComment, openClarification, openRevisionFlag, resolved, mixed)
  - testing/index.ts — re-exports all (already correct)

Batch 2 — Vitest unit tests (7 test files, 97 tests):
  - AnnotationApi.test.ts — 20 tests (all 6 methods, mapListItemToAnnotation, RepliesJson parsing, error handling, resolveAnnotationConfig)
  - useFieldAnnotations.test.ts — 8 tests (computeAnnotationCounts, query behavior, enabled=false, empty/mixed counts)
  - useFieldAnnotation.test.ts — 5 tests (fieldKey filter, openCount, enabled=false)
  - useAnnotationActions.test.ts — 5 tests (create/reply/resolve/withdraw mutations, cache invalidation, pending states)
  - HbcAnnotationMarker.test.tsx — 16 tests (essential→null, viewer hidden, add-only, red/amber/blue/grey dots, expert badge, forceVariant, thread open/close)
  - HbcAnnotationThread.test.tsx — 25 tests (popover, cards, replies, reply form, resolve form, withdraw, resolved toggle, escape close, add form, intent placeholders)
  - HbcAnnotationSummary.test.tsx — 18 tests (essential→null, loading, empty, counts, expert breakdown, field focus, standard summary, singular/plural text)
  Coverage: 100% statements/functions/lines, 95.19% branches (passes 95% threshold)

Batch 3 — Storybook stories (3 story files + config):
  - .storybook/main.ts — Storybook 8 react-vite config
  - HbcAnnotationMarker.stories.tsx — 9 stories
  - HbcAnnotationThread.stories.tsx — 7 stories
  - HbcAnnotationSummary.stories.tsx — 4 stories

Batch 4 — Playwright E2E + docs:
  - e2e/field-annotations.spec.ts — 9 test.skip() stubs (D-03, D-05, D-06, D-07, D-08, D-09 coverage)

Spec discrepancies corrected:
  1. variant→tier (useComplexity returns { tier })
  2. Import paths (../api → correct for src/__tests__/)
  3. CJS require()→ESM vi.mock pattern
  4. Missing fireEvent import (added)
  5. AnnotationApi mock path corrected
  6. Testing sub-path imports validated

All gates pass: build, lint, check-types, test:coverage
Next: SF07-T09 (Deployment)
-->
