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
