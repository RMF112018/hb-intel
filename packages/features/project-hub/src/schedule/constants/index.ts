import type {
  BaselineType,
  CalendarType,
  IImportValidationRule,
  IScheduleIntegrationBoundary,
  PercentCompleteBasis,
  ScheduleAccessAction,
  ScheduleActivityType,
  ScheduleAuthorityRole,
  ScheduleConstraintType,
  ScheduleImportFormat,
  ScheduleLayerAccess,
  ScheduleSourceOwnerRole,
  ScheduleSourceSystem,
  ScheduleStatusCode,
  ScheduleVersionStatus,
} from '../types/index.js';

/**
 * P3-E5 contract constants for Schedule module.
 * T01: source identity, versioning, import snapshot, dual-calendar model.
 * Values are locked for contract stability.
 */

export const SCHEDULE_MODULE_SCOPE = 'schedule' as const;

// ── §1.1 Source Systems ──────────────────────────────────────────────

export const SCHEDULE_SOURCE_SYSTEMS = [
  'PrimaveraP6',
  'MSProject',
  'Asta',
  'Oracle',
  'Other',
] as const satisfies ReadonlyArray<ScheduleSourceSystem>;

export const SCHEDULE_SOURCE_OWNER_ROLES = [
  'PM',
  'Scheduler',
  'PE',
] as const satisfies ReadonlyArray<ScheduleSourceOwnerRole>;

// ── §1.2 Version Statuses ────────────────────────────────────────────

export const SCHEDULE_IMPORT_FORMATS = [
  'XER',
  'XML',
  'CSV',
] as const satisfies ReadonlyArray<ScheduleImportFormat>;

export const SCHEDULE_VERSION_STATUSES = [
  'Processing',
  'Parsed',
  'Active',
  'Superseded',
  'Failed',
  'Secondary',
] as const satisfies ReadonlyArray<ScheduleVersionStatus>;

/** Human-readable descriptions for each version status (§1.2). */
export const SCHEDULE_VERSION_STATUS_DESCRIPTIONS: ReadonlyArray<{
  readonly status: ScheduleVersionStatus;
  readonly description: string;
}> = [
  { status: 'Processing', description: 'File is being parsed' },
  { status: 'Parsed', description: 'Successfully parsed; awaiting activation' },
  { status: 'Active', description: 'Currently active for this source (one per source at a time)' },
  { status: 'Superseded', description: 'Replaced by a newer version; retained for history and forensics' },
  { status: 'Failed', description: 'Parse failed; not usable' },
  { status: 'Secondary', description: 'Imported from a non-canonical source; available for comparison only' },
];

// ── §1.3 Baseline Types ─────────────────────────────────────────────

export const BASELINE_TYPES = [
  'ContractBaseline',
  'ApprovedRevision',
  'RecoveryBaseline',
  'Scenario',
] as const satisfies ReadonlyArray<BaselineType>;

// ── §1.4 Activity Types and Status Codes ─────────────────────────────

export const SCHEDULE_ACTIVITY_TYPES = [
  'TT_Task',
  'TT_Mile',
  'TT_LOE',
  'TT_FinMile',
  'TT_WBS',
] as const satisfies ReadonlyArray<ScheduleActivityType>;

export const SCHEDULE_STATUS_CODES = [
  'TK_NotStart',
  'TK_Active',
  'TK_Complete',
] as const satisfies ReadonlyArray<ScheduleStatusCode>;

// ── §1.4.1 Constraint Types ─────────────────────────────────────────

export const SCHEDULE_CONSTRAINT_TYPES = [
  'CS_MSOA',
  'CS_MFOA',
  'CS_MSON',
  'CS_MFON',
  'CS_SNLF',
  'CS_FNLF',
  'CS_MEOA',
  'CS_MEON',
] as const satisfies ReadonlyArray<ScheduleConstraintType>;

/** Human-readable constraint type abbreviations and meanings (§1.4.1). */
export const SCHEDULE_CONSTRAINT_TYPE_LABELS: ReadonlyArray<{
  readonly type: ScheduleConstraintType;
  readonly abbreviation: string;
  readonly meaning: string;
}> = [
  { type: 'CS_MSOA', abbreviation: 'MSOA', meaning: 'Must Start On or After' },
  { type: 'CS_MFOA', abbreviation: 'MFOA', meaning: 'Must Finish On or After' },
  { type: 'CS_MSON', abbreviation: 'MSON', meaning: 'Must Start On (exact)' },
  { type: 'CS_MFON', abbreviation: 'MFON', meaning: 'Must Finish On (exact)' },
  { type: 'CS_SNLF', abbreviation: 'SNLF', meaning: 'Start No Later Than' },
  { type: 'CS_FNLF', abbreviation: 'FNLF', meaning: 'Finish No Later Than' },
  { type: 'CS_MEOA', abbreviation: 'MEOA', meaning: 'Must End On or After' },
  { type: 'CS_MEON', abbreviation: 'MEON', meaning: 'Must End On' },
];

// ── §1.4 Percent Complete ────────────────────────────────────────────

export const PERCENT_COMPLETE_BASES = [
  'Duration',
  'Physical',
  'Units',
  'Manual',
] as const satisfies ReadonlyArray<PercentCompleteBasis>;

// ── §17 Calendar Types ──────────────────────────────────────────────

export const CALENDAR_TYPES = [
  'SourceCalendar',
  'OperatingCalendar',
] as const satisfies ReadonlyArray<CalendarType>;

// ── §1.6 Import Validation Rules ─────────────────────────────────────

export const IMPORT_VALIDATION_RULES: ReadonlyArray<IImportValidationRule> = [
  { check: 'File format recognized', severity: 'error', behavior: 'Abort parse' },
  { check: 'Required columns present', severity: 'error', behavior: 'Abort parse' },
  { check: 'Activity code unique within version', severity: 'error', behavior: 'Abort parse' },
  { check: 'Data date present and valid', severity: 'error', behavior: 'Abort parse' },
  { check: 'Baseline dates present', severity: 'warning', behavior: 'Parse succeeds; baselineStartDate/Finish = null' },
  { check: 'Target dates valid', severity: 'error', behavior: 'Abort parse if target finish < data date for not-started' },
  { check: 'Float values present', severity: 'warning', behavior: 'Parse succeeds; float = null' },
  { check: 'Duration >= 0', severity: 'warning', behavior: 'Parse succeeds if 0 for non-milestone' },
  { check: 'Activity code matches prior versions', severity: 'informational', behavior: 'Match to continuity link; log new/missing codes' },
  { check: 'Constraint dates within project window', severity: 'warning', behavior: 'Parse succeeds; flag for review' },
];

// ── Authority Roles ──────────────────────────────────────────────────

export const SCHEDULE_AUTHORITY_ROLES = [
  'PM',
  'PE',
  'Scheduler',
  'Superintendent',
  'Foreman',
  'MOE',
] as const satisfies ReadonlyArray<ScheduleAuthorityRole>;

export const SCHEDULE_ACCESS_ACTIONS = [
  'read',
  'write',
  'approve',
  'configure',
  'publish',
] as const satisfies ReadonlyArray<ScheduleAccessAction>;

export const SCHEDULE_LAYERS = [
  'master-schedule',
  'operating',
  'field-execution',
  'published-forecast',
] as const satisfies ReadonlyArray<ScheduleLayerAccess>;

// ── Integration Boundaries ───────────────────────────────────────────

export const SCHEDULE_INTEGRATION_BOUNDARIES: ReadonlyArray<IScheduleIntegrationBoundary> = [
  {
    key: 'cpm-schedule-import',
    direction: 'inbound',
    source: 'Primavera P6 / MS Project / Asta',
    target: 'Schedule',
    description: 'XER/XML/CSV import → frozen ScheduleVersionRecord + ImportedActivitySnapshot',
    status: 'active',
  },
  {
    key: 'schedule-to-health-spine',
    direction: 'outbound',
    source: 'Schedule',
    target: 'Health Spine (P3-D2)',
    description: 'Published forecast milestone status, percent complete, critical path summary',
    status: 'planned',
  },
  {
    key: 'schedule-to-reports',
    direction: 'outbound',
    source: 'Schedule',
    target: 'Reports (P3-F1)',
    description: 'Published forecast layer as report data source for schedule summary projection',
    status: 'planned',
  },
  {
    key: 'schedule-to-work-queue',
    direction: 'outbound',
    source: 'Schedule',
    target: 'Work Queue (P3-D3)',
    description: 'Acknowledgement items, blocker resolution, readiness verification tasks',
    status: 'planned',
  },
  {
    key: 'schedule-to-activity-spine',
    direction: 'outbound',
    source: 'Schedule',
    target: 'Activity Spine (P3-D1)',
    description: 'Import events, baseline approvals, publication events, field execution events',
    status: 'planned',
  },
];
