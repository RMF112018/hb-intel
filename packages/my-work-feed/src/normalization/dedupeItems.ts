/**
 * Dedupe — SF29-T03
 * Groups items by dedupeKey, selects a survivor per group,
 * and merges sourceMeta with permission preservation.
 */

import type { IMyWorkItem } from '../types/index.js';
import { MY_WORK_SOURCE_PRIORITY } from '../constants/index.js';
import type { IDedupeEvent } from '../telemetry/feedTelemetry.js';

export { IDedupeEvent };

export interface IDedupeResult {
  canonical: IMyWorkItem[];
  mergeEvents: IDedupeEvent[];
}

function sourcePriorityIndex(source: string): number {
  const idx = (MY_WORK_SOURCE_PRIORITY as readonly string[]).indexOf(source);
  return idx === -1 ? MY_WORK_SOURCE_PRIORITY.length : idx;
}

function selectSurvivor(items: IMyWorkItem[]): { survivor: IMyWorkItem; merged: IMyWorkItem[] } {
  const sorted = [...items].sort((a, b) => {
    // Higher source priority (lower index) wins
    const aPri = sourcePriorityIndex(a.sourceMeta[0]?.source ?? '');
    const bPri = sourcePriorityIndex(b.sourceMeta[0]?.source ?? '');
    if (aPri !== bPri) return aPri - bPri;
    // Newest sourceUpdatedAtIso wins
    const aTime = a.sourceMeta[0]?.sourceUpdatedAtIso ?? '';
    const bTime = b.sourceMeta[0]?.sourceUpdatedAtIso ?? '';
    return bTime.localeCompare(aTime);
  });

  return {
    survivor: sorted[0],
    merged: sorted.slice(1),
  };
}

export function dedupeItems(items: IMyWorkItem[]): IDedupeResult {
  const groups = new Map<string, IMyWorkItem[]>();
  for (const item of items) {
    const group = groups.get(item.dedupeKey);
    if (group) {
      group.push(item);
    } else {
      groups.set(item.dedupeKey, [item]);
    }
  }

  const canonical: IMyWorkItem[] = [];
  const mergeEvents: IDedupeEvent[] = [];

  for (const [dedupeKey, group] of groups) {
    if (group.length === 1) {
      canonical.push(group[0]);
      continue;
    }

    const { survivor, merged } = selectSurvivor(group);

    // Merge sourceMeta from all items
    const allSourceMeta = [...survivor.sourceMeta];
    for (const m of merged) {
      for (const sm of m.sourceMeta) {
        if (!allSourceMeta.some((existing) => existing.sourceItemId === sm.sourceItemId)) {
          allSourceMeta.push(sm);
        }
      }
    }

    // Permission preservation: any canAct:true wins, any isBlocked:true wins
    const allItems = [survivor, ...merged];
    const anyCanAct = allItems.some((i) => i.permissionState.canAct);
    const anyBlocked = allItems.some((i) => i.isBlocked);
    const cannotActReason = anyCanAct
      ? null
      : allItems.find((i) => i.permissionState.cannotActReason)?.permissionState.cannotActReason ?? null;

    const mergedSurvivor: IMyWorkItem = {
      ...survivor,
      sourceMeta: allSourceMeta,
      isBlocked: anyBlocked,
      permissionState: {
        ...survivor.permissionState,
        canAct: anyCanAct,
        cannotActReason,
      },
      dedupe: {
        dedupeKey,
        mergedSourceMeta: allSourceMeta,
        mergeReason: `Merged ${group.length} items with dedupeKey "${dedupeKey}"`,
      },
    };

    canonical.push(mergedSurvivor);

    for (const m of merged) {
      mergeEvents.push({
        survivorWorkItemId: survivor.workItemId,
        mergedWorkItemId: m.workItemId,
        dedupeKey,
        mergeReason: `Source "${m.sourceMeta[0]?.source ?? 'unknown'}" merged into "${survivor.sourceMeta[0]?.source ?? 'unknown'}"`,
      });
    }
  }

  return { canonical, mergeEvents };
}
