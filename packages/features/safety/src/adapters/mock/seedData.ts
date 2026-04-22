/**
 * Seed data for the mock Safety Inspection Repository.
 *
 * Mirrors the shape observed in the legacy `Jobsite Safety Scores.xlsx`:
 * - one reporting period,
 * - five projects,
 * - one project carries two inspections in the same week (the `92.2% + 93.3%`
 *   compound-cell pattern that motivated the design model).
 */

import type {
  SafetyFinding,
  SafetyIngestionRun,
  SafetyInspectionEvent,
  SafetyProjectWeekRecord,
  SafetyReportingPeriod,
} from '../../domain/types.js';

const PERIOD_ID = 'period-2026-04-20';
const WEEK_START = '2026-04-20';
const WEEK_END = '2026-04-26';

export const seedReportingPeriod: SafetyReportingPeriod = {
  id: PERIOD_ID,
  title: 'Week of 2026-04-20',
  weekStartDate: WEEK_START,
  weekEndDate: WEEK_END,
  periodLabel: 'Apr 20 – Apr 26, 2026',
  status: 'open',
  createdBy: 'safety.manager@hedrickbrothers.com',
};

interface SeedProject {
  readonly projectNumber: string;
  readonly projectName: string;
  readonly projectLocation: string;
  readonly projectStage: string;
  readonly inspectionScores: ReadonlyArray<number>;
  readonly reviewRequired?: boolean;
  readonly invalidTemplate?: boolean;
}

const SEED_PROJECTS: ReadonlyArray<SeedProject> = [
  {
    projectNumber: '2024-118',
    projectName: 'Riverside Medical Pavilion',
    projectLocation: 'West Palm Beach, FL',
    projectStage: 'Construction',
    inspectionScores: [0.922, 0.933],
  },
  {
    projectNumber: '2024-202',
    projectName: 'Coastal Corporate Center',
    projectLocation: 'Palm Beach Gardens, FL',
    projectStage: 'Construction',
    inspectionScores: [0.955],
  },
  {
    projectNumber: '2025-041',
    projectName: 'Brightwater Residences',
    projectLocation: 'Delray Beach, FL',
    projectStage: 'Construction',
    inspectionScores: [0.872],
    reviewRequired: true,
  },
  {
    projectNumber: '2024-318',
    projectName: 'Palm Harbor Parking Deck',
    projectLocation: 'Palm Beach, FL',
    projectStage: 'Construction',
    inspectionScores: [],
    invalidTemplate: true,
  },
  {
    projectNumber: '2025-077',
    projectName: 'Seaview Academy Renovation',
    projectLocation: 'Boca Raton, FL',
    projectStage: 'Pre-Construction',
    inspectionScores: [],
  },
];

export function buildSeed(): {
  period: SafetyReportingPeriod;
  projectWeeks: SafetyProjectWeekRecord[];
  inspections: SafetyInspectionEvent[];
  findings: SafetyFinding[];
  ingestionRuns: SafetyIngestionRun[];
} {
  const projectWeeks: SafetyProjectWeekRecord[] = [];
  const inspections: SafetyInspectionEvent[] = [];
  const findings: SafetyFinding[] = [];
  const ingestionRuns: SafetyIngestionRun[] = [];

  let inspectionCounter = 1;
  let runCounter = 1;
  let findingCounter = 1;

  for (const project of SEED_PROJECTS) {
    const projectWeekId = `pw-${project.projectNumber}-${WEEK_START}`;
    const inspectionEvents: SafetyInspectionEvent[] = project.inspectionScores.map(
      (score, idx) => {
        const id = `ie-${String(inspectionCounter++).padStart(4, '0')}`;
        return {
          id,
          title: `${project.projectNumber} — Inspection #${idx + 1}`,
          projectWeekRecordId: projectWeekId,
          reportingPeriodId: PERIOD_ID,
          sourceUploadItemId: 1000 + inspectionCounter,
          sourceUploadWebUrl: `https://hedrickbrotherscom.sharepoint.com/sites/Safety/SafetyChecklistUploads/${project.projectNumber}-${idx + 1}.xlsx`,
          checksum: `seed-checksum-${id}`,
          templateVersion: 'v1',
          parserVersion: 'parser-v1',
          scoringMode: 'template-compat-v1',
          inspectionDate: addDays(WEEK_START, idx * 2 + 1),
          inspectionNumber: String(idx + 1),
          inspectorName: 'Jamie Thompson',
          inspectorUpn: 'jamie.thompson@hedrickbrothers.com',
          projectNumber: project.projectNumber,
          projectNameSnapshot: project.projectName,
          inspectionScore: score,
          totalYes: Math.round(score * 80),
          totalNo: Math.round((1 - score) * 10),
          totalNa: 4,
          rawChecklistJson: '{"seed":true}',
          ingestionStatus: project.reviewRequired && idx === 0 ? 'review-required' : 'accepted',
          duplicateStatus: 'none',
          requiresReview: project.reviewRequired === true && idx === 0,
          submittedAt: `${addDays(WEEK_START, idx * 2 + 1)}T13:00:00Z`,
          committedAt: `${addDays(WEEK_START, idx * 2 + 1)}T13:05:00Z`,
        } satisfies SafetyInspectionEvent;
      },
    );
    inspections.push(...inspectionEvents);

    if (project.reviewRequired && inspectionEvents[0]) {
      const finding: SafetyFinding = {
        id: `fd-${String(findingCounter++).padStart(4, '0')}`,
        title: 'Fall protection not tied off',
        inspectionEventId: inspectionEvents[0].id,
        projectWeekRecordId: projectWeekId,
        sectionNumber: 4,
        sectionName: '4. Fall Protection & Openings',
        checklistRowNumber: 44,
        checklistItemLabel: 'Tie-off to approved anchor points only',
        findingType: 'no-response',
        severity: 'high',
        findingSummary: 'Failed: Tie-off to approved anchor points only — worker observed without tie-off',
        originalNoteText: 'Worker observed without tie-off on NE corner',
        requiresCorrectiveAction: true,
        isOpen: true,
      };
      findings.push(finding);
    }

    const accepted = inspectionEvents.filter((ie) => ie.ingestionStatus === 'accepted');
    const average =
      accepted.length === 0
        ? null
        : accepted.reduce((sum, ie) => sum + ie.inspectionScore, 0) / accepted.length;

    projectWeeks.push({
      id: projectWeekId,
      title: `${project.projectNumber} — ${WEEK_START}`,
      reportingPeriodId: PERIOD_ID,
      projectNumber: project.projectNumber,
      projectNameSnapshot: project.projectName,
      projectLocationSnapshot: project.projectLocation,
      projectStageSnapshot: project.projectStage,
      projectSourceClassification: 'project',
      expectedInspectionThisWeek: true,
      inspectionCount: accepted.length,
      averageInspectionScore: average,
      highestRiskFindingLevel: project.reviewRequired ? 'high' : accepted.length > 0 ? 'info' : null,
      weeklySummary: project.reviewRequired
        ? 'High-severity finding under review.'
        : accepted.length > 1
          ? 'Two inspections averaged.'
          : accepted.length === 1
            ? 'Single inspection on file.'
            : 'No inspection uploaded.',
      managerReviewStatus: project.reviewRequired ? 'pending' : 'not-required',
      publishStatus: project.reviewRequired
        ? 'review-required'
        : accepted.length === 0
          ? 'awaiting-upload'
          : 'completed',
    });

    if (project.invalidTemplate) {
      ingestionRuns.push({
        id: `run-${String(runCounter++).padStart(4, '0')}`,
        title: `${project.projectNumber} upload — invalid template`,
        sourceUploadItemId: 999,
        uploadFileName: `${project.projectNumber}-week-of-${WEEK_START}.xlsx`,
        templateVersionDetected: undefined,
        checksum: `seed-invalid-${project.projectNumber}`,
        validationStatus: 'failed',
        parseStatus: 'skipped',
        projectResolutionStatus: 'skipped',
        terminalStatus: 'invalid-template',
        committedEntityIdsJson: '{}',
        errorClass: 'template-invalid',
        errorSummary: 'ScoreCard!A9 response matrix header mismatch.',
        runStartedAt: `${WEEK_START}T08:00:00Z`,
        runCompletedAt: `${WEEK_START}T08:00:05Z`,
        attemptNumber: 1,
      });
    }

    for (const inspection of inspectionEvents) {
      ingestionRuns.push({
        id: `run-${String(runCounter++).padStart(4, '0')}`,
        title: `${project.projectNumber} upload — ${inspection.inspectionDate}`,
        sourceUploadItemId: inspection.sourceUploadItemId,
        uploadFileName: `${project.projectNumber}-${inspection.inspectionDate}.xlsx`,
        templateVersionDetected: 'v1',
        checksum: inspection.checksum,
        validationStatus: 'passed',
        parseStatus: 'passed',
        projectResolutionStatus: 'resolved',
        terminalStatus: inspection.ingestionStatus === 'review-required' ? 'review-required' : 'committed',
        committedEntityIdsJson: JSON.stringify({ inspectionEventId: inspection.id }),
        runStartedAt: `${inspection.inspectionDate}T13:00:00Z`,
        runCompletedAt: `${inspection.inspectionDate}T13:05:00Z`,
        attemptNumber: 1,
      });
    }
  }

  return {
    period: seedReportingPeriod,
    projectWeeks,
    inspections,
    findings,
    ingestionRuns,
  };
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
