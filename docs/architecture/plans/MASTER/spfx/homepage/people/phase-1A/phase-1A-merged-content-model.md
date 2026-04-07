# Phase 1A — Merged Content Model Specification

> **Status:** Canonical content model for the People & Culture webpart.
> **Governing architecture:** `00_Architecture/People_Culture_Kudos_Merged_Architecture.md`
> **Existing contracts:** `apps/hb-webparts/src/homepage/webparts/communicationsContracts.ts`
> **Existing models:** `apps/hb-webparts/src/homepage/models/contentModels.ts`

---

## Current State

The existing `PeopleCultureEntry` interface uses a flat event-type model:

```typescript
type PeopleCultureEventType = 'newHire' | 'anniversary' | 'promotion' | 'recognition';
```

This model does not distinguish between Band A and Band B content, has no Kudos domain, no approval workflow, no recipient model, no persistence windows, and no editorial override fields. The `recognition` event type is a generic catch-all that does not represent the distinct Kudos participation engine.

---

## Merged Content Model — Three Domains

The merged content model separates People & Culture into three distinct content domains, each serving a different region of the locked composition.

### Domain 1: Announcements (Band A)

Formal editorial milestones with type-specific persistence windows.

#### Event types

```typescript
type AnnouncementType = 'promotion' | 'baby' | 'wedding' | 'special' | 'newHire';
```

#### Contract: `AnnouncementEntry`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | yes | Unique identifier |
| `personName` | `string` | yes | Person or family name |
| `announcementType` | `AnnouncementType` | yes | Type of announcement |
| `headline` | `string` | yes | Short headline |
| `summary` | `string` | yes | 1–2 line summary |
| `publishDate` | `string` (ISO date) | yes | When the announcement was published |
| `media` | `HomepageMediaSlot` | no | Photo (person, family, event) |
| `cta` | `HomepageCtaLink` | no | Optional deep link or action |
| `startDisplayDate` | `string` (ISO date) | no | Editorial override: start visibility |
| `endDisplayDate` | `string` (ISO date) | no | Editorial override: end visibility |
| `isPinned` | `boolean` | no | Editorial override: pin to keep visible |
| `priorityOverride` | `number` | no | Editorial override: manual sort weight |
| `homepageEnabled` | `boolean` | no | Editorial override: suppress from homepage |
| `audiences` | `string[]` | no | Audience targeting |

#### Persistence windows (defaults)

| Type | Duration |
|------|----------|
| `promotion` | 5 days from `publishDate` |
| `newHire` | 5 days from `publishDate` |
| `baby` | 3 days from `publishDate` |
| `wedding` | 3 days from `publishDate` |
| `special` | 3 days from `publishDate` unless pinned |

#### Display rules

- 2 to 4 visible items on homepage
- Collapse Band A entirely when empty
- Sort by: pinned first, then `priorityOverride`, then `publishDate` descending

---

### Domain 2: Kudos (Kudos Module)

Participation-driven recognition with submission, approval, and reactions.

#### Contract: `KudosEntry`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | yes | Unique identifier |
| `headline` | `string` | yes | Recognition headline |
| `excerpt` | `string` | yes | Short recognition text |
| `submittedBy` | `PersonReference` | yes | Employee who submitted the Kudos |
| `submittedDate` | `string` (ISO date) | yes | When submitted |
| `status` | `KudosStatus` | yes | Approval state |
| `approvedBy` | `PersonReference` | no | Reviewer who approved (set on approval) |
| `approvedDate` | `string` (ISO date) | no | When approved (set on approval) |
| `recipients` | `KudosRecipient[]` | yes | One or more recipients |
| `media` | `HomepageMediaSlot` | no | Photo (employee, team, project) |
| `isPinned` | `boolean` | no | HR override: pin to keep visible |
| `homepageEnabled` | `boolean` | no | HR override: suppress from homepage |
| `publishStartDate` | `string` (ISO date) | no | Editorial override: start visibility |
| `publishEndDate` | `string` (ISO date) | no | Editorial override: end visibility |
| `celebrateCount` | `number` | no | Number of Celebrate reactions (default: 0) |

#### Kudos status

```typescript
type KudosStatus = 'pending' | 'approved' | 'rejected';
```

#### Kudos recipient

```typescript
type KudosRecipientType = 'individual' | 'team' | 'department' | 'projectGroup';

interface KudosRecipient {
  id: string;
  name: string;
  recipientType: KudosRecipientType;
  media?: HomepageMediaSlot; // avatar or photo
}
```

#### Person reference

```typescript
interface PersonReference {
  id: string;
  displayName: string;
  email?: string;
  media?: HomepageMediaSlot; // avatar or photo
}
```

#### Persistence and visibility rules

- Only `approved` Kudos are visible on homepage and dedicated page
- Default homepage age-off: **14 calendar days** from `approvedDate`
- Pinned Kudos remain visible beyond the 14-day window
- `publishStartDate` / `publishEndDate` override age-off when set
- No anonymous submissions — `submittedBy` is always visible

#### Display rules

- 1 featured Kudos item (most recent approved)
- 3 to 6 recent approved headline items
- Sort by: pinned first, then `approvedDate` descending

---

### Domain 3: Weekly Celebrations (Band B)

Compact weekly birthday and anniversary items.

#### Event types

```typescript
type WeeklyCelebrationType = 'birthday' | 'anniversary';
```

#### Contract: `WeeklyCelebrationEntry`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | yes | Unique identifier |
| `personName` | `string` | yes | Full name |
| `celebrationType` | `WeeklyCelebrationType` | yes | Birthday or anniversary |
| `celebrationDate` | `string` (ISO date) | yes | Date of the celebration |
| `anniversaryYears` | `number` | no | Year count (anniversaries only) |
| `media` | `HomepageMediaSlot` | no | Photo or avatar |
| `audiences` | `string[]` | no | Audience targeting |

#### Persistence and visibility rules

- Show celebrations within the **next 7 days** from today
- No editorial override fields — driven entirely by date proximity
- No pinning — Band B is automated

#### Display rules

- 4 to 8 visible items on homepage
- Sort by: `celebrationDate` ascending (soonest first), then alphabetical by `personName`
- Band B must read as the most compact and least editorial of the three regions

---

## Source Strategy

### Homepage surface

The homepage webpart reads from three independent data feeds, one per region:

| Region | Source pattern | Notes |
|--------|--------------|-------|
| Band A | SharePoint list or authored property bag | Filtered by persistence window + editorial overrides |
| Kudos module | SharePoint list | Filtered by `status === 'approved'` + age-off rules |
| Band B | SharePoint list or tenant directory | Filtered by date proximity (next 7 days) |

Each region produces its own normalized output independently. The webpart does not merge all three into a single ranked list.

### Dedicated Kudos page

The dedicated Kudos page reads from the same Kudos source as the homepage module but with broader scope:

- All approved Kudos (not limited to 14-day window)
- Pending Kudos (visible only to submitter and reviewer/approver)
- Browse-by filters: person, team, department, project group
- Long-form submission interface

### HR/admin moderation workspace

The moderation workspace reads from the Kudos source with elevated access:

- All Kudos regardless of status
- Pending queue (primary view)
- Approve / reject / pin / unpin actions
- Publication management

---

## Reviewer/Approver Property Model

The Kudos reviewer/approver must be a **configurable webpart property**.

### Property contract

```typescript
interface KudosApproverConfig {
  approverType: 'person' | 'group';
  approverIds: string[]; // one or more person or group identifiers
}
```

### Behavior

- When `approverType` is `'person'`: each ID references a specific user
- When `approverType` is `'group'`: each ID references a SharePoint group or security group
- Any member of the configured approver set can approve or reject submissions
- The property must be configurable through the SPFx property pane
- If no approver is configured, the webpart must surface a clear author-facing message (no silent failure)

---

## Shared Supporting Types

The merged model reuses existing homepage primitives:

| Type | Source | Usage |
|------|--------|-------|
| `HomepageMediaSlot` | `contentModels.ts` | Photos, avatars, project imagery across all three domains |
| `HomepageCtaLink` | `contentModels.ts` | CTAs for announcements, Kudos detail links, page navigation |

No new shared primitives are required at this phase.

---

## Migration Path from Current Model

The existing flat model must be replaced, not extended:

| Current | Merged |
|---------|--------|
| `PeopleCultureEventType` (flat union) | Split into `AnnouncementType`, `KudosStatus` + `KudosRecipientType`, `WeeklyCelebrationType` |
| `PeopleCultureEntry` (single interface) | Split into `AnnouncementEntry`, `KudosEntry`, `WeeklyCelebrationEntry` |
| `PeopleCultureConfig` (single config) | Split into per-region configs with independent display limits |
| `recognition` event type | Retired — replaced by distinct `KudosEntry` domain |
| `newHire` event type | Retired from this webpart — new hires are an announcement or a separate surface concern |

### `newHire` disposition

**Resolved in Phase 1B:** New-hire announcements are treated as a Band A announcement type with a 5-day persistence window (same as promotions). `'newHire'` is included in `AnnouncementType` and all standard editorial overrides apply.

---

## What This Phase Excludes

- No TypeScript implementation — contracts are specified here, built in Phase 2+
- No rules engine — visibility and persistence logic is specified here, built in Phase 1B+
- No UI implementation — layouts are governed by the merged architecture, built in Phase 3+
- No packaging work
