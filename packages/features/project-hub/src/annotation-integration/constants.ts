/**
 * Stage 8.1 annotation-integration constants.
 * Module configs, Safety exclusion, isolation contract.
 */

import type {
  AnnotationAccessRole,
  AnnotationAnchorLevel,
  AnnotationEligibleModule,
  AnnotationExcludedModule,
  AnnotationIsolationRule,
  AnnotationMutationAuditEvent,
  AnnotationWritePathValidation,
  IsolationProofResult,
  ModuleDomainTable,
  ReviewSurfacePolicy,
} from './enums.js';
import type {
  IAnnotationAnchorKeyRegistry,
  IAnnotationIsolationContract,
  IModuleAnnotationConfig,
  IModuleDomainTableGuard,
  ISafetyAnnotationExclusion,
} from './types.js';

// -- Enum Arrays ------------------------------------------------------------------

export const ANNOTATION_ELIGIBLE_MODULES = [
  'FINANCIAL',
  'SCHEDULE',
  'CONSTRAINTS',
  'PERMITS',
  'PROJECT_CLOSEOUT',
  'PROJECT_STARTUP',
  'SUBCONTRACT_EXECUTION_READINESS',
] as const satisfies ReadonlyArray<AnnotationEligibleModule>;

export const ANNOTATION_EXCLUDED_MODULES = [
  'SAFETY',
] as const satisfies ReadonlyArray<AnnotationExcludedModule>;

export const ANNOTATION_ANCHOR_LEVELS = [
  'FIELD',
  'SECTION',
  'BLOCK',
] as const satisfies ReadonlyArray<AnnotationAnchorLevel>;

export const ANNOTATION_ACCESS_ROLES = [
  'PER_WRITE',
  'READ_ONLY',
  'NO_ACCESS',
] as const satisfies ReadonlyArray<AnnotationAccessRole>;

export const ANNOTATION_ISOLATION_RULES = [
  'ANNOTATION_LAYER_ONLY',
  'NO_MODULE_RECORD_MUTATION',
  'NO_DOMAIN_TABLE_WRITE',
] as const satisfies ReadonlyArray<AnnotationIsolationRule>;

export const REVIEW_SURFACE_POLICIES = [
  'FULL_ANNOTATION',
  'READ_ONLY_ANNOTATION',
  'NO_ANNOTATION',
] as const satisfies ReadonlyArray<ReviewSurfacePolicy>;

// -- Label Maps -------------------------------------------------------------------

export const ANNOTATION_ELIGIBLE_MODULE_LABELS: Readonly<Record<AnnotationEligibleModule, string>> = {
  FINANCIAL: 'Financial',
  SCHEDULE: 'Schedule',
  CONSTRAINTS: 'Constraints',
  PERMITS: 'Permits',
  PROJECT_CLOSEOUT: 'Project Closeout',
  PROJECT_STARTUP: 'Project Startup',
  SUBCONTRACT_EXECUTION_READINESS: 'Subcontract Execution Readiness',
};

export const ANNOTATION_ACCESS_ROLE_LABELS: Readonly<Record<AnnotationAccessRole, string>> = {
  PER_WRITE: 'PER Write',
  READ_ONLY: 'Read Only',
  NO_ACCESS: 'No Access',
};

// -- Module Annotation Configs ----------------------------------------------------

export const MODULE_ANNOTATION_CONFIGS: ReadonlyArray<IModuleAnnotationConfig> = [
  {
    module: 'FINANCIAL',
    isAnnotationEnabled: true,
    perRoleAccess: 'PER_WRITE',
    defaultNonPerAccess: 'READ_ONLY',
    supportedAnchorLevels: ['FIELD', 'SECTION', 'BLOCK'],
    sectionAnchorKeys: ['financial-summary', 'forecast-ledger', 'cash-flow'],
    blockAnchorKeys: ['budget-line-table', 'gcgr-table', 'buyout-table'],
    governingSpecRef: 'P3-E2 §3.4',
    surfacePolicy: 'FULL_ANNOTATION',
  },
  {
    module: 'SCHEDULE',
    isAnnotationEnabled: true,
    perRoleAccess: 'PER_WRITE',
    defaultNonPerAccess: 'READ_ONLY',
    supportedAnchorLevels: ['FIELD', 'SECTION', 'BLOCK'],
    sectionAnchorKeys: ['master-schedule', 'forecast-layer', 'field-execution'],
    blockAnchorKeys: ['activity-table', 'milestone-table'],
    governingSpecRef: 'P3-E2 §4.4',
    surfacePolicy: 'FULL_ANNOTATION',
  },
  {
    module: 'CONSTRAINTS',
    isAnnotationEnabled: true,
    perRoleAccess: 'PER_WRITE',
    defaultNonPerAccess: 'READ_ONLY',
    supportedAnchorLevels: ['FIELD', 'SECTION', 'BLOCK'],
    sectionAnchorKeys: ['risk-ledger', 'constraint-ledger', 'delay-ledger', 'change-ledger'],
    blockAnchorKeys: ['ledger-table', 'lineage-graph'],
    governingSpecRef: 'P3-E2 §5.4',
    surfacePolicy: 'FULL_ANNOTATION',
  },
  {
    module: 'PERMITS',
    isAnnotationEnabled: true,
    perRoleAccess: 'PER_WRITE',
    defaultNonPerAccess: 'READ_ONLY',
    supportedAnchorLevels: ['FIELD', 'SECTION', 'BLOCK'],
    sectionAnchorKeys: ['permit-registry', 'inspection-log'],
    blockAnchorKeys: ['permit-table', 'inspection-table'],
    governingSpecRef: 'P3-E2 §6.4',
    surfacePolicy: 'FULL_ANNOTATION',
  },
  {
    module: 'PROJECT_CLOSEOUT',
    isAnnotationEnabled: true,
    perRoleAccess: 'PER_WRITE',
    defaultNonPerAccess: 'READ_ONLY',
    supportedAnchorLevels: ['FIELD', 'SECTION', 'BLOCK'],
    sectionAnchorKeys: ['checklist', 'scorecard', 'lessons', 'autopsy'],
    blockAnchorKeys: ['checklist-table', 'scorecard-table', 'lessons-table'],
    governingSpecRef: 'P3-E2 §14.4',
    surfacePolicy: 'FULL_ANNOTATION',
  },
  {
    module: 'PROJECT_STARTUP',
    isAnnotationEnabled: true,
    perRoleAccess: 'PER_WRITE',
    defaultNonPerAccess: 'READ_ONLY',
    supportedAnchorLevels: ['FIELD', 'SECTION', 'BLOCK'],
    sectionAnchorKeys: ['task-library', 'safety-readiness', 'permit-posting', 'contract-obligations', 'responsibility-matrix', 'execution-baseline'],
    blockAnchorKeys: ['task-table', 'remediation-table', 'obligation-table'],
    governingSpecRef: 'P3-E2 §15.4',
    surfacePolicy: 'FULL_ANNOTATION',
  },
  {
    module: 'SUBCONTRACT_EXECUTION_READINESS',
    isAnnotationEnabled: true,
    perRoleAccess: 'PER_WRITE',
    defaultNonPerAccess: 'READ_ONLY',
    supportedAnchorLevels: ['FIELD', 'SECTION', 'BLOCK'],
    sectionAnchorKeys: ['case-registry', 'requirement-workbench', 'exception-packet'],
    blockAnchorKeys: ['requirement-table', 'evaluation-table'],
    governingSpecRef: 'P3-E2 §16.4',
    surfacePolicy: 'FULL_ANNOTATION',
  },
];

// -- Safety Annotation Exclusion --------------------------------------------------

export const SAFETY_ANNOTATION_EXCLUSION: Readonly<ISafetyAnnotationExclusion> = {
  module: 'SAFETY',
  uiBlockEnforced: true,
  authBlockEnforced: true,
  governingSpecRef: 'P3-E2 §7.4',
};

// -- Annotation Isolation Contract ------------------------------------------------

export const ANNOTATION_ISOLATION_CONTRACT: Readonly<IAnnotationIsolationContract> = {
  isolationContractId: 'annotation-isolation-v1',
  isolationRules: ['ANNOTATION_LAYER_ONLY', 'NO_MODULE_RECORD_MUTATION', 'NO_DOMAIN_TABLE_WRITE'],
  annotationWriteTarget: '@hbc/field-annotations',
  moduleRecordMutationAllowed: false,
  domainTableWriteAllowed: false,
  governingSpecRef: 'P3-E2 §11.2',
};

// -- Anchor Key Registries --------------------------------------------------------

export const ANNOTATION_ANCHOR_KEY_REGISTRIES: ReadonlyArray<IAnnotationAnchorKeyRegistry> = [
  { module: 'FINANCIAL', sectionKeys: ['financial-summary', 'forecast-ledger', 'cash-flow'], blockKeys: ['budget-line-table', 'gcgr-table', 'buyout-table'], fieldKeyPattern: '{canonicalBudgetLineId}:{fieldKey}' },
  { module: 'SCHEDULE', sectionKeys: ['master-schedule', 'forecast-layer', 'field-execution'], blockKeys: ['activity-table', 'milestone-table'], fieldKeyPattern: '{activityId}:{fieldKey}' },
  { module: 'CONSTRAINTS', sectionKeys: ['risk-ledger', 'constraint-ledger', 'delay-ledger', 'change-ledger'], blockKeys: ['ledger-table', 'lineage-graph'], fieldKeyPattern: '{recordId}:{fieldKey}' },
  { module: 'PERMITS', sectionKeys: ['permit-registry', 'inspection-log'], blockKeys: ['permit-table', 'inspection-table'], fieldKeyPattern: '{permitId}:{fieldKey}' },
  { module: 'PROJECT_CLOSEOUT', sectionKeys: ['checklist', 'scorecard', 'lessons', 'autopsy'], blockKeys: ['checklist-table', 'scorecard-table', 'lessons-table'], fieldKeyPattern: '{recordId}:{fieldKey}' },
  { module: 'PROJECT_STARTUP', sectionKeys: ['task-library', 'safety-readiness', 'permit-posting', 'contract-obligations', 'responsibility-matrix', 'execution-baseline'], blockKeys: ['task-table', 'remediation-table', 'obligation-table'], fieldKeyPattern: '{taskInstanceId}:{fieldKey}' },
  { module: 'SUBCONTRACT_EXECUTION_READINESS', sectionKeys: ['case-registry', 'requirement-workbench', 'exception-packet'], blockKeys: ['requirement-table', 'evaluation-table'], fieldKeyPattern: '{caseId}:{fieldKey}' },
];

// -- Stage 8.2 Isolation Enforcement Constants ------------------------------------

export const ANNOTATION_WRITE_PATH_VALIDATIONS = [
  'VALID_ANNOTATION_LAYER', 'BLOCKED_MODULE_MUTATION', 'BLOCKED_DOMAIN_TABLE_WRITE', 'BLOCKED_SAFETY_MODULE',
] as const satisfies ReadonlyArray<AnnotationWritePathValidation>;

export const ISOLATION_PROOF_RESULTS = [
  'ZERO_MODULE_WRITES', 'MODULE_WRITE_DETECTED', 'DOMAIN_TABLE_WRITE_DETECTED',
] as const satisfies ReadonlyArray<IsolationProofResult>;

export const ANNOTATION_MUTATION_AUDIT_EVENTS = [
  'ANNOTATION_CREATED', 'ANNOTATION_UPDATED', 'ANNOTATION_RESOLVED', 'ANNOTATION_DELETED',
  'MODULE_MUTATION_BLOCKED', 'DOMAIN_WRITE_BLOCKED', 'SAFETY_WRITE_BLOCKED',
] as const satisfies ReadonlyArray<AnnotationMutationAuditEvent>;

export const MODULE_DOMAIN_TABLES = [
  'FINANCIAL_FORECAST', 'FINANCIAL_BUDGET', 'SCHEDULE_SOURCE', 'SCHEDULE_COMMITMENT',
  'CONSTRAINTS_LEDGER', 'PERMITS_REGISTRY', 'CLOSEOUT_CHECKLIST', 'STARTUP_PROGRAM',
  'SUBCONTRACT_READINESS_CASE', 'REPORTS_RUN_LEDGER',
] as const satisfies ReadonlyArray<ModuleDomainTable>;

export const MODULE_DOMAIN_TABLE_GUARDS: ReadonlyArray<IModuleDomainTableGuard> = [
  { guardId: 'guard-fin-forecast', domainTable: 'FINANCIAL_FORECAST', module: 'FINANCIAL', isAnnotationWriteBlocked: true, governingSpecRef: 'P3-E2 §3.4' },
  { guardId: 'guard-fin-budget', domainTable: 'FINANCIAL_BUDGET', module: 'FINANCIAL', isAnnotationWriteBlocked: true, governingSpecRef: 'P3-E2 §3.4' },
  { guardId: 'guard-sch-source', domainTable: 'SCHEDULE_SOURCE', module: 'SCHEDULE', isAnnotationWriteBlocked: true, governingSpecRef: 'P3-E2 §4.4' },
  { guardId: 'guard-sch-commit', domainTable: 'SCHEDULE_COMMITMENT', module: 'SCHEDULE', isAnnotationWriteBlocked: true, governingSpecRef: 'P3-E2 §4.4' },
  { guardId: 'guard-con-ledger', domainTable: 'CONSTRAINTS_LEDGER', module: 'CONSTRAINTS', isAnnotationWriteBlocked: true, governingSpecRef: 'P3-E2 §5.4' },
  { guardId: 'guard-per-registry', domainTable: 'PERMITS_REGISTRY', module: 'PERMITS', isAnnotationWriteBlocked: true, governingSpecRef: 'P3-E2 §6.4' },
  { guardId: 'guard-clo-checklist', domainTable: 'CLOSEOUT_CHECKLIST', module: 'PROJECT_CLOSEOUT', isAnnotationWriteBlocked: true, governingSpecRef: 'P3-E2 §14.4' },
  { guardId: 'guard-sta-program', domainTable: 'STARTUP_PROGRAM', module: 'PROJECT_STARTUP', isAnnotationWriteBlocked: true, governingSpecRef: 'P3-E2 §15.4' },
  { guardId: 'guard-sub-case', domainTable: 'SUBCONTRACT_READINESS_CASE', module: 'SUBCONTRACT_EXECUTION_READINESS', isAnnotationWriteBlocked: true, governingSpecRef: 'P3-E2 §16.4' },
  { guardId: 'guard-rep-ledger', domainTable: 'REPORTS_RUN_LEDGER', module: 'FINANCIAL', isAnnotationWriteBlocked: true, governingSpecRef: 'P3-E2 §11.2' },
];

export const ISOLATION_PROOF_TEST_EXPECTATIONS: ReadonlyArray<{ module: AnnotationEligibleModule; moduleRecordWritesDetected: number; domainTableWritesDetected: number }> = [
  { module: 'FINANCIAL', moduleRecordWritesDetected: 0, domainTableWritesDetected: 0 },
  { module: 'SCHEDULE', moduleRecordWritesDetected: 0, domainTableWritesDetected: 0 },
  { module: 'CONSTRAINTS', moduleRecordWritesDetected: 0, domainTableWritesDetected: 0 },
  { module: 'PERMITS', moduleRecordWritesDetected: 0, domainTableWritesDetected: 0 },
  { module: 'PROJECT_CLOSEOUT', moduleRecordWritesDetected: 0, domainTableWritesDetected: 0 },
  { module: 'PROJECT_STARTUP', moduleRecordWritesDetected: 0, domainTableWritesDetected: 0 },
  { module: 'SUBCONTRACT_EXECUTION_READINESS', moduleRecordWritesDetected: 0, domainTableWritesDetected: 0 },
];

export const PER_WRITE_PATH_RULES: ReadonlyArray<{ rule: string; enforcement: string }> = [
  { rule: 'Annotation-layer writes are allowed for PER role', enforcement: 'VALID_ANNOTATION_LAYER' },
  { rule: 'Module domain writes are blocked for all annotation operations', enforcement: 'BLOCKED_MODULE_MUTATION' },
  { rule: 'Safety module annotation writes are blocked entirely', enforcement: 'BLOCKED_SAFETY_MODULE' },
];
