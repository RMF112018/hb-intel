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
