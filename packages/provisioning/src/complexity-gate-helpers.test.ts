import { describe, expect, it } from 'vitest';
import type { ISummaryFieldDescriptor } from './summary-field-registry.js';
import type { IHistoryContentDescriptor } from './history-level-registry.js';
import {
  isSummaryFieldVisible,
  isHistoryContentVisible,
  getVisibleSummaryFields,
  getVisibleHistoryContent,
} from './complexity-gate-helpers.js';
import { PROJECT_SETUP_SUMMARY_FIELDS } from './summary-field-registry.js';
import { PROJECT_SETUP_HISTORY_CONTENT } from './history-level-registry.js';

// ─── Test fixtures ───────────────────────────────────────────────────────────

const coreField: ISummaryFieldDescriptor = {
  fieldId: 'projectName',
  label: 'Project Name',
  source: 'request',
  sourcePath: 'IProjectSetupRequest.projectName',
};

const standardField: ISummaryFieldDescriptor = {
  fieldId: 'teamMembers',
  label: 'Team Members',
  source: 'request',
  sourcePath: 'IProjectSetupRequest.groupMembers',
  minTier: 'standard',
};

const expertField: ISummaryFieldDescriptor = {
  fieldId: 'entraGroupIds',
  label: 'Entra ID Groups',
  source: 'provisioning',
  sourcePath: 'IProvisioningStatus.entraGroups',
  minTier: 'expert',
};

const standardHistoryContent: IHistoryContentDescriptor = {
  contentId: 'sagaStepResults',
  label: 'Saga Step Results',
  level: 2,
  minTier: 'standard',
  sourcePath: 'IProvisioningStatus.steps[]',
};

const expertHistoryContent: IHistoryContentDescriptor = {
  contentId: 'correlationIds',
  label: 'Correlation IDs',
  level: 2,
  minTier: 'expert',
  sourcePath: 'IProvisioningStatus.correlationId',
};

// ─── isSummaryFieldVisible ───────────────────────────────────────────────────

describe('isSummaryFieldVisible', () => {
  it('core field visible at essential', () => {
    expect(isSummaryFieldVisible(coreField, 'essential')).toBe(true);
  });

  it('core field visible at all tiers', () => {
    expect(isSummaryFieldVisible(coreField, 'standard')).toBe(true);
    expect(isSummaryFieldVisible(coreField, 'expert')).toBe(true);
  });

  it('standard field NOT visible at essential', () => {
    expect(isSummaryFieldVisible(standardField, 'essential')).toBe(false);
  });

  it('standard field visible at standard', () => {
    expect(isSummaryFieldVisible(standardField, 'standard')).toBe(true);
  });

  it('standard field visible at expert', () => {
    expect(isSummaryFieldVisible(standardField, 'expert')).toBe(true);
  });

  it('expert field NOT visible at essential', () => {
    expect(isSummaryFieldVisible(expertField, 'essential')).toBe(false);
  });

  // TC-CMPLX-04: Expert field NOT visible at standard
  it('expert field NOT visible at standard', () => {
    expect(isSummaryFieldVisible(expertField, 'standard')).toBe(false);
  });

  // TC-CMPLX-05: Expert field visible at expert
  it('expert field visible at expert', () => {
    expect(isSummaryFieldVisible(expertField, 'expert')).toBe(true);
  });
});

// ─── isHistoryContentVisible ─────────────────────────────────────────────────

describe('isHistoryContentVisible', () => {
  it('standard-gated content NOT visible at essential', () => {
    expect(isHistoryContentVisible(standardHistoryContent, 'essential')).toBe(false);
  });

  it('standard-gated content visible at standard', () => {
    expect(isHistoryContentVisible(standardHistoryContent, 'standard')).toBe(true);
  });

  it('expert-gated content NOT visible at standard', () => {
    expect(isHistoryContentVisible(expertHistoryContent, 'standard')).toBe(false);
  });

  it('expert-gated content visible at expert', () => {
    expect(isHistoryContentVisible(expertHistoryContent, 'expert')).toBe(true);
  });
});

// ─── getVisibleSummaryFields ─────────────────────────────────────────────────

// TC-CMPLX-02, TC-CMPLX-03: Standard/expert tier field filtering
describe('getVisibleSummaryFields', () => {
  // TC-CMPLX-01: Essential tier returns only ungated fields
  it('essential tier returns only ungated fields', () => {
    const visible = getVisibleSummaryFields(PROJECT_SETUP_SUMMARY_FIELDS, 'essential');
    expect(visible).toHaveLength(9);
    for (const field of visible) {
      expect(field.minTier).toBeUndefined();
    }
  });

  it('standard tier returns ungated + standard fields', () => {
    const visible = getVisibleSummaryFields(PROJECT_SETUP_SUMMARY_FIELDS, 'standard');
    expect(visible).toHaveLength(17); // 9 core + 8 standard
  });

  it('expert tier returns all fields', () => {
    const visible = getVisibleSummaryFields(PROJECT_SETUP_SUMMARY_FIELDS, 'expert');
    expect(visible).toHaveLength(19); // 9 + 8 + 2
  });
});

// ─── getVisibleHistoryContent ────────────────────────────────────────────────

describe('getVisibleHistoryContent', () => {
  it('essential tier returns only ungated history items', () => {
    const visible = getVisibleHistoryContent(PROJECT_SETUP_HISTORY_CONTENT, 'essential');
    const ungated = PROJECT_SETUP_HISTORY_CONTENT.filter((c) => !c.minTier);
    expect(visible).toHaveLength(ungated.length);
  });

  it('expert tier returns all history items', () => {
    const visible = getVisibleHistoryContent(PROJECT_SETUP_HISTORY_CONTENT, 'expert');
    expect(visible).toHaveLength(PROJECT_SETUP_HISTORY_CONTENT.length);
  });
});
