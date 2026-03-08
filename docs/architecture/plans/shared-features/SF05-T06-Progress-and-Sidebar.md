# SF05-T06 — `HbcStepProgress` + `HbcStepSidebar`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Decisions Applied:** D-06 (complexity density), D-09 (HbcStepProgress self-fetches)
**Estimated Effort:** 0.5 sprint-weeks
**Wave:** 3

---

## Objective

Implement `HbcStepProgress` (compact list-row indicator — bar / ring / fraction, self-fetching via D-09) and `HbcStepSidebar` (standalone vertical step nav for detail pages that manage their own content area).

---

## 3-Line Plan

1. Implement `HbcStepProgress` using `useStepProgress(config, item)` (D-09); render bar, ring, and fraction variants with stale-state awareness.
2. Implement `HbcStepSidebar` as a stateless display component wrapping `WizardSidebar` from T05 — accepts external `activeStepId` and `onStepSelect` callback.
3. Verify all progress variants and sidebar interaction paths with unit tests.

---

## `HbcStepProgress`

### Props

```typescript
interface HbcStepProgressProps<T> {
  item: T;
  config: IStepWizardConfig<T>;
  /** Display variant. Defaults to 'fraction'. */
  variant?: 'bar' | 'ring' | 'fraction';
}
```

### Self-Fetch via `useStepProgress` (D-09)

`HbcStepProgress` calls `useStepProgress(config, item)` directly. `useStepProgress` resolves `draftKey` from config (handling both string and function forms), reads from the session-state draft store synchronously, and returns `{ completedCount, requiredCount, percentComplete, isComplete, isStale }`.

No TanStack Query. No network call. Draft store read is synchronous IndexedDB cache access.

### Implementation

```typescript
// components/HbcStepProgress.tsx
import * as React from 'react';
import { useStepProgress } from '../hooks/useStepProgress';
import type { IStepWizardConfig } from '../types/IStepWizard';

export function HbcStepProgress<T>({
  item,
  config,
  variant = 'fraction',
}: HbcStepProgressProps<T>) {
  const { completedCount, requiredCount, percentComplete, isComplete, isStale } =
    useStepProgress(config, item);

  return (
    <span
      className={[
        'hbc-step-progress',
        `hbc-step-progress--${variant}`,
        isComplete && 'hbc-step-progress--complete',
        isStale && 'hbc-step-progress--stale',
      ].filter(Boolean).join(' ')}
      aria-label={`${completedCount} of ${requiredCount} steps complete`}
    >
      {variant === 'fraction' && (
        <FractionVariant
          completedCount={completedCount}
          requiredCount={requiredCount}
          isComplete={isComplete}
        />
      )}
      {variant === 'bar' && (
        <BarVariant percentComplete={percentComplete} isComplete={isComplete} />
      )}
      {variant === 'ring' && (
        <RingVariant percentComplete={percentComplete} isComplete={isComplete} />
      )}
      {isStale && (
        <span className="hbc-step-progress__stale-indicator" title="Progress data may be out of date">
          ↻
        </span>
      )}
    </span>
  );
}
```

### Fraction Variant

```typescript
function FractionVariant({
  completedCount, requiredCount, isComplete
}: { completedCount: number; requiredCount: number; isComplete: boolean }) {
  return (
    <span className="hbc-step-progress__fraction">
      {isComplete
        ? <><span className="hbc-step-progress__check">✓</span> Complete</>
        : <>{completedCount} of {requiredCount}</>
      }
    </span>
  );
}
```

### Bar Variant

```typescript
function BarVariant({ percentComplete, isComplete }: { percentComplete: number; isComplete: boolean }) {
  return (
    <span className="hbc-step-progress__bar-wrap">
      <span
        className="hbc-step-progress__bar-fill"
        style={{ width: `${percentComplete}%` }}
        role="progressbar"
        aria-valuenow={percentComplete}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${percentComplete}% complete`}
      />
    </span>
  );
}
```

### Ring Variant (SVG)

```typescript
function RingVariant({ percentComplete, isComplete }: { percentComplete: number; isComplete: boolean }) {
  const RADIUS = 16;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const dashOffset = CIRCUMFERENCE * (1 - percentComplete / 100);

  return (
    <svg
      className="hbc-step-progress__ring"
      width="40"
      height="40"
      viewBox="0 0 40 40"
      aria-hidden="true"
    >
      {/* Track */}
      <circle
        cx="20" cy="20" r={RADIUS}
        fill="none"
        stroke="var(--hbc-color-neutral-200)"
        strokeWidth="3"
      />
      {/* Fill */}
      <circle
        cx="20" cy="20" r={RADIUS}
        fill="none"
        stroke={isComplete ? 'var(--hbc-color-success)' : 'var(--hbc-color-primary)'}
        strokeWidth="3"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform="rotate(-90 20 20)"
      />
      {/* Center label */}
      <text
        x="20" y="24"
        textAnchor="middle"
        fontSize="10"
        fill="var(--hbc-color-neutral-700)"
      >
        {isComplete ? '✓' : `${percentComplete}%`}
      </text>
    </svg>
  );
}
```

---

## `HbcStepSidebar`

### Purpose

`HbcStepSidebar` is the standalone version of the vertical step nav. It is used by consuming modules that manage their own content area — they want to embed the step nav in an existing detail page layout without using the full `HbcStepWizard` wrapper.

### Props

```typescript
interface HbcStepSidebarProps<T> {
  item: T;
  config: IStepWizardConfig<T>;
  activeStepId: string;
  onStepSelect: (stepId: string) => void;
  /** Override complexity tier for Storybook/testing. */
  complexityTier?: ComplexityTier;
}
```

### Implementation

```typescript
// components/HbcStepSidebar.tsx
import * as React from 'react';
import { useComplexity } from '@hbc/complexity';
import { useStepWizard } from '../hooks/useStepWizard';
import { WizardSidebar } from './shared/WizardSidebar';
import type { IStepWizardConfig } from '../types/IStepWizard';

export function HbcStepSidebar<T>({
  item,
  config,
  activeStepId,
  onStepSelect,
  complexityTier,
}: HbcStepSidebarProps<T>) {
  const { tier: contextTier, showCoaching } = useComplexity();
  const tier = complexityTier ?? contextTier;

  // Uses useStepWizard to get derived state — does not manage navigation internally
  const { state, getValidationError } = useStepWizard(config, item);

  return (
    <WizardSidebar
      steps={state.steps}
      activeStepId={activeStepId}
      tier={tier}
      orderMode={config.orderMode}
      showCoaching={showCoaching}
      onStepClick={onStepSelect}
      getValidationError={getValidationError}
    />
  );
}
```

---

## CSS Classes

```css
/* HbcStepProgress */
.hbc-step-progress { display: inline-flex; align-items: center; gap: var(--hbc-spacing-1); font-size: 0.875rem; }
.hbc-step-progress--complete { color: var(--hbc-color-success); }
.hbc-step-progress--stale { opacity: 0.7; }
.hbc-step-progress__stale-indicator { font-size: 0.75rem; color: var(--hbc-color-neutral-400); cursor: help; }

.hbc-step-progress__fraction { white-space: nowrap; }
.hbc-step-progress__check { color: var(--hbc-color-success); font-weight: bold; }

.hbc-step-progress__bar-wrap {
  width: 80px; height: 6px;
  background: var(--hbc-color-neutral-200);
  border-radius: 3px; overflow: hidden;
  display: inline-block;
}
.hbc-step-progress__bar-fill {
  height: 100%;
  background: var(--hbc-color-primary);
  border-radius: 3px;
  transition: width 200ms ease;
}
.hbc-step-progress--complete .hbc-step-progress__bar-fill {
  background: var(--hbc-color-success);
}

.hbc-step-progress__ring { display: inline-block; vertical-align: middle; }
```

---

## Unit Tests (Representative)

```typescript
// components/__tests__/HbcStepProgress.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HbcStepProgress } from '../HbcStepProgress';
import { createMockWizardConfig, mockWizardStates } from '@hbc/step-wizard/testing';

// Mock useStepProgress to return controlled state
vi.mock('../../hooks/useStepProgress', () => ({
  useStepProgress: vi.fn(),
}));

import { useStepProgress } from '../../hooks/useStepProgress';

describe('HbcStepProgress', () => {
  const config = createMockWizardConfig();

  it('renders fraction variant with correct count', () => {
    vi.mocked(useStepProgress).mockReturnValue({
      completedCount: 2, requiredCount: 5,
      percentComplete: 40, isComplete: false, isStale: false,
    });
    render(<HbcStepProgress item={{}} config={config} variant="fraction" />);
    expect(screen.getByText('2 of 5')).toBeInTheDocument();
  });

  it('renders complete state in fraction variant', () => {
    vi.mocked(useStepProgress).mockReturnValue({
      completedCount: 3, requiredCount: 3,
      percentComplete: 100, isComplete: true, isStale: false,
    });
    render(<HbcStepProgress item={{}} config={config} variant="fraction" />);
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('renders bar variant with correct aria attributes', () => {
    vi.mocked(useStepProgress).mockReturnValue({
      completedCount: 1, requiredCount: 3,
      percentComplete: 33, isComplete: false, isStale: false,
    });
    render(<HbcStepProgress item={{}} config={config} variant="bar" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '33');
  });

  it('shows stale indicator when isStale=true (D-09)', () => {
    vi.mocked(useStepProgress).mockReturnValue({
      completedCount: 0, requiredCount: 3,
      percentComplete: 0, isComplete: false, isStale: true,
    });
    render(<HbcStepProgress item={{}} config={config} />);
    expect(screen.getByTitle('Progress data may be out of date')).toBeInTheDocument();
  });
});

describe('HbcStepSidebar', () => {
  it('calls onStepSelect when unlocked step is clicked', async () => {
    // Verify click handler fires with correct stepId
  });

  it('does not call onStepSelect for locked steps (D-01)', async () => {
    // Verify locked step click is blocked
  });
});
```

---

## Verification Commands

```bash
pnpm --filter @hbc/step-wizard typecheck
pnpm --filter @hbc/step-wizard test -- --reporter=verbose components/HbcStepProgress
pnpm --filter @hbc/step-wizard test -- --reporter=verbose components/HbcStepSidebar
```
