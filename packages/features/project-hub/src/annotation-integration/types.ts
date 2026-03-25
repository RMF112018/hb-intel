/**
 * Stage 8.1 annotation-integration TypeScript contracts.
 * Per-module annotation configs, Safety exclusion, isolation enforcement.
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

export interface IModuleAnnotationConfig {
  readonly module: AnnotationEligibleModule;
  readonly isAnnotationEnabled: boolean;
  readonly perRoleAccess: AnnotationAccessRole;
  readonly defaultNonPerAccess: AnnotationAccessRole;
  readonly supportedAnchorLevels: readonly AnnotationAnchorLevel[];
  readonly sectionAnchorKeys: readonly string[];
  readonly blockAnchorKeys: readonly string[];
  readonly governingSpecRef: string;
  readonly surfacePolicy: ReviewSurfacePolicy;
}

export interface ISafetyAnnotationExclusion {
  readonly module: AnnotationExcludedModule;
  readonly uiBlockEnforced: boolean;
  readonly authBlockEnforced: boolean;
  readonly governingSpecRef: string;
}

export interface IAnnotationIsolationContract {
  readonly isolationContractId: string;
  readonly isolationRules: readonly AnnotationIsolationRule[];
  readonly annotationWriteTarget: string;
  readonly moduleRecordMutationAllowed: boolean;
  readonly domainTableWriteAllowed: boolean;
  readonly governingSpecRef: string;
}

export interface IAnnotationAnchorKeyRegistry {
  readonly module: AnnotationEligibleModule;
  readonly sectionKeys: readonly string[];
  readonly blockKeys: readonly string[];
  readonly fieldKeyPattern: string;
}

// -- Stage 8.2 Isolation Enforcement Types ----------------------------------------

export interface IAnnotationWritePathResult {
  readonly writePathResultId: string;
  readonly annotationId: string;
  readonly targetModule: AnnotationEligibleModule | AnnotationExcludedModule;
  readonly validation: AnnotationWritePathValidation;
  readonly moduleRecordsMutated: number;
  readonly domainTableWritesDetected: number;
}

export interface IAnnotationMutationAuditRecord {
  readonly auditRecordId: string;
  readonly annotationId: string;
  readonly event: AnnotationMutationAuditEvent;
  readonly targetModule: string;
  readonly targetAnchorKey: string;
  readonly actorUserId: string;
  readonly occurredAt: string;
  readonly moduleRecordMutationAttempted: boolean;
}

export interface IIsolationProofTestResult {
  readonly testResultId: string;
  readonly testRunAt: string;
  readonly module: AnnotationEligibleModule;
  readonly annotationsCreated: number;
  readonly annotationsUpdated: number;
  readonly moduleRecordWritesDetected: number;
  readonly domainTableWritesDetected: number;
  readonly proofResult: IsolationProofResult;
}

export interface IPerWritePathEnforcement {
  readonly enforcementId: string;
  readonly module: AnnotationEligibleModule;
  readonly perUserIdAttempting: string;
  readonly writeAction: string;
  readonly isAnnotationLayerWrite: boolean;
  readonly isModuleDomainWrite: boolean;
}

export interface IModuleDomainTableGuard {
  readonly guardId: string;
  readonly domainTable: ModuleDomainTable;
  readonly module: AnnotationEligibleModule;
  readonly isAnnotationWriteBlocked: boolean;
  readonly governingSpecRef: string;
}
