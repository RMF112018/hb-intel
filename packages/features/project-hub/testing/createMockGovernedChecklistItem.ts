/**
 * P3-E10-T03 Closeout Checklist testing fixture factories.
 */

import type { IGovernedChecklistItem, IChecklistSectionDefinition } from '../src/closeout/checklist/types.js';

export const createMockGovernedChecklistItem = (
  overrides: Partial<IGovernedChecklistItem> = {},
): IGovernedChecklistItem => ({
  itemNumber: '1.1',
  description: 'Installation of phone lines for Fire Alarm & Elevator — by owner to set up account',
  sectionKey: 'Tasks',
  isGoverned: true,
  isRequired: false,
  responsibleRole: 'OWNER',
  lifecycleStageTrigger: 'ALWAYS',
  hasDateField: false,
  hasEvidenceRequirement: false,
  evidenceHint: null,
  isCalculated: false,
  calculationSource: null,
  linkedModuleHint: null,
  linkedRelationshipKey: null,
  spineEventOnCompletion: null,
  milestoneGateKey: null,
  ...overrides,
});

export const createMockChecklistSectionDefinition = (
  overrides: Partial<IChecklistSectionDefinition> = {},
): IChecklistSectionDefinition => ({
  sectionNumber: 1,
  sectionKey: 'Tasks',
  name: 'Tasks',
  governedItemCount: 5,
  gateRule: 'All items = Yes (or required items with NA+justification) → TASKS_COMPLETE milestone',
  ...overrides,
});
