/**
 * Ranking — SF29-T03
 * Additive scoring with deterministic tie-breaking.
 */

import type { IMyWorkItem, MyWorkSource } from '../types/index.js';

export interface IRankingContext {
  nowIso: string;
  sourceWeights: Map<MyWorkSource, number>;
}

interface IScoringResult {
  score: number;
  primaryReason: string;
  contributingReasons: string[];
}

function daysBetween(isoA: string, isoB: string): number {
  const msPerDay = 86_400_000;
  return (new Date(isoA).getTime() - new Date(isoB).getTime()) / msPerDay;
}

function scoreItem(item: IMyWorkItem, ctx: IRankingContext): IScoringResult {
  let score = 0;
  const reasons: string[] = [];
  let primaryReason = 'Default priority';

  // Overdue: +1000, scaled by days overdue
  if (item.isOverdue && item.dueDateIso) {
    const daysOverdue = Math.max(0, daysBetween(ctx.nowIso, item.dueDateIso));
    score += 1000 + Math.min(daysOverdue * 10, 500);
    primaryReason = 'Overdue item';
    reasons.push('Overdue');
  }

  // Days-to-due: +500 diminishing
  if (item.dueDateIso && !item.isOverdue) {
    const daysToDue = Math.max(0, daysBetween(item.dueDateIso, ctx.nowIso));
    const dueScore = Math.max(0, 500 - daysToDue * 20);
    if (dueScore > 0) {
      score += dueScore;
      reasons.push('Has due date');
    }
  }

  // BIC urgency/blocked: +400
  if (item.isBlocked && item.sourceMeta[0]?.source === 'bic-next-move') {
    score += 400;
    primaryReason = 'Blocked BIC item';
    reasons.push('Blocked BIC');
  }

  // Unacknowledged: +300
  if (
    (item.class === 'inbound-handoff' || item.class === 'pending-approval') &&
    item.isUnread
  ) {
    score += 300;
    reasons.push('Unacknowledged');
  }

  // Unread freshness: +200 scaled by recency
  if (item.isUnread) {
    const daysSinceUpdate = Math.max(0, daysBetween(ctx.nowIso, item.timestamps.updatedAtIso));
    const freshnessScore = Math.max(0, 200 - daysSinceUpdate * 10);
    score += freshnessScore;
    if (freshnessScore > 0) reasons.push('Unread');
  }

  // Dependency impact: +150
  if (item.lifecycle.blockedDependencyLabel) {
    score += 150;
    reasons.push('Dependency impact');
  }

  // Project context: +100
  if (item.context.projectId) {
    score += 100;
    reasons.push('Project context');
  }

  // Source weight: +50 × weight
  const sourceWeight = ctx.sourceWeights.get(item.sourceMeta[0]?.source as MyWorkSource) ?? 0;
  if (sourceWeight > 0) {
    score += 50 * sourceWeight;
  }

  // Offline capable: +25
  if (item.offlineCapable) {
    score += 25;
    reasons.push('Offline capable');
  }

  if (primaryReason === 'Default priority' && reasons.length > 0) {
    primaryReason = reasons[0];
  }

  return { score, primaryReason, contributingReasons: reasons };
}

export function computeRankingScore(item: IMyWorkItem, ctx: IRankingContext): number {
  return scoreItem(item, ctx).score;
}

function tieBreakCompare(a: IMyWorkItem, b: IMyWorkItem, ctx: IRankingContext): number {
  // 1. Overdue severity (days overdue desc)
  if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
  if (a.isOverdue && b.isOverdue && a.dueDateIso && b.dueDateIso) {
    const aDays = daysBetween(ctx.nowIso, a.dueDateIso);
    const bDays = daysBetween(ctx.nowIso, b.dueDateIso);
    if (aDays !== bDays) return bDays - aDays > 0 ? 1 : -1;
  }

  // 2. Blocked criticality (isBlocked first)
  if (a.isBlocked !== b.isBlocked) return a.isBlocked ? -1 : 1;

  // 3. Source weight desc
  const aWeight = ctx.sourceWeights.get(a.sourceMeta[0]?.source as MyWorkSource) ?? 0;
  const bWeight = ctx.sourceWeights.get(b.sourceMeta[0]?.source as MyWorkSource) ?? 0;
  if (aWeight !== bWeight) return bWeight - aWeight;

  // 4. Freshest updatedAtIso desc
  const aTime = a.timestamps.updatedAtIso;
  const bTime = b.timestamps.updatedAtIso;
  if (aTime !== bTime) return bTime.localeCompare(aTime);

  // 5. Stable lexical canonicalKey asc
  return a.canonicalKey.localeCompare(b.canonicalKey);
}

export function rankItems(items: IMyWorkItem[], ctx: IRankingContext): IMyWorkItem[] {
  if (items.length === 0) return [];

  const scored = items.map((item) => {
    const { score, primaryReason, contributingReasons } = scoreItem(item, ctx);
    const ranked: IMyWorkItem = {
      ...item,
      rankingReason: { score, primaryReason, contributingReasons },
    };
    return { ranked, score };
  });

  scored.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return tieBreakCompare(a.ranked, b.ranked, ctx);
  });

  return scored.map((s) => s.ranked);
}
