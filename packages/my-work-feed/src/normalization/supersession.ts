/**
 * Supersession — SF29-T03
 * When multiple sources report the same record, the higher-truth source supersedes lower-truth sources.
 */

import type { IMyWorkItem } from '../types/index.js';
import { MY_WORK_SOURCE_PRIORITY } from '../constants/index.js';
import type { ISupersessionEvent } from '../telemetry/feedTelemetry.js';

export { ISupersessionEvent };

export interface ISupersessionResult {
  active: IMyWorkItem[];
  superseded: IMyWorkItem[];
  supersessionEvents: ISupersessionEvent[];
}

function sourcePriorityIndex(source: string): number {
  const idx = (MY_WORK_SOURCE_PRIORITY as readonly string[]).indexOf(source);
  return idx === -1 ? MY_WORK_SOURCE_PRIORITY.length : idx;
}

function recordIdentityKey(item: IMyWorkItem): string | null {
  const { recordId, recordType, moduleKey } = item.context;
  if (!recordId || !recordType) return null;
  return `${moduleKey}::${recordType}::${recordId}`;
}

export function applySupersession(items: IMyWorkItem[]): ISupersessionResult {
  const groups = new Map<string, IMyWorkItem[]>();
  const ungrouped: IMyWorkItem[] = [];

  for (const item of items) {
    const key = recordIdentityKey(item);
    if (!key) {
      ungrouped.push(item);
      continue;
    }
    const group = groups.get(key);
    if (group) {
      group.push(item);
    } else {
      groups.set(key, [item]);
    }
  }

  const active: IMyWorkItem[] = [...ungrouped];
  const superseded: IMyWorkItem[] = [];
  const supersessionEvents: ISupersessionEvent[] = [];

  for (const group of groups.values()) {
    if (group.length === 1) {
      active.push(group[0]);
      continue;
    }

    // Sort by source priority (lower index = higher truth)
    const sorted = [...group].sort((a, b) => {
      const aPri = sourcePriorityIndex(a.sourceMeta[0]?.source ?? '');
      const bPri = sourcePriorityIndex(b.sourceMeta[0]?.source ?? '');
      return aPri - bPri;
    });

    const winner = sorted[0];
    active.push(winner);

    for (let i = 1; i < sorted.length; i++) {
      const loser = sorted[i];

      // Items from the same source cannot self-supersede
      if (loser.sourceMeta[0]?.source === winner.sourceMeta[0]?.source) {
        active.push(loser);
        continue;
      }

      const supersededItem: IMyWorkItem = {
        ...loser,
        state: 'superseded',
        supersededByWorkItemId: winner.workItemId,
        supersession: {
          supersededByWorkItemId: winner.workItemId,
          supersessionReason: `Source "${winner.sourceMeta[0]?.source}" supersedes "${loser.sourceMeta[0]?.source}" for same record`,
          originalRankingReason: { ...loser.rankingReason },
        },
      };

      superseded.push(supersededItem);
      supersessionEvents.push({
        supersededWorkItemId: loser.workItemId,
        supersededByWorkItemId: winner.workItemId,
        reason: `Higher-truth source "${winner.sourceMeta[0]?.source}" supersedes "${loser.sourceMeta[0]?.source}"`,
      });
    }
  }

  return { active, superseded, supersessionEvents };
}
