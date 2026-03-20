/**
 * Shared landing resolver — P2-B1 §11.1.
 * Sole policy authority for landing path decisions.
 * Pure function — callers pass cohort status and redirect target; no store access.
 */
import type { ShellEnvironment } from './types.js';

/** Landing mode: legacy preserves current-state behavior; phase-2 enables personal-first. */
export type LandingMode = 'legacy' | 'phase-2';

/** Team mode within phase-2 personal-first landing. */
export type TeamMode = 'personal' | 'delegated-by-me' | 'my-team';

/** Input to the shared landing decision resolver. */
export interface LandingDecisionInput {
  resolvedRoles: readonly string[];
  runtimeMode: ShellEnvironment;
  redirectTarget?: string | null;
  cohortEnabled: boolean;
}

/** Output from the shared landing decision resolver. */
export interface LandingDecision {
  pathname: string;
  landingMode: LandingMode;
  teamMode?: TeamMode;
}

/**
 * Shared landing resolver — sole policy authority for landing path decisions.
 *
 * Priority chain (P2-B1 §3):
 *   1. Redirect memory (caller passes validated redirectTarget)
 *   2. Role + cohort-aware landing
 *   3. Default within resolved mode
 */
export function resolveLandingDecision(input: LandingDecisionInput): LandingDecision {
  const { resolvedRoles, redirectTarget, cohortEnabled } = input;

  // Priority 1: Redirect memory takes absolute precedence (caller validated safety).
  if (redirectTarget) {
    return {
      pathname: redirectTarget,
      landingMode: cohortEnabled ? 'phase-2' : 'legacy',
    };
  }

  // Priority 2: Administrator always lands on /admin regardless of cohort (P2-B1 §4.3).
  if (resolvedRoles.includes('Administrator')) {
    return { pathname: '/admin', landingMode: 'legacy' };
  }

  // Priority 2: Executive — cohort-aware (P2-B1 §4.3, §5).
  if (resolvedRoles.includes('Executive')) {
    if (cohortEnabled) {
      return { pathname: '/my-work', landingMode: 'phase-2', teamMode: 'personal' };
    }
    return { pathname: '/leadership', landingMode: 'legacy' };
  }

  // Priority 3: Standard role — cohort-aware default.
  if (cohortEnabled) {
    return { pathname: '/my-work', landingMode: 'phase-2', teamMode: 'personal' };
  }

  return { pathname: '/project-hub', landingMode: 'legacy' };
}
