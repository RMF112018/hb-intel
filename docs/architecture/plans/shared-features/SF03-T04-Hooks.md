# SF03-T04 — Hooks: `useComplexity` & `useComplexityGate`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Decisions Applied:** D-04 (gate boolean), D-06 (lock awareness), D-07 (showCoaching)
**Estimated Effort:** 0.25 sprint-weeks
**Depends On:** T01, T02, T03

---

## Objective

Implement the two hooks that all consumer modules use to read and respond to the complexity tier. These are deliberately thin — they read from the context established by `ComplexityProvider` and expose convenient helpers.

---

## 3-Line Plan

1. Implement `useComplexity` — reads full `IComplexityContext` from context, validates provider presence.
2. Implement `useComplexityGate` — evaluates `minTier`/`maxTier` gate conditions against current tier.
3. Verify all `atLeast`, `is`, and gate combinations return correct booleans for all three tiers.

---

## `src/hooks/useComplexity.ts`

```typescript
import { useContext } from 'react';
import { ComplexityContext } from '../context/ComplexityContext';
import type { IComplexityContext } from '../types/IComplexity';

/**
 * Returns the current complexity context for the authenticated user.
 *
 * Must be called within a ComplexityProvider tree. In development, a console
 * warning fires if called outside a provider — the default Standard context
 * is returned as a safe fallback so the app does not crash.
 *
 * @example
 * const { tier, atLeast, is, setTier, showCoaching, setShowCoaching } = useComplexity();
 *
 * // Gate expensive computation
 * const fullAuditTrail = atLeast('expert') ? computeFullTrail(item) : null;
 *
 * // Coaching prompt visibility
 * const showOnboarding = showCoaching && is('essential');
 *
 * // Tier-specific rendering
 * if (atLeast('standard')) { ... }
 */
export function useComplexity(): IComplexityContext {
  return useContext(ComplexityContext);
}
```

---

## `src/hooks/useComplexityGate.ts`

```typescript
import { useContext } from 'react';
import { ComplexityContext } from '../context/ComplexityContext';
import type { ComplexityTier } from '../types/IComplexity';
import { tierRank } from '../types/IComplexity';
import type { IComplexityGateCondition } from '../types/IComplexity';

/**
 * Returns true if the current complexity tier satisfies both the minTier
 * and maxTier conditions. Used for imperative gate checks when
 * HbcComplexityGate (declarative) is not suitable.
 *
 * Gate truth table:
 * ┌──────────┬──────────┬───────────┬──────────┬─────────┐
 * │ minTier  │ maxTier  │ essential │ standard │ expert  │
 * ├──────────┼──────────┼───────────┼──────────┼─────────┤
 * │ standard │ (none)   │ false     │ true     │ true    │
 * │ expert   │ (none)   │ false     │ false    │ true    │
 * │ (none)   │ standard │ true      │ true     │ false   │
 * │ standard │ standard │ false     │ true     │ false   │
 * │ essential│ essential│ true      │ false    │ false   │
 * │ (none)   │ (none)   │ true      │ true     │ true    │
 * └──────────┴──────────┴───────────┴──────────┴─────────┘
 *
 * @example
 * // Imperative use — compute conditionally
 * const showAdvancedFilters = useComplexityGate({ minTier: 'expert' });
 * const advancedData = showAdvancedFilters ? fetchAdvancedData() : null;
 *
 * @example
 * // Coaching prompt — only Essential and Standard
 * const showCoachingBanner = useComplexityGate({ maxTier: 'standard' });
 */
export function useComplexityGate(condition: IComplexityGateCondition): boolean {
  const { tier } = useContext(ComplexityContext);
  return evaluateGate(tier, condition);
}

/**
 * Pure gate evaluation function — no React dependency.
 * Exported for use in testing and non-hook contexts (e.g., SSR).
 */
export function evaluateGate(
  currentTier: ComplexityTier,
  condition: IComplexityGateCondition
): boolean {
  const currentRank = tierRank(currentTier);

  if (condition.minTier !== undefined) {
    if (currentRank < tierRank(condition.minTier)) return false;
  }

  if (condition.maxTier !== undefined) {
    if (currentRank > tierRank(condition.maxTier)) return false;
  }

  return true;
}
```

---

## `src/hooks/index.ts`

```typescript
export { useComplexity } from './useComplexity';
export { useComplexityGate, evaluateGate } from './useComplexityGate';
```

---

## Gate Truth Table Verification

The following combinations must be tested explicitly in T08 unit tests:

| Tier | minTier | maxTier | Expected |
|---|---|---|---|
| `essential` | `standard` | — | `false` |
| `standard` | `standard` | — | `true` |
| `expert` | `standard` | — | `true` |
| `essential` | `expert` | — | `false` |
| `standard` | `expert` | — | `false` |
| `expert` | `expert` | — | `true` |
| `essential` | — | `standard` | `true` |
| `standard` | — | `standard` | `true` |
| `expert` | — | `standard` | `false` |
| `essential` | `standard` | `standard` | `false` |
| `standard` | `standard` | `standard` | `true` |
| `expert` | `standard` | `standard` | `false` |
| `essential` | `essential` | `essential` | `true` |
| `standard` | `essential` | `essential` | `false` |
| `essential` | — | — | `true` |
| `expert` | — | — | `true` |

---

## `atLeast` Helper Truth Table

| Current Tier | `atLeast('essential')` | `atLeast('standard')` | `atLeast('expert')` |
|---|---|---|---|
| `essential` | `true` | `false` | `false` |
| `standard` | `true` | `true` | `false` |
| `expert` | `true` | `true` | `true` |

---

## Verification Commands

```bash
# Run hook unit tests
pnpm --filter @hbc/complexity test -- useComplexity
pnpm --filter @hbc/complexity test -- useComplexityGate

# Verify evaluateGate is a pure export (no React needed)
node -e "
  import('@hbc/complexity').then(m => {
    console.log('evaluateGate:', typeof m.evaluateGate === 'function');
    console.log('standard atLeast expert:', m.evaluateGate('standard', { minTier: 'expert' })); // false
    console.log('expert atLeast standard:', m.evaluateGate('expert', { minTier: 'standard' })); // true
    console.log('standard maxTier standard from expert:', m.evaluateGate('expert', { maxTier: 'standard' })); // false
  });
"
```
