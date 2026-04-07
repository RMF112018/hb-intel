# Phase 1B — Visibility, Approval, and Aging Rules

> **Status:** Canonical business rules for the People & Culture webpart.
> **Governing architecture:** `00_Architecture/People_Culture_Kudos_Merged_Architecture.md`
> **Content model:** `phase-1A/phase-1A-merged-content-model.md`
> **Source strategy:** `phase-1A/phase-1A-source-strategy-and-moderation-model.md`

---

## Governing Principle

Each of the three content regions (Band A, Kudos Module, Band B) has its own independent visibility rules. Content is never merged across regions into a single ranked list. Rules are evaluated per-region, and each region can be independently empty, partially populated, or fully populated.

---

## Band A — Announcement Visibility Rules

### Persistence windows

Each announcement type has a fixed default persistence window measured from `publishDate`:

| Announcement Type | Default Duration |
|-------------------|-----------------|
| `promotion` | 5 calendar days |
| `baby` | 3 calendar days |
| `wedding` | 3 calendar days |
| `special` | 3 calendar days |

An announcement is **visible** when:

```
today >= publishDate
AND today <= publishDate + persistenceDays
```

### Editorial overrides

Editorial override fields take precedence over default persistence when present:

| Override | Effect |
|----------|--------|
| `startDisplayDate` | If set, replaces `publishDate` as visibility start |
| `endDisplayDate` | If set, replaces `publishDate + persistenceDays` as visibility end |
| `isPinned = true` | Bypasses persistence expiry entirely — item remains visible until unpinned or `endDisplayDate` reached |
| `homepageEnabled = false` | Suppresses the item from homepage regardless of all other rules |
| `priorityOverride` | Overrides natural sort position (lower number = higher priority) |

### Override precedence

Evaluate in this order:

1. **`homepageEnabled`** — if `false`, item is invisible (stop)
2. **`startDisplayDate` / `endDisplayDate`** — if both set, use them as the visibility window
3. **`startDisplayDate` only** — use as start, apply default persistence from `startDisplayDate`
4. **`endDisplayDate` only** — use `publishDate` as start, `endDisplayDate` as end
5. **`isPinned`** — if `true` and no `endDisplayDate`, item never ages off
6. **Default** — use `publishDate` and type-specific persistence window

### Visibility decision pseudocode

```
function isAnnouncementVisible(item, today):
  if item.homepageEnabled === false:
    return false

  start = item.startDisplayDate ?? item.publishDate
  if today < start:
    return false

  if item.endDisplayDate:
    return today <= item.endDisplayDate

  if item.isPinned:
    return true

  persistenceDays = PERSISTENCE_MAP[item.announcementType]
  return today <= start + persistenceDays
```

### Sort order

After filtering for visibility:

1. `isPinned = true` items first
2. `priorityOverride` ascending (lower = higher priority; items without override sort after those with one)
3. `publishDate` descending (newest first)
4. `personName` alphabetical (tie-break)

### Display volume

- Show **2 to 4** visible items
- If zero visible items, **collapse Band A entirely** — do not render an empty shell

---

## Kudos Module — Visibility and Approval Rules

### Approval gate

Kudos items are **only visible on the homepage and dedicated page feed** when:

```
item.status === 'approved'
```

Items with `status === 'pending'` or `status === 'rejected'` are never shown in public-facing feeds.

### Pending visibility (restricted)

| Surface | Visible to |
|---------|------------|
| Submitter's "Your Pending Kudos" section | Submitter only |
| Moderation workspace pending queue | Configured reviewers/approvers only |

### Rejected visibility (restricted)

| Surface | Visible to |
|---------|------------|
| Submitter's submissions view | Submitter only (with rejection status) |
| Moderation workspace history | Configured reviewers/approvers only |

### Age-off rule

Approved Kudos items on the **homepage** age off after **14 calendar days** from `approvedDate`:

```
today <= approvedDate + 14 days
```

The **dedicated Kudos page** has no age-off — it shows the full approved archive.

### Editorial overrides

| Override | Effect |
|----------|--------|
| `isPinned = true` | Bypasses 14-day age-off — item remains on homepage until unpinned |
| `homepageEnabled = false` | Suppresses from homepage (item still visible on dedicated page) |
| `publishStartDate` | If set, replaces `approvedDate` as homepage visibility start |
| `publishEndDate` | If set, overrides 14-day age-off as hard end date |

### Override precedence

Evaluate in this order:

1. **`status`** — if not `'approved'`, item is invisible in public feeds (stop)
2. **`homepageEnabled`** — if `false`, item is invisible on homepage (still visible on dedicated page)
3. **`publishStartDate` / `publishEndDate`** — if set, use as homepage visibility window
4. **`isPinned`** — if `true` and no `publishEndDate`, item never ages off homepage
5. **Default** — use `approvedDate` and 14-day window

### Homepage visibility decision pseudocode

```
function isKudosHomepageVisible(item, today):
  if item.status !== 'approved':
    return false

  if item.homepageEnabled === false:
    return false

  start = item.publishStartDate ?? item.approvedDate
  if today < start:
    return false

  if item.publishEndDate:
    return today <= item.publishEndDate

  if item.isPinned:
    return true

  return today <= item.approvedDate + 14 days
```

### Celebrate reactions

- Any authenticated employee can Celebrate any approved Kudos item
- Celebrate is a single positive reaction type — no other reaction types exist
- Celebration is idempotent per user per item (one Celebrate per user per Kudos)
- `celebrateCount` reflects total unique Celebrate reactions
- Celebrate reactions require no approval
- Celebrate reactions do not affect visibility or sort order

### No anonymous submissions

- Every Kudos submission must have a `submittedBy` person reference
- The submitter is always visible on the published item
- Anonymous submission is not supported and must not be implemented

---

## Band B — Weekly Celebration Visibility Rules

### Date proximity rule

Weekly celebrations are visible when the celebration date falls within the **next 7 calendar days** from today (inclusive):

```
today <= celebrationDate <= today + 7 days
```

### No editorial overrides

Band B items have no pinning, no manual suppression, and no persistence window overrides. Visibility is **entirely date-driven**.

### Audience filtering

If `audiences` is set on an item, the item is only visible to users matching at least one audience value. If `audiences` is empty or not set, the item is visible to all users.

### Sort order

1. `celebrationDate` ascending (soonest first)
2. `personName` alphabetical (tie-break)

### Display volume

- Show **4 to 8** visible items
- Band B must read as the most compact and least editorial of the three regions
- If zero visible items, show a minimal empty state (do not collapse entirely — Band B's weekly rhythm should always feel present)

---

## `newHire` Disposition

The current `PeopleCultureEventType` includes `newHire`. Under the merged architecture:

**Decision:** New-hire announcements are treated as a Band A announcement type.

- Add `'newHire'` to `AnnouncementType`: `'promotion' | 'baby' | 'wedding' | 'special' | 'newHire'`
- Persistence window: **5 calendar days** (same as promotions — new hires are formal editorial milestones)
- All standard editorial overrides apply

This keeps new-hire moments visible in the editorial announcement layer without creating a separate surface concern.

---

## Cross-Region Rules

### Independence

- Band A, Kudos Module, and Band B are **never merged** into a single content list
- Each region filters, sorts, and truncates independently
- Empty state in one region does not affect display of other regions

### Rendering order

Regions always render in locked order regardless of content volume:

1. Band A (or collapsed if empty)
2. Kudos Module
3. Band B

### Audience filtering

Band A and Band B support audience filtering via the `audiences` field and `isVisibleForAudience()` helper. Kudos does not support audience filtering — all approved Kudos are visible to everyone in the company.

---

## Summary of Visibility Rules

| Rule | Band A | Kudos | Band B |
|------|--------|-------|--------|
| Approval gate | No | Yes (`status === 'approved'`) | No |
| Default persistence | Type-specific (3–5 days) | 14 days from `approvedDate` | Next 7 days from today |
| Pinning | Yes | Yes | No |
| Editorial start/end override | Yes | Yes | No |
| Homepage suppression | Yes (`homepageEnabled`) | Yes (`homepageEnabled`) | No |
| Priority override | Yes (`priorityOverride`) | No | No |
| Audience filtering | Yes | No (companywide) | Yes |
| Collapse when empty | Yes (collapse entirely) | No (show empty + CTA) | No (show minimal state) |
| Reactions | No | Yes (Celebrate) | No |
| Anonymous allowed | N/A | No | N/A |

---

## What This Phase Excludes

- No adapter implementation — rules are specified here, built in Phase 2
- No UI implementation — empty states and layouts are built in Phase 3+
- No package changes
