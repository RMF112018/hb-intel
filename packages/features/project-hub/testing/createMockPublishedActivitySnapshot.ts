import type { IPublishedActivitySnapshot } from '../src/schedule/types/index.js';

export const createMockPublishedActivitySnapshot = (
  overrides?: Partial<IPublishedActivitySnapshot>,
): IPublishedActivitySnapshot => ({
  publishedSnapshotId: 'pub-snap-001',
  publicationId: 'pub-001',
  externalActivityKey: 'src-001::A1000',
  sourceActivityCode: 'A1000',
  activityName: 'Excavation & Grading',
  publishedStartDate: '2026-02-01T00:00:00Z',
  publishedFinishDate: '2026-04-01T00:00:00Z',
  publishedPercentComplete: 50,
  varianceFromBaselineDays: 0,
  sourceFinishDate: '2026-04-01T00:00:00Z',
  committedFinishDate: null,
  reconciliationStatus: 'Aligned',
  isCriticalPath: false,
  isMilestone: false,
  ...overrides,
});
