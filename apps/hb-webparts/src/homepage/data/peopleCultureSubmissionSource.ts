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
import { getSiteUrl } from './spContext.js';
import {
  buildPcListItemsEndpoint,
  PEOPLE_CULTURE_LIST_REGISTRY,
} from './peopleCultureSpListRegistry.js';
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
 * The digest token authenticates POST/PATCH/DELETE requests against
 * the SharePoint REST API.
 */
export async function fetchRequestDigest(siteUrl: string): Promise<string> {
  const response = await fetch(`${siteUrl}/_api/contextinfo`, {
    method: 'POST',
    headers: {
      Accept: 'application/json;odata=nometadata',
      'Content-Type': 'application/json;odata=nometadata',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get request digest: ${response.status} ${response.statusText}`);
  }

  const body = (await response.json()) as { FormDigestValue?: string };
  if (!body.FormDigestValue) {
    throw new Error('Request digest not found in contextinfo response');
  }

  return body.FormDigestValue;
}

/**
 * Attempt to resolve a SharePoint user ID from an email address
 * using the ensureUser endpoint. Returns undefined if resolution fails.
 */
export async function resolveUserId(siteUrl: string, email: string, digest: string): Promise<number | undefined> {
  try {
    const response = await fetch(`${siteUrl}/_api/web/ensureuser('${encodeURIComponent(email)}')`, {
      method: 'POST',
      headers: {
        Accept: 'application/json;odata=nometadata',
        'Content-Type': 'application/json;odata=nometadata',
        'X-RequestDigest': digest,
      },
    });

    if (!response.ok) return undefined;

    const body = (await response.json()) as { Id?: number };
    return body.Id;
  } catch {
    return undefined;
  }
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
 *     are written directly as semicolon-delimited label strings.
 *
 * Not set on submission:
 *   - `CurrentVisibilityMode` — defaults to `internalOnly` on the
 *     list itself; HR decides when to promote.
 *   - text-mode submissions continue to skip the four recipient
 *     fields entirely so the transitional merged People & Culture
 *     webpart keeps its existing behavior.
 */
interface KudosListItemPayload {
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
  /** SharePoint UserMulti write convention: `{FieldName}Id: { results: [ids] }` */
  IndividualRecipientsId?: { results: number[] };
  /** Taxonomy text fields — semicolon-delimited labels. */
  TeamRecipients?: string;
  DepartmentRecipients?: string;
  ProjectGroupRecipients?: string;
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

function buildPayload(
  draft: KudosComposerDraft,
  submitterUserId: number | undefined,
  typedResolution: KudosTypedRecipientResolution | undefined,
): KudosListItemPayload {
  const payload: KudosListItemPayload = {
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

  // SubmittedBy is a Person field — set via the Id suffix convention
  if (submitterUserId) {
    payload.SubmittedById = submitterUserId;
  }

  if (typedResolution) {
    if (typedResolution.resolvedIndividualUserIds.length > 0) {
      payload.IndividualRecipientsId = { results: typedResolution.resolvedIndividualUserIds };
    }
    // Write taxonomy labels directly to their real fields.
    if (typedResolution.teamLabels.length > 0) {
      payload.TeamRecipients = typedResolution.teamLabels.join(';');
    }
    if (typedResolution.departmentLabels.length > 0) {
      payload.DepartmentRecipients = typedResolution.departmentLabels.join(';');
    }
    if (typedResolution.projectGroupLabels.length > 0) {
      payload.ProjectGroupRecipients = typedResolution.projectGroupLabels.join(';');
    }
    // ModeratorNotes now only captures unresolved individual emails.
    if (typedResolution.unresolvedIndividualEmails.length > 0) {
      payload.ModeratorNotes = `Unresolved individual recipients: ${typedResolution.unresolvedIndividualEmails.join(', ')}`;
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
 * ### Recipient field limitation
 *
 * The current composer accepts recipient names as free text (comma-
 * separated). SharePoint Person (multi) fields require resolved user
 * IDs, which in turn require a live people-picker or ensureUser lookup
 * per name. Since the current form does not collect email addresses or
 * user principals, IndividualRecipients cannot be populated as Person
 * values in this pass.
 *
 * Recipient names are captured in the Headline and Excerpt fields as
 * authored by the submitter. Moderators assign proper Person field
 * values during the review workflow.
 *
 * A future pass with a SharePoint people-picker component will enable
 * direct Person field population.
 */
export async function submitKudosDraft(
  draft: KudosComposerDraft,
  options: KudosSubmissionOptions = {},
): Promise<KudosSubmissionResult> {
  // Validate site URL
  const siteUrl = getSiteUrl();
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
  const typedBuckets = draft.recipients;
  const hasTypedIndividuals = (typedBuckets?.individualEmails.length ?? 0) > 0;
  if (typedBuckets) {
    if (!hasTypedIndividuals) {
      return { ok: false, error: 'At least one individual recipient email is required.' };
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
        'Content-Type': 'application/json;odata=nometadata',
        'X-RequestDigest': digest,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      return {
        ok: false,
        error: `SharePoint rejected the submission (${response.status}). ${errorBody ? `Details: ${errorBody.slice(0, 200)}` : ''}`.trim(),
      };
    }

    const created = (await response.json()) as { Id?: number };
    const itemId = created.Id;

    if (typeof itemId !== 'number') {
      return { ok: false, error: 'Item was created but the response did not include an item ID.' };
    }

    return { ok: true, itemId };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred during submission.';
    return { ok: false, error: message };
  }
}
