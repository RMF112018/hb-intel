import { describe, expect, it } from 'vitest';

import {
  CLOSEOUT_ROLES,
  CLOSEOUT_INTELLIGENCE_VISIBILITY_REGIMES,
  CLOSEOUT_ANNOTATION_SOURCES,
  SUB_INTELLIGENCE_ACCESS_LEVELS,
  CLOSEOUT_ROLE_DEFINITIONS,
  CLOSEOUT_ROLE_MATRIX,
  CLOSEOUT_INTELLIGENCE_VISIBILITY,
  SUB_INTELLIGENCE_FIELD_VISIBILITY,
  CLOSEOUT_ANNOTATION_VISIBILITY,
  PE_APPROVAL_VS_ANNOTATION,
  PE_FORMAL_REVIEW_SURFACES,
  PE_NON_TRIGGERING_ACTIONS,
  PE_WORK_QUEUE_ITEMS,
  SUPT_CHECKLIST_SECTION_SCOPE,
  CLOSEOUT_ROLE_LABELS,
} from '../../index.js';

describe('P3-E10-T09 Closeout permissions contract stability', () => {
  describe('CloseoutRole', () => {
    it('has exactly 6 roles per §1', () => { expect(CLOSEOUT_ROLES).toHaveLength(6); });
  });

  describe('Visibility regimes', () => {
    it('has exactly 2 per §3.1', () => { expect(CLOSEOUT_INTELLIGENCE_VISIBILITY_REGIMES).toHaveLength(2); });
  });

  describe('Annotation sources', () => {
    it('has exactly 2 per §4.3', () => { expect(CLOSEOUT_ANNOTATION_SOURCES).toHaveLength(2); });
  });

  describe('SubIntelligence access levels', () => {
    it('has exactly 3', () => { expect(SUB_INTELLIGENCE_ACCESS_LEVELS).toHaveLength(3); });
  });

  describe('Role definitions', () => {
    it('has exactly 6 per §1', () => { expect(CLOSEOUT_ROLE_DEFINITIONS).toHaveLength(6); });
    it('each has code, displayName, scope, description', () => {
      for (const def of CLOSEOUT_ROLE_DEFINITIONS) {
        expect(def.code).toBeTruthy();
        expect(def.displayName).toBeTruthy();
        expect(def.scope).toBeTruthy();
        expect(def.description).toBeTruthy();
      }
    });
  });

  describe('Master role matrix', () => {
    it('has 31 action rows per §2', () => { expect(CLOSEOUT_ROLE_MATRIX).toHaveLength(31); });
    it('each row has category, action, and 5 role columns', () => {
      for (const row of CLOSEOUT_ROLE_MATRIX) {
        expect(row.category).toBeTruthy();
        expect(row.action).toBeTruthy();
        expect(row.pm !== undefined).toBe(true);
        expect(row.supt !== undefined).toBe(true);
        expect(row.pe !== undefined).toBe(true);
        expect(row.per !== undefined).toBe(true);
        expect(row.moe !== undefined).toBe(true);
      }
    });
  });

  describe('Intelligence visibility', () => {
    it('has exactly 4 class entries per §3.1', () => { expect(CLOSEOUT_INTELLIGENCE_VISIBILITY).toHaveLength(4); });
    it('SubIntelligence is Restricted', () => {
      const sub = CLOSEOUT_INTELLIGENCE_VISIBILITY.find((v) => v.intelligenceClass === 'SubIntelligence');
      expect(sub?.regime).toBe('Restricted');
    });
    it('LessonsIntelligence is BroadlyAvailable', () => {
      const lessons = CLOSEOUT_INTELLIGENCE_VISIBILITY.find((v) => v.intelligenceClass === 'LessonsIntelligence');
      expect(lessons?.regime).toBe('BroadlyAvailable');
    });
  });

  describe('SubIntelligence field visibility', () => {
    it('has exactly 16 fields per §3.3', () => { expect(SUB_INTELLIGENCE_FIELD_VISIBILITY).toHaveLength(16); });
    it('narratives restricted from SUB_INTELLIGENCE_VIEWER', () => {
      const narrativeFields = ['keyStrengths', 'areasForImprovement', 'notableIncidentsOrIssues', 'overallNarrativeSummary'];
      for (const field of narrativeFields) {
        const rule = SUB_INTELLIGENCE_FIELD_VISIBILITY.find((r) => r.field === field);
        expect(rule?.subIntelViewer).toBe(false);
        expect(rule?.pePERMOE).toBe(true);
      }
    });
  });

  describe('Annotation visibility', () => {
    it('has exactly 2 rules per §4.3', () => { expect(CLOSEOUT_ANNOTATION_VISIBILITY).toHaveLength(2); });
    it('PER annotations not visible to SUPT', () => {
      const per = CLOSEOUT_ANNOTATION_VISIBILITY.find((r) => r.source === 'PER');
      expect(per?.visibleToSUPT).toBe(false);
    });
  });

  describe('PE approval vs. annotation', () => {
    it('has exactly 7 dimensions per §5', () => { expect(PE_APPROVAL_VS_ANNOTATION).toHaveLength(7); });
  });

  describe('PE formal review surfaces', () => {
    it('has exactly 7 surfaces per §6.1', () => { expect(PE_FORMAL_REVIEW_SURFACES).toHaveLength(7); });
  });

  describe('PE non-triggering actions', () => {
    it('has exactly 6 actions per §6.2', () => { expect(PE_NON_TRIGGERING_ACTIONS).toHaveLength(6); });
  });

  describe('PE work queue items', () => {
    it('has exactly 5 items per §6.3', () => { expect(PE_WORK_QUEUE_ITEMS).toHaveLength(5); });
  });

  describe('SUPT checklist scope', () => {
    it('has exactly 6 sections per §7', () => { expect(SUPT_CHECKLIST_SECTION_SCOPE).toHaveLength(6); });
  });

  describe('Role labels', () => {
    it('labels all 6 roles', () => { expect(Object.keys(CLOSEOUT_ROLE_LABELS)).toHaveLength(6); });
  });
});
