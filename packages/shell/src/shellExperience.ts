import type { DegradedEligibilityResult } from './degradedMode.js';
import type { ShellExperienceState, ShellRouteEnforcementDecision } from './types.js';

/**
 * Centralized selector for shell experience surfaces.
 *
 * Extracted from ShellCore.tsx per PH7.3 §7.3.5 (D1) to break circular import:
 * useShellDegradedRecovery needs this function internally, but ShellCore imports that hook.
 */
export function resolveShellExperienceState(params: {
  lifecyclePhase: string;
  routeDecision: ShellRouteEnforcementDecision | null;
  degradedEligibility?: DegradedEligibilityResult;
  forcedExperienceState?: Exclude<ShellExperienceState, 'access-denied'> | null;
}): ShellExperienceState {
  if (params.routeDecision && !params.routeDecision.allow) {
    return 'access-denied';
  }

  if (params.forcedExperienceState) {
    return params.forcedExperienceState;
  }

  if (params.lifecyclePhase === 'bootstrapping' || params.lifecyclePhase === 'restoring') {
    return 'recovery';
  }

  if (params.lifecyclePhase === 'error' || params.lifecyclePhase === 'reauth-required') {
    return params.degradedEligibility?.eligible === true ? 'degraded' : 'recovery';
  }

  return 'ready';
}
