import { describe, expect, it } from 'vitest';

import {
  STARTUP_PERMIT_TYPES,
  PERMIT_VERIFICATION_RESULTS,
  APP_SURFACES,
  STAGE4_ACTIVITY_EVENTS,
  STAGE4_WORK_QUEUE_ITEMS,
  PERMIT_TYPE_MAPPINGS,
  PERMIT_YES_REQUIRED_FIELDS,
  PERMIT_NO_REQUIRED_FIELDS,
  STAGE4_ACTIVITY_EVENT_DEFINITIONS,
  STAGE4_WORK_QUEUE_ITEM_DEFINITIONS,
  STARTUP_PERMIT_TYPE_LABELS,
  PERMIT_VERIFICATION_RESULT_LABELS,
} from '../../index.js';

describe('P3-E11-T10 Stage 4 Startup permit posting verification contract stability', () => {
  // -- Enum arrays -----------------------------------------------------------

  describe('PermitType', () => {
    it('has exactly 12 permit types per T07 §9.2', () => {
      expect(STARTUP_PERMIT_TYPES).toHaveLength(12);
    });
  });

  describe('PermitVerificationResult', () => {
    it('has exactly 3 result values', () => {
      expect(PERMIT_VERIFICATION_RESULTS).toHaveLength(3);
    });
  });

  describe('AppSurface', () => {
    it('has exactly 2 surfaces (PWA and SPFx)', () => {
      expect(APP_SURFACES).toHaveLength(2);
    });
  });

  describe('Stage4ActivityEvent', () => {
    it('has exactly 1 event per T10 §2 Stage 4', () => {
      expect(STAGE4_ACTIVITY_EVENTS).toHaveLength(1);
    });

    it('includes PermitPostingVerified', () => {
      expect(STAGE4_ACTIVITY_EVENTS).toContain('PermitPostingVerified');
    });
  });

  describe('Stage4WorkQueueItem', () => {
    it('has exactly 1 work queue item per T10 §2 Stage 4', () => {
      expect(STAGE4_WORK_QUEUE_ITEMS).toHaveLength(1);
    });

    it('includes PermitNotPosted', () => {
      expect(STAGE4_WORK_QUEUE_ITEMS).toContain('PermitNotPosted');
    });
  });

  // -- Permit type mappings --------------------------------------------------

  describe('Permit type mappings', () => {
    it('has exactly 12 mappings per T07 §9.2', () => {
      expect(PERMIT_TYPE_MAPPINGS).toHaveLength(12);
    });

    it('every mapping has required fields', () => {
      for (const m of PERMIT_TYPE_MAPPINGS) {
        expect(m.taskNumber).toBeTruthy();
        expect(m.permitType).toBeTruthy();
        expect(m.label).toBeTruthy();
      }
    });

    it('task numbers span 4.01 through 4.12', () => {
      expect(PERMIT_TYPE_MAPPINGS[0].taskNumber).toBe('4.01');
      expect(PERMIT_TYPE_MAPPINGS[11].taskNumber).toBe('4.12');
    });

    it('task numbers are unique', () => {
      const numbers = PERMIT_TYPE_MAPPINGS.map((m) => m.taskNumber);
      expect(new Set(numbers).size).toBe(12);
    });

    it('permit types are unique', () => {
      const types = PERMIT_TYPE_MAPPINGS.map((m) => m.permitType);
      expect(new Set(types).size).toBe(12);
    });

    it('4.01 maps to Master', () => {
      expect(PERMIT_TYPE_MAPPINGS[0].permitType).toBe('Master');
    });

    it('Master permit has no applicabilityNote (always required)', () => {
      const master = PERMIT_TYPE_MAPPINGS.find((m) => m.permitType === 'Master');
      expect(master?.applicabilityNote).toBeNull();
    });
  });

  // -- Verification required fields ------------------------------------------

  describe('Verification required fields', () => {
    it('Yes requires 3 fields', () => {
      expect(PERMIT_YES_REQUIRED_FIELDS).toHaveLength(3);
      expect(PERMIT_YES_REQUIRED_FIELDS).toContain('verifiedBy');
      expect(PERMIT_YES_REQUIRED_FIELDS).toContain('verifiedAt');
      expect(PERMIT_YES_REQUIRED_FIELDS).toContain('physicalEvidenceAttachmentIds');
    });

    it('No requires 1 field', () => {
      expect(PERMIT_NO_REQUIRED_FIELDS).toHaveLength(1);
      expect(PERMIT_NO_REQUIRED_FIELDS).toContain('discrepancyReason');
    });
  });

  // -- Spine publication definitions -----------------------------------------

  describe('Stage 4 spine publication', () => {
    it('has 1 activity event definition', () => {
      expect(STAGE4_ACTIVITY_EVENT_DEFINITIONS).toHaveLength(1);
    });

    it('has 1 work queue item definition', () => {
      expect(STAGE4_WORK_QUEUE_ITEM_DEFINITIONS).toHaveLength(1);
    });
  });

  // -- Label maps ------------------------------------------------------------

  describe('Label maps', () => {
    it('labels all 12 permit types', () => {
      expect(Object.keys(STARTUP_PERMIT_TYPE_LABELS)).toHaveLength(12);
    });

    it('labels all 3 verification results', () => {
      expect(Object.keys(PERMIT_VERIFICATION_RESULT_LABELS)).toHaveLength(3);
    });
  });
});
