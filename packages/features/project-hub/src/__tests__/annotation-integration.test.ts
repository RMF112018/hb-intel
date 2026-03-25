import { describe, expect, it } from 'vitest';

import {
  canAnnotationWriteToModuleDomain,
  canAnnotationWriteToReportsDomain,
  canNonPerRoleMutateAnnotations,
  canPerRoleWriteAnnotations,
  doesAnnotationMutateModuleRecord,
  doesAnnotationWriteToDomainTable,
  getAnnotationAccessForRole,
  getBlockAnchorKeysForModule,
  getExpectedDomainTableWritesForAnnotation,
  getExpectedModuleWritesForAnnotation,
  getModuleAnnotationConfig,
  getSectionAnchorKeysForModule,
  isAnchorLevelSupportedForModule,
  isAnnotationMutationAuditRequired,
  isAnnotationStoredInFieldAnnotationsLayer,
  isIsolationProofPassing,
  isModuleAnnotationEligible,
  isModuleDomainTableProtected,
  isPerSourceOfTruthWriteBlocked,
  isSafetyAnnotationBlocked,
  isSafetyAnnotationEnforcedAtAuth,
  isSafetyAnnotationEnforcedAtUI,
  validateAnnotationWritePath,
  validateIsolationProofForModule,
} from '../index.js';

describe('annotation-integration business rules', () => {
  // -- isModuleAnnotationEligible -------------------------------------------------

  describe('isModuleAnnotationEligible', () => {
    it.each([
      'FINANCIAL',
      'SCHEDULE',
      'CONSTRAINTS',
      'PERMITS',
      'PROJECT_CLOSEOUT',
      'PROJECT_STARTUP',
      'SUBCONTRACT_EXECUTION_READINESS',
    ])('returns true for %s', (module) => {
      expect(isModuleAnnotationEligible(module)).toBe(true);
    });

    it('returns false for SAFETY', () => {
      expect(isModuleAnnotationEligible('SAFETY')).toBe(false);
    });

    it('returns false for UNKNOWN', () => {
      expect(isModuleAnnotationEligible('UNKNOWN')).toBe(false);
    });
  });

  // -- Boolean invariant rules ----------------------------------------------------

  it('isSafetyAnnotationBlocked returns true', () => {
    expect(isSafetyAnnotationBlocked()).toBe(true);
  });

  it('canPerRoleWriteAnnotations returns true', () => {
    expect(canPerRoleWriteAnnotations()).toBe(true);
  });

  it('canNonPerRoleMutateAnnotations returns false', () => {
    expect(canNonPerRoleMutateAnnotations()).toBe(false);
  });

  it('doesAnnotationMutateModuleRecord returns false', () => {
    expect(doesAnnotationMutateModuleRecord()).toBe(false);
  });

  it('doesAnnotationWriteToDomainTable returns false', () => {
    expect(doesAnnotationWriteToDomainTable()).toBe(false);
  });

  it('isAnnotationStoredInFieldAnnotationsLayer returns true', () => {
    expect(isAnnotationStoredInFieldAnnotationsLayer()).toBe(true);
  });

  // -- getAnnotationAccessForRole -------------------------------------------------

  describe('getAnnotationAccessForRole', () => {
    it('returns PER_WRITE for FINANCIAL with isPer true', () => {
      expect(getAnnotationAccessForRole('FINANCIAL', true)).toBe('PER_WRITE');
    });

    it('returns READ_ONLY for FINANCIAL with isPer false', () => {
      expect(getAnnotationAccessForRole('FINANCIAL', false)).toBe('READ_ONLY');
    });

    it('returns PER_WRITE for SCHEDULE with isPer true', () => {
      expect(getAnnotationAccessForRole('SCHEDULE', true)).toBe('PER_WRITE');
    });
  });

  // -- getModuleAnnotationConfig --------------------------------------------------

  describe('getModuleAnnotationConfig', () => {
    it('returns non-null config for FINANCIAL with correct fields', () => {
      const config = getModuleAnnotationConfig('FINANCIAL');
      expect(config).not.toBeNull();
      expect(config!.module).toBe('FINANCIAL');
      expect(config!.isAnnotationEnabled).toBe(true);
      expect(config!.perRoleAccess).toBe('PER_WRITE');
      expect(config!.surfacePolicy).toBe('FULL_ANNOTATION');
    });

    it('returns null for unknown module', () => {
      const config = getModuleAnnotationConfig('UNKNOWN_MODULE' as never);
      expect(config).toBeNull();
    });
  });

  // -- getSectionAnchorKeysForModule ----------------------------------------------

  describe('getSectionAnchorKeysForModule', () => {
    it('returns 3 keys for FINANCIAL', () => {
      expect(getSectionAnchorKeysForModule('FINANCIAL')).toHaveLength(3);
    });

    it('returns 3 keys for SCHEDULE', () => {
      expect(getSectionAnchorKeysForModule('SCHEDULE')).toHaveLength(3);
    });

    it('returns 6 keys for PROJECT_STARTUP', () => {
      expect(getSectionAnchorKeysForModule('PROJECT_STARTUP')).toHaveLength(6);
    });
  });

  // -- getBlockAnchorKeysForModule ------------------------------------------------

  describe('getBlockAnchorKeysForModule', () => {
    it('returns 3 keys for FINANCIAL', () => {
      expect(getBlockAnchorKeysForModule('FINANCIAL')).toHaveLength(3);
    });

    it('returns 2 keys for PERMITS', () => {
      expect(getBlockAnchorKeysForModule('PERMITS')).toHaveLength(2);
    });
  });

  // -- isAnchorLevelSupportedForModule --------------------------------------------

  describe('isAnchorLevelSupportedForModule', () => {
    it('returns true for FINANCIAL + FIELD', () => {
      expect(isAnchorLevelSupportedForModule('FINANCIAL', 'FIELD')).toBe(true);
    });

    it('returns true for FINANCIAL + SECTION', () => {
      expect(isAnchorLevelSupportedForModule('FINANCIAL', 'SECTION')).toBe(true);
    });

    it('returns true for FINANCIAL + BLOCK', () => {
      expect(isAnchorLevelSupportedForModule('FINANCIAL', 'BLOCK')).toBe(true);
    });
  });

  // -- Safety enforcement ---------------------------------------------------------

  it('isSafetyAnnotationEnforcedAtUI returns true', () => {
    expect(isSafetyAnnotationEnforcedAtUI()).toBe(true);
  });

  it('isSafetyAnnotationEnforcedAtAuth returns true', () => {
    expect(isSafetyAnnotationEnforcedAtAuth()).toBe(true);
  });

  // -- Stage 8.2 Isolation Enforcement Rules ---------------------------------------

  describe('Stage 8.2 isolation enforcement rules', () => {
    it('validateAnnotationWritePath returns VALID for annotation layer', () => {
      expect(validateAnnotationWritePath('FINANCIAL', true)).toBe('VALID_ANNOTATION_LAYER');
    });
    it('validateAnnotationWritePath returns BLOCKED for module mutation', () => {
      expect(validateAnnotationWritePath('FINANCIAL', false)).toBe('BLOCKED_MODULE_MUTATION');
    });
    it('validateAnnotationWritePath returns BLOCKED for Safety', () => {
      expect(validateAnnotationWritePath('SAFETY', true)).toBe('BLOCKED_SAFETY_MODULE');
    });
    it('isIsolationProofPassing true for ZERO_MODULE_WRITES', () => {
      expect(isIsolationProofPassing('ZERO_MODULE_WRITES')).toBe(true);
    });
    it('isIsolationProofPassing false for MODULE_WRITE_DETECTED', () => {
      expect(isIsolationProofPassing('MODULE_WRITE_DETECTED')).toBe(false);
    });
    it('isModuleDomainTableProtected true for all 10 tables', () => {
      const tables = ['FINANCIAL_FORECAST', 'FINANCIAL_BUDGET', 'SCHEDULE_SOURCE', 'SCHEDULE_COMMITMENT', 'CONSTRAINTS_LEDGER', 'PERMITS_REGISTRY', 'CLOSEOUT_CHECKLIST', 'STARTUP_PROGRAM', 'SUBCONTRACT_READINESS_CASE', 'REPORTS_RUN_LEDGER'];
      for (const table of tables) {
        expect(isModuleDomainTableProtected(table as never)).toBe(true);
      }
    });
    it('canAnnotationWriteToModuleDomain returns false', () => { expect(canAnnotationWriteToModuleDomain()).toBe(false); });
    it('canAnnotationWriteToReportsDomain returns false', () => { expect(canAnnotationWriteToReportsDomain()).toBe(false); });
    it('isAnnotationMutationAuditRequired returns true', () => { expect(isAnnotationMutationAuditRequired()).toBe(true); });
    it('getExpectedModuleWritesForAnnotation returns 0', () => { expect(getExpectedModuleWritesForAnnotation()).toBe(0); });
    it('getExpectedDomainTableWritesForAnnotation returns 0', () => { expect(getExpectedDomainTableWritesForAnnotation()).toBe(0); });
    it('isPerSourceOfTruthWriteBlocked returns true', () => { expect(isPerSourceOfTruthWriteBlocked()).toBe(true); });
    it('validateIsolationProofForModule returns ZERO_MODULE_WRITES for 0 writes', () => {
      expect(validateIsolationProofForModule('FINANCIAL', 0, 0)).toBe('ZERO_MODULE_WRITES');
    });
    it('validateIsolationProofForModule returns MODULE_WRITE_DETECTED for >0 module writes', () => {
      expect(validateIsolationProofForModule('FINANCIAL', 1, 0)).toBe('MODULE_WRITE_DETECTED');
    });
    it('validateIsolationProofForModule returns DOMAIN_TABLE_WRITE_DETECTED for >0 domain writes', () => {
      expect(validateIsolationProofForModule('FINANCIAL', 0, 1)).toBe('DOMAIN_TABLE_WRITE_DETECTED');
    });
  });
});
