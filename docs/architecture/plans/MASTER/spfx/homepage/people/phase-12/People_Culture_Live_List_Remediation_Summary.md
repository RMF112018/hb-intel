# People & Culture Live List Remediation Summary

## Objective

Convert the People & Culture homepage webpart from a manifest-seeded surface into a **live SharePoint-list-backed homepage module** without losing the existing premium UI direction.

## Repo-truth findings

### 1. The visual overhaul is already substantially in place
`PeopleCultureMerged.tsx` is already a bold, warm, celebratory surface with:
- gradient hero banner
- featured kudos spotlight
- supporting announcements / celebrations rail
- avatar treatment
- reduced-motion handling
- sparse-state design

That is **not** the main missing layer.

### 2. The missing production layer is the data seam
The People & Culture component still consumes only `config` props. There is no People & Culture equivalent of:
- `projectSpotlightListSource.ts`
- `useProjectSpotlightData.ts`

### 3. The SPFx site-context seam already exists
`mount.tsx` already stores the site absolute URL via `storeSiteUrl(...)`, and `spContext.ts` already exposes `getSiteUrl()`.

That means the People & Culture live list integration should reuse the exact same operating model as Project Spotlight.

### 4. The manifest is still acting as the effective runtime content source
`PeopleCultureWebPart.manifest.json` still embeds seeded `announcements`, `kudos`, and `celebrations` arrays.

Those arrays should remain only as:
- local dev fallback
- packaging/demo fallback
- graceful no-list fallback

They should **not** remain the primary runtime path.

## Resolved implementation direction

## Files the agent should expect to change

### New files
- `apps/hb-webparts/src/homepage/data/peopleCultureListSource.ts`
- `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts`

### Existing files likely to change
- `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx`
- `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureWebPart.manifest.json`

### Existing files likely **not** to require change
- `apps/hb-webparts/src/homepage/data/spContext.ts`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/homepage/helpers/communicationsConfig.ts`
- `apps/hb-webparts/src/homepage/webparts/communicationsContracts.ts`

Only change contracts/normalizers if a concrete repo-truth incompatibility makes it necessary.

## SharePoint list mapping strategy

## A. Announcements list

### Intended list
User-provided URL points to:
- `People Culture Announcements1`

### Mapping target
Map into `AnnouncementEntry`:

- `id` <- `AnnouncementId`
- `personName` <- resolved user display name from `AnnouncementPerson`, fallback `PersonDisplayName`
- `announcementType` <- normalized `AnnouncementType`
- `headline` <- `Headline`
- `summary` <- plain-text `Summary`
- `publishDate` <- resolved live internal name for display field **PublishDate**
- `startDisplayDate` <- `StartDisplayDate`
- `endDisplayDate` <- `EndDisplayDate`
- `isPinned` <- `IsPinned`
- `priorityOverride` <- `PriorityOverride`
- `homepageEnabled` <- `HomepageEnabled`
- `audiences` <- taxonomy values from `AudienceTags`
- `cta.label` <- `CtaLabel`
- `cta.href` <- `CtaUrl`
- `cta.openInNewTab` <- `OpenInNewTab`
- `media.src` <- `PrimaryImage`
- `media.alt` <- `ImageAltText`

### Important caution
The export indicates the field displayed as `PublishDate` may **not** have a clean internal name. The agent must resolve the internal name from live SharePoint field metadata, not assume `PublishDate` is query-safe.

## B. Kudos list

### Intended list
User-provided URL points to:
- `People Culture Kudos`

### Mapping target
Map into `KudosEntry`:

- `id` <- `KudosId`
- `headline` <- `Headline`
- `excerpt` <- `Excerpt`
- `submittedBy` <- resolved `SubmittedBy`
- `submittedDate` <- `SubmittedDate`
- `approvedBy` <- resolved `ApprovedBy`
- `approvedDate` <- `ApprovedDate`
- `recipients` <- merged output from:
  - `IndividualRecipients` -> `recipientType = individual`
  - `TeamRecipients` -> `recipientType = team`
  - `DepartmentRecipients` -> `recipientType = department`
  - `ProjectGroupRecipients` -> `recipientType = projectGroup`
- `isPinned` <- `IsPinned`
- `homepageEnabled` <- `HomepageEnabled`
- `publishStartDate` <- `PublishStartDate`
- `publishEndDate` <- `PublishEndDate`
- `celebrateCount` <- `CelebrateCount`
- `media.src` <- `PrimaryImage`
- `media.alt` <- `ImageAltText`

### Important caution
The export does **not** include a dedicated `Status` column. The agent should:

1. first check live metadata for a real status field
2. if none exists, synthesize:
   - `approved` when approval state is present
   - `pending` otherwise

Recommended synthesis rule:
- `approved` if `ApprovedDate` exists or `ApprovedBy` resolves
- otherwise `pending`

This preserves the current contract without broadening the model.

## C. Celebrations list

### Intended list
The user-provided URL appears inconsistent. The CSV strongly suggests a separate celebrations-oriented list, but the exact list title / path must be resolved live from the site.

### Mapping target
Map into `WeeklyCelebrationEntry`:

- `id` <- base from `AnnouncementId` (or resolved live ID field), exploded per person when multi-person rows are present
- `personName` <- resolved user display name from `PersonName`, fallback `PersonDisplayName`
- `celebrationType` <- normalized from `CelebrationType`
- `celebrationDate` <- `CelebrationDate`
- `anniversaryYears` <- `AnniversaryYears`
- `audiences` <- taxonomy values from `AudienceTags`
- `media.src` <- `PrimaryImage`
- `media.alt` <- `ImageAltText`

### Important cautions
1. `PersonName` is `UserMulti`, so the adapter should **explode** one SharePoint row into multiple normalized entries when more than one person is selected.
2. `CelebrationType` choices include:
   - `Birthday`
   - `Anniversary`
   - `Promotion`
   - `Wedding`
   - `Engagement`
   - `Baby`

The current repo-truth contract accepts only:
- `birthday`
- `anniversary`

The adapter should normalize case and exclude unsupported values from homepage output unless you intentionally expand the contract in a separate decision.
3. One boolean field in the export appears malformed and may have been intended as `HomepageEnabled`. The agent must verify live metadata before using it.

## Fallback behavior required

The runtime priority should be:

1. live SharePoint list config
2. manifest / prop config fallback
3. existing empty / invalid state handling

The component should never fail hard just because one or more lists are unavailable.

Recommended behavior:
- if list fetch succeeds -> use live data
- if list fetch fails or site URL missing -> fall back to manifest props
- if both are empty/invalid -> use current empty-state logic

## Validation checklist

- live site URL is read from `spContext.ts`
- list-backed config is primary
- manifest arrays are fallback only
- people, taxonomy, and thumbnail fields are parsed safely
- no brittle assumption remains around malformed internal names
- unsupported celebration types do not break rendering
- pending kudos do not appear on the homepage if `status` is synthesized
- loading / fallback / sparse / empty states still work
- package rebuilt using `tools/build-spfx-package.ts`

## Build / package command

```bash
npx tsx tools/build-spfx-package.ts --domain hb-webparts
```

## What this package tells the agent to do

1. verify repo truth without rereading already-loaded files unless needed
2. add a People & Culture list-source module
3. add a People & Culture data hook
4. wire `PeopleCultureMerged.tsx` to list-first behavior
5. preserve the premium UI direction
6. package and verify `hb-webparts.sppkg`
