/**
 * P3-E13-T08 Stage 7 Subcontract Execution Readiness Module cross-module-contracts constants.
 * Financial gate, Startup boundary, downstream consumers, related items, activity, future inputs.
 */

import type {
  CrossModuleActivityEvent,
  DownstreamConsumer,
  ExternalDisplacementProhibition,
  FinancialProhibition,
  FutureExternalInputType,
  GateProjectionField,
  ReadinessRelatedItemPair,
  StartupAllowedConsumption,
  StartupProhibitedConsumption,
} from './enums.js';
import type {
  ICrossModuleActivityEventDef,
  IDownstreamConsumerDef,
  IExternalDisplacementProhibitionDef,
  IFinancialProhibitionDef,
  IFutureExternalInputDef,
  IRelatedItemPairDef,
  IStartupBoundaryAllowedDef,
  IStartupBoundaryProhibitedDef,
} from './types.js';

// -- Enum Arrays ----------------------------------------------------------------

export const GATE_PROJECTION_FIELDS = [
  'LINKED_BUYOUT_LINE_ID', 'READINESS_CASE_ID', 'EXECUTION_READINESS_OUTCOME',
  'DECISION_ISSUED_AT', 'DECISION_VERSION', 'BLOCKING_REASON_CODE', 'SUPERSEDED_BY_CASE_ID',
] as const satisfies ReadonlyArray<GateProjectionField>;

export const FINANCIAL_PROHIBITIONS = [
  'INFER_FROM_RAW_ITEMS', 'WRITE_READINESS_RECORDS',
  'MUTATE_EXCEPTION_OUTCOMES', 'BYPASS_SUPERSEDE_VOID_LINEAGE',
] as const satisfies ReadonlyArray<FinancialProhibition>;

export const STARTUP_ALLOWED_CONSUMPTIONS = [
  'REFERENCE_LINKS', 'SUMMARY_POSTURE', 'DEPENDENCY_VISIBILITY',
] as const satisfies ReadonlyArray<StartupAllowedConsumption>;

export const STARTUP_PROHIBITED_CONSUMPTIONS = [
  'READINESS_WORKFLOW', 'EVALUATION_LEDGERS', 'EXCEPTION_ROUTING', 'DECISION_ISSUANCE',
] as const satisfies ReadonlyArray<StartupProhibitedConsumption>;

export const DOWNSTREAM_CONSUMERS = [
  'REPORTS', 'HEALTH', 'WORK_QUEUE',
] as const satisfies ReadonlyArray<DownstreamConsumer>;

export const READINESS_RELATED_ITEM_PAIRS = [
  'CASE_TO_BUYOUT_LINE', 'DECISION_TO_BUYOUT_LINE',
  'EXCEPTION_PRECEDENT_TO_CASE', 'SUPERSEDED_CASE_TO_SUCCESSOR',
] as const satisfies ReadonlyArray<ReadinessRelatedItemPair>;

export const CROSS_MODULE_ACTIVITY_EVENTS = [
  'CASE_CREATED', 'CASE_SUBMITTED', 'DEFICIENCY_ISSUED', 'DEFICIENCY_RESOLVED',
  'EXCEPTION_ITERATION_SUBMITTED', 'EXCEPTION_ACTION_TAKEN',
  'READINESS_DECISION_ISSUED', 'CASE_RENEWED', 'CASE_SUPERSEDED', 'CASE_VOIDED',
] as const satisfies ReadonlyArray<CrossModuleActivityEvent>;

export const FUTURE_EXTERNAL_INPUT_TYPES = [
  'ARTIFACT_REFERENCES', 'EXTERNAL_FACTUAL_POSTURE',
  'PREQUALIFICATION_ADVISORIES', 'IDENTITY_HYDRATION', 'ALERTING_INPUTS',
] as const satisfies ReadonlyArray<FutureExternalInputType>;

export const EXTERNAL_DISPLACEMENT_PROHIBITIONS = [
  'PARENT_READINESS_CASE', 'SPECIALIST_EVALUATION_OWNERSHIP',
  'EXCEPTION_GOVERNANCE', 'PROJECT_LEVEL_DECISION',
] as const satisfies ReadonlyArray<ExternalDisplacementProhibition>;

// -- Definition Arrays ----------------------------------------------------------

export const FINANCIAL_PROHIBITION_DEFINITIONS: ReadonlyArray<IFinancialProhibitionDef> = [
  { prohibition: 'INFER_FROM_RAW_ITEMS', description: 'Financial must not infer readiness from raw item rows' },
  { prohibition: 'WRITE_READINESS_RECORDS', description: 'Financial must not write readiness records' },
  { prohibition: 'MUTATE_EXCEPTION_OUTCOMES', description: 'Financial must not mutate exception outcomes' },
  { prohibition: 'BYPASS_SUPERSEDE_VOID_LINEAGE', description: 'Financial must not bypass supersede / void lineage' },
];

export const STARTUP_BOUNDARY_ALLOWED_DEFINITIONS: ReadonlyArray<IStartupBoundaryAllowedDef> = [
  { consumption: 'REFERENCE_LINKS', description: 'Reference links to readiness state' },
  { consumption: 'SUMMARY_POSTURE', description: 'Summary posture of readiness' },
  { consumption: 'DEPENDENCY_VISIBILITY', description: 'Dependency visibility where startup operations care about subcontract execution status' },
];

export const STARTUP_BOUNDARY_PROHIBITED_DEFINITIONS: ReadonlyArray<IStartupBoundaryProhibitedDef> = [
  { consumption: 'READINESS_WORKFLOW', description: 'The readiness workflow' },
  { consumption: 'EVALUATION_LEDGERS', description: 'Readiness evaluation ledgers' },
  { consumption: 'EXCEPTION_ROUTING', description: 'Exception routing' },
  { consumption: 'DECISION_ISSUANCE', description: 'Readiness decision issuance' },
];

export const DOWNSTREAM_CONSUMER_DEFINITIONS: ReadonlyArray<IDownstreamConsumerDef> = [
  { consumer: 'REPORTS', consumptionDescription: 'Consumes published readiness summaries or gated projections; must not be treated as the readiness ledger' },
  { consumer: 'HEALTH', consumptionDescription: 'Receives derived readiness outputs: blocked count, overdue review/approval counts, renewal-due count, ready-for-execution count' },
  { consumer: 'WORK_QUEUE', consumptionDescription: 'Receives routed actions: missing item assembly, specialist review due, exception approval due, renewal due, blocked execution resolution' },
];

export const RELATED_ITEM_PAIR_DEFINITIONS: ReadonlyArray<IRelatedItemPairDef> = [
  { pair: 'CASE_TO_BUYOUT_LINE', description: 'Readiness case linked to the governing buyout line' },
  { pair: 'DECISION_TO_BUYOUT_LINE', description: 'Readiness decision linked to the governing buyout line' },
  { pair: 'EXCEPTION_PRECEDENT_TO_CASE', description: 'Approved exception / precedent reference linked to originating readiness case' },
  { pair: 'SUPERSEDED_CASE_TO_SUCCESSOR', description: 'Superseded case linked to successor case' },
];

export const CROSS_MODULE_ACTIVITY_EVENT_DEFINITIONS: ReadonlyArray<ICrossModuleActivityEventDef> = [
  { event: 'CASE_CREATED', description: 'Readiness case created' },
  { event: 'CASE_SUBMITTED', description: 'Case submitted for specialist review' },
  { event: 'DEFICIENCY_ISSUED', description: 'Deficiency issued on a requirement item' },
  { event: 'DEFICIENCY_RESOLVED', description: 'Deficiency resolved on a requirement item' },
  { event: 'EXCEPTION_ITERATION_SUBMITTED', description: 'Exception iteration submitted' },
  { event: 'EXCEPTION_ACTION_TAKEN', description: 'Exception action approved / rejected / returned' },
  { event: 'READINESS_DECISION_ISSUED', description: 'Readiness decision formally issued' },
  { event: 'CASE_RENEWED', description: 'Case renewed in-case' },
  { event: 'CASE_SUPERSEDED', description: 'Case superseded' },
  { event: 'CASE_VOIDED', description: 'Case voided' },
];

export const FUTURE_EXTERNAL_INPUT_DEFINITIONS: ReadonlyArray<IFutureExternalInputDef> = [
  { inputType: 'ARTIFACT_REFERENCES', description: 'Artifact references from external systems' },
  { inputType: 'EXTERNAL_FACTUAL_POSTURE', description: 'External factual posture' },
  { inputType: 'PREQUALIFICATION_ADVISORIES', description: 'Prequalification advisories' },
  { inputType: 'IDENTITY_HYDRATION', description: 'Identity hydration from vendor-master systems' },
  { inputType: 'ALERTING_INPUTS', description: 'Alerting inputs from risk or compliance systems' },
];

export const EXTERNAL_DISPLACEMENT_PROHIBITION_DEFINITIONS: ReadonlyArray<IExternalDisplacementProhibitionDef> = [
  { prohibition: 'PARENT_READINESS_CASE', description: 'External systems cannot displace the parent readiness case' },
  { prohibition: 'SPECIALIST_EVALUATION_OWNERSHIP', description: 'External systems cannot displace specialist evaluation ownership' },
  { prohibition: 'EXCEPTION_GOVERNANCE', description: 'External systems cannot displace exception governance' },
  { prohibition: 'PROJECT_LEVEL_DECISION', description: 'External systems cannot displace the project-level readiness decision' },
];
