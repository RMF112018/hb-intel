/**
 * P3-E10-T07 Project Autopsy testing fixture factory.
 */

import type { IAutopsyRecord } from '../src/closeout/autopsy/types.js';

export const createMockAutopsyRecord = (
  overrides: Partial<IAutopsyRecord> = {},
): IAutopsyRecord => ({
  autopsyId: 'aut-001',
  projectId: 'proj-001',
  autopsyTitle: '2026 — Test Project Project Autopsy',
  leadFacilitatorUserId: 'user-pe-001',
  coordinatorUserId: 'user-pm-001',
  publicationStatus: 'DRAFT',
  waived: false,
  waiverNote: null,
  operationalOutcomesApplicable: false,
  developerProjectApplicable: false,
  preBriefingPackReady: false,
  preBriefingPackGeneratedAt: null,
  preBriefingPackVersion: null,
  preSurveyEnabled: true,
  preSurveyIssuedAt: null,
  preSurveyDeadline: null,
  preSurveyResponseCount: null,
  preSurveyParticipantCount: null,
  workshopDate: null,
  workshopFormat: null,
  workshopCompletedAt: null,
  workshopParticipants: [],
  deliveryAutopsySectionsCompleted: false,
  operationalOutcomesSectionsCompleted: null,
  findingCount: 0,
  actionCount: 0,
  outputCount: 0,
  peApprovedAt: null,
  peApprovedBy: null,
  publishedAt: null,
  notes: null,
  ...overrides,
});
