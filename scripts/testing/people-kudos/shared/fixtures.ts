/**
 * Synthetic data generators for test suites.
 */
import type { WorkflowStatus, ProminenceIntent, VisibilityMode, KudosEventType, KudosDraftInput } from './types.js';
import { buildSyntheticKudosId, buildSyntheticHeadline } from './context.js';

export interface CreateKudosItemPayload {
  Title?: string;
  KudosId: string;
  Headline: string;
  Excerpt: string;
  Details?: string;
  WorkflowStatus: WorkflowStatus;
  HomepageEnabled: boolean;
  IsPinned: boolean;
  WasEverPublished: boolean;
  CelebrateCount: number;
  PublishStartDate?: string;
  PublishEndDate?: string;
  SubmittedDateTime?: string;
  SubmittedById?: number;
  IndividualRecipientsId?: { results: number[] };
}

export function buildKudosDraftFields(
  runId: string,
  seq: number,
  overrides: Partial<KudosDraftInput> = {},
): CreateKudosItemPayload {
  const kudosId = overrides.kudosId ?? buildSyntheticKudosId(runId, seq);
  const headline = overrides.headline ?? buildSyntheticHeadline(runId, seq, 'lifecycle-happy-path');
  const now = new Date();
  return {
    Title: headline,
    KudosId: kudosId,
    Headline: headline,
    Excerpt: overrides.excerpt ?? `Synthetic kudos. runId=${runId} seq=${seq}.`,
    Details: overrides.details ?? 'Created by scripts/testing/people-kudos. Cleaned up unless --no-cleanup.',
    WorkflowStatus: 'pending',
    HomepageEnabled: false,
    IsPinned: false,
    WasEverPublished: false,
    CelebrateCount: 0,
    PublishStartDate: overrides.publishStartIso ?? new Date(now.getTime() - 60_000).toISOString(),
    PublishEndDate: overrides.publishEndIso ?? new Date(now.getTime() + 14 * 24 * 3_600_000).toISOString(),
    SubmittedDateTime: now.toISOString(),
    SubmittedById: overrides.submittedByUserId,
  };
}

// ── Kudos patch builders ──────────────────────────────────────────────

export function buildKudosApprovalPatch(approverUserId: number): Record<string, unknown> {
  return { WorkflowStatus: 'approved' as WorkflowStatus, ApprovedById: approverUserId, ApprovedDate: new Date().toISOString() };
}

export function buildKudosSchedulePatch(scheduledAtIso: string, schedulerUserId: number): Record<string, unknown> {
  return { WorkflowStatus: 'approvedScheduled' as WorkflowStatus, IsScheduled: true, ScheduledPublishAt: scheduledAtIso, ScheduledById: schedulerUserId };
}

export function buildKudosPinPatch(pinOrder: number): Record<string, unknown> {
  return { IsPinned: true, PinOrder: pinOrder, ProminenceIntent: 'pinned' as ProminenceIntent };
}

export function buildKudosFeaturePatch(expiresAtIso: string): Record<string, unknown> {
  return { IsFeatured: true, FeaturedExpiresAt: expiresAtIso, ProminenceIntent: 'featured' as ProminenceIntent };
}

export function buildKudosRevisionRequestedPatch(requesterUserId: number, guidance: string): Record<string, unknown> {
  return { WorkflowStatus: 'revisionRequested' as WorkflowStatus, RevisionRequestedById: requesterUserId, RevisionRequestedAt: new Date().toISOString(), RevisionGuidance: guidance };
}

export function buildKudosRejectPatch(rejectorUserId: number, reason: string): Record<string, unknown> {
  return { WorkflowStatus: 'rejected' as WorkflowStatus, RejectionReason: reason, ReviewedById: rejectorUserId, ReviewedAt: new Date().toISOString() };
}

export function buildKudosWithdrawPatch(withdrawerUserId: number): Record<string, unknown> {
  return { WorkflowStatus: 'withdrawn' as WorkflowStatus, WithdrawnById: withdrawerUserId, WithdrawnAt: new Date().toISOString() };
}

export function buildKudosRemovePatch(removerUserId: number, reason: string): Record<string, unknown> {
  return { WorkflowStatus: 'removedUnpublished' as WorkflowStatus, IsRemovedFromPublicView: true, RemovedById: removerUserId, RemovedAt: new Date().toISOString(), RemovedReason: reason };
}

export function buildKudosRestorePatch(restorerUserId: number): Record<string, unknown> {
  return { WorkflowStatus: 'approved' as WorkflowStatus, IsRemovedFromPublicView: false, RestoredById: restorerUserId, RestoredAt: new Date().toISOString() };
}

export function buildKudosCelebratePatch(nextCount: number): Record<string, unknown> {
  return { CelebrateCount: nextCount };
}

export function buildKudosVisibilityPatch(mode: VisibilityMode): Record<string, unknown> {
  return { CurrentVisibilityMode: mode };
}

// ── People & Culture fixture builders ─────────────────────────────────

export function buildAnnouncementFields(runId: string, seq: number, label = 'test-announcement'): Record<string, unknown> {
  return {
    Title: buildSyntheticHeadline(runId, seq, label),
    AnnouncementId: buildSyntheticKudosId(runId, seq),
    PersonDisplayName: `Test Person ${seq}`,
    AnnouncementType: 'promotion',
    Headline: buildSyntheticHeadline(runId, seq, label),
    Summary: `Synthetic announcement. runId=${runId} seq=${seq}`,
    HomepageEnabled: false,
  };
}

export function buildCelebrationFields(runId: string, seq: number, label = 'test-celebration'): Record<string, unknown> {
  return {
    Title: buildSyntheticHeadline(runId, seq, label),
    AnnouncementId: buildSyntheticKudosId(runId, seq),
    PersonDisplayName: `Test Person ${seq}`,
    CelebrationType: 'birthday',
    CelebrationDate: new Date().toISOString(),
    HomepageEnabledGovernanceextensi: false,
  };
}

// Silence unused import warnings for KudosEventType — used by domain suites.
void (null as KudosEventType | null);
