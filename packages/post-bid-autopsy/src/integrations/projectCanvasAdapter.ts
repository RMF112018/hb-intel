import type { IAutopsyRecordSnapshot } from '../types/index.js';
import { createAutopsyIntegrationDedupeKey } from './helpers.js';

export type AutopsyCanvasTaskType = 'section-gap' | 'disagreement-escalation' | 'stale-revalidation';

export interface IAutopsyCanvasTaskProjection {
  readonly itemId: string;
  readonly taskType: AutopsyCanvasTaskType;
  readonly title: string;
  readonly description: string;
  readonly ownerLabel: string | null;
  readonly dueDate: string | null;
  readonly severity: 'normal' | 'high';
  readonly bucket: 'my-work' | 'review-queue' | 'revalidation';
  readonly targetRef: {
    readonly module: 'post-bid-autopsy';
    readonly autopsyId: string;
    readonly pursuitId: string;
    readonly sectionKey?: string;
  };
}

export const projectAutopsyToCanvasTasks = (
  record: IAutopsyRecordSnapshot
): readonly IAutopsyCanvasTaskProjection[] => {
  const sectionTasks = record.sectionBicRecords.map((section) => ({
    itemId: createAutopsyIntegrationDedupeKey('canvas-section-gap', record.autopsy.autopsyId, section.sectionKey),
    taskType: 'section-gap' as const,
    title: section.title,
    description: section.expectedAction,
    ownerLabel: section.currentOwner?.displayName ?? null,
    dueDate: section.dueDate,
    severity: (section.blockedReason ? 'high' : 'normal') as 'high' | 'normal',
    bucket: 'my-work' as const,
    targetRef: {
      module: 'post-bid-autopsy' as const,
      autopsyId: record.autopsy.autopsyId,
      pursuitId: record.autopsy.pursuitId,
      sectionKey: section.sectionKey,
    },
  }));

  const disagreementTasks = record.escalationEvents
    .filter((event) => event.eventType === 'disagreement-deadlock')
    .map((event) => ({
      itemId: createAutopsyIntegrationDedupeKey('canvas-disagreement', record.autopsy.autopsyId, event.escalationId),
      taskType: 'disagreement-escalation' as const,
      title: 'Resolve post-bid disagreement deadlock',
      description: event.reason,
      ownerLabel: event.target.displayName,
      dueDate: null,
      severity: 'high' as const,
      bucket: 'review-queue' as const,
      targetRef: {
        module: 'post-bid-autopsy' as const,
        autopsyId: record.autopsy.autopsyId,
        pursuitId: record.autopsy.pursuitId,
      },
    }));

  const staleTask =
    record.autopsy.status === 'published' && record.autopsy.telemetry.staleIntelligenceRate !== null
      ? [
          {
            itemId: createAutopsyIntegrationDedupeKey(
              'canvas-revalidation',
              record.autopsy.autopsyId,
              'stale'
            ),
            taskType: 'stale-revalidation' as const,
            title: 'Revalidate stale post-bid intelligence',
            description: 'Published autopsy intelligence requires revalidation before reuse.',
            ownerLabel: record.assignments.chiefEstimator.displayName,
            dueDate: record.sla.dueAt,
            severity: 'high' as const,
            bucket: 'revalidation' as const,
            targetRef: {
              module: 'post-bid-autopsy' as const,
              autopsyId: record.autopsy.autopsyId,
              pursuitId: record.autopsy.pursuitId,
            },
          },
        ]
      : [];

  return Object.freeze([...sectionTasks, ...disagreementTasks, ...staleTask]);
};
