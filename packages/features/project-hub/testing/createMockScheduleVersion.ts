import type { IScheduleVersionRecord } from '../src/schedule/types/index.js';

export const createMockScheduleVersion = (
  overrides?: Partial<IScheduleVersionRecord>,
): IScheduleVersionRecord => ({
  versionId: 'ver-001',
  projectId: 'proj-001',
  sourceId: 'src-001',
  versionLabel: 'Update 12 — March 2026',
  dataDate: '2026-03-15',
  importedBy: 'user-001',
  importedAt: '2026-03-15T10:00:00Z',
  format: 'XER',
  originalFilename: 'Project_Schedule.xer',
  fileStorageRef: 'blob://schedules/proj-001/ver-001.xer',
  activityCount: 450,
  milestoneCount: 35,
  status: 'Active',
  isCanonicalVersion: true,
  supersededAt: null,
  supersededBy: null,
  activatedAt: '2026-03-15T10:05:00Z',
  parentVersionId: null,
  validationWarnings: [],
  validationErrors: [],
  ...overrides,
});
