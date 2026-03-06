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
 * Phase 5.4 standard action-level authorization vocabulary.
 *
 * Traceability:
 * - PH5.4-Auth-Shell-Plan.md §5.4 (standard action permission vocabulary)
 * - PH5-Auth-Shell-Plan.md §5.4 (locked Option C)
 */
export type StandardActionPermission = 'view' | 'create' | 'edit' | 'approve' | 'admin';

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
 * Optional provider-context hints consumed only by the centralized role-mapping
 * layer. Feature modules must never read raw provider group/context semantics.
 *
 * Alignment notes:
 * - D-10: central mapping contract avoids feature-level provider coupling.
 */
export interface RoleMappingHint {
  loginName?: string;
  isSiteAdmin?: boolean;
  providerGroupRefs?: string[];
}

/**
 * Input contract for converting provider/context identity into app roles.
 */
export interface RoleMappingInput {
  providerIdentityRef: string;
  runtimeMode: CanonicalAuthMode;
  existingRoleNames: string[];
  rawContext?: RawAuthContext;
  hint?: RoleMappingHint;
}

/**
 * Explicit exception hook for governed role-mapping edge cases.
 * Keeps default roles clean while making exceptions auditable and bounded.
 */
export interface RoleMappingException {
  id: string;
  reason: string;
  when: (input: RoleMappingInput) => boolean;
  appendRoles: string[];
}

/**
 * Role-mapping policy knobs used by the centralized mapper.
 */
export interface RoleMappingOptions {
  defaultRoleName?: string;
  exceptions?: RoleMappingException[];
}

/**
 * Visibility behavior for protected feature navigation/surfaces.
 */
export type FeatureVisibilityMode = 'hidden' | 'discoverable-locked';

/**
 * Standard protected-feature registration contract for Phase 5.
 *
 * This reserves a seam (`futureGrammarKey`) for deeper custom grammars in
 * later phases without changing the Phase 5 evaluator surface.
 */
export interface FeaturePermissionRegistration {
  featureId: string;
  requiredFeatureGrants: string[];
  actionGrants: Partial<Record<StandardActionPermission, string[]>>;
  visibility: FeatureVisibilityMode;
  compatibleModes?: CanonicalAuthMode[] | 'all';
  lockMessage?: string;
  futureGrammarKey?: string;
}

/**
 * Shared evaluation output consumed by guards/hooks/shell visibility logic.
 */
export interface FeatureAccessEvaluation {
  featureId: string;
  action: StandardActionPermission;
  registered: boolean;
  visible: boolean;
  allowed: boolean;
  locked: boolean;
  denialReason: string | null;
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

/**
 * Access-control lifecycle status for persisted override records.
 */
export type AccessControlRecordStatus = 'active' | 'revoked' | 'archived';

/**
 * Renewal state for expiring access override records.
 */
export type RenewalState = 'not-required' | 'pending-renewal' | 'renewed' | 'expired';

/**
 * Base-role definition persisted in HB Intel-owned authorization storage.
 */
export interface BaseRoleDefinition {
  id: string;
  name: string;
  grants: string[];
  version: number;
  updatedAt: string;
  updatedBy: string;
}

/**
 * Input contract for creating normalized role definitions.
 */
export interface BaseRoleDefinitionInput {
  id: string;
  name: string;
  grants: string[];
  version: number;
  updatedBy: string;
  updatedAt?: string;
}

/**
 * Diff contract identifying role-definition version changes that require
 * dependent override review.
 */
export interface BaseRoleDefinitionVersionDiff {
  roleId: string;
  previousVersion: number | null;
  nextVersion: number;
}

/**
 * Override request change type for explicit grant or restriction records.
 */
export type AccessOverrideChangeMode = 'grant' | 'restriction';

/**
 * Requested access change payload for one override record.
 */
export interface AccessOverrideGrantChange {
  mode: AccessOverrideChangeMode;
  grants: string[];
}

/**
 * Approval metadata for governed override workflows.
 */
export interface AccessOverrideApprovalMetadata {
  state: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  approverId: string | null;
  approvedAt: string | null;
}

/**
 * Expiration and renewal metadata retained for all override records.
 */
export interface AccessOverrideExpirationMetadata {
  expiresAt?: string;
  renewalState?: RenewalState;
}

/**
 * Review metadata used when role-definition drift requires explicit review.
 */
export interface AccessControlOverrideReviewMetadata {
  reviewRequired: boolean;
  reviewReason?: string;
  reviewMarkedBy?: string;
  reviewMarkedAt?: string;
}

/**
 * HB Intel system-of-record override model for user-specific authorization
 * exceptions.
 */
export interface AccessControlOverrideRecord {
  id: string;
  targetUserId: string;
  baseRoleId: string;
  requestedChange: AccessOverrideGrantChange;
  reason: string;
  requesterId: string;
  approval: AccessOverrideApprovalMetadata;
  expiration: AccessOverrideExpirationMetadata;
  emergency: boolean;
  review: AccessControlOverrideReviewMetadata;
  status: AccessControlRecordStatus;
}

/**
 * Input contract for creating an override request record.
 */
export interface AccessOverrideRequest {
  id: string;
  targetUserId: string;
  baseRoleId: string;
  requestedChange: AccessOverrideGrantChange;
  reason: string;
  requesterId: string;
  requestedAt?: string;
  expiresAt?: string;
  emergency: boolean;
  reviewRequired?: boolean;
}

/**
 * Canonical Phase 5.13 audit event taxonomy covering required auth and
 * access-governance traceability actions.
 *
 * Traceability:
 * - PH5.13-Auth-Shell-Plan.md §5.13 item 1
 * - PH5-Auth-Shell-Plan.md locked Option C (structured audit trail)
 */
export type AccessControlAuditEventType =
  | 'sign-in'
  | 'sign-out'
  | 'session-restore-success'
  | 'session-restore-failure'
  | 'access-denied'
  | 'request-submitted'
  | 'request-approved'
  | 'request-rejected'
  | 'override-created'
  | 'override-modified'
  | 'override-revoked'
  | 'override-archived'
  | 'override-expired'
  | 'override-renewed'
  | 'emergency-access-used'
  | 'review-flag-generated'
  | 'review-flag-resolved'
  | 'admin-access-action'
  | 'base-role-updated';

/**
 * Structured source classification for audit event producers.
 */
export type AccessControlAuditEventSource =
  | 'auth-store'
  | 'adapter'
  | 'guard'
  | 'workflow'
  | 'admin'
  | 'backend'
  | 'system';

/**
 * Outcome shape required by governance and troubleshooting workflows.
 */
export type AccessControlAuditOutcome = 'success' | 'failure' | 'denied' | 'pending';

/**
 * Audit record payload for key access-control backend events.
 */
export interface AccessControlAuditEventRecord {
  /**
   * Compatibility alias retained for pre-5.13 call sites.
   * Use `eventId` in new code.
   */
  id: string;
  eventId: string;
  eventType: AccessControlAuditEventType;
  actorId: string;
  subjectUserId: string;
  runtimeMode: CanonicalAuthMode | 'unknown';
  source: AccessControlAuditEventSource;
  correlationId: string;
  overrideId?: string;
  requestId?: string;
  roleId?: string;
  featureId?: string;
  action?: string;
  outcome: AccessControlAuditOutcome;
  details?: Record<string, unknown>;
  occurredAt: string;
}

/**
 * Retention policy for Phase 5.13 audit records.
 *
 * Deferred path:
 * - Future event-type tiering is intentionally documented but not enabled in
 *   Phase 5 per locked Option C scope.
 */
export interface AccessControlAuditRetentionPolicy {
  activeWindowDays: number;
  archiveStrategy: 'indefinite-archive';
  futureTieringDocumented: true;
}

/**
 * Retention partition output for operational visibility.
 */
export interface AccessControlAuditRetentionSnapshot {
  active: AccessControlAuditEventRecord[];
  archived: AccessControlAuditEventRecord[];
  policy: AccessControlAuditRetentionPolicy;
  generatedAt: string;
}

/**
 * Runtime rule configuration for auth/shell environment behavior.
 */
export interface AuthRuntimeRuleSet {
  allowDevOverrideInProduction: boolean;
  supportedRuntimeModes: CanonicalAuthMode[];
}

/**
 * Redirect policy defaults used by centralized guard/shell flows.
 */
export interface RedirectDefaultPolicy {
  defaultSignedInPath: string;
  defaultSignedOutPath: string;
  preserveIntendedRoute: boolean;
  unsafeRouteFallbackPath: string;
}

/**
 * Session policy windows used for restore/expiration/idle safeguards.
 */
export interface SessionPolicyWindowSettings {
  safeRestoreWindowMs: number;
  hardSessionMaxAgeMs: number;
  idleTimeoutMs: number;
}

/**
 * Access-control policy settings for Option C enforcement defaults.
 */
export interface AccessControlPolicySettings {
  defaultDenyUnregisteredFeatures: boolean;
  requireOverrideApproval: boolean;
  requireReasonForOverride: boolean;
  emergencyOverrideMaxHours: number;
}

/**
 * Central typed auth/shell configuration contract for runtime policy loading.
 */
export interface ShellAuthConfiguration {
  runtimeRules: AuthRuntimeRuleSet;
  redirectDefaults: RedirectDefaultPolicy;
  sessionWindows: SessionPolicyWindowSettings;
  policySettings: AccessControlPolicySettings;
}

/**
 * Input contract for partial configuration overrides.
 */
export interface ShellAuthConfigurationInput {
  runtimeRules?: Partial<AuthRuntimeRuleSet>;
  redirectDefaults?: Partial<RedirectDefaultPolicy>;
  sessionWindows?: Partial<SessionPolicyWindowSettings>;
  policySettings?: Partial<AccessControlPolicySettings>;
}

/**
 * Section identifiers for the Phase 5.11 minimal production admin experience.
 */
export type AccessControlAdminSection =
  | 'user-lookup'
  | 'role-access-lookup'
  | 'override-review'
  | 'renewal-queue'
  | 'role-change-review'
  | 'emergency-review'
  | 'audit-log';

/**
 * User lookup row model for admin access-control operations.
 */
export interface AccessControlUserLookupRecord {
  userId: string;
  displayName: string;
  email: string;
  resolvedRoles: string[];
  grants: string[];
}

/**
 * Role/access lookup row model for admin role governance review.
 */
export interface AccessControlRoleAccessRecord {
  roleId: string;
  roleName: string;
  grants: string[];
  activeOverrideCount: number;
  pendingOverrideCount: number;
  reviewRequiredCount: number;
}

/**
 * Snapshot payload consumed by the sectioned Phase 5.11 admin UX.
 */
export interface AccessControlAdminSnapshot {
  generatedAt: string;
  users: AccessControlUserLookupRecord[];
  roleAccess: AccessControlRoleAccessRecord[];
  overrideReviewQueue: AccessControlOverrideRecord[];
  renewalQueue: AccessControlOverrideRecord[];
  roleChangeReviewQueue: AccessControlOverrideRecord[];
  emergencyReviewQueue: AccessControlOverrideRecord[];
  auditEvents: AccessControlAuditEventRecord[];
}

/**
 * Minimal operational visibility summary for Phase 5 admin scope.
 */
export interface AccessControlAdminAuditVisibility {
  generatedAt: string;
  activeCount: number;
  archivedCount: number;
  recentEvents: AccessControlAuditEventRecord[];
  policy: AccessControlAuditRetentionPolicy;
}

/**
 * Query options for lookup/filter scenarios on the admin surface.
 */
export interface AccessControlAdminQuery {
  searchTerm?: string;
}

/**
 * Approval decisions for review queues.
 */
export type ReviewOverrideDecision = 'approve' | 'reject';

/**
 * Command for review decisions in override request queue.
 */
export interface ReviewOverrideCommand {
  overrideId: string;
  reviewerId: string;
  decision: ReviewOverrideDecision;
  reason?: string;
  reviewedAt?: string;
}

/**
 * Command for renewal handling of expiring overrides.
 */
export interface RenewOverrideCommand {
  overrideId: string;
  reviewerId: string;
  reason: string;
  expiresAt: string;
  reviewedAt?: string;
}

/**
 * Command for resolving overrides flagged by role-definition changes.
 */
export interface ResolveRoleChangeReviewCommand {
  overrideId: string;
  reviewerId: string;
  reason: string;
  reviewedAt?: string;
}

/**
 * Command for emergency-access queue review with mandatory reason.
 */
export interface ReviewEmergencyAccessCommand {
  overrideId: string;
  reviewerId: string;
  decision: ReviewOverrideDecision;
  reason: string;
  reviewedAt?: string;
}

/**
 * Typed workflow result contract for admin queue action handlers.
 */
export interface AccessControlWorkflowResult {
  ok: boolean;
  message: string;
  updatedOverride?: AccessControlOverrideRecord;
  auditEvent?: AccessControlAuditEventRecord;
}

/**
 * Repository contract for Phase 5.11 admin UX data access and queue actions.
 */
export interface AccessControlAdminRepository {
  getSnapshot: (query?: AccessControlAdminQuery) => Promise<AccessControlAdminSnapshot>;
  reviewOverride: (command: ReviewOverrideCommand) => Promise<AccessControlWorkflowResult>;
  renewOverride: (command: RenewOverrideCommand) => Promise<AccessControlWorkflowResult>;
  resolveRoleChangeReview: (
    command: ResolveRoleChangeReviewCommand,
  ) => Promise<AccessControlWorkflowResult>;
  reviewEmergencyAccess: (
    command: ReviewEmergencyAccessCommand,
  ) => Promise<AccessControlWorkflowResult>;
}

/**
 * Policy knobs for structured override request intake.
 */
export interface AccessOverrideRequestPolicy {
  defaultExpirationHours: number;
  minimumBusinessReasonLength: number;
}

/**
 * Validation result for structured request payloads.
 */
export interface AccessOverrideRequestValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Structured request command for standard override workflows.
 */
export interface StructuredAccessOverrideRequestCommand {
  requestId: string;
  targetUserId: string;
  baseRoleId: string;
  requestedChange: AccessOverrideGrantChange;
  businessReason: string;
  targetFeatureId: string;
  targetAction: string;
  requesterId: string;
  requestedDurationHours?: number;
  requestedExpiresAt?: string;
  requestedAt?: string;
  renewalOfRequestId?: string;
}

/**
 * Canonical structured request payload consumed by approval/renewal workflows.
 */
export interface StructuredAccessOverrideRequest {
  requestId: string;
  targetUserId: string;
  baseRoleId: string;
  requestedChange: AccessOverrideGrantChange;
  businessReason: string;
  targetFeatureId: string;
  targetAction: string;
  requesterId: string;
  requestedAt: string;
  requestedDurationHours?: number;
  requestedExpiresAt: string;
  renewalOfRequestId?: string;
}

/**
 * Decision set for standard override approval actions.
 */
export type AccessOverrideApprovalDecision = 'approve' | 'reject';

/**
 * Command contract for approval actions on structured requests.
 */
export interface AccessOverrideApprovalActionCommand {
  reviewerId: string;
  decision: AccessOverrideApprovalDecision;
  reviewedAt?: string;
  expiresAt?: string;
  markPermanent?: boolean;
  permanentJustification?: string;
  rejectionReason?: string;
}

/**
 * Policy controls for approval behavior and permanent designation validation.
 */
export interface AccessOverrideApprovalPolicy {
  defaultExpirationHours: number;
  minimumPermanentJustificationLength: number;
}

/**
 * Result contract returned by approval handlers.
 */
export interface AccessOverrideApprovalResult {
  ok: boolean;
  decision: AccessOverrideApprovalDecision;
  message: string;
  override?: AccessControlOverrideRecord;
  audit?: AccessControlAuditEventRecord;
}

/**
 * Command contract for renewal request initiation.
 */
export interface AccessOverrideRenewalCommand {
  renewalRequestId: string;
  previousRequestId: string;
  targetUserId: string;
  baseRoleId: string;
  requestedChange: AccessOverrideGrantChange;
  targetFeatureId: string;
  targetAction: string;
  requesterId: string;
  updatedJustification: string;
  requestedDurationHours?: number;
  requestedExpiresAt?: string;
  requestedAt?: string;
}

/**
 * Renewal action input with explicit approval command.
 */
export interface AccessOverrideRenewalAction {
  renewalRequestId: string;
  previousRequestId: string;
  targetUserId: string;
  baseRoleId: string;
  requestedChange: AccessOverrideGrantChange;
  targetFeatureId: string;
  targetAction: string;
  requesterId: string;
  updatedJustification: string;
  requestedDurationHours?: number;
  requestedExpiresAt?: string;
  requestedAt?: string;
}

/**
 * Result payload for completed renewal workflows.
 */
export interface AccessOverrideRenewalResult {
  ok: boolean;
  message: string;
  request?: StructuredAccessOverrideRequest;
  override?: AccessControlOverrideRecord;
  audit?: AccessControlAuditEventRecord;
}

/**
 * Policy controls for emergency-access governance boundaries.
 */
export interface AccessOverrideEmergencyPolicy {
  authorizedRoles: string[];
  maximumEmergencyHours: number;
  minimumReasonLength: number;
  minimumBoundaryReasonLength: number;
}

/**
 * Boundary-evaluation output for emergency-access requests.
 */
export interface AccessOverrideEmergencyBoundaryCheck {
  allowed: boolean;
  reason: string | null;
}

/**
 * Command payload for emergency-access workflows.
 */
export interface AccessOverrideEmergencyCommand {
  requestId: string;
  targetUserId: string;
  baseRoleId: string;
  requestedChange: AccessOverrideGrantChange;
  targetFeatureId: string;
  targetAction: string;
  requesterId: string;
  requesterRoles: string[];
  emergencyReason: string;
  normalWorkflowAvailable: boolean;
  boundaryBypassReason?: string;
  requestedAt?: string;
}

/**
 * Result payload for emergency-access workflow execution.
 */
export interface AccessOverrideEmergencyResult {
  ok: boolean;
  message: string;
  request?: StructuredAccessOverrideRequest;
  override?: AccessControlOverrideRecord;
  audit?: AccessControlAuditEventRecord[];
}
