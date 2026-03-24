import { describe, expect, it } from 'vitest';

import {
  INCIDENT_PERSON_ROLES,
  CA_WORK_QUEUE_TRIGGERS,
  INCIDENT_VISIBILITY_RULES,
  EVIDENCE_SENSITIVITY_DEFAULTS,
  EVIDENCE_RETENTION_RULES,
  COMPOSITE_CA_HEALTH_SIGNALS,
  CA_OVERDUE_CANDIDATE_STATUSES,
  CRITICAL_CA_ESCALATION_HOURS,
  PENDING_VERIFICATION_ESCALATION_DAYS,
  INCIDENT_PERSON_ROLE_LABELS,
} from '../../index.js';

describe('P3-E8-T05 Corrective actions contract stability', () => {
  describe('Enum arrays', () => {
    it('INCIDENT_PERSON_ROLES has 4 values', () => {
      expect(INCIDENT_PERSON_ROLES).toHaveLength(4);
    });
  });

  describe('CA work queue triggers', () => {
    it('defines 4 triggers per §1.4', () => {
      expect(CA_WORK_QUEUE_TRIGGERS).toHaveLength(4);
    });
  });

  describe('Incident visibility rules', () => {
    it('defines 15 rules (3 tiers × 5 roles)', () => {
      expect(INCIDENT_VISIBILITY_RULES).toHaveLength(15);
    });

    it('SafetyManager has full access at all tiers', () => {
      const smRules = INCIDENT_VISIBILITY_RULES.filter((r) => r.role === 'SafetyManager');
      expect(smRules).toHaveLength(3);
      expect(smRules.every((r) => r.visibleFields === 'Full record')).toBe(true);
    });

    it('FieldEngineer has no access at any tier', () => {
      const feRules = INCIDENT_VISIBILITY_RULES.filter((r) => r.role === 'FieldEngineer');
      expect(feRules.every((r) => r.visibleFields === 'Not visible')).toBe(true);
    });
  });

  describe('Evidence sensitivity defaults', () => {
    it('defines 9 source type defaults per §3.2', () => {
      expect(EVIDENCE_SENSITIVITY_DEFAULTS).toHaveLength(9);
    });

    it('INCIDENT defaults to SENSITIVE', () => {
      const inc = EVIDENCE_SENSITIVITY_DEFAULTS.find((d) => d.sourceType === 'INCIDENT');
      expect(inc?.defaultSensitivity).toBe('SENSITIVE');
    });

    it('INSPECTION defaults to STANDARD', () => {
      const insp = EVIDENCE_SENSITIVITY_DEFAULTS.find((d) => d.sourceType === 'INSPECTION');
      expect(insp?.defaultSensitivity).toBe('STANDARD');
    });
  });

  describe('Evidence retention rules', () => {
    it('defines 3 retention categories per §3.3', () => {
      expect(EVIDENCE_RETENTION_RULES).toHaveLength(3);
    });
  });

  describe('Composite CA health signals', () => {
    it('defines 5 signals per §4', () => {
      expect(COMPOSITE_CA_HEALTH_SIGNALS).toHaveLength(5);
    });
  });

  describe('Escalation thresholds', () => {
    it('CRITICAL CA escalation is 4 hours', () => {
      expect(CRITICAL_CA_ESCALATION_HOURS).toBe(4);
    });

    it('pending verification escalation is 2 days', () => {
      expect(PENDING_VERIFICATION_ESCALATION_DAYS).toBe(2);
    });

    it('overdue candidates include OPEN, IN_PROGRESS, PENDING_VERIFICATION', () => {
      expect(CA_OVERDUE_CANDIDATE_STATUSES).toHaveLength(3);
      expect(CA_OVERDUE_CANDIDATE_STATUSES).toContain('OPEN');
      expect(CA_OVERDUE_CANDIDATE_STATUSES).toContain('IN_PROGRESS');
      expect(CA_OVERDUE_CANDIDATE_STATUSES).toContain('PENDING_VERIFICATION');
    });
  });

  describe('Label maps', () => {
    it('incident person role labels cover all roles', () => {
      for (const role of INCIDENT_PERSON_ROLES) {
        expect(INCIDENT_PERSON_ROLE_LABELS[role]).toBeTruthy();
      }
    });
  });
});
