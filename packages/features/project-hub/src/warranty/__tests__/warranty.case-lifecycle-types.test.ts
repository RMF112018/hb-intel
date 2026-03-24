import { describe, expect, it } from 'vitest';

import {
  WARRANTY_AUDIT_EVENT_DEFINITIONS,
  WARRANTY_AUDIT_EVENT_TYPES,
  WARRANTY_BLOCKING_REASON_LABELS,
  WARRANTY_CASE_BLOCKING_REASONS,
  WARRANTY_CASE_TRANSITIONS,
  WARRANTY_ESCALATION_TRIGGER_DEFINITIONS,
  WARRANTY_ESCALATION_TRIGGERS,
  WARRANTY_NEXT_MOVE_DEFINITIONS,
  WARRANTY_SLA_APPROACHING_THRESHOLD_DAYS,
  WARRANTY_SLA_TIER_DEFINITIONS,
  WARRANTY_SLA_TIER_LABELS,
  WARRANTY_SLA_TIERS,
  WARRANTY_SLA_WINDOW_DEFINITIONS,
  WARRANTY_SLA_WINDOWS,
} from '../../index.js';

describe('P3-E14-T10 Stage 4 case-lifecycle contract stability', () => {
  describe('enum arrays', () => {
    it('WarrantySlaTier has 2', () => { expect(WARRANTY_SLA_TIERS).toHaveLength(2); });
    it('WarrantySlaWindow has 3', () => { expect(WARRANTY_SLA_WINDOWS).toHaveLength(3); });
    it('WarrantyCaseBlockingReason has 7', () => { expect(WARRANTY_CASE_BLOCKING_REASONS).toHaveLength(7); });
    it('WarrantyEscalationTrigger has 12', () => { expect(WARRANTY_ESCALATION_TRIGGERS).toHaveLength(12); });
    it('WarrantyAuditEventType has 11', () => { expect(WARRANTY_AUDIT_EVENT_TYPES).toHaveLength(11); });
  });

  describe('label maps', () => {
    it('WARRANTY_SLA_TIER_LABELS covers 2', () => { expect(Object.keys(WARRANTY_SLA_TIER_LABELS)).toHaveLength(2); });
    it('WARRANTY_BLOCKING_REASON_LABELS covers 7', () => { expect(Object.keys(WARRANTY_BLOCKING_REASON_LABELS)).toHaveLength(7); });
  });

  describe('state transition table', () => {
    it('has at least 30 transitions per T04 §3.2', () => { expect(WARRANTY_CASE_TRANSITIONS.length).toBeGreaterThanOrEqual(30); });
    it('includes Open → PendingCoverageDecision', () => {
      expect(WARRANTY_CASE_TRANSITIONS.some((t) => t.from === 'Open' && t.to === 'PendingCoverageDecision')).toBe(true);
    });
    it('includes Closed → Reopened (PX only)', () => {
      const t = WARRANTY_CASE_TRANSITIONS.find((t) => t.from === 'Closed' && t.to === 'Reopened');
      expect(t).toBeDefined();
      expect(t?.actor).toBe('PX');
    });
    it('includes Verified → Closed', () => {
      expect(WARRANTY_CASE_TRANSITIONS.some((t) => t.from === 'Verified' && t.to === 'Closed')).toBe(true);
    });
  });

  describe('definition arrays', () => {
    it('WARRANTY_NEXT_MOVE_DEFINITIONS has 11', () => { expect(WARRANTY_NEXT_MOVE_DEFINITIONS).toHaveLength(11); });
    it('WARRANTY_SLA_TIER_DEFINITIONS has 2', () => { expect(WARRANTY_SLA_TIER_DEFINITIONS).toHaveLength(2); });
    it('WARRANTY_SLA_WINDOW_DEFINITIONS has 3', () => { expect(WARRANTY_SLA_WINDOW_DEFINITIONS).toHaveLength(3); });
    it('WARRANTY_ESCALATION_TRIGGER_DEFINITIONS has 12', () => { expect(WARRANTY_ESCALATION_TRIGGER_DEFINITIONS).toHaveLength(12); });
    it('WARRANTY_AUDIT_EVENT_DEFINITIONS has 11', () => { expect(WARRANTY_AUDIT_EVENT_DEFINITIONS).toHaveLength(11); });
  });

  describe('SLA window values', () => {
    it('Response: Standard 5 BD, Expedited 2 BD', () => {
      const w = WARRANTY_SLA_WINDOW_DEFINITIONS.find((d) => d.window === 'Response');
      expect(w?.standardDays).toBe(5);
      expect(w?.expeditedDays).toBe(2);
    });
    it('Repair: Standard 30 BD, Expedited 10 BD', () => {
      const w = WARRANTY_SLA_WINDOW_DEFINITIONS.find((d) => d.window === 'Repair');
      expect(w?.standardDays).toBe(30);
      expect(w?.expeditedDays).toBe(10);
    });
    it('Verification: Standard 5 BD, Expedited 2 BD', () => {
      const w = WARRANTY_SLA_WINDOW_DEFINITIONS.find((d) => d.window === 'Verification');
      expect(w?.standardDays).toBe(5);
      expect(w?.expeditedDays).toBe(2);
    });
  });

  describe('defaults', () => {
    it('SLA approaching threshold is 5 days', () => {
      expect(WARRANTY_SLA_APPROACHING_THRESHOLD_DAYS).toBe(5);
    });
  });
});
