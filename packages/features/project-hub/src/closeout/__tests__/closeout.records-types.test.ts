import { describe, expect, it } from 'vitest';

import {
  CLOSEOUT_PUBLICATION_STATES,
  CLOSEOUT_CHECKLIST_ITEM_RESULTS,
  CLOSEOUT_CHECKLIST_RESPONSIBLE_ROLES,
  CLOSEOUT_CHECKLIST_LIFECYCLE_STAGE_TRIGGERS,
  CLOSEOUT_CHECKLIST_JURISDICTIONS,
  CLOSEOUT_SCORECARD_EVALUATION_TYPES,
  CLOSEOUT_REBID_RECOMMENDATIONS,
  CLOSEOUT_PUBLICATION_STATE_DETAILS,
  CLOSEOUT_PUBLICATION_STATE_LABELS,
  CLOSEOUT_PUBLICATION_STATE_APPLICABILITY,
  CLOSEOUT_RECORD_FAMILY_HIERARCHY,
  CLOSEOUT_AUTOPSY_INVARIANTS,
  CLOSEOUT_AUTOPSY_RELATIONSHIPS,
  CLOSEOUT_IMMUTABILITY_RULES,
  CLOSEOUT_CHECKLIST_ITEM_RESULT_LABELS,
  CLOSEOUT_SCORECARD_EVALUATION_TYPE_LABELS,
  CLOSEOUT_REBID_RECOMMENDATION_LABELS,
  CLOSEOUT_JURISDICTION_LABELS,
} from '../../index.js';

describe('P3-E10-T02 Closeout records contract stability', () => {
  // -- Publication States (§2) -----------------------------------------------

  describe('CloseoutPublicationState', () => {
    it('has exactly 8 publication states per §2', () => {
      expect(CLOSEOUT_PUBLICATION_STATES).toHaveLength(8);
    });

    it('includes all 8 states in correct order', () => {
      expect([...CLOSEOUT_PUBLICATION_STATES]).toEqual([
        'DRAFT', 'SUBMITTED', 'PE_REVIEW', 'REVISION_REQUIRED',
        'PE_APPROVED', 'PUBLISHED', 'SUPERSEDED', 'ARCHIVED',
      ]);
    });
  });

  describe('Publication state details', () => {
    it('has exactly 8 detail entries per §2 table', () => {
      expect(CLOSEOUT_PUBLICATION_STATE_DETAILS).toHaveLength(8);
    });

    it('each detail has all required fields', () => {
      for (const detail of CLOSEOUT_PUBLICATION_STATE_DETAILS) {
        expect(detail.state).toBeTruthy();
        expect(detail.code).toBeTruthy();
        expect(typeof detail.editable).toBe('boolean');
        expect(typeof detail.orgEligible).toBe('boolean');
        expect(detail.description).toBeTruthy();
      }
    });

    it('only DRAFT and REVISION_REQUIRED are editable per §2', () => {
      const editableStates = CLOSEOUT_PUBLICATION_STATE_DETAILS
        .filter((d) => d.editable)
        .map((d) => d.state);
      expect(editableStates).toEqual(['DRAFT', 'REVISION_REQUIRED']);
    });

    it('only PE_APPROVED is org eligible per §2', () => {
      const orgEligibleStates = CLOSEOUT_PUBLICATION_STATE_DETAILS
        .filter((d) => d.orgEligible)
        .map((d) => d.state);
      expect(orgEligibleStates).toEqual(['PE_APPROVED']);
    });
  });

  describe('Publication state labels', () => {
    it('labels all 8 publication states', () => {
      expect(Object.keys(CLOSEOUT_PUBLICATION_STATE_LABELS)).toHaveLength(8);
    });
  });

  // -- Publication State Applicability (§2.1) --------------------------------

  describe('Publication state applicability', () => {
    it('has exactly 10 record family entries per §2.1', () => {
      expect(CLOSEOUT_PUBLICATION_STATE_APPLICABILITY).toHaveLength(10);
    });

    it('each entry has all required fields', () => {
      for (const entry of CLOSEOUT_PUBLICATION_STATE_APPLICABILITY) {
        expect(entry.family).toBeTruthy();
        expect(typeof entry.usesPublicationStates).toBe('boolean');
        expect(entry.notes).toBeTruthy();
      }
    });

    it('5 families use publication states per §2.1', () => {
      const publishable = CLOSEOUT_PUBLICATION_STATE_APPLICABILITY
        .filter((a) => a.usesPublicationStates)
        .map((a) => a.family);
      expect(publishable).toEqual([
        'SubcontractorScorecard',
        'LessonEntry',
        'LessonsLearningReport',
        'AutopsyRecord',
        'LearningLegacyOutput',
      ]);
    });
  });

  // -- Record Family Hierarchy (§1) ------------------------------------------

  describe('Record family hierarchy', () => {
    it('has exactly 15 relationships per §1', () => {
      expect(CLOSEOUT_RECORD_FAMILY_HIERARCHY).toHaveLength(15);
    });

    it('each relationship has all required fields', () => {
      for (const rel of CLOSEOUT_RECORD_FAMILY_HIERARCHY) {
        expect(rel.parent).toBeTruthy();
        expect(rel.child).toBeTruthy();
        expect(rel.cardinality).toBeTruthy();
        expect(rel.notes).toBeTruthy();
      }
    });
  });

  // -- Autopsy Invariants (§5.1) ---------------------------------------------

  describe('Autopsy invariants', () => {
    it('has exactly 6 invariants per §5.1', () => {
      expect(CLOSEOUT_AUTOPSY_INVARIANTS).toHaveLength(6);
    });

    it('each invariant has name and rule', () => {
      for (const inv of CLOSEOUT_AUTOPSY_INVARIANTS) {
        expect(inv.invariant).toBeTruthy();
        expect(inv.rule).toBeTruthy();
      }
    });
  });

  // -- Autopsy Relationships (§5.2) ------------------------------------------

  describe('Autopsy relationships', () => {
    it('has exactly 5 relationships per §5.2', () => {
      expect(CLOSEOUT_AUTOPSY_RELATIONSHIPS).toHaveLength(5);
    });

    it('each relationship has all required fields', () => {
      for (const rel of CLOSEOUT_AUTOPSY_RELATIONSHIPS) {
        expect(rel.source).toBeTruthy();
        expect(rel.target).toBeTruthy();
        expect(rel.relationship).toBeTruthy();
        expect(rel.direction).toBeTruthy();
      }
    });
  });

  // -- Immutability Rules (§6) -----------------------------------------------

  describe('Immutability rules', () => {
    it('has exactly 10 rules per §6', () => {
      expect(CLOSEOUT_IMMUTABILITY_RULES).toHaveLength(10);
    });

    it('each rule has all required fields', () => {
      for (const rule of CLOSEOUT_IMMUTABILITY_RULES) {
        expect(rule.record).toBeTruthy();
        expect(rule.fieldCategory).toBeTruthy();
        expect(rule.immutableFrom).toBeTruthy();
      }
    });
  });

  // -- Enum Arrays -----------------------------------------------------------

  describe('CloseoutChecklistItemResult', () => {
    it('has exactly 4 results per §4.2', () => {
      expect(CLOSEOUT_CHECKLIST_ITEM_RESULTS).toHaveLength(4);
    });

    it('includes Yes, No, NA, Pending in order', () => {
      expect([...CLOSEOUT_CHECKLIST_ITEM_RESULTS]).toEqual(['Yes', 'No', 'NA', 'Pending']);
    });
  });

  describe('CloseoutChecklistResponsibleRole', () => {
    it('has exactly 8 roles per §4.2', () => {
      expect(CLOSEOUT_CHECKLIST_RESPONSIBLE_ROLES).toHaveLength(8);
    });
  });

  describe('CloseoutChecklistLifecycleStageTrigger', () => {
    it('has exactly 6 triggers per §4.2', () => {
      expect(CLOSEOUT_CHECKLIST_LIFECYCLE_STAGE_TRIGGERS).toHaveLength(6);
    });
  });

  describe('CloseoutChecklistJurisdiction', () => {
    it('has exactly 2 jurisdictions per §4.1', () => {
      expect(CLOSEOUT_CHECKLIST_JURISDICTIONS).toHaveLength(2);
    });
  });

  describe('CloseoutScorecardEvaluationType', () => {
    it('has exactly 2 evaluation types per §4.3', () => {
      expect(CLOSEOUT_SCORECARD_EVALUATION_TYPES).toHaveLength(2);
    });
  });

  describe('CloseoutReBidRecommendation', () => {
    it('has exactly 3 recommendations per §4.3', () => {
      expect(CLOSEOUT_REBID_RECOMMENDATIONS).toHaveLength(3);
    });
  });

  // -- Label Maps -----------------------------------------------------------

  describe('Label maps', () => {
    it('labels all 4 checklist item results', () => {
      expect(Object.keys(CLOSEOUT_CHECKLIST_ITEM_RESULT_LABELS)).toHaveLength(4);
    });

    it('labels all 2 scorecard evaluation types', () => {
      expect(Object.keys(CLOSEOUT_SCORECARD_EVALUATION_TYPE_LABELS)).toHaveLength(2);
    });

    it('labels all 3 re-bid recommendations', () => {
      expect(Object.keys(CLOSEOUT_REBID_RECOMMENDATION_LABELS)).toHaveLength(3);
    });

    it('labels all 2 jurisdictions', () => {
      expect(Object.keys(CLOSEOUT_JURISDICTION_LABELS)).toHaveLength(2);
    });
  });
});
