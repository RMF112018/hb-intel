import type { AuthLifecyclePhase } from '@hbc/auth';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import {
  isShellStatusActionAllowed,
  resolveShellStatusSnapshot,
  type ShellConnectivitySignal,
  type ShellDegradedSectionInput,
  type ShellStatusAction,
  type ShellStatusSnapshot,
} from './shellStatus.js';
import type { ShellRecoveryState } from './degradedMode.js';
import type { ShellExperienceState, ShellRouteEnforcementDecision } from './types.js';

/**
 * Status snapshot, action mediation, and rail rendering hook.
 *
 * Extracted from ShellCore.tsx per PH7.3 §7.3.6.
 */
export function useShellStatusRail(params: {
  lifecyclePhase: AuthLifecyclePhase;
  experienceState: ShellExperienceState;
  routeDecision: ShellRouteEnforcementDecision | null;
  structuredError: unknown;
  connectivitySignal: ShellConnectivitySignal;
  degradedSections: readonly ShellDegradedSectionInput[];
  recoveryState: ShellRecoveryState;
  renderStatusRail?: (params: {
    snapshot: ShellStatusSnapshot;
    onAction: (action: ShellStatusAction) => void;
  }) => ReactNode;
  statusSlot: ReactNode;
  onRetry?: () => void;
  onSignInAgain?: () => void;
  onLearnMore?: () => void;
  onShellStatusAction?: (action: ShellStatusAction, snapshot: ShellStatusSnapshot) => void;
}): {
  statusSnapshot: ShellStatusSnapshot;
  handleShellStatusAction: (action: ShellStatusAction) => void;
  resolvedStatusRail: ReactNode;
} {
  const {
    lifecyclePhase,
    experienceState,
    routeDecision,
    structuredError,
    connectivitySignal,
    degradedSections,
    recoveryState,
    renderStatusRail,
    statusSlot,
    onRetry,
    onSignInAgain,
    onLearnMore,
    onShellStatusAction,
  } = params;

  const statusSnapshot = useMemo(
    () =>
      resolveShellStatusSnapshot({
        lifecyclePhase,
        experienceState,
        hasAccessValidationIssue: Boolean(routeDecision && !routeDecision.allow),
        hasFatalError: Boolean(structuredError),
        connectivitySignal,
        degradedSections,
        hasRecoveredFromDegraded: recoveryState.recovered,
      }),
    [
      lifecyclePhase,
      experienceState,
      routeDecision,
      structuredError,
      connectivitySignal,
      degradedSections,
      recoveryState.recovered,
    ],
  );

  const handleShellStatusAction = (action: ShellStatusAction): void => {
    if (!isShellStatusActionAllowed(statusSnapshot, action)) {
      return;
    }

    if (action === 'retry') {
      onRetry?.();
    }
    if (action === 'sign-in-again') {
      onSignInAgain?.();
    }
    if (action === 'learn-more') {
      onLearnMore?.();
    }

    onShellStatusAction?.(action, statusSnapshot);
  };

  const resolvedStatusRail =
    renderStatusRail != null
      ? renderStatusRail({
          snapshot: statusSnapshot,
          onAction: handleShellStatusAction,
        })
      : statusSlot;

  return {
    statusSnapshot,
    handleShellStatusAction,
    resolvedStatusRail,
  };
}
