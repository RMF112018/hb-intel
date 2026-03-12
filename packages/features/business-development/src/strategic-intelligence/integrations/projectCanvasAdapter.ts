import type { RecommendationSignal } from '@hbc/project-canvas';
import type {
  ICommitmentRegisterItem,
  IStrategicIntelligenceEntry,
} from '@hbc/strategic-intelligence';

export type StrategicIntelligenceCanvasTaskType =
  | 'strategic-gap'
  | 'unresolved-commitment'
  | 'stale-review'
  | 'conflict';

export interface IStrategicIntelligenceCanvasTask {
  stableId: string;
  taskType: StrategicIntelligenceCanvasTaskType;
  tileKey: 'bic-my-items';
  projectId: string;
  routeHref: string;
  title: string;
  recommendationSignal: RecommendationSignal;
  assigneeUserId?: string;
  relatedEntryId?: string;
  relatedCommitmentId?: string;
}

export interface IStrategicIntelligenceCanvasProjection {
  tileKey: 'bic-my-items';
  tasks: IStrategicIntelligenceCanvasTask[];
}

const toSignal = (hasConflict: boolean, isStale: boolean): RecommendationSignal => {
  if (hasConflict || isStale) {
    return 'health';
  }

  return 'usage-history';
};

const toCommitmentTask = (
  projectId: string,
  routeHref: string,
  commitment: ICommitmentRegisterItem
): IStrategicIntelligenceCanvasTask => ({
  stableId: `${projectId}:commitment:${commitment.commitmentId}`,
  taskType: 'unresolved-commitment',
  tileKey: 'bic-my-items',
  projectId,
  routeHref,
  title: `Resolve commitment: ${commitment.description}`,
  recommendationSignal: 'health',
  relatedCommitmentId: commitment.commitmentId,
});

export const projectStrategicIntelligenceToCanvasPlacement = (
  projectId: string,
  routeHref: string,
  entries: readonly IStrategicIntelligenceEntry[],
  commitments: readonly ICommitmentRegisterItem[]
): IStrategicIntelligenceCanvasProjection => {
  const tasks: IStrategicIntelligenceCanvasTask[] = [];

  for (const entry of entries) {
    tasks.push({
      stableId: `${projectId}:entry:${entry.entryId}`,
      taskType: 'strategic-gap',
      tileKey: 'bic-my-items',
      projectId,
      routeHref,
      title: `Strategic gap: ${entry.title}`,
      recommendationSignal: toSignal(
        entry.conflicts.some((conflict) => conflict.resolutionStatus === 'open'),
        entry.trust.isStale
      ),
      relatedEntryId: entry.entryId,
    });

    if (entry.trust.isStale) {
      tasks.push({
        stableId: `${projectId}:stale:${entry.entryId}`,
        taskType: 'stale-review',
        tileKey: 'bic-my-items',
        projectId,
        routeHref,
        title: `Review stale intelligence: ${entry.title}`,
        recommendationSignal: 'health',
        relatedEntryId: entry.entryId,
      });
    }

    for (const conflict of entry.conflicts) {
      if (conflict.resolutionStatus !== 'open') {
        continue;
      }

      tasks.push({
        stableId: `${projectId}:conflict:${conflict.conflictId}`,
        taskType: 'conflict',
        tileKey: 'bic-my-items',
        projectId,
        routeHref,
        title: `Resolve ${conflict.type}: ${entry.title}`,
        recommendationSignal: 'health',
        relatedEntryId: entry.entryId,
      });
    }
  }

  for (const commitment of commitments) {
    if (
      commitment.fulfillmentStatus === 'fulfilled' ||
      commitment.fulfillmentStatus === 'not-applicable'
    ) {
      continue;
    }

    tasks.push(toCommitmentTask(projectId, routeHref, commitment));
  }

  return {
    tileKey: 'bic-my-items',
    tasks,
  };
};
