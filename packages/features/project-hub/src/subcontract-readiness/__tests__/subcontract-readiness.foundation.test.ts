import { describe, expect, it } from 'vitest';

import {
  canReadinessMutateCrossModuleData,
  getAuthorityForConcern,
  getModuleBoundary,
  isActiveCaseIdentityMatch,
  isFinancialBoundaryRespected,
  isModuleIdentityViolation,
  isValidActivationTrigger,
  MODULE_BOUNDARY_DECLARATIONS,
  SOURCE_OF_TRUTH_BOUNDARIES,
} from '../../index.js';

import type { ICaseIdentityConstraint } from '../../index.js';

describe('P3-E13-T08 Stage 1 Subcontract Execution Readiness foundation business rules', () => {
  // -- Case Identity Match (T01 §7) -------------------------------------------

  describe('isActiveCaseIdentityMatch', () => {
    const caseA: ICaseIdentityConstraint = {
      projectId: 'proj-001',
      subcontractorLegalEntityId: 'entity-001',
      awardBuyoutIntent: 'award-001',
    };

    it('returns true for matching identity', () => {
      const caseB: ICaseIdentityConstraint = { ...caseA };
      expect(isActiveCaseIdentityMatch(caseA, caseB)).toBe(true);
    });

    it('returns false when projectId differs', () => {
      const caseB: ICaseIdentityConstraint = { ...caseA, projectId: 'proj-002' };
      expect(isActiveCaseIdentityMatch(caseA, caseB)).toBe(false);
    });

    it('returns false when subcontractorLegalEntityId differs', () => {
      const caseB: ICaseIdentityConstraint = { ...caseA, subcontractorLegalEntityId: 'entity-002' };
      expect(isActiveCaseIdentityMatch(caseA, caseB)).toBe(false);
    });

    it('returns false when awardBuyoutIntent differs', () => {
      const caseB: ICaseIdentityConstraint = { ...caseA, awardBuyoutIntent: 'award-002' };
      expect(isActiveCaseIdentityMatch(caseA, caseB)).toBe(false);
    });

    it('returns false when all fields differ', () => {
      const caseB: ICaseIdentityConstraint = {
        projectId: 'proj-999',
        subcontractorLegalEntityId: 'entity-999',
        awardBuyoutIntent: 'award-999',
      };
      expect(isActiveCaseIdentityMatch(caseA, caseB)).toBe(false);
    });
  });

  // -- Activation Trigger Validation (T01 §7) ---------------------------------

  describe('isValidActivationTrigger', () => {
    it('returns true for BUYOUT_AWARD_PATH_CREATED', () => {
      expect(isValidActivationTrigger('BUYOUT_AWARD_PATH_CREATED')).toBe(true);
    });

    it('returns true for PACKAGE_ASSEMBLED_FOR_EXECUTION', () => {
      expect(isValidActivationTrigger('PACKAGE_ASSEMBLED_FOR_EXECUTION')).toBe(true);
    });

    it('returns true for RENEWAL_OR_RESUBMISSION_REQUIRED', () => {
      expect(isValidActivationTrigger('RENEWAL_OR_RESUBMISSION_REQUIRED')).toBe(true);
    });

    it('returns true for PROACTIVE_COMPLIANCE_GOVERNANCE', () => {
      expect(isValidActivationTrigger('PROACTIVE_COMPLIANCE_GOVERNANCE')).toBe(true);
    });

    it('returns false for an invalid trigger', () => {
      expect(isValidActivationTrigger('INVALID_TRIGGER' as never)).toBe(false);
    });
  });

  // -- Module Boundary Lookup (T01 §5) ----------------------------------------

  describe('getModuleBoundary', () => {
    it('returns the Financial boundary declaration', () => {
      const boundary = getModuleBoundary('FINANCIAL');
      expect(boundary).toBeDefined();
      expect(boundary?.adjacentModule).toBe('FINANCIAL');
      expect(boundary?.boundaryRule).toContain('Financial reads the gate output');
    });

    it('returns the Startup boundary declaration', () => {
      const boundary = getModuleBoundary('STARTUP');
      expect(boundary).toBeDefined();
      expect(boundary?.adjacentModule).toBe('STARTUP');
    });

    it('returns the Reports boundary declaration', () => {
      const boundary = getModuleBoundary('REPORTS');
      expect(boundary).toBeDefined();
      expect(boundary?.boundaryRule).toContain('Reports consumes downstream read models only');
    });

    it('returns the Health boundary declaration', () => {
      const boundary = getModuleBoundary('HEALTH');
      expect(boundary).toBeDefined();
    });

    it('returns the Work Queue boundary declaration', () => {
      const boundary = getModuleBoundary('WORK_QUEUE');
      expect(boundary).toBeDefined();
    });

    it('returns the Future Vendor Master boundary declaration', () => {
      const boundary = getModuleBoundary('FUTURE_VENDOR_MASTER');
      expect(boundary).toBeDefined();
    });

    it('returns a declaration for every adjacent module in the boundary map', () => {
      for (const decl of MODULE_BOUNDARY_DECLARATIONS) {
        expect(getModuleBoundary(decl.adjacentModule)).toBeDefined();
      }
    });
  });

  // -- Financial Boundary Enforcement (T01 §5.1) ------------------------------

  describe('isFinancialBoundaryRespected', () => {
    it('returns true for gate_reading action', () => {
      expect(isFinancialBoundaryRespected('gate_reading')).toBe(true);
    });

    it('returns false for readiness_authoring action', () => {
      expect(isFinancialBoundaryRespected('readiness_authoring')).toBe(false);
    });

    it('returns true for any other action', () => {
      expect(isFinancialBoundaryRespected('some_other_action')).toBe(true);
    });
  });

  // -- Source-of-Truth Authority Lookup (T01 §8) -------------------------------

  describe('getAuthorityForConcern', () => {
    it('returns the authority for Parent case identity and lineage', () => {
      const result = getAuthorityForConcern('Parent case identity and lineage');
      expect(result).toBeDefined();
      expect(result?.authority).toBe('Subcontract Execution Readiness');
      expect(result?.authorityRule).toBe('CANONICAL_SOURCE');
    });

    it('returns the authority for Contract-execution gate enforcement', () => {
      const result = getAuthorityForConcern('Contract-execution gate enforcement');
      expect(result).toBeDefined();
      expect(result?.authority).toBe('Financial');
      expect(result?.authorityRule).toBe('CONSUMES_READINESS_OUTPUT');
    });

    it('returns the authority for Review annotations', () => {
      const result = getAuthorityForConcern('Review annotations');
      expect(result).toBeDefined();
      expect(result?.authority).toBe('@hbc/field-annotations');
      expect(result?.authorityRule).toBe('SEPARATE_REVIEW_LAYER');
    });

    it('returns undefined for an unknown concern', () => {
      expect(getAuthorityForConcern('Unknown concern')).toBeUndefined();
    });

    it('returns a result for every concern in the SoT map', () => {
      for (const row of SOURCE_OF_TRUTH_BOUNDARIES) {
        expect(getAuthorityForConcern(row.dataConcern)).toBeDefined();
      }
    });
  });

  // -- Module Identity Guard (T01 §2) -----------------------------------------

  describe('isModuleIdentityViolation', () => {
    it('returns true for FLAT_CHECKLIST_MODULE', () => {
      expect(isModuleIdentityViolation('FLAT_CHECKLIST_MODULE')).toBe(true);
    });

    it('returns true for WAIVER_ONLY_ROUTING_FORM', () => {
      expect(isModuleIdentityViolation('WAIVER_ONLY_ROUTING_FORM')).toBe(true);
    });

    it('returns true for VENDOR_MASTER_REPLACEMENT', () => {
      expect(isModuleIdentityViolation('VENDOR_MASTER_REPLACEMENT')).toBe(true);
    });

    it('returns true for FINANCIAL_STATUS_TRACKER', () => {
      expect(isModuleIdentityViolation('FINANCIAL_STATUS_TRACKER')).toBe(true);
    });

    it('returns true for REPORTS_LEDGER', () => {
      expect(isModuleIdentityViolation('REPORTS_LEDGER')).toBe(true);
    });

    it('returns true for WORK_QUEUE_PROCESS_MODEL', () => {
      expect(isModuleIdentityViolation('WORK_QUEUE_PROCESS_MODEL')).toBe(true);
    });

    it('returns false for a valid module behavior', () => {
      expect(isModuleIdentityViolation('GOVERNED_READINESS_CASE')).toBe(false);
    });
  });

  // -- Cross-Module Immutability -----------------------------------------------

  describe('canReadinessMutateCrossModuleData', () => {
    it('always returns false', () => {
      expect(canReadinessMutateCrossModuleData()).toBe(false);
    });
  });
});
