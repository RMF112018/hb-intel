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
