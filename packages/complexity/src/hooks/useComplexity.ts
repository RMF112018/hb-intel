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
