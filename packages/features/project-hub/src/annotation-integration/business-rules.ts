/**
 * Stage 8.1 annotation-integration business rules.
 * PER role gating, Safety exclusion, isolation enforcement.
 */

import type {
  AnnotationAccessRole,
  AnnotationAnchorLevel,
  AnnotationEligibleModule,
  AnnotationWritePathValidation,
  IsolationProofResult,
  ModuleDomainTable,
} from './enums.js';
import {
  ANNOTATION_ANCHOR_KEY_REGISTRIES,
  ANNOTATION_ELIGIBLE_MODULES,
  MODULE_ANNOTATION_CONFIGS,
  MODULE_DOMAIN_TABLES,
} from './constants.js';
import type { IModuleAnnotationConfig } from './types.js';

export const isModuleAnnotationEligible = (module: string): boolean =>
  (ANNOTATION_ELIGIBLE_MODULES as readonly string[]).includes(module);

export const isSafetyAnnotationBlocked = (): true => true;

export const canPerRoleWriteAnnotations = (): true => true;

export const canNonPerRoleMutateAnnotations = (): false => false;

export const doesAnnotationMutateModuleRecord = (): false => false;

export const doesAnnotationWriteToDomainTable = (): false => false;

export const isAnnotationStoredInFieldAnnotationsLayer = (): true => true;

export const getAnnotationAccessForRole = (
  module: AnnotationEligibleModule,
  isPer: boolean,
): AnnotationAccessRole => {
  const config = MODULE_ANNOTATION_CONFIGS.find((c) => c.module === module);
  if (!config) return 'NO_ACCESS';
  return isPer ? config.perRoleAccess : config.defaultNonPerAccess;
};

export const getModuleAnnotationConfig = (
  module: AnnotationEligibleModule,
): IModuleAnnotationConfig | null =>
  MODULE_ANNOTATION_CONFIGS.find((c) => c.module === module) ?? null;

export const getSectionAnchorKeysForModule = (
  module: AnnotationEligibleModule,
): readonly string[] => {
  const registry = ANNOTATION_ANCHOR_KEY_REGISTRIES.find((r) => r.module === module);
  return registry ? registry.sectionKeys : [];
};

export const getBlockAnchorKeysForModule = (
  module: AnnotationEligibleModule,
): readonly string[] => {
  const registry = ANNOTATION_ANCHOR_KEY_REGISTRIES.find((r) => r.module === module);
  return registry ? registry.blockKeys : [];
};

export const isAnchorLevelSupportedForModule = (
  module: AnnotationEligibleModule,
  level: AnnotationAnchorLevel,
): boolean => {
  const config = MODULE_ANNOTATION_CONFIGS.find((c) => c.module === module);
  return config !== undefined && (config.supportedAnchorLevels as readonly string[]).includes(level);
};

export const isSafetyAnnotationEnforcedAtUI = (): true => true;

export const isSafetyAnnotationEnforcedAtAuth = (): true => true;

// -- Stage 8.2 Isolation Enforcement Rules ----------------------------------------

export const validateAnnotationWritePath = (
  module: string,
  isAnnotationLayer: boolean,
): AnnotationWritePathValidation => {
  if (module === 'SAFETY') return 'BLOCKED_SAFETY_MODULE';
  if (!isAnnotationLayer) return 'BLOCKED_MODULE_MUTATION';
  return 'VALID_ANNOTATION_LAYER';
};

export const isIsolationProofPassing = (result: IsolationProofResult): boolean =>
  result === 'ZERO_MODULE_WRITES';

export const isModuleDomainTableProtected = (table: ModuleDomainTable): boolean =>
  (MODULE_DOMAIN_TABLES as readonly string[]).includes(table);

export const canAnnotationWriteToModuleDomain = (): false => false;

export const canAnnotationWriteToReportsDomain = (): false => false;

export const isAnnotationMutationAuditRequired = (): true => true;

export const getExpectedModuleWritesForAnnotation = (): 0 => 0;

export const getExpectedDomainTableWritesForAnnotation = (): 0 => 0;

export const isPerSourceOfTruthWriteBlocked = (): true => true;

export const validateIsolationProofForModule = (
  _module: AnnotationEligibleModule,
  moduleWrites: number,
  domainTableWrites: number,
): IsolationProofResult => {
  if (moduleWrites > 0) return 'MODULE_WRITE_DETECTED';
  if (domainTableWrites > 0) return 'DOMAIN_TABLE_WRITE_DETECTED';
  return 'ZERO_MODULE_WRITES';
};
