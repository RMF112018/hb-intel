import type { IScheduleQualityGrade } from '../src/schedule/types/index.js';

export const createMockScheduleQualityGrade = (
  overrides?: Partial<IScheduleQualityGrade>,
): IScheduleQualityGrade => ({
  gradeId: 'grade-001',
  versionId: 'ver-001',
  projectId: 'proj-001',
  computedAt: '2026-03-23T12:00:00Z',
  overallGrade: 'B',
  overallScore: 82,
  controlScores: [
    { controlCode: 'LOGIC_DENSITY', threshold: 80, measuredValue: 85, score: 90, weight: 0.15, pass: true, explanation: 'Logic density meets threshold' },
    { controlCode: 'CRITICAL_PATH_FLOAT', threshold: 0, measuredValue: -8, score: 70, weight: 0.15, pass: false, explanation: 'Negative critical path float detected' },
  ],
  policyVersionId: 'policy-v1',
  ...overrides,
});
