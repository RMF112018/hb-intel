import type {
  FindingSeverity,
  InspectionEventStatus,
  ProjectSourceClassification,
  SafetyFinding,
  SafetyInspectionEvent,
  SafetyProjectWeekRecord,
  SafetyReportingPeriod,
} from '../../domain/types.js';
import type {
  SafetyActivityEvidence,
  SafetyExcellenceCandidateInput,
} from '../types.js';

let inspectionCounter = 0;
let findingCounter = 0;

export function resetCounters(): void {
  inspectionCounter = 0;
  findingCounter = 0;
}

export function makeReportingPeriod(
  overrides: Partial<SafetyReportingPeriod> = {},
): SafetyReportingPeriod {
  return {
    id: 'rp-1',
    spItemId: 1,
    title: 'Reporting Period 2026-W17',
    weekStartDate: '2026-04-20',
    weekEndDate: '2026-04-26',
    periodLabel: '2026-W17',
    status: 'open',
    ...overrides,
  };
}

export function makeProjectWeek(
  overrides: Partial<SafetyProjectWeekRecord> = {},
): SafetyProjectWeekRecord {
  const projectSourceClassification: ProjectSourceClassification =
    overrides.projectSourceClassification ?? 'project';
  return {
    id: 'pw-1',
    spItemId: 100,
    title: 'Project 4815 — 2026-W17',
    reportingPeriodId: 'rp-1',
    reportingPeriodSpItemId: 1,
    projectNumber: '4815',
    projectNameSnapshot: 'Sample Project',
    projectLocationSnapshot: 'Indianapolis',
    projectStageSnapshot: 'Active Construction',
    projectSourceClassification,
    expectedInspectionThisWeek: true,
    inspectionCount: 0,
    averageInspectionScore: null,
    highestRiskFindingLevel: null,
    weeklySummary: '',
    managerReviewStatus: 'not-required',
    publishStatus: 'in-progress',
    ...overrides,
  };
}

export interface MakeInspectionOptions {
  readonly id?: string;
  readonly status?: InspectionEventStatus;
  /** Score in 0..1 fractional scale (matches repo boundary). */
  readonly scoreFraction?: number;
  readonly totalNo?: number;
  readonly totalYes?: number;
  readonly inspectionDate?: string;
  readonly projectNumber?: string;
  readonly reportingPeriodId?: string;
  readonly reportingPeriodSpItemId?: number;
  readonly projectWeekRecordId?: string;
  readonly projectWeekRecordSpItemId?: number;
  readonly parserVersion?: string;
  readonly templateVersion?: string;
  readonly sourceUploadItemId?: number;
}

export function makeInspection(options: MakeInspectionOptions = {}): SafetyInspectionEvent {
  inspectionCounter += 1;
  const id = options.id ?? `ie-${inspectionCounter}`;
  return {
    id,
    spItemId: 1000 + inspectionCounter,
    title: `Inspection ${id}`,
    projectWeekRecordId: options.projectWeekRecordId ?? 'pw-1',
    projectWeekRecordSpItemId: options.projectWeekRecordSpItemId ?? 100,
    reportingPeriodId: options.reportingPeriodId ?? 'rp-1',
    reportingPeriodSpItemId: options.reportingPeriodSpItemId ?? 1,
    sourceUploadItemId: options.sourceUploadItemId ?? 9000 + inspectionCounter,
    sourceUploadWebUrl: 'https://example.invalid/upload',
    checksum: `chk-${inspectionCounter}`,
    templateVersion: options.templateVersion ?? '2026.04',
    parserVersion: options.parserVersion ?? 'parser-1.0',
    scoringMode: 'template-compat-v1',
    inspectionDate: options.inspectionDate ?? '2026-04-22',
    inspectionNumber: String(inspectionCounter),
    inspectorName: 'Inspector Anonymous',
    inspectorUpn: 'inspector@example.invalid',
    projectNumber: options.projectNumber ?? '4815',
    projectNameSnapshot: 'Sample Project',
    inspectionScore: options.scoreFraction ?? 0.92,
    totalYes: options.totalYes ?? 25,
    totalNo: options.totalNo ?? 2,
    totalNa: 3,
    rawChecklistJson: '[]',
    ingestionStatus: options.status ?? 'accepted',
    duplicateStatus: 'none',
    requiresReview: false,
    submittedAt: '2026-04-22T18:00:00.000Z',
    committedAt: '2026-04-22T18:05:00.000Z',
  };
}

export interface MakeFindingOptions {
  readonly id?: string;
  readonly severity?: FindingSeverity;
  readonly isOpen?: boolean;
  readonly sectionNumber?: number;
  readonly checklistRowNumber?: number;
  readonly inspectionEventId?: string;
  readonly inspectionEventSpItemId?: number;
  readonly projectWeekRecordId?: string;
  readonly projectWeekRecordSpItemId?: number;
}

export function makeFinding(options: MakeFindingOptions = {}): SafetyFinding {
  findingCounter += 1;
  const id = options.id ?? `f-${findingCounter}`;
  return {
    id,
    spItemId: 5000 + findingCounter,
    title: `Finding ${id}`,
    inspectionEventId: options.inspectionEventId ?? 'ie-1',
    inspectionEventSpItemId: options.inspectionEventSpItemId ?? 1001,
    projectWeekRecordId: options.projectWeekRecordId ?? 'pw-1',
    projectWeekRecordSpItemId: options.projectWeekRecordSpItemId ?? 100,
    sectionNumber: options.sectionNumber ?? 3,
    sectionName: `Section ${options.sectionNumber ?? 3}`,
    checklistRowNumber: options.checklistRowNumber ?? 12,
    checklistItemLabel: 'Test item',
    findingType: 'no-response',
    severity: options.severity ?? 'medium',
    findingSummary: 'Test finding',
    originalNoteText: '',
    requiresCorrectiveAction: true,
    isOpen: options.isOpen ?? true,
  };
}

export interface MakeInputOptions {
  readonly reportingPeriod?: SafetyReportingPeriod;
  readonly projectWeek?: SafetyProjectWeekRecord;
  readonly inspections?: ReadonlyArray<SafetyInspectionEvent>;
  readonly findings?: ReadonlyArray<SafetyFinding>;
  readonly priorProjectWeeks?: ReadonlyArray<SafetyProjectWeekRecord>;
  readonly priorInspections?: ReadonlyArray<SafetyInspectionEvent>;
  readonly priorFindings?: ReadonlyArray<SafetyFinding>;
  readonly activityEvidence?: SafetyActivityEvidence;
  readonly generatedAt?: string;
  readonly generatorVersion?: string;
}

export function makeInput(options: MakeInputOptions = {}): SafetyExcellenceCandidateInput {
  return {
    reportingPeriod: options.reportingPeriod ?? makeReportingPeriod(),
    projectWeek: options.projectWeek ?? makeProjectWeek(),
    inspections: options.inspections ?? [],
    findings: options.findings ?? [],
    priorProjectWeeks: options.priorProjectWeeks ?? [],
    priorInspections: options.priorInspections ?? [],
    priorFindings: options.priorFindings ?? [],
    activityEvidence: options.activityEvidence,
    generatedAt: options.generatedAt ?? '2026-04-25T12:00:00.000Z',
    generatorVersion: options.generatorVersion,
  };
}
