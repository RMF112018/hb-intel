# P01 — Implementation Note: Repo Truth and Live Field Resolution

**Date:** 2026-04-07
**Phase:** 12 / P01 — Repo Truth and Live Field Resolution

---

## Repo-Truth Implementation Seam

### Current state

`PeopleCultureMerged.tsx` renders exclusively from `config` props passed through the mount dispatcher. The manifest (`PeopleCultureWebPart.manifest.json`, id `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4`) embeds seeded `announcements`, `kudos`, and `celebrations` arrays as the active runtime content source.

### Missing production layer

No People & Culture equivalent exists for:
- `projectSpotlightListSource.ts` (list-source module)
- `useProjectSpotlightData.ts` (data hook)

### Existing seams that require no change

| File | Role | Status |
|------|------|--------|
| `spContext.ts` | Stores/retrieves site absolute URL | Ready — `storeSiteUrl()` / `getSiteUrl()` |
| `mount.tsx` | Calls `storeSiteUrl(spfxContext?.pageContext?.web?.absoluteUrl)` | Ready |
| `communicationsContracts.ts` | Defines `AnnouncementEntry`, `KudosEntry`, `WeeklyCelebrationEntry`, `PeopleCultureMergedConfig` | Compatible — no changes needed |
| `communicationsConfig.ts` | `normalizePeopleCultureMergedConfig()` handles Band A / Kudos / Band B normalization | Compatible — no changes needed |

### Conclusion

The only implementation gap is the data layer: a list-source module and a data hook, following the Project Spotlight pattern exactly.

---

## Resolved List Titles

| List | Resolved title | Confidence | Notes |
|------|---------------|------------|-------|
| Announcements | `People Culture Announcements1` | Confirmed | User-provided URL and CSV export both reference this title |
| Kudos | `People Culture Kudos` | Confirmed | User-provided URL and CSV export both reference this title |
| Celebrations | **Must resolve at runtime** | Low | CSV export title inconsistent with user-provided URL; adapter must enumerate lists or attempt known candidates |

### Celebrations list resolution strategy

The adapter should attempt these candidates in order:
1. `People Culture Celebrations`
2. `People Culture Celebrations1`
3. Fall back to list enumeration via `/_api/web/lists?$select=Title,Id&$filter=substringof('Celebration',Title)`

If none resolves, celebrations will fall back to manifest config.

---

## Field Resolution: Announcements (`People Culture Announcements1`)

### Resolved fields

| Contract field | SP internal name | Type | Notes |
|----------------|-----------------|------|-------|
| `id` | `AnnouncementId` | Text | Custom ID column |
| `personName` | `AnnouncementPerson` (expand) | Person | Expand `AnnouncementPerson/Title`, `AnnouncementPerson/EMail`; fallback to `PersonDisplayName` if person column returns null |
| `announcementType` | `AnnouncementType` | Choice | Values: `promotion`, `newHire`, `baby`, `wedding`, `special` |
| `headline` | `Headline` | Text | |
| `summary` | `Summary` | Enhanced Rich Text | Strip HTML at adapter boundary |
| `publishDate` | **Uncertain** | DateTime | Display name is `PublishDate` but CSV suggests internal name may differ. Adapter should try `PublishDate` first, then fall back to field metadata lookup via `/_api/web/lists/getbytitle('People Culture Announcements1')/fields?$filter=Title eq 'PublishDate'&$select=InternalName` |
| `startDisplayDate` | `StartDisplayDate` | DateTime | |
| `endDisplayDate` | `EndDisplayDate` | DateTime | |
| `isPinned` | `IsPinned` | Boolean | |
| `priorityOverride` | `PriorityOverride` | Number | |
| `homepageEnabled` | `HomepageEnabled` | Boolean | |
| `audiences` | `AudienceTags` | Managed Metadata | Parse via hidden note field `AudienceTags_0` or label extraction |
| `cta.label` | `CtaLabel` | Text | |
| `cta.href` | `CtaUrl` | Hyperlink | May return `{ Url, Description }` or plain string |
| `cta.openInNewTab` | `OpenInNewTab` | Boolean | |
| `media.src` | `PrimaryImage` | Hyperlink/Image | Handle JSON string, `{ Url }` object, or server-relative URL |
| `media.alt` | `ImageAltText` | Text | |

### Flagged issue

**`PublishDate` internal name is suspect.** The CSV export shows this field but SharePoint may have assigned a mangled internal name (e.g., `PublishDate0`, `Publish_x0020_Date`). The P02 adapter must resolve the actual internal name from field metadata at runtime on first fetch, then cache it.

---

## Field Resolution: Kudos (`People Culture Kudos`)

### Resolved fields

| Contract field | SP internal name | Type | Notes |
|----------------|-----------------|------|-------|
| `id` | `KudosId` | Text | Custom ID column |
| `headline` | `Headline` | Text | |
| `excerpt` | `Excerpt` | Enhanced Rich Text | Strip HTML at adapter boundary |
| `submittedBy` | `SubmittedBy` (expand) | Person | Expand `SubmittedBy/Id`, `SubmittedBy/Title`, `SubmittedBy/EMail` |
| `submittedDate` | `SubmittedDate` | DateTime | |
| `approvedBy` | `ApprovedBy` (expand) | Person | May be null for pending items |
| `approvedDate` | `ApprovedDate` | DateTime | May be null |
| `recipients.individual` | `IndividualRecipients` (expand) | Person (multi) | Expand `/Id`, `/Title`, `/EMail`; map to `recipientType: 'individual'` |
| `recipients.team` | `TeamRecipients` | Managed Metadata | Parse labels; map to `recipientType: 'team'` |
| `recipients.department` | `DepartmentRecipients` | Managed Metadata | Parse labels; map to `recipientType: 'department'` |
| `recipients.projectGroup` | `ProjectGroupRecipients` | Managed Metadata | Parse labels; map to `recipientType: 'projectGroup'` |
| `isPinned` | `IsPinned` | Boolean | |
| `homepageEnabled` | `HomepageEnabled` | Boolean | |
| `publishStartDate` | `PublishStartDate` | DateTime | |
| `publishEndDate` | `PublishEndDate` | DateTime | |
| `celebrateCount` | `CelebrateCount` | Number | |
| `media.src` | `PrimaryImage` | Hyperlink/Image | Same handling as Announcements |
| `media.alt` | `ImageAltText` | Text | |

### Status field resolution

**No dedicated `Status` field exists in the CSV export.** The adapter must synthesize status:

| Condition | Synthesized status |
|-----------|-------------------|
| `ApprovedDate` is non-null OR `ApprovedBy` resolves | `'approved'` |
| Otherwise | `'pending'` |

This preserves the existing `KudosStatus` contract (`'pending' | 'approved' | 'rejected'`) without requiring a list schema change. Items synthesized as `'pending'` are filtered out by `isKudosHomepageVisible()` in the normalizer, so unapproved items will not appear on the homepage.

### Taxonomy recipient parsing

The `TeamRecipients`, `DepartmentRecipients`, and `ProjectGroupRecipients` fields are Managed Metadata columns. SharePoint stores these with a hidden note companion field (e.g., `TeamRecipients_0`) containing pipe-delimited `WssId;#Label` values. The adapter should:

1. Request the hidden note field in `$select`
2. Parse the `Label` portion from each entry
3. Generate a stable ID from the label (e.g., `team:<slug>`)
4. Map to a `KudosRecipient` with the appropriate `recipientType`

---

## Field Resolution: Celebrations (title to be resolved at runtime)

### Resolved fields

| Contract field | SP internal name | Type | Notes |
|----------------|-----------------|------|-------|
| `id` | `AnnouncementId` | Text | Despite the name, this is the celebrations list ID field; the CSV reuses the Announcements schema naming |
| `personName` | `PersonName` (expand) | Person (multi) | `UserMulti` — expand `/Id`, `/Title`, `/EMail`; explode one row into N entries when multiple people are selected |
| `celebrationType` | `CelebrationType` | Choice | Raw values include `Birthday`, `Anniversary`, `Promotion`, `Wedding`, `Engagement`, `Baby`; normalize to lowercase; only emit `birthday` and `anniversary` per current contract |
| `celebrationDate` | `CelebrationDate` | DateTime | |
| `anniversaryYears` | `AnniversaryYears` | Number | |
| `audiences` | `AudienceTags` | Managed Metadata | Same parsing as Announcements |
| `media.src` | `PrimaryImage` | Hyperlink/Image | Same handling as other lists |
| `media.alt` | `ImageAltText` | Text | |

### HomepageEnabled field resolution

**The CSV export shows a boolean field that appears malformed.** The adapter should:

1. First check for `HomepageEnabled` in the `$select` response
2. If absent or all-null, try `Homepage_x0020_Enabled` (SharePoint space-encoding)
3. If no boolean field resolves, treat all items as homepage-enabled (the normalizer's `isCelebrationVisible()` already filters by date window)

### Multi-person row explosion

When `PersonName` resolves to multiple users, the adapter must emit one `WeeklyCelebrationEntry` per person with:
- `id`: `<baseId>:<personIndex>` for stable keys
- `personName`: individual user's `Title`
- All other fields copied from the parent row

### Celebration type filtering

The current contract (`WeeklyCelebrationType`) only accepts `'birthday' | 'anniversary'`. The adapter must:
- Normalize `CelebrationType` to lowercase
- Silently drop rows with types not in the contract set (`promotion`, `wedding`, `engagement`, `baby`)
- This is a filter, not an error — unsupported types are expected in the source list

---

## CSV Export Assumptions: What Was Wrong

| Issue | Detail |
|-------|--------|
| Celebrations list title | CSV title does not match user-provided URL; actual title must be resolved at runtime |
| Celebrations ID column | Uses `AnnouncementId` — misleading but functional; carried forward as-is |
| Celebrations `HomepageEnabled` | Appears malformed in export; may have a mangled internal name or may not exist |
| Kudos `Status` | Not present in CSV; must be synthesized from approval state |
| Announcements `PublishDate` | Internal name likely mangled; must be resolved from field metadata |
| Celebrations `CelebrationType` values | CSV shows 6 choices but contract only supports 2; adapter must filter |
| `PersonName` type | CSV does not clearly indicate `UserMulti`; confirmed by schema analysis |

---

## Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| Final list titles known | **Done** — Announcements1 and Kudos confirmed; Celebrations requires runtime resolution with fallback strategy documented |
| Final field internal names known | **Done** — all fields mapped with uncertainty flags and fallback strategies for suspect names |
| Metadata mismatches documented | **Done** — 7 issues identified and mitigation strategies specified |
| Coding can proceed without guessing display names as internal names | **Done** — P02 adapter has clear field map with runtime resolution for uncertain fields |

---

## What This Enables

P02 can now implement `peopleCultureListSource.ts` and `usePeopleCultureData.ts` using:
- The confirmed field maps above
- Runtime field metadata resolution for the 3 flagged uncertain fields
- The celebrations list title resolution strategy
- The kudos status synthesis rule
- The celebrations multi-person explosion pattern
