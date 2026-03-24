import { describe, expect, it } from 'vitest';

import {
  // Enum arrays
  SSSP_STATUSES,
  SSSP_ADDENDUM_STATUSES,
  SSSP_ADDENDUM_CHANGE_TYPES,
  SSSP_SECTION_KEYS,
  TEMPLATE_STATUSES,
  INSPECTION_ITEM_RESPONSE_TYPES,
  INSPECTION_STATUSES,
  CORRECTIVE_ACTION_SOURCE_TYPES,
  CORRECTIVE_ACTION_SEVERITIES,
  CORRECTIVE_ACTION_CATEGORIES,
  CORRECTIVE_ACTION_STATUSES,
  INCIDENT_TYPES,
  INCIDENT_STATUSES,
  JHA_STATUSES,
  HAZARD_RISK_LEVELS,
  PPE_TYPES,
  PRE_TASK_STATUSES,
  TOOLBOX_PROMPT_STATUSES,
  TOOLBOX_TALK_STATUSES,
  ORIENTATION_STATUSES,
  ACKNOWLEDGMENT_METHODS,
  ORIENTATION_TOPICS,
  SAFETY_SUBMISSION_TYPES,
  SUBMISSION_REVIEW_STATUSES,
  CERTIFICATION_TYPES,
  CERTIFICATION_STATUSES,
  SDS_STATUSES,
  COMPETENCY_AREAS,
  DESIGNATION_STATUSES,
  SAFETY_EVIDENCE_SOURCE_TYPES,
  EVIDENCE_SENSITIVITY_TIERS,
  RETENTION_CATEGORIES,
  EVIDENCE_REVIEW_STATUSES,

  // Terminal states
  TERMINAL_SSSP_STATUSES,
  TERMINAL_SSSP_ADDENDUM_STATUSES,
  TERMINAL_TEMPLATE_STATUSES,
  TERMINAL_INSPECTION_STATUSES,
  TERMINAL_CA_STATUSES,
  TERMINAL_INCIDENT_STATUSES,
  TERMINAL_JHA_STATUSES,
  TERMINAL_PRE_TASK_STATUSES,
  TERMINAL_TOOLBOX_TALK_STATUSES,
  TERMINAL_ORIENTATION_STATUSES,

  // State transition maps
  VALID_SSSP_TRANSITIONS,
  VALID_SSSP_ADDENDUM_TRANSITIONS,
  VALID_TEMPLATE_TRANSITIONS,
  VALID_INSPECTION_TRANSITIONS,
  VALID_CA_TRANSITIONS,
  VALID_INCIDENT_TRANSITIONS,
  VALID_JHA_TRANSITIONS,
  VALID_PRE_TASK_TRANSITIONS,
  VALID_TOOLBOX_TALK_TRANSITIONS,
  VALID_ORIENTATION_TRANSITIONS,

  // Label maps
  SSSP_STATUS_LABELS,
  SSSP_ADDENDUM_STATUS_LABELS,
  SSSP_ADDENDUM_CHANGE_TYPE_LABELS,
  SSSP_SECTION_KEY_LABELS,
  TEMPLATE_STATUS_LABELS,
  INSPECTION_STATUS_LABELS,
  CA_SOURCE_TYPE_LABELS,
  CA_SEVERITY_LABELS,
  CA_CATEGORY_LABELS,
  CA_STATUS_LABELS,
  INCIDENT_TYPE_LABELS,
  INCIDENT_STATUS_LABELS,
  JHA_STATUS_LABELS,
  HAZARD_RISK_LEVEL_LABELS,
  PPE_TYPE_LABELS,
  PRE_TASK_STATUS_LABELS,
  TOOLBOX_PROMPT_STATUS_LABELS,
  TOOLBOX_TALK_STATUS_LABELS,
  ORIENTATION_STATUS_LABELS,
  ACKNOWLEDGMENT_METHOD_LABELS,
  ORIENTATION_TOPIC_LABELS,
  SAFETY_SUBMISSION_TYPE_LABELS,
  SUBMISSION_REVIEW_STATUS_LABELS,
  CERTIFICATION_TYPE_LABELS,
  CERTIFICATION_STATUS_LABELS,
  SDS_STATUS_LABELS,
  COMPETENCY_AREA_LABELS,
  DESIGNATION_STATUS_LABELS,
  SAFETY_EVIDENCE_SOURCE_TYPE_LABELS,
  EVIDENCE_SENSITIVITY_TIER_LABELS,
  RETENTION_CATEGORY_LABELS,
  EVIDENCE_REVIEW_STATUS_LABELS,
  INSPECTION_ITEM_RESPONSE_TYPE_LABELS,
} from '../../index.js';

import {
  createMockSiteSpecificSafetyPlan,
  createMockCompletedInspection,
  createMockSafetyCorrectiveAction,
  createMockIncidentRecord,
  createMockJhaRecord,
  createMockSafetyEvidenceRecord,
} from '../../../testing/createMockSafetyRecord.js';

describe('P3-E8-T02 Safety records contract stability', () => {
  // =========================================================================
  // Enum array counts
  // =========================================================================

  describe('Enum array counts', () => {
    it('SSSP_STATUSES has 4 values', () => { expect(SSSP_STATUSES).toHaveLength(4); });
    it('SSSP_ADDENDUM_STATUSES has 4 values', () => { expect(SSSP_ADDENDUM_STATUSES).toHaveLength(4); });
    it('SSSP_ADDENDUM_CHANGE_TYPES has 5 values', () => { expect(SSSP_ADDENDUM_CHANGE_TYPES).toHaveLength(5); });
    it('SSSP_SECTION_KEYS has 12 values', () => { expect(SSSP_SECTION_KEYS).toHaveLength(12); });
    it('TEMPLATE_STATUSES has 3 values', () => { expect(TEMPLATE_STATUSES).toHaveLength(3); });
    it('INSPECTION_ITEM_RESPONSE_TYPES has 4 values', () => { expect(INSPECTION_ITEM_RESPONSE_TYPES).toHaveLength(4); });
    it('INSPECTION_STATUSES has 3 values', () => { expect(INSPECTION_STATUSES).toHaveLength(3); });
    it('CORRECTIVE_ACTION_SOURCE_TYPES has 5 values', () => { expect(CORRECTIVE_ACTION_SOURCE_TYPES).toHaveLength(5); });
    it('CORRECTIVE_ACTION_SEVERITIES has 3 values', () => { expect(CORRECTIVE_ACTION_SEVERITIES).toHaveLength(3); });
    it('CORRECTIVE_ACTION_CATEGORIES has 13 values', () => { expect(CORRECTIVE_ACTION_CATEGORIES).toHaveLength(13); });
    it('CORRECTIVE_ACTION_STATUSES has 5 values', () => { expect(CORRECTIVE_ACTION_STATUSES).toHaveLength(5); });
    it('INCIDENT_TYPES has 7 values', () => { expect(INCIDENT_TYPES).toHaveLength(7); });
    it('INCIDENT_STATUSES has 5 values', () => { expect(INCIDENT_STATUSES).toHaveLength(5); });
    it('JHA_STATUSES has 5 values', () => { expect(JHA_STATUSES).toHaveLength(5); });
    it('HAZARD_RISK_LEVELS has 3 values', () => { expect(HAZARD_RISK_LEVELS).toHaveLength(3); });
    it('PPE_TYPES has 10 values', () => { expect(PPE_TYPES).toHaveLength(10); });
    it('PRE_TASK_STATUSES has 3 values', () => { expect(PRE_TASK_STATUSES).toHaveLength(3); });
    it('TOOLBOX_PROMPT_STATUSES has 2 values', () => { expect(TOOLBOX_PROMPT_STATUSES).toHaveLength(2); });
    it('TOOLBOX_TALK_STATUSES has 3 values', () => { expect(TOOLBOX_TALK_STATUSES).toHaveLength(3); });
    it('ORIENTATION_STATUSES has 3 values', () => { expect(ORIENTATION_STATUSES).toHaveLength(3); });
    it('ACKNOWLEDGMENT_METHODS has 3 values', () => { expect(ACKNOWLEDGMENT_METHODS).toHaveLength(3); });
    it('ORIENTATION_TOPICS has 8 values', () => { expect(ORIENTATION_TOPICS).toHaveLength(8); });
    it('SAFETY_SUBMISSION_TYPES has 4 values', () => { expect(SAFETY_SUBMISSION_TYPES).toHaveLength(4); });
    it('SUBMISSION_REVIEW_STATUSES has 4 values', () => { expect(SUBMISSION_REVIEW_STATUSES).toHaveLength(4); });
    it('CERTIFICATION_TYPES has 8 values', () => { expect(CERTIFICATION_TYPES).toHaveLength(8); });
    it('CERTIFICATION_STATUSES has 4 values', () => { expect(CERTIFICATION_STATUSES).toHaveLength(4); });
    it('SDS_STATUSES has 3 values', () => { expect(SDS_STATUSES).toHaveLength(3); });
    it('COMPETENCY_AREAS has 7 values', () => { expect(COMPETENCY_AREAS).toHaveLength(7); });
    it('DESIGNATION_STATUSES has 3 values', () => { expect(DESIGNATION_STATUSES).toHaveLength(3); });
    it('SAFETY_EVIDENCE_SOURCE_TYPES has 9 values', () => { expect(SAFETY_EVIDENCE_SOURCE_TYPES).toHaveLength(9); });
    it('EVIDENCE_SENSITIVITY_TIERS has 3 values', () => { expect(EVIDENCE_SENSITIVITY_TIERS).toHaveLength(3); });
    it('RETENTION_CATEGORIES has 3 values', () => { expect(RETENTION_CATEGORIES).toHaveLength(3); });
    it('EVIDENCE_REVIEW_STATUSES has 4 values', () => { expect(EVIDENCE_REVIEW_STATUSES).toHaveLength(4); });
  });

  // =========================================================================
  // Terminal states are subsets
  // =========================================================================

  describe('Terminal state subsets', () => {
    it('terminal SSSP statuses are valid SSSP statuses', () => {
      for (const s of TERMINAL_SSSP_STATUSES) expect(SSSP_STATUSES).toContain(s);
    });
    it('terminal CA statuses are valid CA statuses', () => {
      for (const s of TERMINAL_CA_STATUSES) expect(CORRECTIVE_ACTION_STATUSES).toContain(s);
    });
    it('terminal incident statuses are valid incident statuses', () => {
      for (const s of TERMINAL_INCIDENT_STATUSES) expect(INCIDENT_STATUSES).toContain(s);
    });
    it('terminal JHA statuses are valid JHA statuses', () => {
      for (const s of TERMINAL_JHA_STATUSES) expect(JHA_STATUSES).toContain(s);
    });
    it('terminal inspection statuses are valid inspection statuses', () => {
      for (const s of TERMINAL_INSPECTION_STATUSES) expect(INSPECTION_STATUSES).toContain(s);
    });
    it('terminal addendum statuses are valid addendum statuses', () => {
      for (const s of TERMINAL_SSSP_ADDENDUM_STATUSES) expect(SSSP_ADDENDUM_STATUSES).toContain(s);
    });
    it('terminal template statuses are valid template statuses', () => {
      for (const s of TERMINAL_TEMPLATE_STATUSES) expect(TEMPLATE_STATUSES).toContain(s);
    });
    it('terminal pre-task statuses are valid pre-task statuses', () => {
      for (const s of TERMINAL_PRE_TASK_STATUSES) expect(PRE_TASK_STATUSES).toContain(s);
    });
    it('terminal toolbox talk statuses are valid toolbox talk statuses', () => {
      for (const s of TERMINAL_TOOLBOX_TALK_STATUSES) expect(TOOLBOX_TALK_STATUSES).toContain(s);
    });
    it('terminal orientation statuses are valid orientation statuses', () => {
      for (const s of TERMINAL_ORIENTATION_STATUSES) expect(ORIENTATION_STATUSES).toContain(s);
    });
  });

  // =========================================================================
  // State transition maps cover all statuses
  // =========================================================================

  describe('State transition map coverage', () => {
    it('SSSP transitions cover all statuses', () => {
      for (const s of SSSP_STATUSES) expect(VALID_SSSP_TRANSITIONS[s]).toBeDefined();
    });
    it('SSSP addendum transitions cover all statuses', () => {
      for (const s of SSSP_ADDENDUM_STATUSES) expect(VALID_SSSP_ADDENDUM_TRANSITIONS[s]).toBeDefined();
    });
    it('template transitions cover all statuses', () => {
      for (const s of TEMPLATE_STATUSES) expect(VALID_TEMPLATE_TRANSITIONS[s]).toBeDefined();
    });
    it('inspection transitions cover all statuses', () => {
      for (const s of INSPECTION_STATUSES) expect(VALID_INSPECTION_TRANSITIONS[s]).toBeDefined();
    });
    it('CA transitions cover all statuses', () => {
      for (const s of CORRECTIVE_ACTION_STATUSES) expect(VALID_CA_TRANSITIONS[s]).toBeDefined();
    });
    it('incident transitions cover all statuses', () => {
      for (const s of INCIDENT_STATUSES) expect(VALID_INCIDENT_TRANSITIONS[s]).toBeDefined();
    });
    it('JHA transitions cover all statuses', () => {
      for (const s of JHA_STATUSES) expect(VALID_JHA_TRANSITIONS[s]).toBeDefined();
    });
    it('pre-task transitions cover all statuses', () => {
      for (const s of PRE_TASK_STATUSES) expect(VALID_PRE_TASK_TRANSITIONS[s]).toBeDefined();
    });
    it('toolbox talk transitions cover all statuses', () => {
      for (const s of TOOLBOX_TALK_STATUSES) expect(VALID_TOOLBOX_TALK_TRANSITIONS[s]).toBeDefined();
    });
    it('orientation transitions cover all statuses', () => {
      for (const s of ORIENTATION_STATUSES) expect(VALID_ORIENTATION_TRANSITIONS[s]).toBeDefined();
    });

    it('terminal statuses have empty transition arrays', () => {
      expect(VALID_SSSP_TRANSITIONS['SUPERSEDED']).toEqual([]);
      expect(VALID_CA_TRANSITIONS['CLOSED']).toEqual([]);
      expect(VALID_CA_TRANSITIONS['VOIDED']).toEqual([]);
      expect(VALID_INCIDENT_TRANSITIONS['LITIGATED']).toEqual([]);
      expect(VALID_JHA_TRANSITIONS['SUPERSEDED']).toEqual([]);
      expect(VALID_JHA_TRANSITIONS['VOIDED']).toEqual([]);
    });
  });

  // =========================================================================
  // Label map completeness
  // =========================================================================

  describe('Label map completeness', () => {
    it('SSSP status labels', () => { for (const s of SSSP_STATUSES) expect(SSSP_STATUS_LABELS[s]).toBeTruthy(); });
    it('SSSP addendum status labels', () => { for (const s of SSSP_ADDENDUM_STATUSES) expect(SSSP_ADDENDUM_STATUS_LABELS[s]).toBeTruthy(); });
    it('SSSP addendum change type labels', () => { for (const s of SSSP_ADDENDUM_CHANGE_TYPES) expect(SSSP_ADDENDUM_CHANGE_TYPE_LABELS[s]).toBeTruthy(); });
    it('SSSP section key labels', () => { for (const s of SSSP_SECTION_KEYS) expect(SSSP_SECTION_KEY_LABELS[s]).toBeTruthy(); });
    it('template status labels', () => { for (const s of TEMPLATE_STATUSES) expect(TEMPLATE_STATUS_LABELS[s]).toBeTruthy(); });
    it('inspection status labels', () => { for (const s of INSPECTION_STATUSES) expect(INSPECTION_STATUS_LABELS[s]).toBeTruthy(); });
    it('CA source type labels', () => { for (const s of CORRECTIVE_ACTION_SOURCE_TYPES) expect(CA_SOURCE_TYPE_LABELS[s]).toBeTruthy(); });
    it('CA severity labels', () => { for (const s of CORRECTIVE_ACTION_SEVERITIES) expect(CA_SEVERITY_LABELS[s]).toBeTruthy(); });
    it('CA category labels', () => { for (const s of CORRECTIVE_ACTION_CATEGORIES) expect(CA_CATEGORY_LABELS[s]).toBeTruthy(); });
    it('CA status labels', () => { for (const s of CORRECTIVE_ACTION_STATUSES) expect(CA_STATUS_LABELS[s]).toBeTruthy(); });
    it('incident type labels', () => { for (const s of INCIDENT_TYPES) expect(INCIDENT_TYPE_LABELS[s]).toBeTruthy(); });
    it('incident status labels', () => { for (const s of INCIDENT_STATUSES) expect(INCIDENT_STATUS_LABELS[s]).toBeTruthy(); });
    it('JHA status labels', () => { for (const s of JHA_STATUSES) expect(JHA_STATUS_LABELS[s]).toBeTruthy(); });
    it('hazard risk level labels', () => { for (const s of HAZARD_RISK_LEVELS) expect(HAZARD_RISK_LEVEL_LABELS[s]).toBeTruthy(); });
    it('PPE type labels', () => { for (const s of PPE_TYPES) expect(PPE_TYPE_LABELS[s]).toBeTruthy(); });
    it('pre-task status labels', () => { for (const s of PRE_TASK_STATUSES) expect(PRE_TASK_STATUS_LABELS[s]).toBeTruthy(); });
    it('toolbox prompt status labels', () => { for (const s of TOOLBOX_PROMPT_STATUSES) expect(TOOLBOX_PROMPT_STATUS_LABELS[s]).toBeTruthy(); });
    it('toolbox talk status labels', () => { for (const s of TOOLBOX_TALK_STATUSES) expect(TOOLBOX_TALK_STATUS_LABELS[s]).toBeTruthy(); });
    it('orientation status labels', () => { for (const s of ORIENTATION_STATUSES) expect(ORIENTATION_STATUS_LABELS[s]).toBeTruthy(); });
    it('acknowledgment method labels', () => { for (const s of ACKNOWLEDGMENT_METHODS) expect(ACKNOWLEDGMENT_METHOD_LABELS[s]).toBeTruthy(); });
    it('orientation topic labels', () => { for (const s of ORIENTATION_TOPICS) expect(ORIENTATION_TOPIC_LABELS[s]).toBeTruthy(); });
    it('submission type labels', () => { for (const s of SAFETY_SUBMISSION_TYPES) expect(SAFETY_SUBMISSION_TYPE_LABELS[s]).toBeTruthy(); });
    it('submission review status labels', () => { for (const s of SUBMISSION_REVIEW_STATUSES) expect(SUBMISSION_REVIEW_STATUS_LABELS[s]).toBeTruthy(); });
    it('certification type labels', () => { for (const s of CERTIFICATION_TYPES) expect(CERTIFICATION_TYPE_LABELS[s]).toBeTruthy(); });
    it('certification status labels', () => { for (const s of CERTIFICATION_STATUSES) expect(CERTIFICATION_STATUS_LABELS[s]).toBeTruthy(); });
    it('SDS status labels', () => { for (const s of SDS_STATUSES) expect(SDS_STATUS_LABELS[s]).toBeTruthy(); });
    it('competency area labels', () => { for (const s of COMPETENCY_AREAS) expect(COMPETENCY_AREA_LABELS[s]).toBeTruthy(); });
    it('designation status labels', () => { for (const s of DESIGNATION_STATUSES) expect(DESIGNATION_STATUS_LABELS[s]).toBeTruthy(); });
    it('evidence source type labels', () => { for (const s of SAFETY_EVIDENCE_SOURCE_TYPES) expect(SAFETY_EVIDENCE_SOURCE_TYPE_LABELS[s]).toBeTruthy(); });
    it('evidence sensitivity tier labels', () => { for (const s of EVIDENCE_SENSITIVITY_TIERS) expect(EVIDENCE_SENSITIVITY_TIER_LABELS[s]).toBeTruthy(); });
    it('retention category labels', () => { for (const s of RETENTION_CATEGORIES) expect(RETENTION_CATEGORY_LABELS[s]).toBeTruthy(); });
    it('evidence review status labels', () => { for (const s of EVIDENCE_REVIEW_STATUSES) expect(EVIDENCE_REVIEW_STATUS_LABELS[s]).toBeTruthy(); });
    it('inspection item response type labels', () => { for (const s of INSPECTION_ITEM_RESPONSE_TYPES) expect(INSPECTION_ITEM_RESPONSE_TYPE_LABELS[s]).toBeTruthy(); });
  });

  // =========================================================================
  // Mock factory structural checks
  // =========================================================================

  describe('Mock factories', () => {
    it('createMockSiteSpecificSafetyPlan has required fields', () => {
      const sssp = createMockSiteSpecificSafetyPlan();
      expect(sssp.id).toBeTruthy();
      expect(sssp.projectId).toBeTruthy();
      expect(sssp.status).toBe('DRAFT');
      expect(sssp.planVersion).toBe(1);
      expect(sssp.renderedDocumentRef).toBeNull();
    });

    it('createMockCompletedInspection has template binding', () => {
      const insp = createMockCompletedInspection();
      expect(insp.templateId).toBeTruthy();
      expect(insp.templateVersion).toBe(1);
      expect(insp.inspectorId).toBeTruthy();
      expect(insp.status).toBe('IN_PROGRESS');
    });

    it('createMockSafetyCorrectiveAction has centralized ledger fields', () => {
      const ca = createMockSafetyCorrectiveAction();
      expect(ca.sourceType).toBe('INSPECTION');
      expect(ca.sourceRecordId).toBeTruthy();
      expect(ca.ownerId).toBeTruthy();
      expect(ca.status).toBe('OPEN');
      expect(ca.isOverdue).toBe(false);
    });

    it('createMockIncidentRecord has privacy tier', () => {
      const inc = createMockIncidentRecord();
      expect(inc.privacyTier).toBe('STANDARD');
      expect(inc.status).toBe('REPORTED');
      expect(inc.personsInvolved).toEqual([]);
    });

    it('createMockJhaRecord has step-hazard-control structure', () => {
      const jha = createMockJhaRecord();
      expect(jha.steps).toHaveLength(1);
      expect(jha.steps[0].hazards).toHaveLength(1);
      expect(jha.steps[0].hazards[0].controlMeasures).toHaveLength(2);
      expect(jha.requiresCompetentPerson).toBe(true);
    });

    it('createMockSafetyEvidenceRecord has sensitivity and retention', () => {
      const evi = createMockSafetyEvidenceRecord();
      expect(evi.sensitivityTier).toBe('STANDARD');
      expect(evi.retentionCategory).toBe('STANDARD_PROJECT');
      expect(evi.reviewStatus).toBe('PENDING_REVIEW');
      expect(evi.sourceRecordType).toBe('INSPECTION');
    });

    it('mock factories accept overrides', () => {
      const ca = createMockSafetyCorrectiveAction({ severity: 'CRITICAL', isOverdue: true });
      expect(ca.severity).toBe('CRITICAL');
      expect(ca.isOverdue).toBe(true);

      const inc = createMockIncidentRecord({ privacyTier: 'RESTRICTED', status: 'LITIGATED' });
      expect(inc.privacyTier).toBe('RESTRICTED');
      expect(inc.status).toBe('LITIGATED');
    });
  });
});
