import { describe, expect, it } from 'vitest';

import type {
  IAnnotationAnchorKeyRegistry,
  IAnnotationIsolationContract,
  IModuleAnnotationConfig,
  ISafetyAnnotationExclusion,
} from '../index.js';
import {
  ANNOTATION_ACCESS_ROLE_LABELS,
  ANNOTATION_ACCESS_ROLES,
  ANNOTATION_ANCHOR_KEY_REGISTRIES,
  ANNOTATION_ANCHOR_LEVELS,
  ANNOTATION_ELIGIBLE_MODULE_LABELS,
  ANNOTATION_ELIGIBLE_MODULES,
  ANNOTATION_EXCLUDED_MODULES,
  ANNOTATION_ISOLATION_CONTRACT,
  ANNOTATION_ISOLATION_RULES,
  MODULE_ANNOTATION_CONFIGS,
  REVIEW_SURFACE_POLICIES,
  SAFETY_ANNOTATION_EXCLUSION,
} from '../index.js';

describe('annotation-integration contract stability', () => {
  // -- Enum array lengths ---------------------------------------------------------

  it('ANNOTATION_ELIGIBLE_MODULES has 7 entries', () => {
    expect(ANNOTATION_ELIGIBLE_MODULES).toHaveLength(7);
  });

  it('ANNOTATION_EXCLUDED_MODULES has 1 entry', () => {
    expect(ANNOTATION_EXCLUDED_MODULES).toHaveLength(1);
  });

  it('ANNOTATION_ANCHOR_LEVELS has 3 entries', () => {
    expect(ANNOTATION_ANCHOR_LEVELS).toHaveLength(3);
  });

  it('ANNOTATION_ACCESS_ROLES has 3 entries', () => {
    expect(ANNOTATION_ACCESS_ROLES).toHaveLength(3);
  });

  it('ANNOTATION_ISOLATION_RULES has 3 entries', () => {
    expect(ANNOTATION_ISOLATION_RULES).toHaveLength(3);
  });

  it('REVIEW_SURFACE_POLICIES has 3 entries', () => {
    expect(REVIEW_SURFACE_POLICIES).toHaveLength(3);
  });

  // -- Label map key counts -------------------------------------------------------

  it('ANNOTATION_ELIGIBLE_MODULE_LABELS has 7 keys', () => {
    expect(Object.keys(ANNOTATION_ELIGIBLE_MODULE_LABELS)).toHaveLength(7);
  });

  it('ANNOTATION_ACCESS_ROLE_LABELS has 3 keys', () => {
    expect(Object.keys(ANNOTATION_ACCESS_ROLE_LABELS)).toHaveLength(3);
  });

  // -- Module annotation configs --------------------------------------------------

  it('MODULE_ANNOTATION_CONFIGS has 7 entries', () => {
    expect(MODULE_ANNOTATION_CONFIGS).toHaveLength(7);
  });

  it('each config has non-empty sectionAnchorKeys', () => {
    for (const config of MODULE_ANNOTATION_CONFIGS) {
      expect(config.sectionAnchorKeys.length).toBeGreaterThan(0);
    }
  });

  it('each config has non-empty blockAnchorKeys', () => {
    for (const config of MODULE_ANNOTATION_CONFIGS) {
      expect(config.blockAnchorKeys.length).toBeGreaterThan(0);
    }
  });

  it('each config.perRoleAccess is PER_WRITE', () => {
    for (const config of MODULE_ANNOTATION_CONFIGS) {
      expect(config.perRoleAccess).toBe('PER_WRITE');
    }
  });

  it('each config.isAnnotationEnabled is true', () => {
    for (const config of MODULE_ANNOTATION_CONFIGS) {
      expect(config.isAnnotationEnabled).toBe(true);
    }
  });

  // -- Safety exclusion -----------------------------------------------------------

  it('SAFETY_ANNOTATION_EXCLUSION.uiBlockEnforced is true', () => {
    expect(SAFETY_ANNOTATION_EXCLUSION.uiBlockEnforced).toBe(true);
  });

  it('SAFETY_ANNOTATION_EXCLUSION.authBlockEnforced is true', () => {
    expect(SAFETY_ANNOTATION_EXCLUSION.authBlockEnforced).toBe(true);
  });

  // -- Isolation contract ---------------------------------------------------------

  it('ANNOTATION_ISOLATION_CONTRACT.isolationRules has 3 entries', () => {
    expect(ANNOTATION_ISOLATION_CONTRACT.isolationRules).toHaveLength(3);
  });

  it('ANNOTATION_ISOLATION_CONTRACT.moduleRecordMutationAllowed is false', () => {
    expect(ANNOTATION_ISOLATION_CONTRACT.moduleRecordMutationAllowed).toBe(false);
  });

  it('ANNOTATION_ISOLATION_CONTRACT.domainTableWriteAllowed is false', () => {
    expect(ANNOTATION_ISOLATION_CONTRACT.domainTableWriteAllowed).toBe(false);
  });

  // -- Anchor key registries ------------------------------------------------------

  it('ANNOTATION_ANCHOR_KEY_REGISTRIES has 7 entries', () => {
    expect(ANNOTATION_ANCHOR_KEY_REGISTRIES).toHaveLength(7);
  });

  // -- Type checks ----------------------------------------------------------------

  it('IModuleAnnotationConfig satisfies expected shape', () => {
    const config: IModuleAnnotationConfig = MODULE_ANNOTATION_CONFIGS[0]!;
    expect(config.module).toBeDefined();
    expect(config.isAnnotationEnabled).toBeDefined();
    expect(config.perRoleAccess).toBeDefined();
    expect(config.defaultNonPerAccess).toBeDefined();
    expect(config.supportedAnchorLevels).toBeDefined();
    expect(config.governingSpecRef).toBeDefined();
    expect(config.surfacePolicy).toBeDefined();
  });

  it('ISafetyAnnotationExclusion satisfies expected shape', () => {
    const exclusion: ISafetyAnnotationExclusion = SAFETY_ANNOTATION_EXCLUSION;
    expect(exclusion.module).toBe('SAFETY');
    expect(exclusion.uiBlockEnforced).toBeDefined();
    expect(exclusion.authBlockEnforced).toBeDefined();
    expect(exclusion.governingSpecRef).toBeDefined();
  });

  it('IAnnotationIsolationContract satisfies expected shape', () => {
    const contract: IAnnotationIsolationContract = ANNOTATION_ISOLATION_CONTRACT;
    expect(contract.isolationContractId).toBeDefined();
    expect(contract.isolationRules).toBeDefined();
    expect(contract.annotationWriteTarget).toBeDefined();
    expect(contract.moduleRecordMutationAllowed).toBeDefined();
    expect(contract.domainTableWriteAllowed).toBeDefined();
    expect(contract.governingSpecRef).toBeDefined();
  });

  it('IAnnotationAnchorKeyRegistry satisfies expected shape', () => {
    const registry: IAnnotationAnchorKeyRegistry = ANNOTATION_ANCHOR_KEY_REGISTRIES[0]!;
    expect(registry.module).toBeDefined();
    expect(registry.sectionKeys).toBeDefined();
    expect(registry.blockKeys).toBeDefined();
    expect(registry.fieldKeyPattern).toBeDefined();
  });
});
