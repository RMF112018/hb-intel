/**
 * SharePoint write seam for People & Culture Kudos submissions.
 *
 * Creates new items in the live `People Culture Kudos` list via the
 * SharePoint REST API. All submissions land in the
 * `WorkflowStatus: 'pending'` state, with `HomepageEnabled=false` and
 * `CurrentVisibilityMode: 'internalOnly'` so they require HR review
 * before appearing on the public homepage surface.
 *
 * The SharePoint list does NOT have moderation enabled, so
 * `_ModerationStatus` is never written — `WorkflowStatus` is the
 * authoritative publish-state signal.
 *
 * Binds by list GUID via `peopleCultureSpListRegistry` so title
 * drift cannot cross-bind the writer to the wrong list.
 */
import { getKudosListHostUrl } from './spContext.js';
import { invalidatePeopleCultureCache } from './usePeopleCultureData.js';
import {
  buildPcListItemsEndpoint,
  PEOPLE_CULTURE_LIST_REGISTRY,
} from './peopleCultureSpListRegistry.js';
import {
  fetchRequestDigest as platformFetchRequestDigest,
  ensureUserByEmail as platformEnsureUserByEmail,
} from '@hbc/sharepoint-platform';
import type { KudosComposerDraft } from './useKudosComposer.js';

/* ── List metadata ──────────────────────────────────────────────── */

/**
 * @deprecated Kept only for callers that still import the string.
 * The submission writer binds by list ID via
 * `PEOPLE_CULTURE_LIST_REGISTRY.kudos`.
 */
export const SP_KUDOS_LIST_TITLE = PEOPLE_CULTURE_LIST_REGISTRY.kudos.title;

/* ── Types ──────────────────────────────────────────────────────── */

export interface KudosSubmissionOptions {
  /** Current user display name from SPFx context. */
  submitterDisplayName?: string;
  /** Current user email from SPFx context. */
  submitterEmail?: string;
}

export type KudosSubmissionResult =
  | { ok: true; itemId: number }
  | { ok: false; error: string };

/* ── Helpers ────────────────────────────────────────────────────── */

/**
 * Generate a deterministic, timestamp-safe unique ID for new submissions.
 * Format: `kudos-<timestamp>-<random>` to avoid collisions.
 */
function generateKudosId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `kudos-${ts}-${rand}`;
}

/**
 * Fetch the SharePoint request digest required for write operations.
 *
 * Phase 01 (synchronous-weaving-thacker): delegated to the platform
 * package. Re-exported under the same name so callers are unchanged
 * until the rename phase.
 */
export async function fetchRequestDigest(siteUrl: string): Promise<string> {
  return platformFetchRequestDigest(siteUrl);
}

/**
 * Attempt to resolve a SharePoint user ID from an email address
 * using the ensureUser endpoint. Returns undefined if resolution fails.
 *
 * Phase 01: delegated to the platform package's `ensureUserByEmail`.
 */
export async function resolveUserId(siteUrl: string, email: string, digest: string): Promise<number | undefined> {
  return platformEnsureUserByEmail(siteUrl, email, digest);
}

/* ── Payload construction ──────────────────────────────────────── */

/**
 * Kudos list item payload. Every field name here is a live
 * InternalName verified against
 * `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/people-culture-kudos-list-schema.normalized.json`.
 *
 * Fields intentionally set on every submission:
 *   - `KudosId`            — stable app-side GUID
 *   - `Headline`, `Excerpt`— required editorial fields
 *   - `Details`            — optional long-form body
 *   - `SubmittedDate`      — required editorial submission timestamp
 *   - `SubmittedById`      — resolved SharePoint user id for the
 *                            `SubmittedBy` Person field
 *   - `WorkflowStatus`     — authoritative publish state. New drafts
 *                            land in `pending`.
 *   - `WasEverPublished`   — required Boolean. Always `false` on create.
 *   - `ProminenceIntent`   — Choice. Default `standard` on create.
 *   - `HomepageEnabled`    — `false` until HR explicitly promotes.
 *   - `IsPinned`           — `false` until HR explicitly pins.
 *   - `IsFeatured`         — `false` until HR explicitly features.
 *   - `IsScheduled`        — `false` until HR schedules a publish time.
 *   - `CelebrateCount`     — initialized to 0.
 *
 * Typed recipient handling:
 *   - `IndividualRecipientsId` (UserMulti) is resolved via
 *     `ensureUser` when the typed composer passes individual emails.
 *     Unresolvable emails are collected in `ModeratorNotes` for HR.
 *   - `TeamRecipients` / `DepartmentRecipients` / `ProjectGroupRecipients`
 *     are Taxonomy fields requiring term-store resolution (not yet
 *     wired). Labels are captured in `ModeratorNotes` for HR review.
 *
 * Not set on submission:
 *   - `CurrentVisibilityMode` — defaults to `internalOnly` on the
 *     list itself; HR decides when to promote.
 *   - text-mode submissions continue to skip the four recipient
 *     fields entirely so the transitional merged People & Culture
 *     webpart keeps its existing behavior.
 */
interface KudosListItemPayload {
  /** OData verbose type annotation — required for SharePoint to
   *  correctly deserialize collection-typed fields. */
  __metadata: { type: string };
  KudosId: string;
  Headline: string;
  Excerpt: string;
  Details?: string;
  ModeratorNotes?: string;
  SubmittedDate: string;
  SubmittedById?: number;
  WorkflowStatus: 'pending';
  WasEverPublished: boolean;
  ProminenceIntent: 'standard';
  HomepageEnabled: boolean;
  IsPinned: boolean;
  IsFeatured: boolean;
  IsScheduled: boolean;
  CelebrateCount: number;
  /** SharePoint UserMulti write convention (odata=verbose):
   *  `{FieldName}Id: { __metadata: { type }, results: [ids] }` */
  IndividualRecipientsId?: { __metadata: { type: string }; results: number[] };
}

export interface KudosTypedRecipientResolution {
  /** SharePoint user ids successfully resolved via ensureUser. */
  resolvedIndividualUserIds: number[];
  /** Emails that did not resolve (surfaced in ModeratorNotes for HR). */
  unresolvedIndividualEmails: string[];
  /** Team taxonomy labels captured for HR review. */
  teamLabels: string[];
  /** Department taxonomy labels captured for HR review. */
  departmentLabels: string[];
  /** Project-group taxonomy labels captured for HR review. */
  projectGroupLabels: string[];
}

function buildModeratorNotesFromTyped(resolution: KudosTypedRecipientResolution): string | undefined {
  const parts: string[] = [];
  if (resolution.unresolvedIndividualEmails.length > 0) {
    parts.push(
      `Unresolved individual recipients: ${resolution.unresolvedIndividualEmails.join(', ')}`,
    );
  }
  if (resolution.teamLabels.length > 0) {
    parts.push(`Suggested teams: ${resolution.teamLabels.join(', ')}`);
  }
  if (resolution.departmentLabels.length > 0) {
    parts.push(`Suggested departments: ${resolution.departmentLabels.join(', ')}`);
  }
  if (resolution.projectGroupLabels.length > 0) {
    parts.push(`Suggested project groups: ${resolution.projectGroupLabels.join(', ')}`);
  }
  return parts.length > 0 ? parts.join(' | ') : undefined;
}

/**
 * Resolve the typed recipient buckets from the composer into the shape
 * the SharePoint writer needs. Exposed for tests.
 */
export async function resolveTypedRecipientBuckets(
  siteUrl: string,
  buckets: {
    individualEmails: string[];
    teamLabels: string[];
    departmentLabels: string[];
    projectGroupLabels: string[];
  },
  digest: string,
): Promise<KudosTypedRecipientResolution> {
  const resolvedIndividualUserIds: number[] = [];
  const unresolvedIndividualEmails: string[] = [];

  for (const rawEmail of buckets.individualEmails) {
    const email = rawEmail.trim();
    if (!email) continue;
    const id = await resolveUserId(siteUrl, email, digest);
    if (typeof id === 'number') {
      resolvedIndividualUserIds.push(id);
    } else {
      unresolvedIndividualEmails.push(email);
    }
  }

  return {
    resolvedIndividualUserIds,
    unresolvedIndividualEmails,
    teamLabels: buckets.teamLabels.map((v) => v.trim()).filter(Boolean),
    departmentLabels: buckets.departmentLabels.map((v) => v.trim()).filter(Boolean),
    projectGroupLabels: buckets.projectGroupLabels.map((v) => v.trim()).filter(Boolean),
  };
}

/**
 * OData verbose type name for the People Culture Kudos list.
 * Format: `SP.Data.{ListInternalName}ListItem` with spaces encoded
 * as `_x0020_`. Matches the list title "People Culture Kudos".
 */
const SP_KUDOS_LIST_ITEM_TYPE =
  'SP.Data.People_x0020_Culture_x0020_KudosListItem';

function buildPayload(
  draft: KudosComposerDraft,
  submitterUserId: number | undefined,
  typedResolution: KudosTypedRecipientResolution | undefined,
): KudosListItemPayload {
  const payload: KudosListItemPayload = {
    __metadata: { type: SP_KUDOS_LIST_ITEM_TYPE },
    KudosId: generateKudosId(),
    Headline: draft.headline.trim(),
    Excerpt: draft.excerpt.trim(),
    SubmittedDate: new Date().toISOString(),
    // Authoritative publish-state defaults — HR review required
    // before this item goes live. `WorkflowStatus` is the single
    // source of truth; `_ModerationStatus` is not written.
    WorkflowStatus: 'pending',
    WasEverPublished: false,
    ProminenceIntent: 'standard',
    HomepageEnabled: false,
    IsPinned: false,
    IsFeatured: false,
    IsScheduled: false,
    CelebrateCount: 0,
  };

  if (draft.details.trim()) {
    payload.Details = draft.details.trim();
  }

  // SubmittedBy is a Person field — set via the Id suffix convention.
  if (submitterUserId) {
    payload.SubmittedById = submitterUserId;
  }

  if (typedResolution) {
    // IndividualRecipients is a UserMulti field. odata=verbose
    // requires Collection(Edm.Int32) __metadata on the results
    // wrapper so SharePoint correctly deserializes the array.
    if (typedResolution.resolvedIndividualUserIds.length > 0) {
      payload.IndividualRecipientsId = {
        __metadata: { type: 'Collection(Edm.Int32)' },
        results: typedResolution.resolvedIndividualUserIds,
      };
    }

    // Taxonomy fields (TeamRecipients, DepartmentRecipients,
    // ProjectGroupRecipients) require term-store resolution that
    // is not yet wired. Capture labels in ModeratorNotes so HR
    // can see what the submitter intended. Direct writes to managed
    // metadata columns require the hidden Note field and WssId
    // resolution — deferred until taxonomy adapter lands.
    const notes: string[] = [];

    if (typedResolution.unresolvedIndividualEmails.length > 0) {
      notes.push(`Unresolved individual recipients: ${typedResolution.unresolvedIndividualEmails.join(', ')}`);
    }
    if (typedResolution.teamLabels.length > 0) {
      notes.push(`Teams: ${typedResolution.teamLabels.join(', ')}`);
    }
    if (typedResolution.departmentLabels.length > 0) {
      notes.push(`Departments: ${typedResolution.departmentLabels.join(', ')}`);
    }
    if (typedResolution.projectGroupLabels.length > 0) {
      notes.push(`Projects: ${typedResolution.projectGroupLabels.join(', ')}`);
    }

    if (notes.length > 0) {
      payload.ModeratorNotes = notes.join(' | ');
    }
  }

  return payload;
}

/* ── Public API ──────────────────────────────────────────────────── */

/**
 * Submit a Kudos draft to the live People Culture Kudos SharePoint list.
 *
 * Creates a new list item with moderation defaults. The submission
 * enters a pending state: HomepageEnabled=false, no approval dates,
 * no publish window. Moderators complete the review workflow.
 *
 * ### Recipient resolution
 *
 * When the typed composer mode is used (`recipientsMode: 'typed'`),
 * individual email addresses are resolved to SharePoint user IDs via
 * `resolveTypedRecipientBuckets` / `ensureUser`. Non-individual
 * buckets (team, department, project group) are written as taxonomy
 * label strings. Any non-empty combination of recipient buckets is
 * valid per Decision Lock §Recipient Model.
 *
 * The legacy text-mode path (`recipientNames` string) is retained for
 * backward compatibility with older callers but does not resolve
 * Person field values.
 *
 * Invalidates the shared People & Culture cache after successful
 * submission so consumers refetch fresh data.
 */
export async function submitKudosDraft(
  draft: KudosComposerDraft,
  options: KudosSubmissionOptions = {},
): Promise<KudosSubmissionResult> {
  // Validate list host URL (uses explicit override or falls back to current site)
  const siteUrl = getKudosListHostUrl();
  if (!siteUrl) {
    return { ok: false, error: 'SharePoint site context is not available. Kudos submission requires a SharePoint-hosted environment.' };
  }

  // Validate minimum required fields
  if (!draft.headline.trim()) {
    return { ok: false, error: 'Headline is required.' };
  }
  if (!draft.excerpt.trim()) {
    return { ok: false, error: 'Message is required.' };
  }

  // Recipient validation: typed buckets take precedence when present,
  // otherwise fall back to the legacy text field for merged webpart callers.
  // Any non-empty supported bucket combination is valid per the Decision Lock.
  const typedBuckets = draft.recipients;
  if (typedBuckets) {
    const hasAnyRecipient =
      (typedBuckets.individualEmails.length ?? 0) > 0 ||
      (typedBuckets.teamLabels.length ?? 0) > 0 ||
      (typedBuckets.departmentLabels.length ?? 0) > 0 ||
      (typedBuckets.projectGroupLabels.length ?? 0) > 0;
    if (!hasAnyRecipient) {
      return { ok: false, error: 'At least one recipient is required in any bucket.' };
    }
  } else if (!draft.recipientNames.trim()) {
    return { ok: false, error: 'At least one recipient is required.' };
  }

  try {
    // Get request digest for write operations
    const digest = await fetchRequestDigest(siteUrl);

    // Resolve current user ID for SubmittedBy person field
    let submitterUserId: number | undefined;
    if (options.submitterEmail) {
      submitterUserId = await resolveUserId(siteUrl, options.submitterEmail, digest);
    }

    // Resolve typed recipient buckets when the caller used the typed composer mode.
    let typedResolution: KudosTypedRecipientResolution | undefined;
    if (typedBuckets) {
      typedResolution = await resolveTypedRecipientBuckets(siteUrl, typedBuckets, digest);
    }

    // Build the list item payload
    const payload = buildPayload(draft, submitterUserId, typedResolution);

    // Create the list item — bind by list GUID so title drift cannot
    // cross-bind the writer to the wrong list.
    const url = buildPcListItemsEndpoint(
      siteUrl,
      PEOPLE_CULTURE_LIST_REGISTRY.kudos,
    );

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json;odata=nometadata',
        // odata=verbose is required for writes so SharePoint can
        // correctly deserialize collection-typed fields (UserMulti).
        // nometadata causes "StartObject" errors on { results: [] }.
        'Content-Type': 'application/json;odata=verbose',
        'X-RequestDigest': digest,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      // Log structured diagnostic detail for debugging but surface
      // a cleaner message to the end user.
      // eslint-disable-next-line no-console
      console.error(
        '[HB Kudos] Submission failed',
        { status: response.status, url, errorBody: errorBody.slice(0, 500) },
      );
      const userMessage =
        response.status === 400
          ? 'The submission was rejected by SharePoint. Please check your entries and try again.'
          : response.status === 403
            ? 'You do not have permission to submit kudos. Please contact your administrator.'
            : `Something went wrong (${response.status}). Please try again.`;
      return { ok: false, error: userMessage };
    }

    const created = (await response.json()) as { Id?: number; d?: { Id?: number } };
    // odata=verbose responses wrap the result in a `d` property.
    const itemId = created.Id ?? created.d?.Id;

    if (typeof itemId !== 'number') {
      return { ok: false, error: 'Item was created but the response did not include an item ID.' };
    }

    // Invalidate the shared People & Culture cache so the new
    // submission appears immediately in queue/archive views.
    invalidatePeopleCultureCache();

    return { ok: true, itemId };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred during submission.';
    return { ok: false, error: message };
  }
}
