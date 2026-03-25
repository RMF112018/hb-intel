import { describe, expect, it } from 'vitest';

import {
  ACKNOWLEDGMENT_SLA_THRESHOLDS,
  ACKNOWLEDGMENT_TRANSITIONS,
  DISPUTE_RESOLUTION_PATHS,
  EXTERNAL_COLLABORATION_DEFERRAL_DEFINITIONS,
  EXTERNAL_COLLABORATION_DEFERRALS,
  SUB_ACKNOWLEDGMENT_STATUS_LABELS,
  SUB_ACKNOWLEDGMENT_STATUSES,
  SUB_DISPUTE_OUTCOMES,
  SUB_WORK_QUEUE_EVENT_DEFINITIONS,
  SUB_WORK_QUEUE_EVENT_TYPES,
  SUBCONTRACTOR_ENTRY_CHANNELS,
  WARRANTY_EVIDENCE_TYPE_T06_LABELS,
  WARRANTY_EVIDENCE_TYPES_T06,
  WARRANTY_RESOLUTION_TYPE_T06_LABELS,
  WARRANTY_RESOLUTION_TYPES_T06,
} from '../../index.js';

describe('P3-E14-T10 Stage 6 subcontractor-participation contract stability', () => {
  describe('enum arrays', () => {
    it('SubcontractorEntryChannel has 2', () => { expect(SUBCONTRACTOR_ENTRY_CHANNELS).toHaveLength(2); });
    it('SubAcknowledgmentStatus has 5', () => { expect(SUB_ACKNOWLEDGMENT_STATUSES).toHaveLength(5); });
    it('SubDisputeOutcome has 4', () => { expect(SUB_DISPUTE_OUTCOMES).toHaveLength(4); });
    it('WarrantyEvidenceTypeT06 has 8', () => { expect(WARRANTY_EVIDENCE_TYPES_T06).toHaveLength(8); });
    it('WarrantyResolutionTypeT06 has 4', () => { expect(WARRANTY_RESOLUTION_TYPES_T06).toHaveLength(4); });
    it('SubWorkQueueEventType has 8', () => { expect(SUB_WORK_QUEUE_EVENT_TYPES).toHaveLength(8); });
    it('ExternalCollaborationDeferral has 7', () => { expect(EXTERNAL_COLLABORATION_DEFERRALS).toHaveLength(7); });
  });

  describe('label maps', () => {
    it('SUB_ACKNOWLEDGMENT_STATUS_LABELS covers 5', () => { expect(Object.keys(SUB_ACKNOWLEDGMENT_STATUS_LABELS)).toHaveLength(5); });
    it('WARRANTY_EVIDENCE_TYPE_T06_LABELS covers 8', () => { expect(Object.keys(WARRANTY_EVIDENCE_TYPE_T06_LABELS)).toHaveLength(8); });
    it('WARRANTY_RESOLUTION_TYPE_T06_LABELS covers 4', () => { expect(Object.keys(WARRANTY_RESOLUTION_TYPE_T06_LABELS)).toHaveLength(4); });
  });

  describe('definition arrays', () => {
    it('ACKNOWLEDGMENT_TRANSITIONS has 5', () => { expect(ACKNOWLEDGMENT_TRANSITIONS).toHaveLength(5); });
    it('DISPUTE_RESOLUTION_PATHS has 4', () => { expect(DISPUTE_RESOLUTION_PATHS).toHaveLength(4); });
    it('ACKNOWLEDGMENT_SLA_THRESHOLDS has 2', () => { expect(ACKNOWLEDGMENT_SLA_THRESHOLDS).toHaveLength(2); });
    it('SUB_WORK_QUEUE_EVENT_DEFINITIONS has 8', () => { expect(SUB_WORK_QUEUE_EVENT_DEFINITIONS).toHaveLength(8); });
    it('EXTERNAL_COLLABORATION_DEFERRAL_DEFINITIONS has 7', () => { expect(EXTERNAL_COLLABORATION_DEFERRAL_DEFINITIONS).toHaveLength(7); });
  });

  describe('SLA thresholds', () => {
    it('Standard reminder 5 BD, escalation 10 BD', () => {
      const s = ACKNOWLEDGMENT_SLA_THRESHOLDS.find((t) => t.tier === 'Standard');
      expect(s?.reminderThresholdBD).toBe(5);
      expect(s?.escalationThresholdBD).toBe(10);
    });
    it('Expedited reminder 2 BD, escalation 4 BD', () => {
      const e = ACKNOWLEDGMENT_SLA_THRESHOLDS.find((t) => t.tier === 'Expedited');
      expect(e?.reminderThresholdBD).toBe(2);
      expect(e?.escalationThresholdBD).toBe(4);
    });
  });
});
