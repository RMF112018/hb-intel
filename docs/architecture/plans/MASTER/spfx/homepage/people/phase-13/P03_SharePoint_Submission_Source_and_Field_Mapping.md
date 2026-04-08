# P03 — SharePoint Submission Source and Field Mapping

## Objective

Create a **real SharePoint-backed Kudos submission seam** for the People & Culture composer.

The target site is:

- `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

The target list is the live **People Culture Kudos** list.

This phase is about writing **new submissions** into the list safely and coherently.

---

## Critical Rules

- Work from repo truth.
- Do **not** bury create-item REST logic in `PeopleCultureMerged.tsx`.
- Do **not** bypass moderation by marking new user submissions as live homepage content.
- Do **not** invent a second schema if the live list already supports the existing `KudosEntry` shape.
- Do **not** trust the CSV blindly if live metadata proves different.
- Do **not** fail silently on submission errors.

---

## Repo Context to Honor

The repo already has:
- `spContext.ts` for narrow site URL storage/retrieval
- a SharePoint list-source pattern in `projectSpotlightListSource.ts`
- a hook pattern in `useProjectSpotlightData.ts`
- existing Kudos contracts in `communicationsContracts.ts`

Use these seams and patterns as the reference model.

---

## Create a Submission Source

Create a dedicated file such as:

- `apps/hb-webparts/src/homepage/data/peopleCultureSubmissionSource.ts`

This source should:
1. retrieve the current site URL via `getSiteUrl()` or accept site URL explicitly
2. resolve the proper SharePoint list title / endpoint for Kudos submissions
3. create a list item through SharePoint REST
4. map the composer draft into list fields
5. return a deterministic success/error result

---

## Minimum Required Submission Payload

Use live metadata verification, but based on the uploaded Kudos export the agent should expect fields such as:

- `KudosId`
- `Headline`
- `Excerpt`
- `Details`
- `SubmittedBy`
- `SubmittedDate`
- `ApprovedBy`
- `ApprovedDate`
- `IndividualRecipients`
- `TeamRecipients`
- `DepartmentRecipients`
- `ProjectGroupRecipients`
- `IsPinned`
- `HomepageEnabled`
- `PublishStartDate`
- `PublishEndDate`
- `CelebrateCount`
- `PrimaryImage`
- `ImageAltText`
- `RejectionReason`
- `ModeratorNotes`

---

## Required Default Behavior for New User Submissions

New submissions should default into a moderated state.

Recommended defaults:
- `KudosId` = generated deterministic or timestamp-safe unique value
- `Headline` = from form
- `Excerpt` = from form
- `Details` = optional long-form field if implemented
- `SubmittedBy` = current SharePoint user
- `SubmittedDate` = current timestamp
- `ApprovedBy` = null
- `ApprovedDate` = null
- `IsPinned` = false
- `HomepageEnabled` = false
- `PublishStartDate` = null
- `PublishEndDate` = null
- `CelebrateCount` = 0
- `RejectionReason` = null
- `ModeratorNotes` = null

### Status handling
The current `KudosEntry` contract has a `status` field but the uploaded Kudos export did **not** clearly expose a dedicated `Status` column.

Therefore:
- verify whether a live `Status` or equivalent field exists
- if it exists, set new items to `pending`
- if it does not exist, document the resolved workflow rule and synthesize pending-state behavior from the approval/publish flags instead of inventing a fake unmapped field

---

## Recipient Mapping

Implement robust mapping for recipient fields.

### Individual recipients
Map selected people into:
- `IndividualRecipients`

### Optional recipient types
If implemented in this pass:
- teams → `TeamRecipients`
- departments → `DepartmentRecipients`
- project groups → `ProjectGroupRecipients`

### Important
Do not force all recipient types into one improvised text field.
Respect the actual SharePoint field shapes.

---

## Person / Image / Taxonomy Handling

Handle these safely:
- SharePoint user fields
- multi-user fields
- taxonomy fields if used for teams/departments/project groups
- thumbnail/image field shape if image support is included
- null-safe create payloads

If image upload is not practical in this pass, it is acceptable to:
- defer image upload
- keep the composer image affordance out of scope
- leave image support for a follow-on pass

But document that decision explicitly.

---

## Suggested Public API

A clean submission function may look conceptually like:

- `submitKudosDraft(draft, options): Promise<{ ok: true, itemId: number } | { ok: false, error: string }>`  

The exact shape can vary, but it must be:
- explicit
- typed
- deterministic
- UI-friendly

---

## Error Handling

Handle at least:
- missing SPFx site URL
- missing list access
- failed current-user resolution if needed
- invalid recipient payload
- SharePoint REST create failure
- schema mismatch or missing fields

Return usable messages to the flyout layer.

---

## Deliverable for This Phase

At completion of this phase:
1. the repo has a dedicated Kudos submission source
2. the source can create list items in the live Kudos list
3. the composer can use this source without embedding REST calls in the rendering layer
4. the resolved field mapping is documented in completion notes
