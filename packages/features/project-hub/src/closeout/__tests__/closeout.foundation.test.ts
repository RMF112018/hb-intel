import { describe, expect, it } from 'vitest';

import {
  isClass1Surface,
  isClass2Index,
  isClass3ConsumptionPoint,
  getSurfaceClass,
  isCloseoutOwnedRecord,
  isAlwaysOnSurface,
  isCloseoutPhaseRequired,
  canCloseoutMutate,
  isIntelligencePublicationSurface,
  canClass2IndexBeDirectlyWritten,
  CLOSEOUT_OPERATIONAL_SURFACES,
  CLOSEOUT_DERIVED_INDEXES,
  CLOSEOUT_CONSUMPTION_POINTS,
  CLOSEOUT_RECORD_FAMILIES,
  CLOSEOUT_CROSS_MODULE_SOURCES,
} from '../../index.js';

import { createMockCloseoutSoTBoundary } from '../../../testing/createMockCloseoutSoTBoundary.js';

describe('P3-E10-T01 Closeout foundation business rules', () => {
  // -- Surface Classification (§2.1) ----------------------------------------

  describe('isClass1Surface', () => {
    it('returns true for all 4 operational surfaces', () => {
      for (const surface of CLOSEOUT_OPERATIONAL_SURFACES) {
        expect(isClass1Surface(surface)).toBe(true);
      }
    });
  });

  describe('isClass2Index', () => {
    it('returns true for all 3 derived indexes', () => {
      for (const index of CLOSEOUT_DERIVED_INDEXES) {
        expect(isClass2Index(index)).toBe(true);
      }
    });
  });

  describe('isClass3ConsumptionPoint', () => {
    it('returns true for all 3 consumption points', () => {
      for (const point of CLOSEOUT_CONSUMPTION_POINTS) {
        expect(isClass3ConsumptionPoint(point)).toBe(true);
      }
    });
  });

  describe('getSurfaceClass', () => {
    it('returns ProjectScoped for operational surfaces', () => {
      expect(getSurfaceClass('CloseoutChecklist')).toBe('ProjectScoped');
      expect(getSurfaceClass('SubcontractorScorecard')).toBe('ProjectScoped');
      expect(getSurfaceClass('LessonsLearned')).toBe('ProjectScoped');
      expect(getSurfaceClass('ProjectAutopsy')).toBe('ProjectScoped');
    });

    it('returns OrgDerived for derived indexes', () => {
      expect(getSurfaceClass('LessonsIntelligence')).toBe('OrgDerived');
      expect(getSurfaceClass('SubIntelligence')).toBe('OrgDerived');
      expect(getSurfaceClass('LearningLegacy')).toBe('OrgDerived');
    });

    it('returns ProjectHubConsumption for consumption points', () => {
      expect(getSurfaceClass('ContextualLessonsPanel')).toBe('ProjectHubConsumption');
      expect(getSurfaceClass('SubVettingIntelligence')).toBe('ProjectHubConsumption');
      expect(getSurfaceClass('LearningLegacyFeed')).toBe('ProjectHubConsumption');
    });

    it('returns undefined for unrecognized surfaces', () => {
      expect(getSurfaceClass('Unknown')).toBeUndefined();
    });
  });

  // -- Record Ownership (§3.1) ----------------------------------------------

  describe('isCloseoutOwnedRecord', () => {
    it('returns true for all 16 record families', () => {
      for (const family of CLOSEOUT_RECORD_FAMILIES) {
        expect(isCloseoutOwnedRecord(family)).toBe(true);
      }
    });

    it('returns false for unknown record families', () => {
      expect(isCloseoutOwnedRecord('SSSPBasePlan')).toBe(false);
    });
  });

  // -- Activation Model (§4) ------------------------------------------------

  describe('isAlwaysOnSurface', () => {
    it('LessonsLearned is always-on', () => {
      expect(isAlwaysOnSurface('LessonsLearned')).toBe(true);
    });

    it('SubcontractorScorecard is always-on', () => {
      expect(isAlwaysOnSurface('SubcontractorScorecard')).toBe(true);
    });

    it('CloseoutChecklist is NOT always-on', () => {
      expect(isAlwaysOnSurface('CloseoutChecklist')).toBe(false);
    });

    it('ProjectAutopsy is NOT always-on', () => {
      expect(isAlwaysOnSurface('ProjectAutopsy')).toBe(false);
    });
  });

  describe('isCloseoutPhaseRequired', () => {
    it('CloseoutChecklist requires closeout phase', () => {
      expect(isCloseoutPhaseRequired('CloseoutChecklist')).toBe(true);
    });

    it('ProjectAutopsy requires closeout phase', () => {
      expect(isCloseoutPhaseRequired('ProjectAutopsy')).toBe(true);
    });

    it('LessonsLearned does NOT require closeout phase', () => {
      expect(isCloseoutPhaseRequired('LessonsLearned')).toBe(false);
    });

    it('SubcontractorScorecard does NOT require closeout phase', () => {
      expect(isCloseoutPhaseRequired('SubcontractorScorecard')).toBe(false);
    });
  });

  // -- Cross-Module Immutability (§3.2) --------------------------------------

  describe('canCloseoutMutate', () => {
    it('always returns false for all cross-module sources', () => {
      for (const source of CLOSEOUT_CROSS_MODULE_SOURCES) {
        expect(canCloseoutMutate(source)).toBe(false);
      }
    });
  });

  // -- Intelligence Publication (§1, §2.1) -----------------------------------

  describe('isIntelligencePublicationSurface', () => {
    it('returns true for all Class 2 derived indexes', () => {
      for (const index of CLOSEOUT_DERIVED_INDEXES) {
        expect(isIntelligencePublicationSurface(index)).toBe(true);
      }
    });

    it('returns true for all Class 3 consumption points', () => {
      for (const point of CLOSEOUT_CONSUMPTION_POINTS) {
        expect(isIntelligencePublicationSurface(point)).toBe(true);
      }
    });
  });

  describe('canClass2IndexBeDirectlyWritten', () => {
    it('always returns false', () => {
      expect(canClass2IndexBeDirectlyWritten()).toBe(false);
    });
  });

  // -- Mock factory -----------------------------------------------------------

  describe('createMockCloseoutSoTBoundary', () => {
    it('creates a valid default SoT boundary', () => {
      const boundary = createMockCloseoutSoTBoundary();
      expect(boundary.dataConcern).toBe('Checklist item result');
      expect(boundary.sotOwner).toBe('@hbc/project-closeout');
      expect(boundary.whoWrites).toBeTruthy();
      expect(boundary.whoReads).toBeTruthy();
    });

    it('accepts overrides', () => {
      const boundary = createMockCloseoutSoTBoundary({
        dataConcern: 'Autopsy finding',
        sotOwner: '@hbc/project-closeout',
        whoWrites: 'PE, PM (with PE)',
        whoReads: 'PE, PM, PER',
      });
      expect(boundary.dataConcern).toBe('Autopsy finding');
      expect(boundary.whoWrites).toBe('PE, PM (with PE)');
    });
  });
});
