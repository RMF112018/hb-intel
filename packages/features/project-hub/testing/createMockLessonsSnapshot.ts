/**
 * P3-E10-T05 Lessons Learned testing fixture factory.
 */

import type { ILessonsLearnedPublicationSnapshot } from '../src/closeout/lessons/types.js';

export const createMockLessonsLearnedSnapshot = (
  overrides: Partial<ILessonsLearnedPublicationSnapshot> = {},
): ILessonsLearnedPublicationSnapshot => ({
  snapshotId: 'snap-les-001',
  projectId: 'proj-001',
  generatedAt: '2026-03-24T10:00:00Z',
  reportId: 'rpt-001',
  peApprovedBy: 'user-pe-001',
  peApprovedAt: '2026-03-20T14:00:00Z',
  reportHeader: {
    projectName: 'Test Project',
    projectNumber: 'TP-2026-001',
    deliveryMethod: 'CMAtRisk',
    marketSector: 'OfficeCommercial',
    projectSizeBand: 'FifteenToFiftyM',
    complexityRating: 3,
    originalContractValue: 25000000,
    finalContractValue: 26500000,
    contractVariance: 1500000,
    scheduledCompletion: '2026-06-30',
    actualCompletion: '2026-07-15',
    daysVariance: 15,
    projectManager: 'Jane Smith',
    superintendent: 'Bob Johnson',
    projectExecutive: 'Carol Williams',
    reportDate: '2026-03-18',
  },
  entries: [
    {
      lessonNumber: 1,
      category: 'Safety',
      phaseEncountered: 'Execution',
      applicability: 4,
      keywords: ['safety', 'audit'],
      situation: 'Insufficient safety audits during MEP rough-in',
      impact: 'Near-miss incident, $15,000 remediation cost',
      impactMagnitude: 'Moderate',
      rootCause: 'Safety audit frequency reduced during peak labor',
      response: 'Resumed weekly safety audits immediately',
      recommendation: 'Establish minimum weekly safety audit frequency regardless of labor volume',
    },
  ],
  entryCount: 1,
  aggregateStats: {
    categoryCounts: {
      PreConstruction: 0, EstimatingBid: 0, Procurement: 0, Schedule: 0, CostBudget: 0,
      Safety: 1, Quality: 0, Subcontractors: 0, DesignRFIs: 0, OwnerClient: 0,
      TechnologyBIM: 0, WorkforceLabor: 0, Commissioning: 0, CloseoutTurnover: 0, Other: 0,
    },
    magnitudeCounts: { Minor: 0, Moderate: 1, Significant: 0, Critical: 0 },
    highApplicabilityCount: 1,
    criticalAndSignificantCount: 0,
  },
  ...overrides,
});
