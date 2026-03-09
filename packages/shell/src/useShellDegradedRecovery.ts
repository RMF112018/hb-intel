import { useEffect, useMemo, useState } from 'react';
import type { NormalizedAuthSession } from '@hbc/auth';
import {
  resolveDegradedEligibility,
  resolveRestrictedZones,
  resolveSafeRecoveryState,
  resolveSensitiveActionPolicy,
  type DegradedEligibilityResult,
  type ShellRecoveryState,
  type ShellRestrictedZoneInput,
  type ShellRestrictedZoneState,
  type ShellSensitiveActionIntent,
  type ShellSensitiveActionPolicyResult,
} from './degradedMode.js';
import { resolveShellExperienceState } from './shellExperience.js';
import type {
  ShellConnectivitySignal,
  ShellDegradedSectionInput,
} from './shellStatus.js';
import type {
  ShellExperienceState,
  ShellRouteEnforcementDecision,
} from './types.js';

/**
 * Degraded eligibility, experience state, sensitive-action policy, restricted zones,
 * recovery state, and wasDegraded tracking hook.
 *
 * Extracted from ShellCore.tsx per PH7.3 §7.3.5.
 * Computes experienceState internally via resolveShellExperienceState (from shellExperience.ts)
 * to avoid circular import and preserve single-render-pass ordering.
 */
export function useShellDegradedRecovery(params: {
  lifecyclePhase: string;
  session: NormalizedAuthSession | null;
  degradedSections: readonly ShellDegradedSectionInput[];
  sensitiveActionIntents: readonly ShellSensitiveActionIntent[];
  restrictedZones: readonly ShellRestrictedZoneInput[];
  routeDecision: ShellRouteEnforcementDecision | null;
  forcedExperienceState: Exclude<ShellExperienceState, 'access-denied'> | null;
  connectivitySignal: ShellConnectivitySignal;
  onSensitiveActionPolicyResolved?: (policy: ShellSensitiveActionPolicyResult) => void;
  onRestrictedZonesResolved?: (zones: readonly ShellRestrictedZoneState[]) => void;
  onRecoveryStateResolved?: (state: ShellRecoveryState) => void;
}): {
  degradedEligibility: DegradedEligibilityResult;
  experienceState: ShellExperienceState;
  sensitiveActionPolicy: ShellSensitiveActionPolicyResult;
  resolvedRestrictedZones: readonly ShellRestrictedZoneState[];
  recoveryState: ShellRecoveryState;
} {
  const {
    lifecyclePhase,
    session,
    degradedSections,
    sensitiveActionIntents,
    restrictedZones,
    routeDecision,
    forcedExperienceState,
    connectivitySignal,
    onSensitiveActionPolicyResolved,
    onRestrictedZonesResolved,
    onRecoveryStateResolved,
  } = params;

  // 1. Degraded eligibility
  const degradedEligibility = useMemo(
    () =>
      resolveDegradedEligibility({
        lifecyclePhase,
        sessionValidatedAt: session?.validatedAt ?? null,
        sections: degradedSections,
      }),
    [degradedSections, lifecyclePhase, session?.validatedAt],
  );

  // 2. Experience state (inline call, NOT memoized — uses degradedEligibility from step 1)
  const experienceState = resolveShellExperienceState({
    lifecyclePhase,
    routeDecision,
    degradedEligibility,
    forcedExperienceState,
  });

  // 3. Sensitive action policy
  const sensitiveActionPolicy = useMemo(
    () =>
      resolveSensitiveActionPolicy({
        isDegradedMode: experienceState === 'degraded',
        intents: sensitiveActionIntents,
      }),
    [experienceState, sensitiveActionIntents],
  );

  // 4. Restricted zones
  const resolvedRestrictedZones = useMemo(
    () =>
      resolveRestrictedZones({
        isDegradedMode: experienceState === 'degraded',
        zones: restrictedZones,
      }),
    [experienceState, restrictedZones],
  );

  // 5. wasDegraded — INTERNAL to hook per §7.3.5
  const [wasDegraded, setWasDegraded] = useState(false);

  // 6. Recovery state
  const recoveryState = useMemo(
    () =>
      resolveSafeRecoveryState({
        wasDegraded,
        isDegraded: experienceState === 'degraded',
        lifecyclePhase,
        connectivitySignal,
      }),
    [experienceState, lifecyclePhase, connectivitySignal, wasDegraded],
  );

  // 7. Degraded tracking effect
  useEffect(() => {
    if (experienceState === 'degraded') {
      setWasDegraded(true);
      return;
    }

    if (recoveryState.recovered) {
      setWasDegraded(false);
    }
  }, [experienceState, recoveryState.recovered]);

  // 8. Observer forwarding effects
  useEffect(() => {
    onSensitiveActionPolicyResolved?.(sensitiveActionPolicy);
  }, [onSensitiveActionPolicyResolved, sensitiveActionPolicy]);

  useEffect(() => {
    onRestrictedZonesResolved?.(resolvedRestrictedZones);
  }, [onRestrictedZonesResolved, resolvedRestrictedZones]);

  useEffect(() => {
    onRecoveryStateResolved?.(recoveryState);
  }, [onRecoveryStateResolved, recoveryState]);

  return {
    degradedEligibility,
    experienceState,
    sensitiveActionPolicy,
    resolvedRestrictedZones,
    recoveryState,
  };
}
