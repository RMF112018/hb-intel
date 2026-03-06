import type { AuthLifecyclePhase } from '@hbc/auth';
import type { ShellConnectivitySignal } from './shellStatus.js';

/**
 * Recently-authenticated window used for controlled degraded-mode eligibility.
 *
 * Traceability:
 * - PH5.7-Auth-Shell-Plan.md §5.7 item 1
 * - PH5-Auth-Shell-Plan.md §5.7 item 1
 */
export const RECENT_AUTH_WINDOW_MS = 4 * 60 * 60 * 1000;

/**
 * Default freshness window for trusted last-known section state.
 */
export const TRUSTED_SECTION_FRESHNESS_WINDOW_MS = 60 * 60 * 1000;

/**
 * Canonical freshness states for degraded-mode section communication.
 */
export type ShellSectionFreshnessState = 'fresh' | 'stale' | 'unknown';

/**
 * Controlled degraded-mode section input contract.
 *
 * Alignment notes:
 * - D-04: section state remains route/context driven, not locally mutated.
 * - D-10: feature-specific state logic stays outside shell by using metadata.
 */
export interface DegradedModeSectionState {
  sectionId: string;
  sectionLabel: string;
  isVisible?: boolean;
  isTrustedLastKnownState?: boolean;
  lastKnownTimestamp?: string;
  lastKnownDataLabel?: string;
  limitedValidation?: boolean;
  requiresBackendValidation?: boolean;
  restrictedInDegradedMode?: boolean;
}

/**
 * Degraded-mode eligibility resolver input.
 */
export interface DegradedEligibilityInput {
  lifecyclePhase: AuthLifecyclePhase | string;
  sessionValidatedAt?: string | null;
  sections: readonly DegradedModeSectionState[];
  now?: () => Date;
  recentAuthWindowMs?: number;
  trustedFreshnessWindowMs?: number;
}

/**
 * Eligibility result for controlled degraded mode.
 */
export interface DegradedEligibilityResult {
  eligible: boolean;
  reason:
    | 'eligible'
    | 'not-impaired'
    | 'missing-session-validation-time'
    | 'not-recently-authenticated'
    | 'missing-trusted-fresh-section';
}

/**
 * Explicit action metadata used for centralized degraded-mode blocking.
 */
export interface ShellSensitiveActionIntent {
  actionId: string;
  category: 'read' | 'write' | 'approve' | 'permission-change' | 'requires-current-authorization';
  requiresBackendValidation?: boolean;
}

/**
 * Central sensitive-action policy result for degraded mode.
 */
export interface ShellSensitiveActionPolicyResult {
  allowedActionIds: readonly string[];
  blockedActionIds: readonly string[];
}

/**
 * Restricted-zone metadata input.
 */
export interface ShellRestrictedZoneInput {
  zoneId: string;
  zoneLabel: string;
  reason?: string;
  visibleInDegradedMode?: boolean;
}

/**
 * Restricted-zone state emitted by centralized policy.
 */
export interface ShellRestrictedZoneState {
  zoneId: string;
  zoneLabel: string;
  restricted: boolean;
  visible: boolean;
  message: string;
}

/**
 * Safe recovery resolver input.
 */
export interface ShellRecoveryStateInput {
  wasDegraded: boolean;
  isDegraded: boolean;
  lifecyclePhase: AuthLifecyclePhase | string;
  connectivitySignal: ShellConnectivitySignal;
}

/**
 * Safe recovery resolver output used by shell-status signaling.
 */
export interface ShellRecoveryState {
  recovered: boolean;
  safeToResumeSensitiveActions: boolean;
}

/**
 * Resolve a section freshness state from timestamp metadata.
 */
export function resolveSectionFreshnessState(params: {
  lastKnownTimestamp?: string;
  now?: () => Date;
  freshnessWindowMs?: number;
}): ShellSectionFreshnessState {
  if (!params.lastKnownTimestamp) {
    return 'unknown';
  }

  const nowMs = (params.now ?? (() => new Date()))().getTime();
  const timestampMs = Date.parse(params.lastKnownTimestamp);
  if (Number.isNaN(timestampMs)) {
    return 'unknown';
  }

  const freshnessWindowMs = params.freshnessWindowMs ?? TRUSTED_SECTION_FRESHNESS_WINDOW_MS;
  return nowMs - timestampMs <= freshnessWindowMs ? 'fresh' : 'stale';
}

/**
 * Controlled degraded-mode eligibility policy.
 *
 * Rules:
 * - Only impaired auth lifecycle phases can enter degraded mode.
 * - Session must be recently validated.
 * - At least one visible section must be trusted and fresh.
 */
export function resolveDegradedEligibility(input: DegradedEligibilityInput): DegradedEligibilityResult {
  const isImpaired =
    input.lifecyclePhase === 'error' || input.lifecyclePhase === 'reauth-required';
  if (!isImpaired) {
    return { eligible: false, reason: 'not-impaired' };
  }

  if (!input.sessionValidatedAt) {
    return { eligible: false, reason: 'missing-session-validation-time' };
  }

  const now = input.now ?? (() => new Date());
  const validatedAtMs = Date.parse(input.sessionValidatedAt);
  if (Number.isNaN(validatedAtMs)) {
    return { eligible: false, reason: 'missing-session-validation-time' };
  }

  const recentAuthWindowMs = input.recentAuthWindowMs ?? RECENT_AUTH_WINDOW_MS;
  if (now().getTime() - validatedAtMs > recentAuthWindowMs) {
    return { eligible: false, reason: 'not-recently-authenticated' };
  }

  const hasTrustedFreshSection = input.sections.some((section) => {
    if (section.isVisible === false) {
      return false;
    }

    if (!section.isTrustedLastKnownState) {
      return false;
    }

    return (
      resolveSectionFreshnessState({
        lastKnownTimestamp: section.lastKnownTimestamp,
        now,
        freshnessWindowMs: input.trustedFreshnessWindowMs,
      }) === 'fresh'
    );
  });

  if (!hasTrustedFreshSection) {
    return { eligible: false, reason: 'missing-trusted-fresh-section' };
  }

  return { eligible: true, reason: 'eligible' };
}

/**
 * Enforce centralized sensitive-action policy for degraded mode.
 *
 * Blocked categories align with §5.7 item 4 and locked Option C safety:
 * - write
 * - approve
 * - permission-change
 * - requires-current-authorization
 * - any backend-validation dependent operation
 */
export function resolveSensitiveActionPolicy(params: {
  isDegradedMode: boolean;
  intents: readonly ShellSensitiveActionIntent[];
}): ShellSensitiveActionPolicyResult {
  if (!params.isDegradedMode) {
    return {
      allowedActionIds: params.intents.map((intent) => intent.actionId),
      blockedActionIds: [],
    };
  }

  const blockedActionIds: string[] = [];
  const allowedActionIds: string[] = [];
  for (const intent of params.intents) {
    const blockedByCategory =
      intent.category === 'write' ||
      intent.category === 'approve' ||
      intent.category === 'permission-change' ||
      intent.category === 'requires-current-authorization';
    const blockedByValidation = intent.requiresBackendValidation === true;

    if (blockedByCategory || blockedByValidation) {
      blockedActionIds.push(intent.actionId);
      continue;
    }
    allowedActionIds.push(intent.actionId);
  }

  return {
    allowedActionIds,
    blockedActionIds,
  };
}

/**
 * Resolve visible restricted-zone state for degraded mode communication.
 */
export function resolveRestrictedZones(params: {
  isDegradedMode: boolean;
  zones: readonly ShellRestrictedZoneInput[];
}): readonly ShellRestrictedZoneState[] {
  return params.zones.map((zone) => {
    const restricted = params.isDegradedMode;
    const visible = restricted ? zone.visibleInDegradedMode !== false : false;
    return {
      zoneId: zone.zoneId,
      zoneLabel: zone.zoneLabel,
      restricted,
      visible,
      message: restricted
        ? (zone.reason ?? 'Restricted while authorization validation is limited.')
        : 'Fully available.',
    };
  });
}

/**
 * Resolve safe recovery state from degraded mode.
 */
export function resolveSafeRecoveryState(input: ShellRecoveryStateInput): ShellRecoveryState {
  const recovered =
    input.wasDegraded &&
    !input.isDegraded &&
    input.lifecyclePhase === 'authenticated' &&
    input.connectivitySignal === 'connected';

  return {
    recovered,
    safeToResumeSensitiveActions: !input.isDegraded && input.lifecyclePhase === 'authenticated',
  };
}
