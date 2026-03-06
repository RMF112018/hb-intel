import type { AuthLifecyclePhase } from '@hbc/auth';
import type { ShellExperienceState } from './types.js';

/**
 * Canonical shell-status states required by Phase 5.6.
 */
export type ShellStatusKind =
  | 'initializing'
  | 'restoring-session'
  | 'connected'
  | 'reconnecting'
  | 'degraded'
  | 'access-validation-issue'
  | 'error-failure';

/**
 * Approved shell-status action ids.
 */
export type ShellStatusAction = 'retry' | 'sign-in-again' | 'learn-more';

/**
 * Connectivity signal adapter state used by the shell-status resolver.
 */
export type ShellConnectivitySignal = 'connected' | 'reconnecting';

/**
 * Section-level degraded status input shape.
 */
export interface ShellDegradedSectionInput {
  sectionId: string;
  sectionLabel: string;
  lastKnownDataLabel?: string;
  limitedValidation?: boolean;
}

/**
 * Section-level degraded status output label shape.
 */
export interface ShellDegradedSectionLabel {
  sectionId: string;
  label: string;
}

/**
 * Unified shell-status snapshot consumed by UI rails.
 */
export interface ShellStatusSnapshot {
  kind: ShellStatusKind;
  message: string;
  actions: readonly ShellStatusAction[];
  degradedSectionLabels: readonly ShellDegradedSectionLabel[];
}

/**
 * Resolver input from centralized shell/auth state + connectivity adapter.
 *
 * Alignment notes:
 * - D-10: centralized derivation to prevent subsystem-local status writes.
 * - D-04: route-authoritative shell context remains compatible with nav sync.
 * - D-07: deterministic status/action outputs for guarded recovery flows.
 * - D-12: status rail theming remains unified and provider-agnostic at shell level.
 * - PH5.6: fixed priority hierarchy.
 */
export interface ShellStatusResolutionInput {
  lifecyclePhase: AuthLifecyclePhase;
  experienceState: ShellExperienceState;
  hasAccessValidationIssue: boolean;
  hasFatalError: boolean;
  connectivitySignal: ShellConnectivitySignal;
  degradedSections?: readonly ShellDegradedSectionInput[];
}

/**
 * Locked Phase 5.6 priority order (highest first).
 */
export const SHELL_STATUS_PRIORITY: readonly ShellStatusKind[] = [
  'error-failure',
  'access-validation-issue',
  'restoring-session',
  'initializing',
  'degraded',
  'reconnecting',
  'connected',
] as const;

const STATUS_COPY: Record<ShellStatusKind, string> = {
  initializing: 'Initializing HB Intel shell...',
  'restoring-session': 'Restoring your session...',
  connected: 'Connected.',
  reconnecting: 'Trying to reconnect...',
  degraded: 'Running in degraded mode. Some validation is limited.',
  'access-validation-issue': 'We could not validate your access.',
  'error-failure': 'Shell startup encountered an error.',
};

const STATUS_ACTIONS: Record<ShellStatusKind, readonly ShellStatusAction[]> = {
  initializing: [],
  'restoring-session': ['retry'],
  connected: [],
  reconnecting: ['retry'],
  degraded: ['learn-more'],
  'access-validation-issue': ['sign-in-again', 'learn-more'],
  'error-failure': ['retry', 'sign-in-again', 'learn-more'],
};

/**
 * Resolve the single winning shell-status state from centralized inputs.
 */
export function resolveShellStatusSnapshot(
  input: ShellStatusResolutionInput,
): ShellStatusSnapshot {
  const candidates = new Set<ShellStatusKind>();

  if (input.hasFatalError || input.lifecyclePhase === 'error') {
    candidates.add('error-failure');
  }

  if (input.hasAccessValidationIssue || input.lifecyclePhase === 'reauth-required') {
    candidates.add('access-validation-issue');
  }

  if (input.lifecyclePhase === 'restoring') {
    candidates.add('restoring-session');
  }

  if (input.lifecyclePhase === 'idle' || input.lifecyclePhase === 'bootstrapping') {
    candidates.add('initializing');
  }

  if (input.experienceState === 'degraded') {
    candidates.add('degraded');
  }

  if (input.connectivitySignal === 'reconnecting') {
    candidates.add('reconnecting');
  }

  candidates.add('connected');

  const kind =
    SHELL_STATUS_PRIORITY.find((priorityKind) => candidates.has(priorityKind)) ?? 'connected';

  return {
    kind,
    message: STATUS_COPY[kind],
    actions: STATUS_ACTIONS[kind],
    degradedSectionLabels:
      kind === 'degraded'
        ? deriveDegradedSectionLabels(input.degradedSections ?? [])
        : [],
  };
}

/**
 * Build section-level degraded labels without introducing feature-specific
 * sub-state ownership in the shell.
 */
export function deriveDegradedSectionLabels(
  sections: readonly ShellDegradedSectionInput[],
): readonly ShellDegradedSectionLabel[] {
  return sections.map((section) => {
    const suffix = section.limitedValidation ? 'Limited validation' : 'Last known data';
    const detail = section.lastKnownDataLabel ? ` (${section.lastKnownDataLabel})` : '';
    return {
      sectionId: section.sectionId,
      label: `${section.sectionLabel}: ${suffix}${detail}`,
    };
  });
}

/**
 * Validate whether a specific action is allowed for a status snapshot.
 */
export function isShellStatusActionAllowed(
  snapshot: ShellStatusSnapshot,
  action: ShellStatusAction,
): boolean {
  return snapshot.actions.includes(action);
}
