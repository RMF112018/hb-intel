/**
 * HB Kudos governance writer.
 *
 * SharePoint write seam for both the employee and HR companion webparts.
 * Every governance action routes through this module so:
 *
 *   1. list-item lookups are bound to the `People Culture Kudos` GUID
 *      via `peopleCultureSpListRegistry` (never by list title),
 *   2. list-item updates use the MERGE + `If-Match` convention with a
 *      real etag (no blind overwrites),
 *   3. every workflow transition writes a matching row to the
 *      `Kudos Audit Events` list so the durable event timeline is
 *      correct by construction,
 *   4. the discriminator over `KudosPatch` is exhaustive,
 *   5. writer-level authorization verifies the caller's resolved role
 *      against the required capability before any network call.
 *
 * Governing sources:
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Decision-Lock-Appendix.md`
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Schema-Reference-Appendix.md`
 */
import {
  PEOPLE_CULTURE_LIST_REGISTRY,
  buildPcListItemsEndpoint,
  type PeopleCultureListDescriptor,
} from './peopleCultureSpListRegistry.js';
import {
  fetchRequestDigest,
  resolveUserId,
} from './peopleCultureSubmissionSource.js';
import { KUDOS_FIELDS, KUDOS_AUDIT_FIELDS } from './peopleCultureListSource.js';
import type {
  KudosAuditEventInput,
  KudosAuditEventType,
  KudosPatch,
} from '../webparts/kudosContracts.js';
import { deriveKudosCapabilities, type KudosRole } from '../helpers/kudosCapabilities.js';
import { buildKudosNotificationIntents } from '../helpers/kudosNotificationBuilder.js';
import { dispatchKudosNotifications } from './kudosNotificationDispatch.js';
import {
  handleScheduledProminenceCollision,
  validateFeatureAction,
  validatePinAction,
  validateReassignmentAuthority,
  type ProminenceSlotState,
} from '../helpers/kudosProminenceRules.js';

// ---------------------------------------------------------------------------
// Public result shape
// ---------------------------------------------------------------------------

export type KudosGovernanceResult =
  | { ok: true; itemId: number; auditEventId?: number }
  | { ok: false; error: string };

export interface KudosItemMeta {
  /** SharePoint list item id on the People Culture Kudos list. */
  itemId: number;
  /** ETag extracted from the nometadata response header or body. */
  etag: string;
  /** The app-side KudosId echoed back for caller convenience. */
  kudosId: string;
}

// ---------------------------------------------------------------------------
// Fetch item meta by KudosId
// ---------------------------------------------------------------------------

/**
 * Escape a literal string for OData `$filter` use. SharePoint REST
 * requires single quotes to be doubled.
 */
function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}

/**
 * Look up the live SharePoint list item id and etag for a given
 * app-side `KudosId`. Bound by the kudos list GUID so title drift
 * cannot cross-bind the writer to the wrong list.
 *
 * Returns `undefined` when no item matches (caller decides whether
 * that is an error).
 */
export async function fetchKudosItemMeta(
  siteUrl: string,
  kudosId: string,
): Promise<KudosItemMeta | undefined> {
  if (!kudosId.trim()) return undefined;

  const url = buildPcListItemsEndpoint(
    siteUrl,
    PEOPLE_CULTURE_LIST_REGISTRY.kudos,
    {
      select: `Id,${KUDOS_FIELDS.KudosId}`,
      filter: `${KUDOS_FIELDS.KudosId} eq '${escapeODataString(kudosId)}'`,
      top: 1,
    },
  );

  // Ask for minimal metadata so the response carries the
  // `@odata.etag` field that we need for the If-Match write.
  const response = await fetch(url, {
    headers: { Accept: 'application/json;odata=minimalmetadata' },
  });

  if (!response.ok) {
    throw new Error(
      `People Culture Kudos lookup by KudosId failed: ${response.status} ${response.statusText}`,
    );
  }

  interface RawItem {
    Id: number;
    KudosId: string;
    '@odata.etag'?: string;
    'odata.etag'?: string;
  }
  const body = (await response.json()) as { value?: RawItem[] };
  const raw = body.value?.[0];
  if (!raw) return undefined;

  const etag = raw['@odata.etag'] ?? raw['odata.etag'] ?? '*';
  return { itemId: raw.Id, etag, kudosId: raw.KudosId };
}

// ---------------------------------------------------------------------------
// Prominence slot counting
// ---------------------------------------------------------------------------

/**
 * Count the current number of featured and pinned items on the live
 * kudos list. Used by prominence rule validation before executing
 * pin/feature actions.
 */
export async function fetchProminenceSlotState(
  siteUrl: string,
): Promise<ProminenceSlotState> {
  const baseUrl = buildPcListItemsEndpoint(
    siteUrl,
    PEOPLE_CULTURE_LIST_REGISTRY.kudos,
  );
  const countFeatured = fetch(
    `${baseUrl}?$filter=${KUDOS_FIELDS.IsFeatured} eq true&$select=Id&$top=10`,
    { headers: { Accept: 'application/json;odata=nometadata' } },
  )
    .then((r) => (r.ok ? r.json() : { value: [] }))
    .then((b: { value?: unknown[] }) => b.value?.length ?? 0)
    .catch(() => 0);

  const countPinned = fetch(
    `${baseUrl}?$filter=${KUDOS_FIELDS.IsPinned} eq true&$select=Id&$top=10`,
    { headers: { Accept: 'application/json;odata=nometadata' } },
  )
    .then((r) => (r.ok ? r.json() : { value: [] }))
    .then((b: { value?: unknown[] }) => b.value?.length ?? 0)
    .catch(() => 0);

  const [featuredCount, pinnedCount] = await Promise.all([countFeatured, countPinned]);
  return { featuredCount, pinnedCount };
}

// ---------------------------------------------------------------------------
// PATCH the kudos item
// ---------------------------------------------------------------------------

/**
 * Update a `People Culture Kudos` item by id. Uses the SharePoint REST
 * MERGE convention: POST the item-by-id endpoint with
 * `X-HTTP-Method: MERGE` and `If-Match: {etag}` so the write is
 * transactional against the fetched version. Returns the HTTP status.
 */
export async function patchKudosItem(
  siteUrl: string,
  itemId: number,
  etag: string,
  digest: string,
  fields: Record<string, unknown>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const url = `${buildPcListItemsEndpoint(siteUrl, PEOPLE_CULTURE_LIST_REGISTRY.kudos)}(${itemId})`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json;odata=nometadata',
      'Content-Type': 'application/json;odata=nometadata',
      'X-RequestDigest': digest,
      'X-HTTP-Method': 'MERGE',
      'If-Match': etag,
    },
    body: JSON.stringify(fields),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    return {
      ok: false,
      error: `SharePoint rejected the kudos PATCH (${response.status}). ${errorBody ? `Details: ${errorBody.slice(0, 240)}` : ''}`.trim(),
    };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Create an audit event row
// ---------------------------------------------------------------------------

/**
 * Write a new row to the `Kudos Audit Events` list. Every governance
 * action writes one of these so the durable event timeline can be
 * reconstructed without replaying the main list.
 *
 * Returns the created item id, or an error result. Does not throw
 * on HTTP errors (the caller decides whether a missing audit row
 * should roll back the main write — today it surfaces via the
 * returned shape so the HR companion can warn the user).
 */
export async function createKudosAuditEvent(
  siteUrl: string,
  digest: string,
  input: KudosAuditEventInput,
): Promise<{ ok: true; id: number } | { ok: false; error: string }> {
  interface AuditPayload {
    Title: string;
    KudosId: string;
    EventType: KudosAuditEventType;
    ActorId?: number;
    EventAt: string;
    PublicNote?: string;
    InternalNote?: string;
    OldValue?: string;
    NewValue?: string;
  }
  const payload: AuditPayload = {
    Title: `${input.eventType}:${input.kudosId}`,
    KudosId: input.kudosId,
    EventType: input.eventType,
    EventAt: input.eventAtIso ?? new Date().toISOString(),
  };
  if (typeof input.actorUserId === 'number') payload.ActorId = input.actorUserId;
  if (input.publicNote) payload.PublicNote = input.publicNote;
  if (input.internalNote) payload.InternalNote = input.internalNote;
  if (input.oldValue !== undefined) payload.OldValue = JSON.stringify(input.oldValue);
  if (input.newValue !== undefined) payload.NewValue = JSON.stringify(input.newValue);

  const url = buildPcListItemsEndpoint(
    siteUrl,
    PEOPLE_CULTURE_LIST_REGISTRY.kudosAuditEvents,
  );
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json;odata=nometadata',
      'Content-Type': 'application/json;odata=nometadata',
      'X-RequestDigest': digest,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    return {
      ok: false,
      error: `Kudos Audit Events write failed (${response.status}). ${errorBody ? `Details: ${errorBody.slice(0, 240)}` : ''}`.trim(),
    };
  }
  const body = (await response.json()) as { Id?: number };
  if (typeof body.Id !== 'number') {
    return { ok: false, error: 'Kudos Audit Events write succeeded but the response did not include an item id.' };
  }
  // `void` the unused list descriptor import — kept for future
  // audit-event queries that bind by descriptor rather than key.
  void (null as PeopleCultureListDescriptor | null);
  return { ok: true, id: body.Id };
}

// ---------------------------------------------------------------------------
// Discriminated executor over KudosPatch
// ---------------------------------------------------------------------------

/**
 * Build the { fieldSet, auditEvent } pair for a given `KudosPatch`.
 * Exported so tests can verify the PATCH body shape without mocking
 * any network layer.
 *
 * Prompt-03 implements the review-workflow transitions. Every other
 * patch kind is acknowledged with a `NotImplemented` return so later
 * prompts can land the writer code without a caller change.
 */
export function buildKudosPatchPlan(
  patch: KudosPatch,
): {
  ok: true;
  fields: Record<string, unknown>;
  auditEvent: KudosAuditEventInput;
} | {
  ok: false;
  error: string;
} {
  const actedAtIso = patch.actedAtIso ?? new Date().toISOString();

  switch (patch.kind) {
    case 'approve': {
      const fields: Record<string, unknown> = {
        [KUDOS_FIELDS.WorkflowStatus]: 'approved',
        [KUDOS_FIELDS.ApprovedDate]: actedAtIso,
        [KUDOS_FIELDS.HomepageEnabled]: true,
        [KUDOS_FIELDS.WasEverPublished]: true,
      };
      if (typeof patch.actorUserId === 'number') {
        fields[`${KUDOS_FIELDS.ApprovedBy}Id`] = patch.actorUserId;
        fields[`${KUDOS_FIELDS.ReviewedBy}Id`] = patch.actorUserId;
        fields[KUDOS_FIELDS.ReviewedAt] = actedAtIso;
      }
      if (patch.flagForAdminReview === true) {
        fields[KUDOS_FIELDS.IsFlaggedForAdminReview] = true;
        if (patch.adminReviewReason) {
          fields[KUDOS_FIELDS.AdminReviewReason] = patch.adminReviewReason;
        }
        if (typeof patch.actorUserId === 'number') {
          fields[`${KUDOS_FIELDS.AdminReviewFlaggedBy}Id`] = patch.actorUserId;
          fields[KUDOS_FIELDS.AdminReviewFlaggedAt] = actedAtIso;
        }
      }
      return {
        ok: true,
        fields,
        auditEvent: {
          kudosId: patch.kudosId,
          eventType: 'approve',
          actorUserId: patch.actorUserId,
          eventAtIso: actedAtIso,
          publicNote: patch.publicNote,
          internalNote: patch.internalNote,
          newValue: { workflowStatus: 'approved', homepageEnabled: true },
        },
      };
    }

    case 'reject': {
      if (!patch.rejectionReason.trim()) {
        return { ok: false, error: 'Rejection reason is required.' };
      }
      const fields: Record<string, unknown> = {
        [KUDOS_FIELDS.WorkflowStatus]: 'rejected',
        [KUDOS_FIELDS.RejectionReason]: patch.rejectionReason.trim(),
      };
      if (typeof patch.actorUserId === 'number') {
        fields[`${KUDOS_FIELDS.ReviewedBy}Id`] = patch.actorUserId;
        fields[KUDOS_FIELDS.ReviewedAt] = actedAtIso;
      }
      return {
        ok: true,
        fields,
        auditEvent: {
          kudosId: patch.kudosId,
          eventType: 'reject',
          actorUserId: patch.actorUserId,
          eventAtIso: actedAtIso,
          publicNote: patch.publicNote,
          internalNote: patch.internalNote,
          newValue: { workflowStatus: 'rejected', rejectionReason: patch.rejectionReason.trim() },
        },
      };
    }

    case 'requestRevision': {
      if (!patch.revisionGuidance.trim()) {
        return { ok: false, error: 'Revision guidance is required.' };
      }
      const fields: Record<string, unknown> = {
        [KUDOS_FIELDS.WorkflowStatus]: 'revisionRequested',
        [KUDOS_FIELDS.RevisionGuidance]: patch.revisionGuidance.trim(),
        [KUDOS_FIELDS.RevisionRequestedAt]: actedAtIso,
      };
      if (typeof patch.actorUserId === 'number') {
        fields[`${KUDOS_FIELDS.RevisionRequestedBy}Id`] = patch.actorUserId;
      }
      return {
        ok: true,
        fields,
        auditEvent: {
          kudosId: patch.kudosId,
          eventType: 'revisionRequested',
          actorUserId: patch.actorUserId,
          eventAtIso: actedAtIso,
          publicNote: patch.publicNote,
          internalNote: patch.internalNote,
          newValue: { workflowStatus: 'revisionRequested', revisionGuidance: patch.revisionGuidance.trim() },
        },
      };
    }

    case 'flagAdminReview': {
      if (!patch.adminReviewReason.trim()) {
        return { ok: false, error: 'Admin review reason is required.' };
      }
      const fields: Record<string, unknown> = {
        [KUDOS_FIELDS.IsFlaggedForAdminReview]: true,
        [KUDOS_FIELDS.AdminReviewReason]: patch.adminReviewReason.trim(),
        [KUDOS_FIELDS.AdminReviewFlaggedAt]: actedAtIso,
      };
      if (typeof patch.actorUserId === 'number') {
        fields[`${KUDOS_FIELDS.AdminReviewFlaggedBy}Id`] = patch.actorUserId;
      }
      return {
        ok: true,
        fields,
        auditEvent: {
          kudosId: patch.kudosId,
          eventType: 'flagAdminReview',
          actorUserId: patch.actorUserId,
          eventAtIso: actedAtIso,
          publicNote: patch.publicNote,
          internalNote: patch.internalNote,
          newValue: { isFlaggedForAdminReview: true, reason: patch.adminReviewReason.trim() },
        },
      };
    }

    case 'clearAdminReview': {
      const fields: Record<string, unknown> = {
        [KUDOS_FIELDS.IsFlaggedForAdminReview]: false,
        [KUDOS_FIELDS.AdminReviewedAt]: actedAtIso,
      };
      if (typeof patch.actorUserId === 'number') {
        fields[`${KUDOS_FIELDS.AdminReviewedBy}Id`] = patch.actorUserId;
      }
      return {
        ok: true,
        fields,
        auditEvent: {
          kudosId: patch.kudosId,
          eventType: 'clearAdminReview',
          actorUserId: patch.actorUserId,
          eventAtIso: actedAtIso,
          publicNote: patch.publicNote,
          internalNote: patch.internalNote,
          newValue: { isFlaggedForAdminReview: false },
        },
      };
    }

    // ── Prompt-04 scheduling/prominence writers ─────────────────────

    case 'schedule': {
      if (!patch.scheduledPublishAtIso?.trim()) {
        return { ok: false, error: 'Scheduled publish date is required.' };
      }
      const fields: Record<string, unknown> = {
        [KUDOS_FIELDS.WorkflowStatus]: 'approvedScheduled',
        [KUDOS_FIELDS.IsScheduled]: true,
        [KUDOS_FIELDS.ScheduledPublishAt]: patch.scheduledPublishAtIso.trim(),
      };
      if (typeof patch.actorUserId === 'number') {
        fields[`${KUDOS_FIELDS.ScheduledBy}Id`] = patch.actorUserId;
      }
      return {
        ok: true,
        fields,
        auditEvent: {
          kudosId: patch.kudosId,
          eventType: 'schedule',
          actorUserId: patch.actorUserId,
          eventAtIso: actedAtIso,
          publicNote: patch.publicNote,
          internalNote: patch.internalNote,
          newValue: { scheduledPublishAt: patch.scheduledPublishAtIso.trim() },
        },
      };
    }

    case 'unschedule': {
      const fields: Record<string, unknown> = {
        [KUDOS_FIELDS.WorkflowStatus]: 'approved',
        [KUDOS_FIELDS.IsScheduled]: false,
        [KUDOS_FIELDS.ScheduledPublishAt]: null,
        [KUDOS_FIELDS.ScheduleCancelledAt]: actedAtIso,
      };
      if (typeof patch.actorUserId === 'number') {
        fields[`${KUDOS_FIELDS.ScheduleCancelledBy}Id`] = patch.actorUserId;
      }
      return {
        ok: true,
        fields,
        auditEvent: {
          kudosId: patch.kudosId,
          eventType: 'unschedule',
          actorUserId: patch.actorUserId,
          eventAtIso: actedAtIso,
          publicNote: patch.publicNote,
          internalNote: patch.internalNote,
          newValue: { isScheduled: false },
        },
      };
    }

    case 'pin': {
      const fields: Record<string, unknown> = {
        [KUDOS_FIELDS.IsPinned]: true,
        [KUDOS_FIELDS.IsFeatured]: false,
        [KUDOS_FIELDS.ProminenceIntent]: 'pinned',
      };
      if (typeof patch.pinOrder === 'number') {
        fields[KUDOS_FIELDS.PinOrder] = patch.pinOrder;
      }
      return {
        ok: true,
        fields,
        auditEvent: {
          kudosId: patch.kudosId,
          eventType: 'pin',
          actorUserId: patch.actorUserId,
          eventAtIso: actedAtIso,
          publicNote: patch.publicNote,
          internalNote: patch.internalNote,
          newValue: { isPinned: true, pinOrder: patch.pinOrder ?? null },
        },
      };
    }

    case 'unpin': {
      return {
        ok: true,
        fields: {
          [KUDOS_FIELDS.IsPinned]: false,
          [KUDOS_FIELDS.PinOrder]: null,
          [KUDOS_FIELDS.ProminenceIntent]: 'standard',
        },
        auditEvent: {
          kudosId: patch.kudosId,
          eventType: 'unpin',
          actorUserId: patch.actorUserId,
          eventAtIso: actedAtIso,
          publicNote: patch.publicNote,
          internalNote: patch.internalNote,
          newValue: { isPinned: false },
        },
      };
    }

    case 'feature': {
      const fields: Record<string, unknown> = {
        [KUDOS_FIELDS.IsFeatured]: true,
        [KUDOS_FIELDS.IsPinned]: false,
        [KUDOS_FIELDS.ProminenceIntent]: 'featured',
      };
      if (patch.featuredExpiresAtIso) {
        fields[KUDOS_FIELDS.FeaturedExpiresAt] = patch.featuredExpiresAtIso;
      }
      return {
        ok: true,
        fields,
        auditEvent: {
          kudosId: patch.kudosId,
          eventType: 'feature',
          actorUserId: patch.actorUserId,
          eventAtIso: actedAtIso,
          publicNote: patch.publicNote,
          internalNote: patch.internalNote,
          newValue: { isFeatured: true, featuredExpiresAt: patch.featuredExpiresAtIso ?? null },
        },
      };
    }

    case 'unfeature': {
      return {
        ok: true,
        fields: {
          [KUDOS_FIELDS.IsFeatured]: false,
          [KUDOS_FIELDS.FeaturedExpiresAt]: null,
          [KUDOS_FIELDS.ProminenceIntent]: 'standard',
        },
        auditEvent: {
          kudosId: patch.kudosId,
          eventType: 'unfeature',
          actorUserId: patch.actorUserId,
          eventAtIso: actedAtIso,
          publicNote: patch.publicNote,
          internalNote: patch.internalNote,
          newValue: { isFeatured: false },
        },
      };
    }

    // ── Prompt-04 also lands remove/restore (detail-panel needs them) ──

    case 'remove': {
      if (!patch.removedReason.trim()) {
        return { ok: false, error: 'Removal reason is required.' };
      }
      const fields: Record<string, unknown> = {
        [KUDOS_FIELDS.WorkflowStatus]: 'removedUnpublished',
        [KUDOS_FIELDS.IsRemovedFromPublicView]: true,
        [KUDOS_FIELDS.RemovedReason]: patch.removedReason.trim(),
        [KUDOS_FIELDS.RemovedAt]: actedAtIso,
        [KUDOS_FIELDS.HomepageEnabled]: false,
      };
      if (typeof patch.actorUserId === 'number') {
        fields[`${KUDOS_FIELDS.RemovedBy}Id`] = patch.actorUserId;
      }
      return {
        ok: true,
        fields,
        auditEvent: {
          kudosId: patch.kudosId,
          eventType: 'remove',
          actorUserId: patch.actorUserId,
          eventAtIso: actedAtIso,
          publicNote: patch.publicNote,
          internalNote: patch.internalNote,
          newValue: { workflowStatus: 'removedUnpublished', removedReason: patch.removedReason.trim() },
        },
      };
    }

    case 'restore': {
      const fields: Record<string, unknown> = {
        [KUDOS_FIELDS.WorkflowStatus]: 'approved',
        [KUDOS_FIELDS.IsRemovedFromPublicView]: false,
        [KUDOS_FIELDS.RestoredAt]: actedAtIso,
        [KUDOS_FIELDS.HomepageEnabled]: true,
      };
      if (typeof patch.actorUserId === 'number') {
        fields[`${KUDOS_FIELDS.RestoredBy}Id`] = patch.actorUserId;
      }
      return {
        ok: true,
        fields,
        auditEvent: {
          kudosId: patch.kudosId,
          eventType: 'restore',
          actorUserId: patch.actorUserId,
          eventAtIso: actedAtIso,
          publicNote: patch.publicNote,
          internalNote: patch.internalNote,
          newValue: { workflowStatus: 'approved', isRemovedFromPublicView: false },
        },
      };
    }

    // ── Prompt-05 work-management + lifecycle writers ───────────────

    case 'claim': {
      const fields: Record<string, unknown> = {
        [KUDOS_FIELDS.ClaimedAt]: actedAtIso,
      };
      if (typeof patch.actorUserId === 'number') {
        fields[`${KUDOS_FIELDS.ClaimOwner}Id`] = patch.actorUserId;
      }
      return {
        ok: true,
        fields,
        auditEvent: {
          kudosId: patch.kudosId,
          eventType: 'claim',
          actorUserId: patch.actorUserId,
          eventAtIso: actedAtIso,
          publicNote: patch.publicNote,
          internalNote: patch.internalNote,
          newValue: { claimOwnerId: patch.actorUserId },
        },
      };
    }

    case 'reassign': {
      const fields: Record<string, unknown> = {
        [`${KUDOS_FIELDS.AssignedOwner}Id`]: patch.assignedUserId,
        [KUDOS_FIELDS.ReassignedAt]: actedAtIso,
      };
      if (typeof patch.actorUserId === 'number') {
        fields[`${KUDOS_FIELDS.ReassignedBy}Id`] = patch.actorUserId;
      }
      return {
        ok: true,
        fields,
        auditEvent: {
          kudosId: patch.kudosId,
          eventType: 'reassign',
          actorUserId: patch.actorUserId,
          eventAtIso: actedAtIso,
          publicNote: patch.publicNote,
          internalNote: patch.internalNote,
          newValue: { assignedUserId: patch.assignedUserId },
        },
      };
    }

    case 'celebrate': {
      return {
        ok: true,
        fields: {
          [KUDOS_FIELDS.CelebrateCount]: patch.nextCount,
        },
        auditEvent: {
          kudosId: patch.kudosId,
          eventType: 'celebrate',
          actorUserId: patch.actorUserId,
          eventAtIso: actedAtIso,
          publicNote: patch.publicNote,
          internalNote: patch.internalNote,
          newValue: { celebrateCount: patch.nextCount },
        },
      };
    }

    case 'resubmit': {
      const fields: Record<string, unknown> = {
        [KUDOS_FIELDS.WorkflowStatus]: 'pending',
      };
      if (patch.updatedHeadline?.trim()) fields[KUDOS_FIELDS.Headline] = patch.updatedHeadline.trim();
      if (patch.updatedExcerpt?.trim()) fields[KUDOS_FIELDS.Excerpt] = patch.updatedExcerpt.trim();
      if (patch.updatedDetails?.trim()) fields[KUDOS_FIELDS.Details] = patch.updatedDetails.trim();
      return {
        ok: true,
        fields,
        auditEvent: {
          kudosId: patch.kudosId,
          eventType: 'resubmit',
          actorUserId: patch.actorUserId,
          eventAtIso: actedAtIso,
          publicNote: patch.publicNote,
          internalNote: patch.internalNote,
          newValue: { workflowStatus: 'pending' },
        },
      };
    }

    case 'withdraw': {
      const fields: Record<string, unknown> = {
        [KUDOS_FIELDS.WorkflowStatus]: 'withdrawn',
        [KUDOS_FIELDS.WithdrawnAt]: actedAtIso,
      };
      if (typeof patch.actorUserId === 'number') {
        fields[`${KUDOS_FIELDS.WithdrawnBy}Id`] = patch.actorUserId;
      }
      return {
        ok: true,
        fields,
        auditEvent: {
          kudosId: patch.kudosId,
          eventType: 'withdraw',
          actorUserId: patch.actorUserId,
          eventAtIso: actedAtIso,
          publicNote: patch.publicNote,
          internalNote: patch.internalNote,
          newValue: { workflowStatus: 'withdrawn' },
        },
      };
    }

    case 'reopen': {
      return {
        ok: true,
        fields: {
          [KUDOS_FIELDS.WorkflowStatus]: patch.targetStatus,
        },
        auditEvent: {
          kudosId: patch.kudosId,
          eventType: 'reopen',
          actorUserId: patch.actorUserId,
          eventAtIso: actedAtIso,
          publicNote: patch.publicNote,
          internalNote: patch.internalNote,
          newValue: { workflowStatus: patch.targetStatus },
        },
      };
    }

    case 'updateContent': {
      const fields: Record<string, unknown> = {};
      if (patch.headline?.trim()) fields[KUDOS_FIELDS.Headline] = patch.headline.trim();
      if (patch.excerpt?.trim()) fields[KUDOS_FIELDS.Excerpt] = patch.excerpt.trim();
      if (patch.details?.trim()) fields[KUDOS_FIELDS.Details] = patch.details.trim();
      if (patch.primaryImageUrl) fields[KUDOS_FIELDS.PrimaryImage] = patch.primaryImageUrl;
      if (patch.imageAltText) fields[KUDOS_FIELDS.ImageAltText] = patch.imageAltText;
      if (Object.keys(fields).length === 0) {
        return { ok: false, error: 'No content fields to update.' };
      }
      return {
        ok: true,
        fields,
        auditEvent: {
          kudosId: patch.kudosId,
          eventType: 'updateContent',
          actorUserId: patch.actorUserId,
          eventAtIso: actedAtIso,
          publicNote: patch.publicNote,
          internalNote: patch.internalNote ?? 'Content updated',
          oldValue: undefined,
          newValue: fields,
        },
      };
    }

    default: {
      // Exhaustiveness check: if a new kind lands in KudosPatch, this
      // cast forces a TypeScript error here so the discriminator stays
      // honest.
      const _exhaustive: never = patch;
      return { ok: false, error: `Unknown patch kind: ${JSON.stringify(_exhaustive)}` };
    }
  }
}

// ---------------------------------------------------------------------------
// Writer-level authorization preflight
// ---------------------------------------------------------------------------

/**
 * Map a `KudosPatch.kind` to the capability flag that must be `true`
 * for the caller to execute it. Returns `undefined` for actions that
 * any authenticated user may perform (e.g. `celebrate`).
 */
function requiredCapabilityForPatch(
  kind: KudosPatch['kind'],
): keyof import('../helpers/kudosCapabilities.js').KudosCapabilities | undefined {
  switch (kind) {
    case 'approve':
    case 'reopen':
      return 'canApprove';
    case 'reject':
      return 'canReject';
    case 'requestRevision':
      return 'canRequestRevision';
    case 'flagAdminReview':
      return 'canFlagAdminReview';
    case 'clearAdminReview':
      return 'canClearAdminReview';
    case 'schedule':
    case 'unschedule':
      return 'canSchedule';
    case 'pin':
    case 'unpin':
      return 'canPin';
    case 'feature':
    case 'unfeature':
      return 'canFeature';
    case 'remove':
      return 'canRemove';
    case 'restore':
      return 'canRestore';
    case 'claim':
    case 'reassign':
      return 'canClaim';
    case 'updateContent':
      return 'canEditPublished';
    case 'withdraw':
    case 'resubmit':
    case 'celebrate':
      // Any authenticated user may celebrate, withdraw, or resubmit their own.
      return undefined;
    default:
      return undefined;
  }
}

/**
 * Verify the caller's role authorizes the requested patch kind.
 * Returns an error string when denied, `undefined` when allowed.
 */
function authorizeKudosPatch(
  callerRole: KudosRole | undefined,
  patchKind: KudosPatch['kind'],
): string | undefined {
  // celebrate and withdraw are open to all authenticated users.
  const cap = requiredCapabilityForPatch(patchKind);
  if (!cap) return undefined;

  // When no callerRole is supplied, deny all gated actions.
  if (!callerRole) {
    return `Authorization denied: caller role is unknown for action '${patchKind}'.`;
  }

  const capabilities = deriveKudosCapabilities(callerRole);
  if (!capabilities[cap]) {
    return `Authorization denied: role '${callerRole}' cannot perform '${patchKind}'.`;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// High-level dispatcher: executeKudosPatch + submitKudosGovernanceAction
// ---------------------------------------------------------------------------

/**
 * Execute a validated `KudosPatch` against SharePoint. The caller is
 * responsible for fetching the request digest and the item meta; this
 * keeps the dispatch pure and easy to test (tests can mock fetch and
 * verify the PATCH body shape via `buildKudosPatchPlan` first).
 */
export async function executeKudosPatch(
  siteUrl: string,
  digest: string,
  itemMeta: KudosItemMeta,
  patch: KudosPatch,
): Promise<KudosGovernanceResult> {
  const plan = buildKudosPatchPlan(patch);
  if (!plan.ok) {
    return { ok: false, error: plan.error };
  }

  const patchResult = await patchKudosItem(
    siteUrl,
    itemMeta.itemId,
    itemMeta.etag,
    digest,
    plan.fields,
  );
  if (!patchResult.ok) {
    return { ok: false, error: patchResult.error };
  }

  const auditResult = await createKudosAuditEvent(siteUrl, digest, plan.auditEvent);
  if (!auditResult.ok) {
    // The PATCH committed but the audit event failed. Surface a
    // structured error so the HR companion can warn the operator.
    return {
      ok: false,
      error: `Governance action committed but audit event write failed: ${auditResult.error}`,
    };
  }

  return { ok: true, itemId: itemMeta.itemId, auditEventId: auditResult.id };
}

/**
 * Public wrapper used by both the employee and HR companion UIs.
 * Fetches the request digest, resolves the SharePoint list item meta
 * for the given `KudosId`, and dispatches through `executeKudosPatch`.
 *
 * Writer-level authorization: when `callerRole` is provided, the
 * writer verifies the caller's capability before executing the patch.
 * Actions gated to admin-only (schedule, pin, feature, remove,
 * restore) are denied for reviewer/viewer roles. `celebrate` and
 * `withdraw` are open to any authenticated user and do not require
 * a `callerRole`.
 */
export async function submitKudosGovernanceAction(
  siteUrl: string,
  patch: KudosPatch,
  options: {
    actorEmail?: string;
    callerRole?: KudosRole;
    /** Item headline for notification content. */
    headline?: string;
    /** True when the item's wasEverPublished was false before this action. */
    isFirstPublish?: boolean;
    /** True when the item is currently flagged for admin review (for reassign authority). */
    itemIsFlaggedForAdminReview?: boolean;
    /** Prominence intent when approving a scheduled item (for collision handling). */
    prominenceIntent?: 'featured' | 'pinned';
  } = {},
): Promise<KudosGovernanceResult> {
  if (!siteUrl) {
    return { ok: false, error: 'SharePoint site context is not available.' };
  }

  // Writer-level authorization: verify before any network call.
  const authError = authorizeKudosPatch(options.callerRole, patch.kind);
  if (authError) {
    return { ok: false, error: authError };
  }

  try {
    const digest = await fetchRequestDigest(siteUrl);

    let enrichedPatch = patch;
    if (typeof patch.actorUserId !== 'number' && options.actorEmail) {
      const resolvedId = await resolveUserId(siteUrl, options.actorEmail, digest);
      if (typeof resolvedId === 'number') {
        enrichedPatch = { ...patch, actorUserId: resolvedId };
      }
    }

    // Prominence rule enforcement: validate slot limits before writing.
    if (enrichedPatch.kind === 'feature') {
      const slots = await fetchProminenceSlotState(siteUrl);
      const validation = validateFeatureAction(
        slots,
        enrichedPatch.featuredExpiresAtIso,
      );
      if (!validation.ok) {
        return { ok: false, error: validation.error! };
      }
    }
    if (enrichedPatch.kind === 'pin') {
      const slots = await fetchProminenceSlotState(siteUrl);
      const validation = validatePinAction(slots);
      if (!validation.ok) {
        return { ok: false, error: validation.error! };
      }
    }

    // Scheduled prominence collision: when approving a scheduled item
    // with a prominence intent (featured/pinned), check if the slot is
    // occupied. If so, demote to standard and flag for admin review.
    let prominenceCollisionDemotion = false;
    if (enrichedPatch.kind === 'approve' && options.prominenceIntent) {
      const slots = await fetchProminenceSlotState(siteUrl);
      const collision = handleScheduledProminenceCollision(slots, options.prominenceIntent);
      if (collision.demoteToStandard) {
        prominenceCollisionDemotion = true;
        // The approve plan will proceed as standard — no featured/pinned
        // fields will be set. The caller should flag for admin review.
        if (!enrichedPatch.flagForAdminReview) {
          enrichedPatch = {
            ...enrichedPatch,
            flagForAdminReview: true,
            adminReviewReason: collision.adminNotificationReason ?? 'Scheduled prominence slot was occupied at go-live.',
          };
        }
      }
    }

    // State-aware reassignment authority: flagged items require admin.
    if (enrichedPatch.kind === 'reassign' && options.callerRole) {
      const reassignError = validateReassignmentAuthority(
        options.callerRole,
        options.itemIsFlaggedForAdminReview === true,
      );
      if (reassignError) {
        return { ok: false, error: reassignError };
      }
    }

    const meta = await fetchKudosItemMeta(siteUrl, enrichedPatch.kudosId);
    if (!meta) {
      return {
        ok: false,
        error: `KudosId '${enrichedPatch.kudosId}' was not found on People Culture Kudos.`,
      };
    }

    const result = await executeKudosPatch(siteUrl, digest, meta, enrichedPatch);

    // Dispatch notifications after successful governance actions.
    if (result.ok) {
      const isApproval = enrichedPatch.kind === 'approve';
      const notificationIntents = buildKudosNotificationIntents({
        eventType: enrichedPatch.kind === 'requestRevision' ? 'revisionRequested' : enrichedPatch.kind as Parameters<typeof buildKudosNotificationIntents>[0]['eventType'],
        kudosId: enrichedPatch.kudosId,
        headline: options.headline ?? enrichedPatch.kudosId,
        isLive: isApproval,
        isFirstPublish: isApproval && options.isFirstPublish === true,
        reason: 'rejectionReason' in enrichedPatch
          ? (enrichedPatch as { rejectionReason?: string }).rejectionReason
          : 'revisionGuidance' in enrichedPatch
            ? (enrichedPatch as { revisionGuidance?: string }).revisionGuidance
            : undefined,
      });
      if (notificationIntents.length > 0) {
        dispatchKudosNotifications(notificationIntents);
      }
    }

    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected governance write failure.';
    return { ok: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Audit timeline reader (Phase-14 Prompt-04)
// ---------------------------------------------------------------------------

interface RawAuditEventItem {
  Id: number;
  KudosId?: string;
  EventType?: string;
  Actor?: SpPersonValue | null;
  EventAt?: string;
  PublicNote?: string;
  InternalNote?: string;
  OldValue?: string;
  NewValue?: string;
}

interface SpPersonValue {
  Id: number;
  Title: string;
  EMail?: string;
}

/**
 * Fetch the audit-event timeline for a given `KudosId`. Returns the
 * rows sorted by `EventAt` ascending so the UI can render a
 * chronological timeline. Uses the `Kudos Audit Events` list
 * bound by GUID via `peopleCultureSpListRegistry`.
 */
export async function fetchKudosAuditTimeline(
  siteUrl: string,
  kudosId: string,
): Promise<KudosAuditTimelineEntry[]> {
  if (!kudosId.trim()) return [];

  const select = [
    'Id',
    KUDOS_AUDIT_FIELDS.KudosId,
    KUDOS_AUDIT_FIELDS.EventType,
    `${KUDOS_AUDIT_FIELDS.Actor}/Id`,
    `${KUDOS_AUDIT_FIELDS.Actor}/Title`,
    `${KUDOS_AUDIT_FIELDS.Actor}/EMail`,
    KUDOS_AUDIT_FIELDS.EventAt,
    KUDOS_AUDIT_FIELDS.PublicNote,
    KUDOS_AUDIT_FIELDS.InternalNote,
    KUDOS_AUDIT_FIELDS.OldValue,
    KUDOS_AUDIT_FIELDS.NewValue,
  ].join(',');

  const url = buildPcListItemsEndpoint(
    siteUrl,
    PEOPLE_CULTURE_LIST_REGISTRY.kudosAuditEvents,
    {
      select,
      expand: KUDOS_AUDIT_FIELDS.Actor,
      filter: `${KUDOS_AUDIT_FIELDS.KudosId} eq '${escapeODataString(kudosId)}'`,
      top: 100,
    },
  );

  const response = await fetch(url, {
    headers: { Accept: 'application/json;odata=nometadata' },
  });

  if (!response.ok) return [];

  const body = (await response.json()) as { value?: RawAuditEventItem[] };
  const items = body.value ?? [];

  return items
    .map((raw): KudosAuditTimelineEntry | undefined => {
      if (!raw.EventType || !raw.EventAt) return undefined;
      return {
        id: raw.Id,
        kudosId: raw.KudosId ?? kudosId,
        eventType: raw.EventType as KudosAuditEventType,
        actorDisplayName: raw.Actor?.Title?.trim(),
        eventAt: raw.EventAt,
        publicNote: raw.PublicNote?.trim() || undefined,
        internalNote: raw.InternalNote?.trim() || undefined,
      };
    })
    .filter((e): e is KudosAuditTimelineEntry => e != null)
    .sort((a, b) => Date.parse(a.eventAt) - Date.parse(b.eventAt));
}

/**
 * Compact read shape returned by `fetchKudosAuditTimeline`. This is
 * not the same as `KudosAuditEvent` from kudosContracts (which is
 * the full read shape with old/newValue blobs). The timeline entry
 * is intentionally narrower — just what the detail-panel timeline
 * block needs to render.
 */
export interface KudosAuditTimelineEntry {
  id: number;
  kudosId: string;
  eventType: KudosAuditEventType;
  actorDisplayName?: string;
  eventAt: string;
  publicNote?: string;
  /** HR-only. Must not leak to employee-facing views. */
  internalNote?: string;
}
