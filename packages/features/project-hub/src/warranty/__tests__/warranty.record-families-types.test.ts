import { describe, expect, it } from 'vitest';

import {
  ACKNOWLEDGMENT_ENTERED_BYS,
  COVERAGE_DECISION_OUTCOMES,
  COVERAGE_DECISION_STATUSES,
  DISPUTE_OUTCOMES,
  OWNER_INTAKE_STATUSES,
  OWNER_REPORT_CHANNELS,
  RESOLUTION_OUTCOME_LABELS,
  RESOLUTION_OUTCOMES,
  SUBCONTRACTOR_SCOPE_POSITIONS,
  WARRANTY_ACKNOWLEDGMENT_STATUSES,
  WARRANTY_ASSIGNMENT_STATUSES,
  WARRANTY_ASSIGNMENT_TYPES,
  WARRANTY_AUTHORITY_ROLES,
  WARRANTY_CASE_SOURCE_CHANNELS,
  WARRANTY_CASE_STATUS_LABELS,
  WARRANTY_CASE_STATUSES,
  WARRANTY_COVERAGE_LAYER_LABELS,
  WARRANTY_COVERAGE_LAYERS,
  WARRANTY_COVERAGE_SOURCE_ENUMS,
  WARRANTY_COVERAGE_STATUSES,
  WARRANTY_EVIDENCE_TYPES,
  WARRANTY_ISSUE_TYPES,
  WARRANTY_LOCKED_AUTHORITY_DECISIONS,
  WARRANTY_RECORD_FAMILIES,
  WARRANTY_RECORD_FAMILY_DEFINITIONS,
  WARRANTY_SLA_STATUSES,
  WARRANTY_TERMINAL_CASE_STATUSES,
  WARRANTY_VISIT_STATUSES,
  WARRANTY_VISIT_TYPES,
  WARRANTY_WRITE_AUTHORITY_MATRIX,
} from '../../index.js';

describe('P3-E14-T10 Stage 2 Warranty record-families contract stability', () => {
  describe('enum arrays', () => {
    it('WarrantyCoverageLayer has 3', () => { expect(WARRANTY_COVERAGE_LAYERS).toHaveLength(3); });
    it('WarrantyCoverageStatus has 4', () => { expect(WARRANTY_COVERAGE_STATUSES).toHaveLength(4); });
    it('WarrantyCoverageSourceEnum has 3', () => { expect(WARRANTY_COVERAGE_SOURCE_ENUMS).toHaveLength(3); });
    it('WarrantyCaseStatus has 16', () => { expect(WARRANTY_CASE_STATUSES).toHaveLength(16); });
    it('WarrantySlaStatus has 4', () => { expect(WARRANTY_SLA_STATUSES).toHaveLength(4); });
    it('AcknowledgmentStatus has 4', () => { expect(WARRANTY_ACKNOWLEDGMENT_STATUSES).toHaveLength(4); });
    it('SubcontractorScopePosition has 3', () => { expect(SUBCONTRACTOR_SCOPE_POSITIONS).toHaveLength(3); });
    it('DisputeOutcome has 4', () => { expect(DISPUTE_OUTCOMES).toHaveLength(4); });
    it('CoverageDecisionOutcome has 3', () => { expect(COVERAGE_DECISION_OUTCOMES).toHaveLength(3); });
    it('CoverageDecisionStatus has 2', () => { expect(COVERAGE_DECISION_STATUSES).toHaveLength(2); });
    it('AssignmentType has 4', () => { expect(WARRANTY_ASSIGNMENT_TYPES).toHaveLength(4); });
    it('AssignmentStatus has 3', () => { expect(WARRANTY_ASSIGNMENT_STATUSES).toHaveLength(3); });
    it('WarrantyVisitType has 4', () => { expect(WARRANTY_VISIT_TYPES).toHaveLength(4); });
    it('WarrantyVisitStatus has 4', () => { expect(WARRANTY_VISIT_STATUSES).toHaveLength(4); });
    it('WarrantyEvidenceType has 5', () => { expect(WARRANTY_EVIDENCE_TYPES).toHaveLength(5); });
    it('ResolutionOutcome has 5', () => { expect(RESOLUTION_OUTCOMES).toHaveLength(5); });
    it('OwnerReportChannel has 4', () => { expect(OWNER_REPORT_CHANNELS).toHaveLength(4); });
    it('OwnerIntakeStatus has 3', () => { expect(OWNER_INTAKE_STATUSES).toHaveLength(3); });
    it('WarrantyCaseSourceChannel has 2', () => { expect(WARRANTY_CASE_SOURCE_CHANNELS).toHaveLength(2); });
    it('AcknowledgmentEnteredBy has 2', () => { expect(ACKNOWLEDGMENT_ENTERED_BYS).toHaveLength(2); });
    it('WarrantyIssueType has 5', () => { expect(WARRANTY_ISSUE_TYPES).toHaveLength(5); });
    it('WarrantyAuthorityRole has 8', () => { expect(WARRANTY_AUTHORITY_ROLES).toHaveLength(8); });
    it('WarrantyRecordFamily has 10', () => { expect(WARRANTY_RECORD_FAMILIES).toHaveLength(10); });
  });

  describe('label maps', () => {
    it('WARRANTY_CASE_STATUS_LABELS covers 16', () => { expect(Object.keys(WARRANTY_CASE_STATUS_LABELS)).toHaveLength(16); });
    it('WARRANTY_COVERAGE_LAYER_LABELS covers 3', () => { expect(Object.keys(WARRANTY_COVERAGE_LAYER_LABELS)).toHaveLength(3); });
    it('RESOLUTION_OUTCOME_LABELS covers 5', () => { expect(Object.keys(RESOLUTION_OUTCOME_LABELS)).toHaveLength(5); });
  });

  describe('definition arrays', () => {
    it('WARRANTY_RECORD_FAMILY_DEFINITIONS has 10', () => { expect(WARRANTY_RECORD_FAMILY_DEFINITIONS).toHaveLength(10); });
    it('WARRANTY_WRITE_AUTHORITY_MATRIX has 18 actions', () => { expect(WARRANTY_WRITE_AUTHORITY_MATRIX).toHaveLength(18); });
    it('WARRANTY_LOCKED_AUTHORITY_DECISIONS has 5', () => { expect(WARRANTY_LOCKED_AUTHORITY_DECISIONS).toHaveLength(5); });
    it('WARRANTY_TERMINAL_CASE_STATUSES has 5', () => { expect(WARRANTY_TERMINAL_CASE_STATUSES).toHaveLength(5); });
  });
});
