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
