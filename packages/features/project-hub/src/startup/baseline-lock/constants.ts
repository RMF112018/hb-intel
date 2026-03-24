/**
 * P3-E11-T10 Stage 8 Project Startup Baseline Lock and Closeout Continuity constants.
 * Lock transaction, Closeout API, delta analysis map, spine publication.
 */

import type {
  BaselineAPIMethod,
  BaselineLockActor,
  BaselineReadRole,
  Stage8ActivityEvent,
} from './enums.js';
import type {
  IBaselineLockTransactionStep,
  ICloseoutAPIContract,
  ICloseoutDeltaAnalysisEntry,
  IStage8ActivityEventDef,
} from './types.js';

// -- Module Scope -----------------------------------------------------------

export const BASELINE_LOCK_SCOPE = 'startup/baseline-lock' as const;

// -- Enum Arrays ------------------------------------------------------------

export const BASELINE_LOCK_ACTORS = [
  'PE', 'SYSTEM',
] as const satisfies ReadonlyArray<BaselineLockActor>;

export const BASELINE_API_METHODS = [
  'GET', 'PATCH', 'PUT', 'DELETE',
] as const satisfies ReadonlyArray<BaselineAPIMethod>;

export const BASELINE_READ_ROLES = [
  'PX', 'CloseoutService',
] as const satisfies ReadonlyArray<BaselineReadRole>;

export const STAGE8_ACTIVITY_EVENTS = [
  'StartupBaselineLocked',
] as const satisfies ReadonlyArray<Stage8ActivityEvent>;

// -- Baseline Lock Transaction (T01 §7.5) ------------------------------------

export const BASELINE_LOCK_TRANSACTION_STEPS: ReadonlyArray<IBaselineLockTransactionStep> = [
  { stepNumber: 1, description: 'Create StartupBaseline snapshot (T02 §7.2) — all 22 fields populated atomically' },
  { stepNumber: 2, description: 'Set all Tier 2 records to read-only — any mutation attempt returns HTTP 405' },
  { stepNumber: 3, description: 'Advance program state to BASELINE_LOCKED' },
  { stepNumber: 4, description: 'Emit StartupBaselineLocked to Activity Spine' },
  { stepNumber: 5, description: 'Clear Startup-sourced Work Queue items' },
];

// -- Closeout API Contract (T02 §7.3) ----------------------------------------

export const CLOSEOUT_API_CONTRACT: ICloseoutAPIContract = {
  endpoint: 'GET /api/startup/{projectId}/baseline',
  authorizedRoles: ['PX', 'CloseoutService'],
  responses: [
    { method: 'GET', statusCode: 200, description: 'Returns full StartupBaseline snapshot; no field omission' },
    { method: 'GET', statusCode: 403, description: 'Caller not authorized (not PX or closeout service account)' },
    { method: 'GET', statusCode: 404, description: 'No baseline exists (program not yet BASELINE_LOCKED)' },
    { method: 'PATCH', statusCode: 405, description: 'Mutation not allowed; BASELINE_IMMUTABLE' },
    { method: 'PUT', statusCode: 405, description: 'Mutation not allowed; BASELINE_IMMUTABLE' },
    { method: 'DELETE', statusCode: 405, description: 'Mutation not allowed; BASELINE_IMMUTABLE' },
  ],
};

// -- Related Items Relationship Type (T08 §4) ---------------------------------

export const BASELINE_CLOSEOUT_RELATIONSHIP_TYPE = 'startup-baseline-feeds-autopsy' as const;

// -- StartupBaseline Required Fields (T02 §7.2) ------------------------------

export const STARTUP_BASELINE_REQUIRED_FIELDS: ReadonlyArray<string> = [
  'snapshotId', 'programId', 'projectId', 'lockedAt', 'lockedBy',
  'programStateAtLock', 'stabilizationWindowDays', 'stabilizationActualDuration',
  'taskLibrarySnapshotAtLock', 'safetyReadinessSnapshotAtLock',
  'permitPostingSnapshotAtLock', 'contractObligationsSnapshotAtLock',
  'responsibilitySnapshotAtLock', 'executionBaselineFieldsAtLock',
  'pmPlanStatusAtLock', 'certificationSummaryAtLock',
  'approvedWaiversAtLock', 'lapsedWaiversAtLock',
  'openProgramBlockersAtLock', 'peFlagsAtLock',
  'authorizingPEUserId', 'authorizationTimestamp',
];

// -- Closeout Delta Analysis Map (T06 §9.2) -----------------------------------

export const CLOSEOUT_DELTA_ANALYSIS_MAP: ReadonlyArray<ICloseoutDeltaAnalysisEntry> = [
  { analysis: 'Schedule Autopsy — planned vs. actual dates', sourceFields: ['substantialCompletionDate', 'goalSubstantialCompletionDate', 'goalFinalCompletionDate', 'noticeToProceedDate'] },
  { analysis: 'Cost Autopsy — final cost vs. baseline contract', sourceFields: ['contractAmount', 'buyoutTargetAmount', 'liquidatedDamagesPerDay'] },
  { analysis: 'Risk Realization — which identified risks materialized', sourceFields: ['costRiskAreas', 'criticalPathConcerns', 'safetyGoals', 'existingSiteConditions'] },
  { analysis: 'Savings Achievement — which savings targets were hit', sourceFields: ['costSavingsAreas', 'buyoutStrategy', 'buyoutOpportunities', 'splitSavingsProvision'] },
  { analysis: 'Safety Scorecard — safety goal adherence', sourceFields: ['safetyGoals', 'safetyConcerns', 'safetyOfficerName'] },
  { analysis: 'Assumption Audit — which assumptions held, which failed', sourceFields: ['ExecutionAssumption records with closeoutVerificationNote'] },
  { analysis: 'Success Criteria Scoring — measurable outcomes achieved', sourceFields: ['ExecutionAssumption records with isSuccessCriterion = true and successMeasure'] },
  { analysis: 'Team Staffing Comparison — planned vs. actual team', sourceFields: ['responsibilitySnapshotAtLock.primaryAssignments'] },
  { analysis: 'Lessons Learned Seeding — recurring patterns', sourceFields: ['costRiskAreas', 'criticalPathConcerns', 'OPERATING_HYPOTHESIS assumption records'] },
];

// -- Stage 8 Spine Publication Definitions -----------------------------------

export const STAGE8_ACTIVITY_EVENT_DEFINITIONS: ReadonlyArray<IStage8ActivityEventDef> = [
  { event: 'StartupBaselineLocked', description: 'Stabilization window closed; StartupBaseline snapshot created atomically; all Tier 2 records read-only; Work Queue cleared' },
];

// -- Label Maps ---------------------------------------------------------------

export const BASELINE_LOCK_ACTOR_LABELS: Readonly<Record<BaselineLockActor, string>> = {
  PE: 'Project Executive (manual close)',
  SYSTEM: 'System (timer expiry)',
};
