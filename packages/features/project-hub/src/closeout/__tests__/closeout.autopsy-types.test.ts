import { describe, expect, it } from 'vitest';

import {
  AUTOPSY_THEMES,
  AUTOPSY_FINDING_TYPES,
  AUTOPSY_RECURRENCE_RISKS,
  AUTOPSY_FINDING_SEVERITIES,
  AUTOPSY_ACTION_TYPES,
  AUTOPSY_ACTION_STATUSES,
  LEARNING_LEGACY_OUTPUT_TYPES,
  AUTOPSY_WORKSHOP_FORMATS,
  ROOT_CAUSE_CATEGORIES,
  PRE_SURVEY_RESPONSE_TYPES,
  FINDING_EVIDENCE_REF_TYPES,
  AUTOPSY_SECTION_DEFINITIONS,
  AUTOPSY_FINDING_TYPE_DEFINITIONS,
  AUTOPSY_ACTION_TYPE_DEFINITIONS,
  AUTOPSY_ROOT_CAUSE_LEVELS,
  AUTOPSY_WORKSHOP_AGENDA,
  AUTOPSY_PRE_BRIEFING_DATA_SOURCES,
  AUTOPSY_LAYER_COMPARISON,
  AUTOPSY_THEME_LABELS,
  AUTOPSY_FINDING_TYPE_LABELS,
  AUTOPSY_ACTION_TYPE_LABELS,
  AUTOPSY_ACTION_STATUS_LABELS,
  LEARNING_LEGACY_OUTPUT_TYPE_LABELS,
  ROOT_CAUSE_CATEGORY_LABELS,
} from '../../index.js';

describe('P3-E10-T07 Closeout autopsy contract stability', () => {
  // -- Enum arrays -----------------------------------------------------------

  describe('AutopsyTheme', () => {
    it('has exactly 12 themes per §9.1', () => { expect(AUTOPSY_THEMES).toHaveLength(12); });
  });

  describe('AutopsyFindingType', () => {
    it('has exactly 5 types per §11.1', () => { expect(AUTOPSY_FINDING_TYPES).toHaveLength(5); });
  });

  describe('AutopsyRecurrenceRisk', () => {
    it('has exactly 3 levels', () => { expect(AUTOPSY_RECURRENCE_RISKS).toHaveLength(3); });
  });

  describe('AutopsyFindingSeverity', () => {
    it('has exactly 4 levels', () => { expect(AUTOPSY_FINDING_SEVERITIES).toHaveLength(4); });
  });

  describe('AutopsyActionType', () => {
    it('has exactly 8 types per §13.2', () => { expect(AUTOPSY_ACTION_TYPES).toHaveLength(8); });
  });

  describe('AutopsyActionStatus', () => {
    it('has exactly 5 statuses per §13.1', () => { expect(AUTOPSY_ACTION_STATUSES).toHaveLength(5); });
  });

  describe('LearningLegacyOutputType', () => {
    it('has exactly 8 types per §14.3', () => { expect(LEARNING_LEGACY_OUTPUT_TYPES).toHaveLength(8); });
  });

  describe('AutopsyWorkshopFormat', () => {
    it('has exactly 4 formats per §10', () => { expect(AUTOPSY_WORKSHOP_FORMATS).toHaveLength(4); });
  });

  describe('RootCauseCategory', () => {
    it('has exactly 14 categories per §12.3', () => { expect(ROOT_CAUSE_CATEGORIES).toHaveLength(14); });
  });

  describe('PreSurveyResponseType', () => {
    it('has exactly 5 types per §6.2', () => { expect(PRE_SURVEY_RESPONSE_TYPES).toHaveLength(5); });
  });

  describe('FindingEvidenceRefType', () => {
    it('has exactly 8 types per §11.2', () => { expect(FINDING_EVIDENCE_REF_TYPES).toHaveLength(8); });
  });

  // -- Section definitions ---------------------------------------------------

  describe('Section definitions', () => {
    it('has exactly 12 sections per §9.1', () => { expect(AUTOPSY_SECTION_DEFINITIONS).toHaveLength(12); });

    it('first 10 sections are always applicable', () => {
      const alwaysSections = AUTOPSY_SECTION_DEFINITIONS.filter((s) => s.applicableWhen === 'Always');
      expect(alwaysSections).toHaveLength(10);
    });

    it('2 conditional sections exist', () => {
      const conditional = AUTOPSY_SECTION_DEFINITIONS.filter((s) => s.applicableWhen !== 'Always');
      expect(conditional).toHaveLength(2);
    });
  });

  // -- Finding type definitions ----------------------------------------------

  describe('Finding type definitions', () => {
    it('has exactly 5 per §11.1', () => { expect(AUTOPSY_FINDING_TYPE_DEFINITIONS).toHaveLength(5); });
    it('each has type and definition', () => {
      for (const def of AUTOPSY_FINDING_TYPE_DEFINITIONS) {
        expect(def.type).toBeTruthy();
        expect(def.definition).toBeTruthy();
      }
    });
  });

  // -- Action type definitions -----------------------------------------------

  describe('Action type definitions', () => {
    it('has exactly 8 per §13.2', () => { expect(AUTOPSY_ACTION_TYPE_DEFINITIONS).toHaveLength(8); });
    it('each has type, description, typicalOwner', () => {
      for (const def of AUTOPSY_ACTION_TYPE_DEFINITIONS) {
        expect(def.type).toBeTruthy();
        expect(def.description).toBeTruthy();
        expect(def.typicalOwner).toBeTruthy();
      }
    });
  });

  // -- Root-cause levels -----------------------------------------------------

  describe('Root-cause levels', () => {
    it('has exactly 4 levels per §12.2', () => { expect(AUTOPSY_ROOT_CAUSE_LEVELS).toHaveLength(4); });
  });

  // -- Workshop agenda -------------------------------------------------------

  describe('Workshop agenda', () => {
    it('has exactly 10 blocks per §8.2', () => { expect(AUTOPSY_WORKSHOP_AGENDA).toHaveLength(10); });
  });

  // -- Pre-briefing data sources ---------------------------------------------

  describe('Pre-briefing data sources', () => {
    it('has exactly 10 sources per §7.1', () => { expect(AUTOPSY_PRE_BRIEFING_DATA_SOURCES).toHaveLength(10); });
  });

  // -- Layer comparison ------------------------------------------------------

  describe('Layer comparison', () => {
    it('has exactly 3 layers per §2', () => { expect(AUTOPSY_LAYER_COMPARISON).toHaveLength(3); });
  });

  // -- Label maps ------------------------------------------------------------

  describe('Label maps', () => {
    it('labels all 12 themes', () => { expect(Object.keys(AUTOPSY_THEME_LABELS)).toHaveLength(12); });
    it('labels all 5 finding types', () => { expect(Object.keys(AUTOPSY_FINDING_TYPE_LABELS)).toHaveLength(5); });
    it('labels all 8 action types', () => { expect(Object.keys(AUTOPSY_ACTION_TYPE_LABELS)).toHaveLength(8); });
    it('labels all 5 action statuses', () => { expect(Object.keys(AUTOPSY_ACTION_STATUS_LABELS)).toHaveLength(5); });
    it('labels all 8 output types', () => { expect(Object.keys(LEARNING_LEGACY_OUTPUT_TYPE_LABELS)).toHaveLength(8); });
    it('labels all 14 root-cause categories', () => { expect(Object.keys(ROOT_CAUSE_CATEGORY_LABELS)).toHaveLength(14); });
  });
});
