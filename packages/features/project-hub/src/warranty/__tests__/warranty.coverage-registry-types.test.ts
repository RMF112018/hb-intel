import { describe, expect, it } from 'vitest';

import {
  CLOSEOUT_TURNOVER_ARTIFACT_TYPE_LABELS,
  CLOSEOUT_TURNOVER_ARTIFACT_TYPES,
  COVERAGE_ANCHOR_REQUIREMENTS,
  COVERAGE_ANCHOR_REQUIREMENTS_ENUM,
  COVERAGE_ANCHOR_TYPES,
  COVERAGE_EXPIRATION_ADVISORY_LEVELS,
  COVERAGE_EXPIRATION_ADVISORY_THRESHOLD_DEFAULT,
  COVERAGE_EXPIRATION_RULES,
  COVERAGE_METADATA_GATE_FIELDS,
  COVERAGE_METADATA_GATES,
  LABOR_SCOPE_LABELS,
  PRODUCT_SCOPE_LABELS,
  STARTUP_COMMISSIONING_STATUS_LABELS,
  STARTUP_COMMISSIONING_STATUSES,
  SYSTEM_SCOPE_LABELS,
} from '../../index.js';

describe('P3-E14-T10 Stage 3 coverage-registry contract stability', () => {
  describe('enum arrays', () => {
    it('CloseoutTurnoverArtifactType has 4', () => { expect(CLOSEOUT_TURNOVER_ARTIFACT_TYPES).toHaveLength(4); });
    it('StartupCommissioningStatus has 3', () => { expect(STARTUP_COMMISSIONING_STATUSES).toHaveLength(3); });
    it('CoverageMetadataGateField has 8', () => { expect(COVERAGE_METADATA_GATE_FIELDS).toHaveLength(8); });
    it('CoverageExpirationAdvisoryLevel has 3', () => { expect(COVERAGE_EXPIRATION_ADVISORY_LEVELS).toHaveLength(3); });
    it('CoverageAnchorRequirement has 4', () => { expect(COVERAGE_ANCHOR_REQUIREMENTS_ENUM).toHaveLength(4); });
    it('CoverageAnchorType has 3', () => { expect(COVERAGE_ANCHOR_TYPES).toHaveLength(3); });
  });

  describe('label maps', () => {
    it('CLOSEOUT_TURNOVER_ARTIFACT_TYPE_LABELS covers 4', () => { expect(Object.keys(CLOSEOUT_TURNOVER_ARTIFACT_TYPE_LABELS)).toHaveLength(4); });
    it('STARTUP_COMMISSIONING_STATUS_LABELS covers 3', () => { expect(Object.keys(STARTUP_COMMISSIONING_STATUS_LABELS)).toHaveLength(3); });
  });

  describe('scope taxonomy', () => {
    it('PRODUCT_SCOPE_LABELS has 7', () => { expect(PRODUCT_SCOPE_LABELS).toHaveLength(7); });
    it('LABOR_SCOPE_LABELS has 10', () => { expect(LABOR_SCOPE_LABELS).toHaveLength(10); });
    it('SYSTEM_SCOPE_LABELS has 6', () => { expect(SYSTEM_SCOPE_LABELS).toHaveLength(6); });
    it('total governed scopes = 23', () => {
      expect(PRODUCT_SCOPE_LABELS.length + LABOR_SCOPE_LABELS.length + SYSTEM_SCOPE_LABELS.length).toBe(23);
    });
  });

  describe('definition arrays', () => {
    it('COVERAGE_ANCHOR_REQUIREMENTS has 9 (3 layers × 3 anchors)', () => { expect(COVERAGE_ANCHOR_REQUIREMENTS).toHaveLength(9); });
    it('COVERAGE_METADATA_GATES has 8', () => { expect(COVERAGE_METADATA_GATES).toHaveLength(8); });
    it('COVERAGE_EXPIRATION_RULES has 3', () => { expect(COVERAGE_EXPIRATION_RULES).toHaveLength(3); });
  });

  describe('defaults', () => {
    it('COVERAGE_EXPIRATION_ADVISORY_THRESHOLD_DEFAULT is 30', () => {
      expect(COVERAGE_EXPIRATION_ADVISORY_THRESHOLD_DEFAULT).toBe(30);
    });
  });
});
