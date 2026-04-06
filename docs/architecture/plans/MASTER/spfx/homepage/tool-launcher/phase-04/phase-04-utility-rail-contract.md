# Phase 04 — Utility Rail Contract

## 1. Current-State Utility-Rail Gap

### What the Phase 02–03 rail was doing

The utility rail had three sections (notices, help, access) with independently suppressible rendering. However:

- **No rail-level label** — the region had no heading to identify its purpose
- **No CTA distinction** — help and access links used the same muted link style as metadata, lacking a clear action affordance
- **No ExternalLink icon** — CTA links didn't communicate that they navigate externally
- **No support contacts section** — platforms with `supportOwnerName` and `supportOwnerUrl` had no dedicated rendering
- **No notice count** — notices heading didn't indicate how many active notices exist

### What a real utility rail requires

- A labeled region ("Support & Status") so the rail reads as a purposeful secondary surface
- Clear CTA styling for actionable links (help, access request) — blue, with ExternalLink icon
- Quiet metadata styling for informational content (support contacts) — muted, no icon affordance
- Notice count in the heading for at-a-glance awareness
- Support contacts section for platforms with named support owners

## 2. Utility-Rail Contract

### Content categories (ordered by priority)

| # | Category | Section | Type | Icon | Purpose |
|---|----------|---------|------|------|---------|
| 1 | **Platform Notices** | `NoticesSection` | Metadata (status labels) | AlertCircle | Surface outages, maintenance, and info notices with tone-colored badges |
| 2 | **Need Help** | `NeedHelpSection` | CTA (action links) | Info | Navigate to platform help destinations |
| 3 | **Request Access** | `RequestAccessSection` | CTA (action links) | Link2 | Navigate to platform access-request destinations |
| 4 | **Support Contacts** | `SupportContactsSection` | Metadata (quiet links) | Users | Show support owner names, optionally navigable |

### Required vs optional fields per section

**Notices:**
| Field | Required | Source |
|-------|----------|--------|
| `notice.status` (≠ 'none') | Yes | `LauncherPlatformRecord.notice` |
| `notice.label` | No | Falls back to status string |
| `notice.tone` | No | Default 'info' |
| `notice.details` | No | Detail line suppressed if absent |

**Need Help:**
| Field | Required | Source |
|-------|----------|--------|
| `support.helpUrl` | Yes (section gating) | `LauncherPlatformRecord.support` |
| `name` | Yes | Platform name for link label |

**Request Access:**
| Field | Required | Source |
|-------|----------|--------|
| `support.accessRequestUrl` | Yes (section gating) | `LauncherPlatformRecord.support` |
| `name` | Yes | Platform name for link label |

**Support Contacts:**
| Field | Required | Source |
|-------|----------|--------|
| `support.supportOwnerName` | Yes (section gating) | `LauncherPlatformRecord.support` |
| `support.supportOwnerUrl` | No | If present, name renders as navigable link; otherwise, plain text |
| `name` | Yes | Platform name for context |

### CTA vs metadata distinction

| Rendering type | Visual treatment | Used by |
|---------------|------------------|---------|
| **CTA links** | Blue (#225391), 500 weight, flex row with ExternalLink icon (11px) | Help, Access Request |
| **Metadata labels** | Status badges with tone colors in notice items | Notices |
| **Metadata links** | Muted (`rgba(0,0,0,0.6)`), no icon, smaller font (0.75rem) | Support Contacts |

### Item limits

Each CTA/metadata section renders at most **5 items** to prevent the rail from overflowing. This cap is enforced with `.slice(0, 5)` in each section renderer.

## 3. Suppression and Escalation Rules

### Section-level suppression

| Section | Suppresses when |
|---------|----------------|
| Platform Notices | No active notices in `presentation.noticesSummary.activeNotices` |
| Need Help | No platforms have `support.helpUrl` |
| Request Access | No platforms have `support.accessRequestUrl` |
| Support Contacts | No platforms have `support.supportOwnerName` |

### Rail-level suppression

The entire `LauncherUtilityRail` returns `null` when **all four sections** have no data. The composition shell's body grid then collapses from `2fr 1fr` to `1fr`, giving the flagship stage full width.

### Escalation (what gets deferred)

| Content | Phase | Reason |
|---------|-------|--------|
| Favorites section | Future | Requires persistence model not yet designed |
| Recently-used tracking | Future | Requires launch-event tracking not yet implemented |
| Interactive notice detail overlay | Future | Current inline detail text is sufficient for skeleton |
| Support chat/ticket integration | Future | Out of scope for launcher utility rail |

## 4. Structural Coding Plan

### `LauncherUtilityRail.tsx` (refined)

**Location:** `apps/hb-webparts/src/webparts/toolLauncherWorkHub/LauncherUtilityRail.tsx`

**Responsibility:** Secondary support surface with 4 independently suppressible sections. Accepts `LauncherPresentationModel` and `LauncherPlatformRecord[]`.

**Structure:**
```
<div> [rail container, grid gap 10px]
  <p> "Support & Status" [rail label, uppercase, muted]
  <NoticesSection />     [if active notices exist]
  <NeedHelpSection />    [if any platform has helpUrl]
  <RequestAccessSection /> [if any platform has accessRequestUrl]
  <SupportContactsSection /> [if any platform has supportOwnerName]
</div>
```

**Data flow:**
- `presentation.noticesSummary.activeNotices` → `NoticesSection`
- `platforms.filter(p => p.support.helpUrl)` → `NeedHelpSection`
- `platforms.filter(p => p.support.accessRequestUrl)` → `RequestAccessSection`
- `platforms.filter(p => p.support.supportOwnerName)` → `SupportContactsSection`

**No changes to other components.** The composition shell, command band, flagship stage, and workflow shelves are unchanged. The rail's position in the shell is preserved.

## 5. Guardrails

| Must not | Reason |
|----------|--------|
| Let the rail become a second launcher | The rail shows support metadata and CTAs, not launch cards |
| Let the rail visually compete with the flagship stage | Rail uses quiet card sections (subtle border, muted headings, 0.72rem text) while flagship uses prominent cards (standard border, 0.92rem names, motion) |
| Create a noisy alerts dashboard | Notices are compact status labels with optional detail text, not alert banners or modal notifications |
| Fill the rail with generic cards | Each section has a specific contract and data source — no catch-all "rail content" bucket |
| Bind to raw SharePoint fields | All data comes from `LauncherPlatformRecord` and `LauncherPresentationModel` |
| Move support logic to `@hbc/ui-kit` | Tenant-specific support metadata is launcher business logic, not reusable UI |
| Remove section suppression | Each section must independently suppress when its data is empty |
