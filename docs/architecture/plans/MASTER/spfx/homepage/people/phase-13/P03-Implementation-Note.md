# P03 — Implementation Note: SharePoint Submission Source and Field Mapping

**Date:** 2026-04-07
**Phase:** 13 / P03 — SharePoint Submission Source and Field Mapping
**Version:** 0.0.26

---

## What Changed

### New files

| File | Purpose |
|------|---------|
| `apps/hb-webparts/src/homepage/data/peopleCultureSubmissionSource.ts` | SharePoint REST write seam — creates Kudos list items with moderation defaults, request digest handling, current-user resolution, and deterministic result types |

### Modified files

| File | Change |
|------|--------|
| `apps/hb-webparts/package.json` | Version bump 0.0.25 → 0.0.26 |

---

## Submission Field Mapping

| SharePoint field | Source | Default for new submissions |
|-----------------|--------|---------------------------|
| `KudosId` | Generated | `kudos-<timestamp36>-<random>` |
| `Headline` | Draft headline | — |
| `Excerpt` | Draft message | — |
| `Details` | Draft details (optional) | null if empty |
| `SubmittedById` | Resolved via `ensureUser(email)` | null if resolution fails |
| `SubmittedDate` | Current ISO timestamp | — |
| `IsPinned` | — | `false` |
| `HomepageEnabled` | — | `false` (moderation required) |
| `CelebrateCount` | — | `0` |
| `ApprovedBy` | — | null (moderator-set) |
| `ApprovedDate` | — | null (moderator-set) |
| `PublishStartDate` | — | null (moderator-set) |
| `PublishEndDate` | — | null (moderator-set) |
| `RejectionReason` | — | null |
| `ModeratorNotes` | — | null |

---

## Status Field Resolution

Per Phase 12 P01 findings, no dedicated `Status` column exists in the live Kudos list. New submissions enter a pending state through the moderation defaults:
- `HomepageEnabled = false`
- `ApprovedBy = null`
- `ApprovedDate = null`

The existing normalizer synthesizes status as `'pending'` when approval fields are absent, and `isKudosHomepageVisible()` filters out non-approved items. No fake `Status` field is written.

---

## Recipient Field Limitation (Documented)

The `IndividualRecipients` column is a Person (multi) field requiring resolved SharePoint user IDs. The current composer accepts recipient names as free text (comma-separated) without email addresses or user principals. Without a live people-picker or ensureUser lookup per name, Person field values cannot be populated in this pass.

**Current behavior:** Recipient names are captured in the Headline and Excerpt text as authored by the submitter. Moderators assign proper Person field values during the review workflow.

**Future pass:** A SharePoint people-picker component will enable direct `IndividualRecipientsId` population with resolved user IDs.

---

## Image Upload (Deferred)

Image upload is not included in this pass. The composer does not expose an image affordance. `PrimaryImage` and `ImageAltText` fields are not set on new submissions. Moderators may add images during review.

---

## Architecture

### Request digest

Write operations require `X-RequestDigest` from `/_api/contextinfo`. The digest is fetched once per submission and passed to both `ensureUser` and the create-item call.

### Current user resolution

`SubmittedBy` is a Person field set via the `SubmittedById` convention. The submitter's email (from SPFx context) is resolved to a SharePoint user ID via `/_api/web/ensureuser`. If resolution fails, the field is omitted — SharePoint still records the authenticated user as `Created By`.

### Error handling

All error paths return `{ ok: false, error: string }` with user-friendly messages:
- Missing SPFx site context
- Missing required fields
- Request digest failure
- User resolution failure (non-fatal, submission continues)
- SharePoint REST create failure (includes status code and truncated error body)
- Unexpected exceptions

---

## What Was Not Changed

- `PeopleCultureMerged.tsx` — wiring in P04
- `useKudosComposer.ts` — already has pluggable `onSubmit` callback, P04 connects it
- `communicationsContracts.ts` — existing types sufficient
- `spContext.ts` — site URL seam unchanged
- `peopleCultureListSource.ts` — read path unchanged

---

## Verification

- `check-types`: Pass (clean)
- `lint`: Pass (clean, 0 errors, 0 warnings)
- `build`: Pass (556.88 kB JS, 31.32 kB CSS — unchanged, submission source tree-shaken until wired)
- `test`: 13 failures, all pre-existing
