import type { ICurrentUser } from '@hbc/models';

/**
 * Canonical runtime modes for Phase 5 dual-mode authentication.
 *
 * Traceability:
 * - PH5.2-Auth-Shell-Plan.md §5.2
 * - PH5-Auth-Shell-Plan.md §5.2 (locked Option C)
 */
export type CanonicalAuthMode = 'pwa-msal' | 'spfx-context' | 'mock' | 'dev-override';

/**
 * Legacy runtime mode aliases retained during Phase 5.2 migration to
 * preserve compatibility with existing app entrypoint checks.
 */
export type LegacyAuthMode = 'msal' | 'spfx';

/**
 * Public auth mode type exposed during transition.
 * New code should prefer CanonicalAuthMode.
 */
export type AuthMode = CanonicalAuthMode | LegacyAuthMode;

/**
 * Structured authentication failure classification required by Phase 5.2.
 */
export type AuthFailureCode =
  | 'missing-context'
  | 'expired-session'
  | 'unsupported-runtime'
  | 'access-validation-issue'
  | 'provider-bootstrap-failure'
  | 'unknown-fatal-initialization-failure';

/**
 * Structured failure payload shared across adapters and resolver paths.
 */
export interface AuthFailure {
  code: AuthFailureCode;
  message: string;
  recoverable: boolean;
  details?: Record<string, unknown>;
  cause?: unknown;
}

/**
 * Result wrapper that prevents untyped throws from adapter boundaries.
 */
export type AuthResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: AuthFailure;
    };

/**
 * MSAL configuration contract consumed by PWA auth adapter logic.
 */
export interface IMsalConfig {
  clientId: string;
  authority: string;
  redirectUri: string;
  scopes: string[];
}

/**
 * Lightweight SPFx page context contract to avoid direct dependency on
 * SPFx framework types from shared auth package code.
 */
export interface ISpfxPageContext {
  user: {
    displayName: string;
    email: string;
    loginName: string;
    isAnonymousGuestUser: boolean;
    isSiteAdmin: boolean;
  };
  web: {
    permissions: {
      value: { High: number; Low: number };
    };
  };
}

/**
 * Raw provider/environment context that may be retained in supplemental
 * normalized session fields for approved diagnostics/integration seams.
 */
export interface RawAuthContext {
  provider: CanonicalAuthMode;
  payload?: unknown;
}

/**
 * Permission contract summary included in every normalized session.
 */
export interface PermissionSummary {
  grants: string[];
  overrides: string[];
}

/**
 * Session restoration metadata required by locked Phase 5.2 decisions.
 */
export interface SessionRestoreMetadata {
  source: 'memory' | 'storage' | 'provider';
  canRestoreUntil?: string;
  restoredAt?: string;
}

/**
 * Canonical HB Intel normalized session contract.
 */
export interface NormalizedAuthSession {
  user: ICurrentUser;
  providerIdentityRef: string;
  resolvedRoles: string[];
  permissionSummary: PermissionSummary;
  runtimeMode: CanonicalAuthMode;
  issuedAt: string;
  validatedAt: string;
  expiresAt?: string;
  restoreMetadata: SessionRestoreMetadata;
  rawContext?: RawAuthContext;
}

/**
 * Restore policy controls safe restore behavior and reauth fallback.
 */
export interface SessionRestorePolicy {
  safeWindowMs: number;
  now?: () => Date;
}

/**
 * Typed shell-status transition events emitted by restore utilities.
 */
export type ShellStatusTransition =
  | 'restore-started'
  | 'restore-succeeded'
  | 'restore-reauth-required'
  | 'restore-failed'
  | 'restore-fatal';

/**
 * Phase 5.2 explicit restore outcome set.
 */
export type SessionRestoreOutcome =
  | 'restored'
  | 'reauth-required'
  | 'invalid-expired'
  | 'fatal';

/**
 * Typed restore result used by adapters and auth orchestration layers.
 */
export interface SessionRestoreResult {
  outcome: SessionRestoreOutcome;
  shellStatusTransition: ShellStatusTransition;
  session?: NormalizedAuthSession;
  failure?: AuthFailure;
}

/**
 * Normalized adapter identity payload before full session normalization.
 */
export interface AdapterIdentityPayload {
  user: ICurrentUser;
  providerIdentityRef: string;
  runtimeMode: CanonicalAuthMode;
  rawContext?: RawAuthContext;
  expiresAt?: string;
}

/**
 * Central lifecycle phases for the Phase 5.3 auth/session store.
 *
 * Alignment notes:
 * - D-04: route-driven shells can subscribe to minimal lifecycle slices.
 * - D-07: structured lifecycle states support deterministic validation/submit
 *   prerequisites before protected actions run.
 */
export type AuthLifecyclePhase =
  | 'idle'
  | 'bootstrapping'
  | 'restoring'
  | 'authenticated'
  | 'reauth-required'
  | 'signed-out'
  | 'error';

/**
 * Restore-tracking state owned by the central auth/session store.
 */
export interface AuthRestoreState {
  inFlight: boolean;
  outcome: SessionRestoreOutcome | null;
  shellTransition: ShellStatusTransition | null;
  lastAttemptedAt: string | null;
  lastResolvedAt: string | null;
}

/**
 * Shell bootstrap readiness flags consumed by shell/guards.
 */
export interface ShellBootstrapReadiness {
  authReady: boolean;
  permissionsReady: boolean;
  shellReadyToRender: boolean;
}

/**
 * Central auth/session store state contract.
 */
export interface AuthStoreState {
  lifecyclePhase: AuthLifecyclePhase;
  session: NormalizedAuthSession | null;
  runtimeMode: AuthMode | null;
  restoreState: AuthRestoreState;
  structuredError: AuthFailure | null;
  shellBootstrap: ShellBootstrapReadiness;

  /** Compatibility field for existing consumers. */
  currentUser: ICurrentUser | null;
  /** Compatibility loading field for existing consumers. */
  isLoading: boolean;
  /** Compatibility error message field for existing consumers. */
  error: string | null;
}

/**
 * Central auth/session store atomic action contract.
 */
export interface AuthStoreActions {
  beginBootstrap: (runtimeMode?: AuthMode | null) => void;
  completeBootstrap: (params?: {
    session?: NormalizedAuthSession | null;
    permissionsReady?: boolean;
  }) => void;
  beginRestore: () => void;
  resolveRestore: (result: SessionRestoreResult) => void;
  signInSuccess: (session: NormalizedAuthSession) => void;
  signOut: () => void;
  markReauthRequired: (failure?: AuthFailure | null) => void;
  setStructuredError: (error: AuthFailure | null) => void;
  clearStructuredError: () => void;

  /** Compatibility wrappers retained for existing apps. */
  setUser: (user: ICurrentUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (errorMessage: string | null) => void;
  clear: () => void;
}

/**
 * Complete central auth store slice.
 */
export type AuthStoreSlice = AuthStoreState & AuthStoreActions;

/**
 * Lifecycle selector output for shallow subscriptions.
 */
export interface AuthLifecycleSelectorResult {
  lifecyclePhase: AuthLifecyclePhase;
  runtimeMode: AuthMode | null;
  isLoading: boolean;
}

/**
 * Shell bootstrap selector output for shallow subscriptions.
 */
export interface AuthBootstrapSelectorResult {
  authReady: boolean;
  permissionsReady: boolean;
  shellReadyToRender: boolean;
}

/**
 * Session summary selector output for shallow subscriptions.
 */
export interface AuthSessionSummarySelectorResult {
  userId: string | null;
  runtimeMode: AuthMode | null;
  resolvedRoles: string[];
}

/**
 * Permission summary selector output for shallow subscriptions.
 */
export interface AuthPermissionSummarySelectorResult {
  grants: string[];
  overrides: string[];
}

/**
 * Per-user permission override record.
 */
export interface PermissionOverrideRecord {
  action: string;
  mode: 'grant' | 'deny';
  reason: string;
  expiresAt?: string;
}

/**
 * Emergency-access grant state used in permission resolution.
 */
export interface EmergencyAccessState {
  enabled: boolean;
  grants: string[];
  expiresAt?: string;
}

/**
 * Input contract for deterministic permission resolution.
 */
export interface PermissionResolutionInput {
  baseRoleGrants: string[];
  defaultFeatureActionGrants: string[];
  explicitOverrides: PermissionOverrideRecord[];
  emergencyAccess: EmergencyAccessState | null;
  now?: Date;
}

/**
 * Resolution output exposed as the shared authorization truth contract.
 */
export interface EffectivePermissionSet {
  grants: string[];
  denied: string[];
  expiredOverrides: string[];
  emergencyAccessActive: boolean;
}

/**
 * Snapshot payload for diagnostics/audit trails.
 */
export interface PermissionResolutionSnapshot {
  evaluatedAt: string;
  inputSummary: {
    baseRoleGrantCount: number;
    defaultGrantCount: number;
    overrideCount: number;
    emergencyConfigured: boolean;
  };
  effective: EffectivePermissionSet;
}
