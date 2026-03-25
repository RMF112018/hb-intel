/**
 * Stage 8.1 annotation-integration business rules.
 * PER role gating, Safety exclusion, isolation enforcement.
 */

import type { AnnotationAccessRole, AnnotationAnchorLevel, AnnotationEligibleModule } from './enums.js';
import {
  ANNOTATION_ANCHOR_KEY_REGISTRIES,
  ANNOTATION_ELIGIBLE_MODULES,
  MODULE_ANNOTATION_CONFIGS,
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
