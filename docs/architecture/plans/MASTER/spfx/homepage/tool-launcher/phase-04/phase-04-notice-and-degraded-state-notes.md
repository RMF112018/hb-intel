# Phase 04 — Notice and Degraded State Notes

## 1. Notice Rendering Strategy

### Priority ordering

Notices are sorted by tone severity before rendering:

| Priority | Tone | Visual treatment |
|----------|------|------------------|
| 0 (highest) | `critical` | Red badge, AlertTriangle icon, urgent left-border accent |
| 1 | `warning` | Orange badge, AlertTriangle icon, urgent left-border accent |
| 2 | `info` | Blue badge, AlertCircle icon, standard section styling |
| 3 | `success` | Green badge, AlertCircle icon, standard section styling |
| 4 (lowest) | `neutral` | Gray badge, AlertCircle icon, standard section styling |

Within the same priority level, notices are sorted alphabetically by platform name.

### Urgent notice emphasis

When any notice has `critical` or `warning` tone:
- Section container gets a **3px left border** in `rgba(200,40,40,0.3)` for visual urgency signal
- Section icon changes from `AlertCircle` to `AlertTriangle`
- Count badge uses red-tinted background (`rgba(200,40,40,0.1)`) instead of neutral gray

This emphasis is section-level, not per-notice — if any notice is urgent, the entire section signals urgency.

### Per-notice rendering

Each notice renders:
- **Platform name** (bold) — always present (required by normalization)
- **Status badge** — tone-colored inline badge with label text
- **Detail line** (optional) — smaller muted text below the badge, only when `notice.details` exists

When `notice.details` is absent, the notice renders as a compact single line (name + badge). No placeholder or "no details available" text.

### Notice count

The section heading shows a count badge indicating total active notices. The count uses the urgent styling when urgent notices exist.

## 2. Degraded States

### Only notices exist (no help, access, or contacts)

| What renders | Behavior |
|-------------|----------|
| Rail label "Support & Status" | Always present when rail renders |
| Notices section only | Full notice rendering with priority ordering and urgency treatment |
| No empty placeholders | Help, access, and contacts sections are simply absent |

The rail reads as a focused status surface — one section is sufficient for a professional appearance.

### Only help or access links exist (no notices)

| What renders | Behavior |
|-------------|----------|
| Rail label | Present |
| Help and/or access sections | CTA links with ExternalLink icons |
| No notice placeholder | No "no notices" message — section simply absent |

### Notices without details

| Field | Present | Absent |
|-------|---------|--------|
| `notice.label` | Badge text | Falls back to status name (enforced by normalization) |
| `notice.tone` | Tone-colored badge | Default `'info'` blue (enforced by normalization) |
| `notice.details` | Detail line below badge | Detail line suppressed; compact single-line rendering |

### Help exists but access-request does not

Help section renders normally. Access section suppressed. No "no access-request links" placeholder.

### Access-request exists but help does not

Access section renders normally. Help section suppressed. No "no help links" placeholder.

### Support-owner name exists but URL does not

Support contact renders as plain text (non-navigable `<div>`) instead of an anchor. The platform name and owner name still display. No broken-link state.

### No support metadata at all

Entire rail returns `null`. Composition shell body grid collapses from `2fr 1fr` to `1fr`. Flagship stage gets full width. No empty rail placeholder.

### Mixed partial data

Any combination of sections can appear independently:
- Notices + contacts but no help/access → two sections render
- Help only → one section renders
- All four → full rail

The rail always shows the "Support & Status" label regardless of how many sections are populated. This label anchors the region's identity even with a single section.

## 3. Guardrails

| Avoided | Reason |
|---------|--------|
| **Noisy alerts column** | Notices use compact status labels (not alert banners or toast notifications) with priority ordering to surface the most important first |
| **Empty-state placeholders in sections** | Missing sections are suppressed, not rendered with "no data" messages — avoids clutter |
| **Notice-driven visual competition** | Even the urgent treatment (3px left border, AlertTriangle) is a secondary signal — it does not use full-width banners, modal overlays, or animation |
| **Generic fallback sections** | No "general support" catch-all section — each section has a specific contract |
| **Unbounded notice lists** | Notices are not capped at 5 (they come pre-filtered by the normalization layer which excludes expired and inactive), but the source list is practically bounded |
| **Forced rail rendering** | When all sections are empty, the rail suppresses entirely — no empty container with just a label |

## 4. Deferred Items

| Item | Phase | Description |
|------|-------|-------------|
| **Interactive notice expansion** | Future | Click-to-expand or tooltip for notice details; current inline detail text is sufficient |
| **Notice expiry countdown** | Future | Notices with `expiresOn` could show "expires in 2 hours" — currently just badge + details |
| **Per-platform notice linking** | Future | Notices could link to the platform's launch URL or a dedicated status page |
| **Favorites section** | Future | Not yet designed; requires persistence model |
| **Recently-used section** | Future | Not yet designed; requires launch-event tracking |
| **Notice acknowledgment** | Future | No "dismiss" or "seen" behavior for notices |
| **Real-time notice updates** | Future | Notices are fetched once per cache TTL (5 minutes); no push/polling for live updates |
