import { describe, expect, it } from 'vitest';

import {
  generateDelayNumber,
  validateNotificationDateIntegrity,
  validateScheduleReferenceConsistency,
  isDelayNotificationPending,
  isQuantifiedGateMet,
  isDispositionedGateMet,
  validateDelayRecordImmutability,
  isTerminalDelayStatus,
  isValidDelayTransition,
  transitionDelayStatus,
  DELAY_STATUSES,
  TERMINAL_DELAY_STATUSES,
} from '../../index.js';

import { createMockDelayRecord } from '../../../testing/createMockDelayRecord.js';
import { createMockTimeImpactRecord } from '../../../testing/createMockTimeImpactRecord.js';
import { createMockCommercialImpactRecord } from '../../../testing/createMockCommercialImpactRecord.js';

describe('P3-E6-T03 Delay Ledger business rules', () => {
  // ── generateDelayNumber ─────────────────────────────────────────────

  describe('generateDelayNumber', () => {
    it('pads single digit to 3', () => {
      expect(generateDelayNumber(1)).toBe('DEL-001');
    });

    it('pads double digit to 3', () => {
      expect(generateDelayNumber(42)).toBe('DEL-042');
    });

    it('preserves triple digit', () => {
      expect(generateDelayNumber(999)).toBe('DEL-999');
    });
  });

  // ── isTerminalDelayStatus ───────────────────────────────────────────

  describe('isTerminalDelayStatus', () => {
    it('returns true for terminal statuses', () => {
      for (const s of TERMINAL_DELAY_STATUSES) {
        expect(isTerminalDelayStatus(s)).toBe(true);
      }
    });

    it('returns false for non-terminal statuses', () => {
      const nonTerminal = DELAY_STATUSES.filter(
        (s) => !(TERMINAL_DELAY_STATUSES as readonly string[]).includes(s),
      );
      for (const s of nonTerminal) {
        expect(isTerminalDelayStatus(s)).toBe(false);
      }
    });
  });

  // ── isValidDelayTransition ──────────────────────────────────────────

  describe('isValidDelayTransition', () => {
    it('allows Identified → UnderAnalysis', () => {
      expect(isValidDelayTransition('Identified', 'UnderAnalysis')).toBe(true);
    });

    it('allows UnderAnalysis → Quantified', () => {
      expect(isValidDelayTransition('UnderAnalysis', 'Quantified')).toBe(true);
    });

    it('allows Quantified → Dispositioned', () => {
      expect(isValidDelayTransition('Quantified', 'Dispositioned')).toBe(true);
    });

    it('allows Dispositioned → Closed', () => {
      expect(isValidDelayTransition('Dispositioned', 'Closed')).toBe(true);
    });

    it('rejects Identified → Quantified (must go through UnderAnalysis)', () => {
      expect(isValidDelayTransition('Identified', 'Quantified')).toBe(false);
    });

    it('rejects Closed → any', () => {
      for (const s of DELAY_STATUSES) {
        expect(isValidDelayTransition('Closed', s)).toBe(false);
      }
    });
  });

  // ── transitionDelayStatus — evidence gates ──────────────────────────

  describe('transitionDelayStatus', () => {
    const ctx = { actor: 'user-001', timestamp: '2026-03-15T10:00:00Z' };

    it('accepts valid non-gated transition', () => {
      const record = createMockDelayRecord({ status: 'Identified' });
      const result = transitionDelayStatus(record, 'UnderAnalysis', ctx);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects Quantified transition without timeImpact', () => {
      const record = createMockDelayRecord({
        status: 'UnderAnalysis',
        timeImpact: null,
        commercialImpact: createMockCommercialImpactRecord(),
        criticalPathImpact: 'CRITICAL',
      });
      const result = transitionDelayStatus(record, 'Quantified', ctx);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('timeImpact')]),
      );
    });

    it('rejects Quantified transition without separationConfirmed', () => {
      const record = createMockDelayRecord({
        status: 'UnderAnalysis',
        timeImpact: createMockTimeImpactRecord(),
        commercialImpact: createMockCommercialImpactRecord({ separationConfirmed: false }),
        criticalPathImpact: 'CRITICAL',
      });
      const result = transitionDelayStatus(record, 'Quantified', ctx);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('separationConfirmed')]),
      );
    });

    it('rejects Quantified transition with criticalPathImpact UNKNOWN', () => {
      const record = createMockDelayRecord({
        status: 'UnderAnalysis',
        timeImpact: createMockTimeImpactRecord(),
        commercialImpact: createMockCommercialImpactRecord(),
        criticalPathImpact: 'UNKNOWN',
      });
      const result = transitionDelayStatus(record, 'Quantified', ctx);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('criticalPathImpact')]),
      );
    });

    it('accepts Quantified transition with all gates met', () => {
      const record = createMockDelayRecord({
        status: 'UnderAnalysis',
        timeImpact: createMockTimeImpactRecord(),
        commercialImpact: createMockCommercialImpactRecord(),
        criticalPathImpact: 'CRITICAL',
      });
      const result = transitionDelayStatus(record, 'Quantified', ctx);
      expect(result.valid).toBe(true);
    });

    it('rejects Dispositioned without dispositionOutcome', () => {
      const record = createMockDelayRecord({
        status: 'Quantified',
        timeImpact: createMockTimeImpactRecord(),
        commercialImpact: createMockCommercialImpactRecord(),
        criticalPathImpact: 'CRITICAL',
        dispositionOutcome: null,
        dispositionNotes: 'Some notes',
        notificationDate: '2026-01-22',
      });
      const result = transitionDelayStatus(record, 'Dispositioned', ctx);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('dispositionOutcome')]),
      );
    });

    it('rejects Dispositioned without notificationDate', () => {
      const record = createMockDelayRecord({
        status: 'Quantified',
        timeImpact: createMockTimeImpactRecord(),
        commercialImpact: createMockCommercialImpactRecord(),
        criticalPathImpact: 'CRITICAL',
        dispositionOutcome: 'SettledByTime',
        dispositionNotes: 'Time extension granted.',
        notificationDate: null,
      });
      const result = transitionDelayStatus(record, 'Dispositioned', ctx);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('notificationDate')]),
      );
    });

    it('accepts Dispositioned with all gates met', () => {
      const record = createMockDelayRecord({
        status: 'Quantified',
        timeImpact: createMockTimeImpactRecord(),
        commercialImpact: createMockCommercialImpactRecord(),
        criticalPathImpact: 'CRITICAL',
        dispositionOutcome: 'SettledByTime',
        dispositionNotes: 'Owner agreed to time extension.',
        notificationDate: '2026-01-22',
      });
      const result = transitionDelayStatus(record, 'Dispositioned', ctx);
      expect(result.valid).toBe(true);
    });

    it('rejects Void without closureReason', () => {
      const record = createMockDelayRecord({ status: 'Identified' });
      const result = transitionDelayStatus(record, 'Void', ctx);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('closureReason')]),
      );
    });

    it('rejects transition from terminal status', () => {
      const record = createMockDelayRecord({ status: 'Closed' });
      const result = transitionDelayStatus(record, 'Identified', ctx);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('terminal status')]),
      );
    });
  });

  // ── validateNotificationDateIntegrity (D-02) ────────────────────────

  describe('validateNotificationDateIntegrity', () => {
    it('accepts notification on or after delay start', () => {
      expect(validateNotificationDateIntegrity('2026-01-20', '2026-01-15')).toBe(true);
    });

    it('accepts same day notification', () => {
      expect(validateNotificationDateIntegrity('2026-01-15', '2026-01-15')).toBe(true);
    });

    it('rejects notification before delay start', () => {
      expect(validateNotificationDateIntegrity('2026-01-10', '2026-01-15')).toBe(false);
    });
  });

  // ── validateScheduleReferenceConsistency (D-03) ─────────────────────

  describe('validateScheduleReferenceConsistency', () => {
    it('accepts Integrated mode with scheduleVersionId', () => {
      const result = validateScheduleReferenceConsistency({
        scheduleReferenceMode: 'Integrated',
        scheduleVersionId: 'sv-001',
        impactedActivityFreeText: [],
        impactedPathDescription: 'Critical path through steel erection sequence for Building A floors 3-5.',
      });
      expect(result.valid).toBe(true);
    });

    it('rejects Integrated mode without scheduleVersionId', () => {
      const result = validateScheduleReferenceConsistency({
        scheduleReferenceMode: 'Integrated',
        scheduleVersionId: null,
        impactedActivityFreeText: [],
        impactedPathDescription: 'Some path description that is at least fifty characters for validation purposes.',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('scheduleVersionId')]),
      );
    });

    it('accepts ManualFallback with free text activities', () => {
      const result = validateScheduleReferenceConsistency({
        scheduleReferenceMode: 'ManualFallback',
        scheduleVersionId: null,
        impactedActivityFreeText: ['Steel Erection'],
        impactedPathDescription: '',
      });
      expect(result.valid).toBe(true);
    });

    it('accepts ManualFallback with long path description', () => {
      const result = validateScheduleReferenceConsistency({
        scheduleReferenceMode: 'ManualFallback',
        scheduleVersionId: null,
        impactedActivityFreeText: [],
        impactedPathDescription: 'Critical path through steel erection sequence for Building A floors 3-5 affecting vertical construction.',
      });
      expect(result.valid).toBe(true);
    });
  });

  // ── isDelayNotificationPending ──────────────────────────────────────

  describe('isDelayNotificationPending', () => {
    it('returns true when notification missing past threshold', () => {
      expect(
        isDelayNotificationPending(
          { notificationDate: null, delayStartDate: '2026-01-01', status: 'Identified' },
          '2026-01-15',
          7,
        ),
      ).toBe(true);
    });

    it('returns false when notification is set', () => {
      expect(
        isDelayNotificationPending(
          { notificationDate: '2026-01-05', delayStartDate: '2026-01-01', status: 'Identified' },
          '2026-01-15',
          7,
        ),
      ).toBe(false);
    });

    it('returns false for closed delays', () => {
      expect(
        isDelayNotificationPending(
          { notificationDate: null, delayStartDate: '2026-01-01', status: 'Closed' },
          '2026-01-15',
          7,
        ),
      ).toBe(false);
    });
  });

  // ── isQuantifiedGateMet ─────────────────────────────────────────────

  describe('isQuantifiedGateMet', () => {
    it('returns met when all conditions satisfied', () => {
      const result = isQuantifiedGateMet({
        timeImpact: createMockTimeImpactRecord(),
        commercialImpact: createMockCommercialImpactRecord(),
        criticalPathImpact: 'CRITICAL',
      });
      expect(result.met).toBe(true);
      expect(result.unmetConditions).toHaveLength(0);
    });

    it('returns unmet when timeImpact is null', () => {
      const result = isQuantifiedGateMet({
        timeImpact: null,
        commercialImpact: createMockCommercialImpactRecord(),
        criticalPathImpact: 'CRITICAL',
      });
      expect(result.met).toBe(false);
    });

    it('returns unmet when analysisBasis too short', () => {
      const result = isQuantifiedGateMet({
        timeImpact: createMockTimeImpactRecord({ analysisBasis: 'Too short.' }),
        commercialImpact: createMockCommercialImpactRecord(),
        criticalPathImpact: 'CRITICAL',
      });
      expect(result.met).toBe(false);
      expect(result.unmetConditions).toEqual(
        expect.arrayContaining([expect.stringContaining('analysisBasis')]),
      );
    });
  });

  // ── isDispositionedGateMet ──────────────────────────────────────────

  describe('isDispositionedGateMet', () => {
    it('returns met when all conditions satisfied', () => {
      const result = isDispositionedGateMet({
        dispositionOutcome: 'SettledByTime',
        dispositionNotes: 'Time extension granted.',
        notificationDate: '2026-01-22',
      });
      expect(result.met).toBe(true);
    });

    it('returns unmet when dispositionOutcome missing', () => {
      const result = isDispositionedGateMet({
        dispositionOutcome: null,
        dispositionNotes: 'Notes',
        notificationDate: '2026-01-22',
      });
      expect(result.met).toBe(false);
    });
  });

  // ── validateDelayRecordImmutability ─────────────────────────────────

  describe('validateDelayRecordImmutability', () => {
    const original = createMockDelayRecord();

    it('accepts changes to mutable fields', () => {
      const result = validateDelayRecordImmutability(original, {
        title: 'Updated title',
        responsibleParty: 'OWNER',
      });
      expect(result.valid).toBe(true);
    });

    it('rejects changes to delayId', () => {
      const result = validateDelayRecordImmutability(original, { delayId: 'different' });
      expect(result.valid).toBe(false);
    });

    it('rejects changes to delayEventType', () => {
      const result = validateDelayRecordImmutability(original, { delayEventType: 'FORCE_MAJEURE' });
      expect(result.valid).toBe(false);
    });

    it('accepts same value for immutable field', () => {
      const result = validateDelayRecordImmutability(original, { delayId: original.delayId });
      expect(result.valid).toBe(true);
    });
  });
});
