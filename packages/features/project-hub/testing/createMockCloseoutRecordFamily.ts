/**
 * P3-E10-T02 Closeout Module record family testing fixture factories.
 */

import type { ICloseoutChecklist } from '../src/closeout/records/types.js';
import type { ISubcontractorScorecard } from '../src/closeout/records/types.js';
import type { ILessonEntry } from '../src/closeout/records/types.js';

export const createMockCloseoutChecklist = (
  overrides: Partial<ICloseoutChecklist> = {},
): ICloseoutChecklist => ({
  checklistId: 'chk-001',
  projectId: 'proj-001',
  projectName: 'Test Project',
  projectNumber: 'TP-2026-001',
  projectLocation: 'Test City, FL',
  projectType: 'Commercial',
  jurisdiction: 'PBC',
  templateId: 'tmpl-001',
  templateVersion: '2026.1.0',
  lifecycleState: 'ACTIVE',
  completionPercentage: 0,
  createdAt: '2026-01-15T10:00:00Z',
  createdBy: 'user-pm-001',
  lastModifiedAt: '2026-01-15T10:00:00Z',
  lastModifiedBy: null,
  notes: null,
  ...overrides,
});

export const createMockSubcontractorScorecard = (
  overrides: Partial<ISubcontractorScorecard> = {},
): ISubcontractorScorecard => ({
  scorecardId: 'sc-001',
  projectId: 'proj-001',
  subcontractorId: 'sub-001',
  subcontractorName: 'Test Subcontractor LLC',
  tradeScope: 'Electrical',
  evaluationType: 'FinalCloseout',
  evaluationSequence: 1,
  publicationStatus: 'DRAFT',
  contractValue: 500000,
  finalCost: null,
  scheduledCompletion: '2026-06-30',
  actualCompletion: null,
  evaluatorUserId: 'user-pm-001',
  evaluatorName: 'Jane Smith',
  evaluatorTitle: 'Project Manager',
  evaluationDate: '2026-03-24',
  reBidRecommendation: 'Yes',
  overallWeightedScore: null,
  performanceRating: null,
  keyStrengths: null,
  areasForImprovement: null,
  notableIncidentsOrIssues: null,
  overallNarrativeSummary: null,
  pmSignedAt: null,
  superintendentSignedAt: null,
  peApprovedAt: null,
  peApprovedBy: null,
  publishedToOrgIndexAt: null,
  eligibleForPublication: true,
  ...overrides,
});

export const createMockLessonEntry = (
  overrides: Partial<ILessonEntry> = {},
): ILessonEntry => ({
  lessonId: 'les-001',
  projectId: 'proj-001',
  reportId: null,
  lessonNumber: 1,
  category: 'Coordination',
  phaseEncountered: 'Execution',
  applicability: 3,
  keywords: ['coordination', 'subcontractor'],
  situation: 'Scheduling conflicts between MEP trades caused delays',
  impact: '2-week delay on Level 3 MEP rough-in',
  impactMagnitude: 'Moderate',
  rootCause: 'Insufficient look-ahead coordination between MEP subs',
  response: 'Implemented daily coordination meetings',
  recommendation: 'Establish weekly MEP coordination meetings from project start',
  supportingDocuments: null,
  publicationStatus: 'DRAFT',
  createdAt: '2026-02-10T08:30:00Z',
  createdBy: 'user-pm-001',
  lastModifiedAt: '2026-02-10T08:30:00Z',
  ...overrides,
});
