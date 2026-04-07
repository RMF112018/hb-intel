# Phase 1A — Source Strategy and Moderation Model

> **Status:** Canonical source strategy and moderation model for the People & Culture webpart.
> **Governing architecture:** `00_Architecture/People_Culture_Kudos_Merged_Architecture.md`
> **Content model:** `phase-1A/phase-1A-merged-content-model.md`
> **Existing data patterns:** `apps/hb-webparts/src/homepage/data/` (REST API list sources, React hooks)

---

## Current State

The PeopleCulture webpart is currently **config-only** — data comes from manifest/property-bag configuration, not from a SharePoint list. There is no list source, no data hook, and no moderation workflow.

Other homepage webparts (Tool Launcher, Project Spotlight) already use a three-layer data access pattern:

1. **Raw SharePoint layer** — REST API response shape with internal column names
2. **Normalized domain layer** — clean TypeScript types with SharePoint quirks absorbed
3. **Presentation layer** — derived view models for rendering

The People & Culture webpart must adopt this same pattern for all three content domains (announcements, Kudos, weekly celebrations).

---

## Source Architecture

### Overview

Each of the three content regions reads from its own SharePoint list. The webpart does not merge all content into a single ranked source.

| Region | SharePoint List | Access Pattern | Surfaces |
|--------|----------------|----------------|----------|
| Band A — Announcements | `People Culture Announcements` | REST API list source + React hook | Homepage |
| Kudos Module | `People Culture Kudos` | REST API list source + React hook | Homepage, Dedicated Kudos page, Moderation workspace |
| Band B — Weekly Celebrations | `People Culture Celebrations` | REST API list source + React hook | Homepage |

### Why three lists

- Announcements, Kudos, and weekly celebrations have **different schemas** — combining them in one list would require nullable columns for every domain-specific field
- Kudos has **approval workflow state** that announcements and celebrations do not
- Each list can have **independent permissions** — Kudos submissions require write access for all employees, while announcements may be restricted to People Operations
- Three lists with clear ownership are easier to govern than one overloaded list

---

## Band A — Announcements Source

### SharePoint list: `People Culture Announcements`

#### List columns

| Column (Internal Name) | Type | Required | Maps to |
|------------------------|------|----------|---------|
| `Title` | Single line of text | yes | `headline` |
| `PersonName` | Single line of text | yes | `personName` |
| `AnnouncementType` | Choice | yes | `announcementType` |
| `Summary` | Multiple lines of text (plain) | yes | `summary` |
| `PublishDate` | Date and time | yes | `publishDate` |
| `AnnouncementImage` | Hyperlink (picture) | no | `media.src` |
| `ImageAltText` | Single line of text | no | `media.alt` |
| `LinkUrl` | Hyperlink | no | `cta.href` |
| `LinkLabel` | Single line of text | no | `cta.label` |
| `StartDisplayDate` | Date and time | no | `startDisplayDate` |
| `EndDisplayDate` | Date and time | no | `endDisplayDate` |
| `IsPinned` | Yes/No | no | `isPinned` |
| `PriorityOverride` | Number | no | `priorityOverride` |
| `HomepageEnabled` | Yes/No | no | `homepageEnabled` (default: yes) |
| `Audiences` | Multiple lines of text (plain) | no | `audiences` (semicolon-delimited) |

#### Choice values for `AnnouncementType`

- `Promotion`
- `Baby`
- `Wedding`
- `Special`

#### Access pattern

- REST API: `/_api/web/lists/getbytitle('People Culture Announcements')/items`
- Filter: `HomepageEnabled ne 0` (or null, treated as true)
- Select: all columns listed above
- Top: 20 (generous fetch, client-side persistence-window filtering)
- Order by: `PublishDate desc`

#### Client-side filtering

The list source fetches generously. The normalization layer applies:

1. Persistence-window filtering based on `AnnouncementType` and `PublishDate`
2. `startDisplayDate` / `endDisplayDate` overrides when present
3. `isPinned` items bypass persistence-window expiry
4. `homepageEnabled` suppression
5. Audience filtering via `isVisibleForAudience()`

---

## Kudos Module Source

### SharePoint list: `People Culture Kudos`

#### List columns

| Column (Internal Name) | Type | Required | Maps to |
|------------------------|------|----------|---------|
| `Title` | Single line of text | yes | `headline` |
| `Excerpt` | Multiple lines of text (plain) | yes | `excerpt` |
| `SubmittedById` | Person or Group | yes | `submittedBy.id` / `.displayName` |
| `SubmittedDate` | Date and time | yes | `submittedDate` |
| `Status` | Choice | yes | `status` |
| `ApprovedById` | Person or Group | no | `approvedBy.id` / `.displayName` |
| `ApprovedDate` | Date and time | no | `approvedDate` |
| `RecipientData` | Multiple lines of text (plain) | yes | `recipients` (JSON string) |
| `KudosImage` | Hyperlink (picture) | no | `media.src` |
| `ImageAltText` | Single line of text | no | `media.alt` |
| `IsPinned` | Yes/No | no | `isPinned` |
| `HomepageEnabled` | Yes/No | no | `homepageEnabled` (default: yes) |
| `PublishStartDate` | Date and time | no | `publishStartDate` |
| `PublishEndDate` | Date and time | no | `publishEndDate` |
| `CelebrateCount` | Number | no | `celebrateCount` (default: 0) |

#### Choice values for `Status`

- `Pending`
- `Approved`
- `Rejected`

#### `RecipientData` format

JSON string stored in a plain text column:

```json
[
  {
    "id": "user-id-or-group-id",
    "name": "Jane Smith",
    "recipientType": "individual",
    "photoUrl": "https://..."
  }
]
```

This avoids multi-value Person column limitations and supports non-person recipient types (teams, departments, project groups).

#### Person or Group columns

`SubmittedById` and `ApprovedById` use SharePoint Person or Group columns:

- REST API expand: `$expand=SubmittedById,ApprovedById`
- Select: `SubmittedById/Id,SubmittedById/Title,SubmittedById/EMail,ApprovedById/Id,ApprovedById/Title,ApprovedById/EMail`

#### Access patterns by surface

**Homepage module:**
- Filter: `Status eq 'Approved' and HomepageEnabled ne 0`
- Top: 10
- Order by: `ApprovedDate desc`
- Client-side: 14-day age-off from `ApprovedDate`, pinned items bypass age-off, `publishStartDate`/`publishEndDate` overrides

**Dedicated Kudos page (employee view):**
- Filter: `Status eq 'Approved'`
- Top: 50 (paginated)
- Order by: `ApprovedDate desc`
- No age-off — full archive browsing

**Dedicated Kudos page (submitter's own pending):**
- Filter: `Status eq 'Pending' and SubmittedById eq [currentUserId]`
- Shown in a "Your Pending Kudos" section, not in the main feed

**Moderation workspace (reviewer/approver view):**
- Filter: `Status eq 'Pending'`
- Top: 50
- Order by: `SubmittedDate asc` (oldest first for fair review order)
- Additional view: `Status eq 'Approved' or Status eq 'Rejected'` for publication management

---

## Band B — Weekly Celebrations Source

### SharePoint list: `People Culture Celebrations`

#### List columns

| Column (Internal Name) | Type | Required | Maps to |
|------------------------|------|----------|---------|
| `Title` | Single line of text | yes | `personName` |
| `CelebrationType` | Choice | yes | `celebrationType` |
| `CelebrationDate` | Date and time | yes | `celebrationDate` |
| `AnniversaryYears` | Number | no | `anniversaryYears` |
| `PersonImage` | Hyperlink (picture) | no | `media.src` |
| `ImageAltText` | Single line of text | no | `media.alt` |
| `Audiences` | Multiple lines of text (plain) | no | `audiences` (semicolon-delimited) |

#### Choice values for `CelebrationType`

- `Birthday`
- `Anniversary`

#### Access pattern

- REST API: `/_api/web/lists/getbytitle('People Culture Celebrations')/items`
- Filter: `CelebrationDate ge datetime'[today]' and CelebrationDate le datetime'[today+7]'`
- Select: all columns listed above
- Top: 50
- Order by: `CelebrationDate asc`

#### Client-side filtering

- Audience filtering via `isVisibleForAudience()`
- Date validation (guard against stale cache showing past-date items)

---

## Data Access Layer Architecture

### File structure

Follow the established pattern from Tool Launcher and Project Spotlight:

```
apps/hb-webparts/src/homepage/data/
├── announcementsListSource.ts     ← REST API fetch + raw → normalized mapping
├── kudosListSource.ts             ← REST API fetch + raw → normalized mapping
├── celebrationsListSource.ts      ← REST API fetch + raw → normalized mapping
├── useAnnouncementsData.ts        ← React hook with cache + loading/error state
├── useKudosData.ts                ← React hook with cache + loading/error state
├── useCelebrationsData.ts         ← React hook with cache + loading/error state
└── spContext.ts                   ← (existing) site URL storage
```

### Three-layer pattern per source

1. **Raw SharePoint type** — matches REST response shape exactly (nullable fields, Hyperlink objects, Person expand shapes)
2. **List source function** — `fetch` + field mapping + normalization, returns clean domain types
3. **React hook** — calls list source, manages loading/error/cache state, returns `{ data, isLoading, error }`

### Cache strategy

- In-memory TTL cache per hook (5 minutes, matching existing pattern)
- AbortController for cleanup on unmount
- Graceful degradation: return `undefined` when SPFx context unavailable

---

## Kudos Moderation Model

### Submission flow

```
Employee submits Kudos
    → New list item created with Status = 'Pending'
    → SubmittedById = current user (automatic)
    → SubmittedDate = now (automatic)
    → Item invisible on homepage and dedicated page feed
    → Item visible to submitter in "Your Pending Kudos" section
    → Item visible to configured reviewers in moderation workspace
```

### Approval flow

```
Reviewer opens moderation workspace
    → Sees pending queue (oldest first)
    → Opens Kudos detail
    → Approves or rejects

On approval:
    → Status = 'Approved'
    → ApprovedById = reviewer (automatic)
    → ApprovedDate = now (automatic)
    → Item becomes visible on homepage and dedicated page
    → 14-day homepage age-off clock starts from ApprovedDate

On rejection:
    → Status = 'Rejected'
    → Item remains invisible on homepage and dedicated page
    → Item remains visible to submitter with rejection status
```

### Pin/unpin flow

```
Reviewer pins approved Kudos
    → IsPinned = true
    → Item bypasses 14-day age-off
    → Item remains on homepage until unpinned

Reviewer unpins Kudos
    → IsPinned = false
    → Normal 14-day age-off resumes from ApprovedDate
    → If already past 14 days, item drops from homepage on next render
```

### Celebrate reaction flow

```
Employee clicks Celebrate on approved Kudos
    → CelebrateCount incremented
    → No approval needed for reactions
    → Count displayed on homepage module and dedicated page
```

### Implementation approach

Kudos write operations (submit, approve, reject, pin, celebrate) use the SharePoint REST API for list item creation and updates:

- **Submit:** `POST /_api/web/lists/getbytitle('People Culture Kudos')/items`
- **Approve/Reject:** `MERGE /_api/web/lists/getbytitle('People Culture Kudos')/items(itemId)` updating `Status`, `ApprovedById`, `ApprovedDate`
- **Pin/Unpin:** `MERGE` updating `IsPinned`
- **Celebrate:** `MERGE` incrementing `CelebrateCount`

All write operations require `X-RequestDigest` for SharePoint request validation.

---

## Reviewer/Approver Property Mapping

### Webpart property

The Kudos reviewer/approver is configured through the webpart's property bag (manifest-driven, following existing pattern):

```json
{
  "kudosApprover": {
    "approverType": "group",
    "approverIds": ["group-id-1"]
  }
}
```

### Resolution at runtime

1. Webpart reads `kudosApprover` from property bag
2. If `approverType` is `'person'`: compare current user ID against `approverIds`
3. If `approverType` is `'group'`: check current user's group membership against `approverIds` via `/_api/web/sitegroups(groupId)/users` or `/_api/web/currentuser/groups`
4. If current user is a configured approver: show moderation workspace access
5. If no approver configured: surface authoring governance message ("Kudos approver not configured")

### Authoring governance integration

Register the Kudos approver requirement in the existing authoring governance system:

```typescript
// In authoringGovernance.ts, peopleCulture entry
kudosApprover: {
  ownerRole: 'People Operations',
  requiredProperty: 'kudosApprover',
  noConfigMessage: 'Kudos moderation requires a configured reviewer. Set the Kudos approver in webpart properties.',
}
```

---

## Fallback Behavior

### No SPFx context available

When the webpart renders outside SharePoint (development, preview):

- List sources return `undefined`
- Hooks report `isLoading: false`, `data: undefined`
- Webpart falls back to property-bag config if available
- Graceful empty state if no data source is available

### List does not exist

If a SharePoint list has not been provisioned:

- REST API returns 404
- List source catches the error and returns `undefined`
- Hook surfaces `error` message
- Webpart renders authoring governance message ("List not found — contact site admin")

### Empty list

- Band A: collapses entirely (no announcements)
- Kudos: shows empty recognition state with Give Kudos CTA still active
- Band B: shows empty celebration state
- All three empty: webpart shows a single intentional empty state

---

## What This Phase Excludes

- No list provisioning — lists are created by site admins or provisioning scripts, not by the webpart
- No TypeScript implementation — data access architecture is specified here, built in Phase 2
- No UI implementation — moderation workspace UI is built in Phase 6
- No rules engine implementation — visibility logic is specified in Phase 1B, built in Phase 2+
