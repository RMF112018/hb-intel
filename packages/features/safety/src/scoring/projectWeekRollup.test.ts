import { describe, expect, it } from 'vitest';
import { computeProjectWeekRollup } from './projectWeekRollup.js';
import type { SafetyInspectionEvent, SafetyFinding } from '../domain/types.js';

function makeInspection(id: string, score: number, overrides: Partial<SafetyInspectionEvent> = {}): SafetyInspectionEvent {
  return {
    id,
    title: id,
    projectWeekRecordId: 'pw-test',
    reportingPeriodId: 'period-test',
    sourceUploadItemId: 1,
    sourceUploadWebUrl: '',
    checksum: '',
    templateVersion: 'v1',
    parserVersion: 'parser-v1',
    scoringMode: 'template-compat-v1',
    inspectionDate: '2026-04-22',
    inspectionNumber: '1',
    projectNumber: '2024-118',
    projectNameSnapshot: 'Test Project',
    inspectionScore: score,
    totalYes: 80,
    totalNo: 0,
    totalNa: 4,
    rawChecklistJson: '{}',
    ingestionStatus: 'accepted',
    duplicateStatus: 'none',
    requiresReview: false,
    submittedAt: '2026-04-22T10:00:00Z',
    ...overrides,
  };
}

describe('computeProjectWeekRollup', () => {
  it('matches the legacy 92.2% + 93.3% compound-cell pattern as an average', () => {
    const rollup = computeProjectWeekRollup(
      [makeInspection('ie-1', 0.922), makeInspection('ie-2', 0.933)],
      [],
    );
    expect(rollup.inspectionCount).toBe(2);
    expect(rollup.averageInspectionScore).toBeCloseTo((0.922 + 0.933) / 2, 5);
  });

  it('ignores rejected inspections in the average', () => {
    const rollup = computeProjectWeekRollup(
      [
        makeInspection('ie-1', 0.90),
        makeInspection('ie-2', 0.10, { ingestionStatus: 'rejected' }),
      ],
      [],
    );
    expect(rollup.inspectionCount).toBe(1);
    expect(rollup.averageInspectionScore).toBeCloseTo(0.90, 5);
  });

  it('returns null average when no inspections are accepted', () => {
    const rollup = computeProjectWeekRollup([], []);
    expect(rollup.inspectionCount).toBe(0);
    expect(rollup.averageInspectionScore).toBeNull();
  });

  it('picks highest severity across findings', () => {
    const findings: SafetyFinding[] = [
      mkFinding('fd-1', 'info'),
      mkFinding('fd-2', 'medium'),
      mkFinding('fd-3', 'high'),
    ];
    const rollup = computeProjectWeekRollup([makeInspection('ie-1', 0.9)], findings);
    expect(rollup.highestRiskFindingLevel).toBe('high');
  });
});

function mkFinding(id: string, severity: 'info' | 'medium' | 'high'): SafetyFinding {
  return {
    id,
    title: id,
    inspectionEventId: 'ie-1',
    projectWeekRecordId: 'pw-test',
    sectionNumber: 4,
    sectionName: '4. Fall Protection & Openings',
    checklistRowNumber: 44,
    checklistItemLabel: 'Tie-off',
    findingType: 'no-response',
    severity,
    findingSummary: '',
    originalNoteText: '',
    requiresCorrectiveAction: severity !== 'info',
    isOpen: true,
  };
}
