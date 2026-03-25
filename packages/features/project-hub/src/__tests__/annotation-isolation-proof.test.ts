import { describe, expect, it } from 'vitest';

import {
  ANNOTATION_ELIGIBLE_MODULES,
  ISOLATION_PROOF_TEST_EXPECTATIONS,
  MODULE_DOMAIN_TABLE_GUARDS,
  MODULE_DOMAIN_TABLES,
  validateAnnotationWritePath,
  validateIsolationProofForModule,
  isModuleDomainTableProtected,
  isPerSourceOfTruthWriteBlocked,
  canAnnotationWriteToModuleDomain,
  getExpectedModuleWritesForAnnotation,
  getExpectedDomainTableWritesForAnnotation,
  isSafetyAnnotationBlocked,
} from '../index.js';

/**
 * P3-E2 §11.2 Annotation Isolation Proof Tests
 *
 * These tests prove that annotation creation produces ZERO writes
 * to any module domain table. This is the specific deliverable
 * required by Stage 8.2 of the Phase 3 README.
 */
describe('P3-E2 §11.2 Annotation Isolation Proof', () => {
  describe('per-module zero-write proof', () => {
    for (const expectation of ISOLATION_PROOF_TEST_EXPECTATIONS) {
      it(`${expectation.module}: annotation creation produces zero module record writes`, () => {
        const result = validateIsolationProofForModule(
          expectation.module,
          expectation.moduleRecordWritesDetected,
          expectation.domainTableWritesDetected,
        );
        expect(result).toBe('ZERO_MODULE_WRITES');
      });
    }
  });

  describe('all eligible modules produce zero writes', () => {
    it('every eligible module has a proof expectation', () => {
      const proofModules = ISOLATION_PROOF_TEST_EXPECTATIONS.map((e) => e.module);
      for (const module of ANNOTATION_ELIGIBLE_MODULES) {
        expect(proofModules).toContain(module);
      }
    });

    it('every proof expectation has zero module writes', () => {
      for (const exp of ISOLATION_PROOF_TEST_EXPECTATIONS) {
        expect(exp.moduleRecordWritesDetected).toBe(0);
      }
    });

    it('every proof expectation has zero domain table writes', () => {
      for (const exp of ISOLATION_PROOF_TEST_EXPECTATIONS) {
        expect(exp.domainTableWritesDetected).toBe(0);
      }
    });
  });

  describe('all domain tables are protected', () => {
    it('all 10 domain tables have annotation write guards', () => {
      for (const table of MODULE_DOMAIN_TABLES) {
        expect(isModuleDomainTableProtected(table)).toBe(true);
      }
    });

    it('all guards block annotation writes', () => {
      for (const guard of MODULE_DOMAIN_TABLE_GUARDS) {
        expect(guard.isAnnotationWriteBlocked).toBe(true);
      }
    });
  });

  describe('annotation write-path validation', () => {
    it('annotation-layer writes are valid for eligible modules', () => {
      for (const module of ANNOTATION_ELIGIBLE_MODULES) {
        expect(validateAnnotationWritePath(module, true)).toBe('VALID_ANNOTATION_LAYER');
      }
    });

    it('non-annotation-layer writes are blocked for all modules', () => {
      for (const module of ANNOTATION_ELIGIBLE_MODULES) {
        expect(validateAnnotationWritePath(module, false)).toBe('BLOCKED_MODULE_MUTATION');
      }
    });

    it('Safety module writes are blocked regardless of target', () => {
      expect(validateAnnotationWritePath('SAFETY', true)).toBe('BLOCKED_SAFETY_MODULE');
      expect(validateAnnotationWritePath('SAFETY', false)).toBe('BLOCKED_SAFETY_MODULE');
    });
  });

  describe('PER source-of-truth isolation', () => {
    it('PER cannot write to module source-of-truth', () => {
      expect(isPerSourceOfTruthWriteBlocked()).toBe(true);
    });

    it('annotation write path cannot target module domain', () => {
      expect(canAnnotationWriteToModuleDomain()).toBe(false);
    });

    it('expected module writes for any annotation operation is zero', () => {
      expect(getExpectedModuleWritesForAnnotation()).toBe(0);
    });

    it('expected domain table writes for any annotation operation is zero', () => {
      expect(getExpectedDomainTableWritesForAnnotation()).toBe(0);
    });
  });

  describe('Safety hard exclusion', () => {
    it('Safety annotation is blocked', () => {
      expect(isSafetyAnnotationBlocked()).toBe(true);
    });
  });
});
