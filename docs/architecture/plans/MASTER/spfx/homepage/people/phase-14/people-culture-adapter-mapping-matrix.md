# People & Culture adapter mapping matrix

Phase-14 appendix to
`docs/architecture/reviews/people-culture-data-schema-conformance-audit.md`.

Single-source matrix for how each live SharePoint `InternalName`
maps into the app's domain model after the data-schema conformance
remediation pass. Field names are **live InternalName** values
verified against the extracted schema artifacts at
`docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/`.

## Scope

Three PC lists are audited here:

| List | Live title | List ID | URL segment |
|---|---|---|---|
| Announcements | `People Culture Announcements` | `2cd191fc-a7ea-49f2-af05-c395c2326e57` | `People Culture Announcements1` |
| Celebrations | `People Culture Celebrations` | `b87bf664-0531-418b-902c-726e5fb87083` | `People Culture Announcements` |
| Kudos | `People Culture Kudos` | `b01fa4d2-29b1-4e11-b581-4cb3d0951a79` | `People Culture Kudos` |

The adapter binds by **list ID**, not display title. Title and URL
are listed only for cross-reference with the SharePoint UI.

## 1. Announcements list (`2cd191fc-…`)

| InternalName | Type | Current code usage | Corrected domain mapping | Notes |
|---|---|---|---|---|
| `AnnouncementId` | Text | `ANN_FIELDS.AnnouncementId`; read into `RawAnnouncementItem.AnnouncementId`; used as `AnnouncementEntry.id` | Unchanged | Required in DTO. Items without a value are dropped. |
| `AnnouncementPerson` | User (single) | Expanded via `$expand=AnnouncementPerson` and read as `{Id, Title, EMail}`; feeds `AnnouncementEntry.personName` via `resolvePersonName` | Unchanged | Schema confirms Mult=FALSE. Single-user field. |
| `PersonDisplayName` | Text | Fallback when `AnnouncementPerson` is null | Unchanged | Optional snapshot name. |
| `AnnouncementType` | Choice (lowercase) | `ANN_FIELDS.AnnouncementType`; validated against `VALID_ANNOUNCEMENT_TYPES = {promotion, newHire, baby, wedding, special}`; feeds `AnnouncementEntry.announcementType` | Unchanged | Live choices are lowercase — matches the validator. |
| `Headline` | Text (required) | `ANN_FIELDS.Headline`; feeds `AnnouncementEntry.headline` | Unchanged | Required in DTO. |
| `Summary` | Note (required) | `ANN_FIELDS.Summary`; HTML-stripped via `stripHtml`; feeds `AnnouncementEntry.summary` | Unchanged | Required in DTO. |
| `PublishDateMapstopublishDate_x00` | DateTime (required, display title `PublishDate`) | **BEFORE:** `ANN_FIELDS.PublishDate = 'PublishDate'` — wrong name; relied on `resolvePublishDateField` runtime lookup. **AFTER:** `ANN_FIELDS.PublishDate = 'PublishDateMapstopublishDate_x00'`; remapped onto the `PublishDate` adapter key inside `fetchPeopleCultureListData` | Fixed | The resolver remains as a defensive safety net via `buildPcListFieldsEndpoint`. |
| `StartDisplayDate` | DateTime | `ANN_FIELDS.StartDisplayDate`; feeds `AnnouncementEntry.startDisplayDate` | Unchanged | |
| `EndDisplayDate` | DateTime | `ANN_FIELDS.EndDisplayDate`; feeds `AnnouncementEntry.endDisplayDate` | Unchanged | |
| `IsPinned` | Boolean | `ANN_FIELDS.IsPinned`; feeds `AnnouncementEntry.isPinned` | Unchanged | |
| `PriorityOverride` | Number | `ANN_FIELDS.PriorityOverride`; feeds `AnnouncementEntry.priorityOverride` | Unchanged | |
| `HomepageEnabled` | Boolean | `ANN_FIELDS.HomepageEnabled`; used as `$filter=HomepageEnabled eq 1`; feeds `AnnouncementEntry.homepageEnabled` | Unchanged | **Authoritative publish-state signal.** `_ModerationStatus` is not authoritative because moderation is disabled on the list. |
| `AudienceTags` | Taxonomy | `ANN_FIELDS.AudienceTags`; parsed via `parseTaxonomyLabels`; feeds `AnnouncementEntry.audiences` as `string[]` | Unchanged | Label-only extraction. Term GUID resolution deferred. |
| `CtaLabel`, `CtaUrl`, `OpenInNewTab` | Text / URL / Boolean | Composed into `AnnouncementEntry.cta` when both label and href are non-empty | Unchanged | |
| `PrimaryImage` | Thumbnail | `ANN_FIELDS.PrimaryImage`; decoded via `extractImageSrc` with `serverRelativeUrl`/`serverUrl` JSON parsing; feeds `AnnouncementEntry.media.src` | Unchanged | |
| `ImageAltText` | Text | `ANN_FIELDS.ImageAltText`; feeds `AnnouncementEntry.media.alt` | Unchanged | |
| `InternalNotes` | Note | **NEW.** Added to `ANN_FIELDS` and the `$select`; read into `RawAnnouncementItem.InternalNotes` | Added | Not yet projected into the public `AnnouncementEntry` DTO — captured for future HR companion surfacing. |
| `_ModerationStatus` | System | Not read | Unchanged | Intentionally ignored — moderation is disabled on this list. |

## 2. Celebrations list (`b87bf664-…`)

| InternalName | Type | Current code usage | Corrected domain mapping | Notes |
|---|---|---|---|---|
| `AnnouncementId` | Text | `CEL_FIELDS.AnnouncementId`; used as `WeeklyCelebrationEntry.id` (suffixed with person index when the row explodes) | Unchanged | The celebrations list reuses the announcement id field name — documented in jsdoc. |
| `PersonName` | **UserMulti** | `CEL_FIELDS.PersonName`; expanded via `$expand=PersonName`; iterated via `extractPersonArray`; each person produces a separate `WeeklyCelebrationEntry` with id `<baseId>:<idx>` | Unchanged | **Multi-user — do not assume single-user.** Schema confirms Mult=TRUE. |
| `PersonDisplayName` | Text | Fallback when `PersonName` array is empty | Unchanged | |
| `ExternalEmployeeId` | Text | **NEW.** Declared in `CEL_FIELDS`; not yet projected | Declared | Available for future adapter passes that need the external payroll/identity link. |
| `CelebrationType` | Choice (Title-Case) | `CEL_FIELDS.CelebrationType`; lowercased and compared to `VALID_CELEBRATION_TYPES = {birthday, anniversary}`; feeds `WeeklyCelebrationEntry.celebrationType` | Unchanged | Live schema exposes `Birthday`, `Anniversary`, `Promotion`, `Wedding`, `Engagement`, `Baby` — the adapter intentionally only surfaces `birthday`/`anniversary` in the weekly celebration DTO. |
| `CelebrationDate` | DateTime (required) | `CEL_FIELDS.CelebrationDate`; feeds `WeeklyCelebrationEntry.celebrationDate` | Unchanged | |
| `AnniversaryYears` | Number | `CEL_FIELDS.AnniversaryYears`; feeds `WeeklyCelebrationEntry.anniversaryYears` | Unchanged | |
| `HomepageEnabledGovernanceextensi` | Boolean | `CEL_FIELDS.HomepageEnabled = 'HomepageEnabledGovernanceextensi'`; false → entry dropped; missing → treated as enabled | Unchanged | **Mangled internal name is authoritative.** Do not rename. |
| `AudienceTags` | Taxonomy | Parsed via `parseTaxonomyLabels`; feeds `WeeklyCelebrationEntry.audiences` | Unchanged | |
| `PrimaryImage` / `ImageAltText` | Thumbnail / Text | Feeds `WeeklyCelebrationEntry.media` | Unchanged | |
| `SourceSystem`, `LastSynchronizedOn` | Text / DateTime | **NEW.** Declared in `CEL_FIELDS`; not yet projected | Declared | Hybrid-intake hook point — the companion milestone queue can use `SourceSystem` to tag candidates from external HRIS snapshots. |
| `_ModerationStatus` | System | Not read | Unchanged | Intentionally ignored — moderation is disabled. |

## 3. Kudos list (`b01fa4d2-…`)

| InternalName | Type | Current code usage | Corrected domain mapping | Notes |
|---|---|---|---|---|
| `KudosId` | Text (required) | `KUDOS_FIELDS.KudosId`; used as `KudosEntry.id` | Unchanged | |
| `Headline` | Text (required) | Feeds `KudosEntry.headline` | Unchanged | |
| `Excerpt` | Note (required) | HTML-stripped; feeds `KudosEntry.excerpt` | Unchanged | |
| `Details` | Note | **NEW.** HTML-stripped; feeds `KudosEntry.details` | Added | Optional long-form body. |
| `SubmittedBy` | User (required) | Expanded; feeds `KudosEntry.submittedBy` | Unchanged | Required — rows without a submitter are dropped. |
| `SubmittedDate` | DateTime (required) | Feeds `KudosEntry.submittedDate` | Unchanged | |
| `ApprovedBy` | User | Expanded; feeds `KudosEntry.approvedBy` | Unchanged | |
| `ApprovedDate` | DateTime | Feeds `KudosEntry.approvedDate` | Unchanged | |
| `IndividualRecipients` | UserMulti | Expanded; each person becomes a `KudosRecipient` of type `individual` | Unchanged | |
| `TeamRecipients`, `DepartmentRecipients`, `ProjectGroupRecipients` | Taxonomy | `parseTaxonomyLabels` → `KudosRecipient` rows by type | Unchanged | |
| `WorkflowStatus` | Choice (required) | **BEFORE:** not read; adapter synthesized a tri-state from `ApprovedBy`/`ApprovedDate`. **AFTER:** read into `RawKudosItem.WorkflowStatus`; validated via `parseKudosWorkflowStatus` against the live 7-state choice set; collapsed into the narrow `KudosStatus` tri-state via `deriveKudosStatus`; full value preserved on `KudosEntry.workflowStatus` | **Fixed** | Decision-lock rule: **this is the authoritative publish state**, not `_ModerationStatus`. |
| `WasEverPublished` | Boolean (required) | **NEW.** Read into `KudosEntry.wasEverPublished` | Added | Write path defaults to `false` on submission. |
| `IsPinned` | Boolean (required) | Feeds `KudosEntry.isPinned` | Unchanged | |
| `PinOrder` | Number | **NEW.** Feeds `KudosEntry.pinOrder` | Added | Manual pin order. |
| `IsFeatured` | Boolean | **NEW.** Feeds `KudosEntry.isFeatured` | Added | |
| `FeaturedExpiresAt` | DateTime | **NEW.** Feeds `KudosEntry.featuredExpiresAt` | Added | |
| `ProminenceIntent` | Choice (`standard`/`pinned`/`featured`; default `standard`) | **NEW.** Validated via `parseKudosProminenceIntent`; feeds `KudosEntry.prominenceIntent` | Added | Write path sets `'standard'` on every new submission. |
| `CurrentVisibilityMode` | Choice (`public`/`associatedOnly`/`internalOnly`; default `internalOnly`) | **NEW.** Validated via `parseKudosVisibilityMode`; feeds `KudosEntry.visibilityMode` | Added | |
| `HomepageEnabled` | Boolean (required) | Feeds `KudosEntry.homepageEnabled` | Unchanged | |
| `IsScheduled` | Boolean | **NEW.** Feeds `KudosEntry.isScheduled` | Added | |
| `ScheduledPublishAt` | DateTime | **NEW.** Feeds `KudosEntry.scheduledPublishAt` | Added | |
| `PublishStartDate`, `PublishEndDate` | DateTime | Feed `KudosEntry.publishStartDate` / `.publishEndDate` | Unchanged | |
| `CelebrateCount` | Number (required) | Feeds `KudosEntry.celebrateCount` | Unchanged | |
| `PrimaryImage` / `ImageAltText` | Thumbnail / Text | Feed `KudosEntry.media` | Unchanged | |
| `_ModerationStatus` | System | **Not read, not written.** | Unchanged | Moderation is disabled on the Kudos list — this field is never authoritative. |

## 4. Kudos submission write contract

Only the fields listed below are written on a new draft submission.
Every other field is left to the list defaults.

| InternalName | Value written | Rationale |
|---|---|---|
| `KudosId` | generated `kudos-<base36 ts>-<random>` | App-owned stable id. |
| `Headline` | `draft.headline.trim()` | Required. |
| `Excerpt` | `draft.excerpt.trim()` | Required. |
| `Details` | `draft.details.trim()` when non-empty | Optional. |
| `SubmittedDate` | `new Date().toISOString()` | Editorial submission moment. |
| `SubmittedById` | resolved via `ensureUser(submitterEmail)` | SharePoint Person field Id-suffix convention. |
| `WorkflowStatus` | `'pending'` | **Authoritative publish-state baseline.** Makes the submission visible to the companion approvals inbox. |
| `WasEverPublished` | `false` | Required boolean. |
| `ProminenceIntent` | `'standard'` | Matches the live schema default explicitly. |
| `HomepageEnabled` | `false` | HR review gate. |
| `IsPinned` | `false` | HR pins only. |
| `IsFeatured` | `false` | HR features only. |
| `IsScheduled` | `false` | HR schedules only. |
| `CelebrateCount` | `0` | Initial value. |

Not written on submission (moderated by HR during the review
workflow):

- `IndividualRecipients`, `TeamRecipients`, `DepartmentRecipients`,
  `ProjectGroupRecipients` — composer does not yet collect person
  account names or term ids. HR assigns these.
- `ApprovedBy`, `ApprovedDate`, `RejectionReason`, `ModeratorNotes`,
  `RevisionRequestedBy`, `RevisionRequestedAt`, `RevisionGuidance`,
  `WithdrawnBy`, `WithdrawnAt`, `RemovedBy`, `RemovedAt`,
  `RemovedReason`, `IsRemovedFromPublicView`, `RestoredBy`,
  `RestoredAt` — lifecycle workflow.
- `PublishStartDate`, `PublishEndDate`, `ScheduledPublishAt`,
  `ScheduleChangedBy`, etc. — HR scheduling decisions.
- `IsFeatured` / `FeaturedExpiresAt` beyond the `false` default —
  HR feature promotion.
- `PinOrder` / `FeaturedExpiresAt` — HR prominence decisions.
- `ClaimOwner`, `ClaimedAt`, `AssignedOwner`, `ReassignedBy`,
  `ReassignedAt`, `ReviewedBy`, `ReviewedAt` — HR work management.
- `ProminenceFailureAt`, `ProminenceFailureReason` — runtime promotion traces.
- `CurrentVisibilityMode` beyond the list default (`internalOnly`) — HR decides.
- `PrimaryImage`, `ImageAltText` — composer does not yet capture media.
- `AdminReviewFlaggedBy`, `IsFlaggedForAdminReview`, etc. — admin escalation path.

`_ModerationStatus` is **never written** — moderation is disabled
on the list.

## 5. Binding rule

The adapter **MUST** bind every REST call by list GUID:

```ts
import {
  buildPcListItemsEndpoint,
  buildPcListFieldsEndpoint,
  PEOPLE_CULTURE_LIST_REGISTRY,
} from '../data/peopleCultureSpListRegistry.js';

// ✅ correct — binds by list ID
const url = buildPcListItemsEndpoint(siteUrl, PEOPLE_CULTURE_LIST_REGISTRY.announcements, {
  select: 'AnnouncementId,Headline',
  expand: 'AnnouncementPerson',
  filter: 'HomepageEnabled eq 1',
});

// ❌ forbidden — title drift can silently cross-bind to the celebrations list
const badUrl = `${siteUrl}/_api/web/lists/getbytitle('People Culture Announcements')/items`;
```

## 6. Runtime guardrail

`validatePeopleCultureListBindings(siteUrl)` verifies every
registered list's critical `InternalName` set is present in the
live schema and returns actionable error strings. Non-empty
output must be surfaced visibly to operators — never swallowed.

```ts
import { validatePeopleCultureListBindings } from '../data/peopleCultureListSource.js';

const errors = await validatePeopleCultureListBindings(siteUrl);
if (errors.length > 0) {
  // surface these through the hook / UI — do not treat as "no data"
  console.error('People & Culture list binding errors:', errors);
}
```
