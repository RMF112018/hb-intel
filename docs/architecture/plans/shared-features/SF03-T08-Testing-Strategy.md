# SF03-T08 — Testing Strategy

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Decisions Applied:** All D-01 through D-10
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** T01–T07

---

## Objective

Implement ≥95% unit test coverage across all hooks, provider, and gate logic. Implement the `@hbc/complexity/testing` sub-path (D-10). Write Storybook stories for all tier states. Define Playwright E2E scenarios.

---

## 3-Line Plan

1. Implement `testing/` sub-path — `ComplexityTestProvider`, `createComplexityWrapper`, `mockComplexityContext`, `allTiers`.
2. Write Vitest unit tests covering all locked decisions.
3. Define Storybook stories and Playwright E2E scenarios for all critical behaviors.

---

## `testing/allTiers.ts`

```typescript
import type { ComplexityTier } from '../src/types/IComplexity';

/**
 * All three complexity tiers as a typed const array (D-10).
 * Use for parameterized tests that must cover all tiers.
 *
 * @example
 * import { allTiers } from '@hbc/complexity/testing';
 *
 * test.each(allTiers)('renders at tier %s', (tier) => {
 *   render(<MyComponent />, { wrapper: createComplexityWrapper(tier) });
 *   // ...
 * });
 */
export const allTiers = ['essential', 'standard', 'expert'] as const satisfies ComplexityTier[];
```

---

## `testing/mockComplexityContext.ts`

```typescript
import { vi } from 'vitest';
import type { IComplexityContext, ComplexityTier } from '../src/types/IComplexity';
import { tierRank } from '../src/types/IComplexity';

/**
 * Returns a complete IComplexityContext with all functions as vi.fn() (D-10).
 * Use when you need to spy on setTier, setShowCoaching, atLeast, or is calls.
 *
 * @example
 * const ctx = mockComplexityContext({ tier: 'expert' });
 * expect(ctx.atLeast('standard')).toBe(true);
 * // ctx.setTier is a vi.fn() — assert it was called
 */
export function mockComplexityContext(
  overrides?: Partial<IComplexityContext>
): IComplexityContext {
  const tier: ComplexityTier = overrides?.tier ?? 'standard';

  return {
    tier,
    showCoaching: overrides?.showCoaching ?? tier === 'essential',
    lockedBy: overrides?.lockedBy ?? undefined,
    lockedUntil: overrides?.lockedUntil ?? undefined,
    isLocked: overrides?.isLocked ?? false,
    atLeast: overrides?.atLeast ?? ((threshold) => tierRank(tier) >= tierRank(threshold)),
    is: overrides?.is ?? ((t) => tier === t),
    setTier: overrides?.setTier ?? vi.fn(),
    setShowCoaching: overrides?.setShowCoaching ?? vi.fn(),
  };
}
```

---

## `testing/ComplexityTestProvider.tsx`

```tsx
import React from 'react';
import { ComplexityContext } from '../src/context/ComplexityContext';
import { mockComplexityContext } from './mockComplexityContext';
import type { ComplexityTier } from '../src/types/IComplexity';
import type { IComplexityContext } from '../src/types/IComplexity';

export interface ComplexityTestProviderProps {
  /** The tier to render at. @default 'standard' */
  tier?: ComplexityTier;
  /** Whether coaching prompts should show. Defaults to true for essential, false otherwise. */
  showCoaching?: boolean;
  /** Whether the tier is locked. */
  isLocked?: boolean;
  lockedBy?: 'admin' | 'onboarding';
  lockedUntil?: string;
  /** Full context override — use when you need spy functions */
  value?: Partial<IComplexityContext>;
  children: React.ReactNode;
}

/**
 * Drop-in replacement for ComplexityProvider in tests and Storybook (D-10).
 * No localStorage, no API calls, no StorageEvent listeners.
 * Renders children at the specified tier immediately with no async gap.
 *
 * @example
 * render(
 *   <ComplexityTestProvider tier="expert">
 *     <MyComplexityAwareComponent />
 *   </ComplexityTestProvider>
 * );
 *
 * @example — With spy functions
 * const ctx = mockComplexityContext({ tier: 'standard' });
 * render(<ComplexityTestProvider value={ctx}><MyComponent /></ComplexityTestProvider>);
 * expect(ctx.setTier).toHaveBeenCalledWith('expert');
 */
export function ComplexityTestProvider({
  tier = 'standard',
  showCoaching,
  isLocked = false,
  lockedBy,
  lockedUntil,
  value,
  children,
}: ComplexityTestProviderProps): React.ReactElement {
  const contextValue = mockComplexityContext({
    tier,
    showCoaching: showCoaching ?? (tier === 'essential'),
    isLocked,
    lockedBy,
    lockedUntil,
    ...value,
  });

  return (
    <ComplexityContext.Provider value={contextValue}>
      {children}
    </ComplexityContext.Provider>
  );
}
```

---

## `testing/createComplexityWrapper.tsx`

```tsx
import React from 'react';
import { ComplexityTestProvider } from './ComplexityTestProvider';
import type { ComplexityTier } from '../src/types/IComplexity';

/**
 * Creates a Testing Library `wrapper` factory for a given complexity tier (D-10).
 *
 * @example — One-liner test setup
 * render(<MyComponent />, { wrapper: createComplexityWrapper('expert') });
 *
 * @example — With parameterized tests
 * test.each(allTiers)('renders correctly at %s', (tier) => {
 *   render(<MyComponent />, { wrapper: createComplexityWrapper(tier) });
 *   // ...
 * });
 */
export function createComplexityWrapper(tier: ComplexityTier) {
  return function Wrapper({ children }: { children: React.ReactNode }): React.ReactElement {
    return <ComplexityTestProvider tier={tier}>{children}</ComplexityTestProvider>;
  };
}
```

---

## `testing/index.ts`

```typescript
export { ComplexityTestProvider } from './ComplexityTestProvider';
export type { ComplexityTestProviderProps } from './ComplexityTestProvider';
export { createComplexityWrapper } from './createComplexityWrapper';
export { mockComplexityContext } from './mockComplexityContext';
export { allTiers } from './allTiers';
```

---

## Unit Tests

### `src/__tests__/useComplexityGate.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { evaluateGate } from '../../hooks/useComplexityGate';

describe('evaluateGate (D-04)', () => {
  describe('minTier only', () => {
    it.each([
      ['essential', 'standard', false],
      ['standard', 'standard', true],
      ['expert', 'standard', true],
      ['essential', 'expert', false],
      ['standard', 'expert', false],
      ['expert', 'expert', true],
    ])('tier=%s, minTier=%s → %s', (tier, minTier, expected) => {
      expect(evaluateGate(tier as any, { minTier: minTier as any })).toBe(expected);
    });
  });

  describe('maxTier only', () => {
    it.each([
      ['essential', 'standard', true],
      ['standard', 'standard', true],
      ['expert', 'standard', false],
      ['essential', 'essential', true],
      ['standard', 'essential', false],
    ])('tier=%s, maxTier=%s → %s', (tier, maxTier, expected) => {
      expect(evaluateGate(tier as any, { maxTier: maxTier as any })).toBe(expected);
    });
  });

  describe('minTier + maxTier', () => {
    it.each([
      ['essential', 'standard', 'standard', false],
      ['standard', 'standard', 'standard', true],
      ['expert', 'standard', 'standard', false],
      ['essential', 'essential', 'essential', true],
      ['standard', 'essential', 'essential', false],
    ])('tier=%s, min=%s, max=%s → %s', (tier, min, max, expected) => {
      expect(evaluateGate(tier as any, { minTier: min as any, maxTier: max as any })).toBe(expected);
    });
  });

  describe('no condition', () => {
    it.each(['essential', 'standard', 'expert'] as const)(
      'always true at tier %s', (tier) => {
        expect(evaluateGate(tier, {})).toBe(true);
      }
    );
  });
});
```

### `src/__tests__/useComplexity.test.ts`

```typescript
import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useComplexity } from '../../hooks/useComplexity';
import { createComplexityWrapper, allTiers } from '../../../testing';

describe('useComplexity — atLeast helper', () => {
  it.each([
    ['essential', 'essential', true],
    ['essential', 'standard', false],
    ['essential', 'expert', false],
    ['standard', 'essential', true],
    ['standard', 'standard', true],
    ['standard', 'expert', false],
    ['expert', 'essential', true],
    ['expert', 'standard', true],
    ['expert', 'expert', true],
  ] as const)('at %s, atLeast(%s) = %s', (tier, threshold, expected) => {
    const { result } = renderHook(() => useComplexity(), {
      wrapper: createComplexityWrapper(tier),
    });
    expect(result.current.atLeast(threshold)).toBe(expected);
  });
});

describe('useComplexity — is helper', () => {
  it.each(allTiers)('is(%s) true only when current tier is %s', (tier) => {
    const { result } = renderHook(() => useComplexity(), {
      wrapper: createComplexityWrapper(tier),
    });
    for (const t of allTiers) {
      expect(result.current.is(t)).toBe(t === tier);
    }
  });
});

describe('useComplexity — showCoaching default (D-07)', () => {
  it('defaults showCoaching to true at essential', () => {
    const { result } = renderHook(() => useComplexity(), {
      wrapper: createComplexityWrapper('essential'),
    });
    expect(result.current.showCoaching).toBe(true);
  });

  it('defaults showCoaching to false at standard', () => {
    const { result } = renderHook(() => useComplexity(), {
      wrapper: createComplexityWrapper('standard'),
    });
    expect(result.current.showCoaching).toBe(false);
  });

  it('defaults showCoaching to false at expert', () => {
    const { result } = renderHook(() => useComplexity(), {
      wrapper: createComplexityWrapper('expert'),
    });
    expect(result.current.showCoaching).toBe(false);
  });
});
```

### `src/__tests__/HbcComplexityGate.test.tsx`

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HbcComplexityGate } from '../../components/HbcComplexityGate';
import { createComplexityWrapper, allTiers } from '../../../testing';

describe('HbcComplexityGate — unmount default (D-04)', () => {
  it('renders children when gate is open', () => {
    render(
      <HbcComplexityGate minTier="standard">
        <span>Expert content</span>
      </HbcComplexityGate>,
      { wrapper: createComplexityWrapper('standard') }
    );
    expect(screen.getByText('Expert content')).toBeInTheDocument();
  });

  it('unmounts children when gate is closed', () => {
    render(
      <HbcComplexityGate minTier="expert">
        <span>Expert content</span>
      </HbcComplexityGate>,
      { wrapper: createComplexityWrapper('standard') }
    );
    expect(screen.queryByText('Expert content')).not.toBeInTheDocument();
  });

  it('renders fallback when gate is closed', () => {
    render(
      <HbcComplexityGate minTier="expert" fallback={<span>Fallback</span>}>
        <span>Expert content</span>
      </HbcComplexityGate>,
      { wrapper: createComplexityWrapper('standard') }
    );
    expect(screen.getByText('Fallback')).toBeInTheDocument();
    expect(screen.queryByText('Expert content')).not.toBeInTheDocument();
  });

  it('keeps children in DOM when keepMounted=true (D-04)', () => {
    render(
      <HbcComplexityGate minTier="expert" keepMounted>
        <span>Expert content</span>
      </HbcComplexityGate>,
      { wrapper: createComplexityWrapper('standard') }
    );
    // In DOM but hidden
    const el = screen.getByText('Expert content');
    expect(el).toBeInTheDocument();
    expect(el.closest('[aria-hidden="true"]')).toBeInTheDocument();
  });
});

describe('HbcComplexityGate — maxTier', () => {
  it('renders coaching prompt at essential and standard', () => {
    for (const tier of ['essential', 'standard'] as const) {
      const { unmount } = render(
        <HbcComplexityGate maxTier="standard">
          <span>Coaching</span>
        </HbcComplexityGate>,
        { wrapper: createComplexityWrapper(tier) }
      );
      expect(screen.getByText('Coaching')).toBeInTheDocument();
      unmount();
    }
  });

  it('hides coaching prompt at expert', () => {
    render(
      <HbcComplexityGate maxTier="standard">
        <span>Coaching</span>
      </HbcComplexityGate>,
      { wrapper: createComplexityWrapper('expert') }
    );
    expect(screen.queryByText('Coaching')).not.toBeInTheDocument();
  });
});
```

### `src/__tests__/HbcComplexityDial.test.tsx`

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { HbcComplexityDial } from '../../components/HbcComplexityDial';
import { ComplexityTestProvider, mockComplexityContext } from '../../../testing';

describe('HbcComplexityDial — header variant', () => {
  it('renders three tier buttons', () => {
    render(
      <ComplexityTestProvider tier="standard">
        <HbcComplexityDial variant="header" />
      </ComplexityTestProvider>
    );
    expect(screen.getByRole('button', { name: /essential/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /standard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /expert/i })).toBeInTheDocument();
  });

  it('marks current tier as active (aria-pressed)', () => {
    render(
      <ComplexityTestProvider tier="expert">
        <HbcComplexityDial variant="header" />
      </ComplexityTestProvider>
    );
    expect(screen.getByRole('button', { name: /expert/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /standard/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls setTier when a segment is clicked', async () => {
    const ctx = mockComplexityContext({ tier: 'standard' });
    render(
      <ComplexityTestProvider value={ctx}>
        <HbcComplexityDial variant="header" />
      </ComplexityTestProvider>
    );
    await userEvent.click(screen.getByRole('button', { name: /expert/i }));
    expect(ctx.setTier).toHaveBeenCalledWith('expert');
  });
});

describe('HbcComplexityDial — locked state (D-06)', () => {
  it('disables all buttons when locked', () => {
    render(
      <ComplexityTestProvider tier="essential" isLocked lockedBy="onboarding">
        <HbcComplexityDial variant="header" />
      </ComplexityTestProvider>
    );
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => expect(btn).toBeDisabled());
  });

  it('shows lock icon when locked', () => {
    render(
      <ComplexityTestProvider tier="essential" isLocked lockedBy="admin">
        <HbcComplexityDial variant="header" />
      </ComplexityTestProvider>
    );
    expect(screen.getByLabelText(/managed by your organization/i)).toBeInTheDocument();
  });
});

describe('HbcComplexityDial — showCoaching toggle (D-07)', () => {
  it('renders coaching toggle in settings variant when showCoachingToggle=true', () => {
    render(
      <ComplexityTestProvider tier="standard">
        <HbcComplexityDial variant="settings" showCoachingToggle />
      </ComplexityTestProvider>
    );
    expect(screen.getByRole('checkbox', { name: /guidance prompts/i })).toBeInTheDocument();
  });

  it('calls setShowCoaching when toggle is clicked', async () => {
    const ctx = mockComplexityContext({ tier: 'standard', showCoaching: false });
    render(
      <ComplexityTestProvider value={ctx}>
        <HbcComplexityDial variant="settings" showCoachingToggle />
      </ComplexityTestProvider>
    );
    await userEvent.click(screen.getByRole('checkbox', { name: /guidance prompts/i }));
    expect(ctx.setShowCoaching).toHaveBeenCalledWith(true);
  });
});
```

### `src/__tests__/complexityStorage.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { readPreference, writePreference, clearPreference } from '../../storage/complexityStorage';

describe('complexityStorage (D-01)', () => {
  beforeEach(() => localStorage.clear());

  it('returns null when no preference stored', () => {
    expect(readPreference(false)).toBeNull();
  });

  it('writes and reads preference round-trip', () => {
    const pref = { tier: 'expert' as const, showCoaching: false };
    writePreference(pref, false);
    expect(readPreference(false)).toEqual(pref);
  });

  it('returns null for corrupt storage value', () => {
    localStorage.setItem('hbc::complexity::v1', 'not-json');
    expect(readPreference(false)).toBeNull();
  });

  it('returns null for invalid tier value', () => {
    localStorage.setItem('hbc::complexity::v1', '{"tier":"invalid","showCoaching":false}');
    expect(readPreference(false)).toBeNull();
  });

  it('clearPreference removes the key', () => {
    writePreference({ tier: 'standard', showCoaching: false }, false);
    clearPreference(false);
    expect(readPreference(false)).toBeNull();
  });

  it('uses sessionStorage when isSpfx=true', () => {
    writePreference({ tier: 'standard', showCoaching: false }, true);
    expect(sessionStorage.getItem('hbc::complexity::v1')).not.toBeNull();
    expect(localStorage.getItem('hbc::complexity::v1')).toBeNull();
  });
});
```

---

## Storybook Story Requirements

Required stories for `HbcComplexityGate`:

| Story | Tier | Gate Condition | Expected |
|---|---|---|---|
| `GateOpen_Standard` | standard | `minTier="standard"` | Children visible |
| `GateClosed_Essential` | essential | `minTier="standard"` | Fallback shown |
| `GateOpen_Expert` | expert | `minTier="expert"` | Children visible |
| `GateClosed_Coaching` | expert | `maxTier="standard"` | Fallback shown |
| `KeepMounted_Hidden` | essential | `minTier="standard" keepMounted` | Children in DOM, `aria-hidden` |
| `FadeIn_Animation` | standard | `minTier="standard"` | Fade-in CSS class visible on mount |

Required stories for `HbcComplexityDial`:

| Story | Tier | Variant | Locked | Coaching Toggle |
|---|---|---|---|---|
| `Header_Essential` | essential | header | false | — |
| `Header_Standard` | standard | header | false | — |
| `Header_Expert` | expert | header | false | — |
| `Header_Locked` | essential | header | true (onboarding) | — |
| `Settings_Standard` | standard | settings | false | shown |
| `Settings_Locked_Admin` | standard | settings | true (admin, with expiry) | shown |

---

## Playwright E2E Scenarios

```typescript
// e2e/complexity-dial.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Complexity Dial — E2E', () => {

  test('D-03: New user starts at Essential, upgrades additively after API response', async ({ page }) => {
    await page.goto('/dev-harness/complexity?scenario=new-user');
    // Initial render at Essential
    await expect(page.locator('[data-complexity-tier="essential"]')).toBeVisible();
    // After mock API response resolves (Expert role)
    await page.waitForTimeout(500);
    await expect(page.locator('[data-complexity-tier="expert"]')).toBeVisible();
    // Confirm no content vanished (additive transition only)
  });

  test('D-04: HbcComplexityGate unmounts Expert content at Standard tier', async ({ page }) => {
    await page.goto('/dev-harness/complexity?tier=standard');
    await expect(page.locator('[data-testid="audit-trail-panel"]')).not.toBeVisible();
  });

  test('D-04: keepMounted keeps content in DOM but hides it', async ({ page }) => {
    await page.goto('/dev-harness/complexity?tier=standard&scenario=keepmounted');
    const el = page.locator('[data-testid="keepmounted-content"]');
    await expect(el).toBeAttached(); // In DOM
    await expect(el.locator('..').filter({ has: page.locator('[aria-hidden="true"]') })).toBeVisible();
  });

  test('D-05: Tier change in one tab syncs to another tab instantly', async ({ browser }) => {
    const context = await browser.newContext();
    const [tabA, tabB] = await Promise.all([
      context.newPage(),
      context.newPage(),
    ]);
    await tabA.goto('/dev-harness/complexity?tier=standard');
    await tabB.goto('/dev-harness/complexity?tier=standard');

    // Change tier in Tab A
    await tabA.click('[data-testid="dial-expert"]');

    // Tab B should update without reload
    await expect(tabB.locator('[data-testid="active-tier"]')).toHaveText('expert', { timeout: 2000 });
    await context.close();
  });

  test('D-06: Locked dial renders disabled with lock tooltip', async ({ page }) => {
    await page.goto('/dev-harness/complexity?scenario=locked-onboarding');
    const buttons = page.locator('.hbc-complexity-dial__segment');
    await expect(buttons.first()).toBeDisabled();
    await expect(page.locator('.hbc-complexity-dial__lock-icon')).toBeVisible();
  });

  test('D-06: Expired lock auto-clears without page reload', async ({ page }) => {
    // Scenario: lock with lockedUntil = 1 second in the future
    await page.goto('/dev-harness/complexity?scenario=expiring-lock');
    await expect(page.locator('.hbc-complexity-dial--locked')).toBeVisible();
    // Wait for lock to expire and polling interval to fire
    await page.waitForTimeout(70_000); // 60s polling + buffer
    await expect(page.locator('.hbc-complexity-dial--locked')).not.toBeVisible();
  });

  test('D-07: showCoaching toggle works independently of tier', async ({ page }) => {
    await page.goto('/dev-harness/complexity?tier=standard&showCoaching=true');
    await expect(page.locator('[data-testid="coaching-callout"]')).toBeVisible();
    await page.click('[data-testid="coaching-toggle"]');
    await expect(page.locator('[data-testid="coaching-callout"]')).not.toBeVisible();
    // Tier is still Standard — only coaching changed
    await expect(page.locator('[data-testid="active-tier"]')).toHaveText('standard');
  });

  test('D-09: Fade-in animation class applied on gate open', async ({ page }) => {
    await page.goto('/dev-harness/complexity?tier=standard');
    // Switch to Expert — Expert-gated content should fade in
    await page.click('[data-testid="dial-expert"]');
    const gateContent = page.locator('.hbc-complexity-gate__content--entering');
    await expect(gateContent).toBeVisible();
    // Animation completes in 150ms
    await page.waitForTimeout(200);
    await expect(gateContent).not.toBeVisible(); // Class removed after animation
  });

});
```

---

## Verification Commands

```bash
# 1. Full test suite with coverage
pnpm --filter @hbc/complexity test:coverage
# Expected: Lines ≥95%, Functions ≥95%, Branches ≥95%

# 2. Verify testing sub-path exports
node -e "
  import('@hbc/complexity/testing').then(m => {
    console.log('allTiers:', m.allTiers);
    console.log('createComplexityWrapper:', typeof m.createComplexityWrapper);
    console.log('ComplexityTestProvider:', typeof m.ComplexityTestProvider);
    console.log('mockComplexityContext:', typeof m.mockComplexityContext);
  });
"

# 3. Playwright E2E
pnpm exec playwright test e2e/complexity-dial.spec.ts --reporter=list
```
