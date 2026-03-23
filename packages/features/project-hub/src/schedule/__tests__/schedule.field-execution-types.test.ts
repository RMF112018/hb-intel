import { describe, expect, it } from 'vitest';

import {
  ACK_RESPONSES,
  ACK_STATUSES,
  ACK_SUBJECT_TYPES,
  BLOCKER_SEVERITIES,
  BLOCKER_STATUSES,
  BLOCKER_TYPES,
  DEFAULT_READINESS_DIMENSIONS,
  DEFAULT_ROLL_UP_CONFIG,
  FIELD_COMMITMENT_STATUSES,
  FIELD_COMMITMENT_TYPES,
  LOCATION_HIERARCHY_LEVELS,
  LOOK_AHEAD_STATUSES,
  OVERALL_READINESS_VALUES,
  PROGRESS_BASIS_TYPES,
  READINESS_DIMENSION_STATUSES,
  ROLL_UP_METHODS,
  SYNC_STATUSES,
  VERIFICATION_METHODS,
  VERIFICATION_OUTCOMES,
  VERIFICATION_STATUSES,
  WORK_PACKAGE_STATUSES,
} from '../constants/index.js';

describe('P3-E5-T05 contract stability', () => {
  describe('§6.1 work package', () => {
    it('has 7 progress basis types', () => { expect(PROGRESS_BASIS_TYPES).toHaveLength(7); });
    it('has 7 work package statuses', () => { expect(WORK_PACKAGE_STATUSES).toHaveLength(7); });
    it('has 4 sync statuses', () => { expect(SYNC_STATUSES).toHaveLength(4); });
  });

  describe('§6.2 location', () => {
    it('has 7 hierarchy levels', () => { expect(LOCATION_HIERARCHY_LEVELS).toHaveLength(7); });
  });

  describe('§6.3 field commitment', () => {
    it('has 4 commitment types', () => { expect(FIELD_COMMITMENT_TYPES).toHaveLength(4); });
    it('has 9 commitment statuses', () => { expect(FIELD_COMMITMENT_STATUSES).toHaveLength(9); });
  });

  describe('§6.4 blocker', () => {
    it('has 14 blocker types', () => { expect(BLOCKER_TYPES).toHaveLength(14); });
    it('has 4 severities', () => { expect(BLOCKER_SEVERITIES).toHaveLength(4); });
    it('has 6 blocker statuses', () => { expect(BLOCKER_STATUSES).toHaveLength(6); });
  });

  describe('§6.5 readiness', () => {
    it('has 4 overall readiness values', () => { expect(OVERALL_READINESS_VALUES).toHaveLength(4); });
    it('has 4 dimension statuses', () => { expect(READINESS_DIMENSION_STATUSES).toHaveLength(4); });
    it('has 7 default dimensions', () => { expect(DEFAULT_READINESS_DIMENSIONS).toHaveLength(7); });
  });

  describe('§6.6 look-ahead', () => {
    it('has 4 look-ahead statuses', () => { expect(LOOK_AHEAD_STATUSES).toHaveLength(4); });
  });

  describe('§7 acknowledgement', () => {
    it('has 5 subject types', () => { expect(ACK_SUBJECT_TYPES).toHaveLength(5); });
    it('has 8 statuses', () => { expect(ACK_STATUSES).toHaveLength(8); });
    it('has 3 responses', () => { expect(ACK_RESPONSES).toHaveLength(3); });
  });

  describe('§8 verification', () => {
    it('has 4 verification statuses', () => { expect(VERIFICATION_STATUSES).toHaveLength(4); });
    it('has 6 verification methods', () => { expect(VERIFICATION_METHODS).toHaveLength(6); });
    it('has 4 verification outcomes', () => { expect(VERIFICATION_OUTCOMES).toHaveLength(4); });
  });

  describe('§9 roll-up', () => {
    it('has 3 roll-up methods', () => { expect(ROLL_UP_METHODS).toHaveLength(3); });
    it('defaults to WeightedAverage with verified-only', () => {
      expect(DEFAULT_ROLL_UP_CONFIG.progressRollUpMethod).toBe('WeightedAverage');
      expect(DEFAULT_ROLL_UP_CONFIG.authoritativeOnlyVerified).toBe(true);
    });
  });
});
