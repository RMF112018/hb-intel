# P01 — CTA and Destination Map: People & Culture Homepage Surface

**Date:** 2026-04-07
**Phase:** 11 / P01 — Information Architecture and Surface Blueprint

---

## Overview

Every interactive element on the homepage People & Culture surface falls into one of two categories:

- **Homepage prompt** — an action the user can initiate from the homepage itself (participate, celebrate)
- **Destination link** — navigation to a deeper page for full content, archives, or workflows

CTAs that have no wired destination must be hidden, not rendered as dead links. P04 will wire each CTA to its actual target.

---

## CTA Inventory

### Homepage Prompts (Participation Actions)

| CTA | Location | Variant | Behavior | Destination (P04) |
|-----|----------|---------|----------|-------------------|
| **Give Kudos** | Module header (rail + wide) | `HbcPremiumCta` ghost, small | Opens Kudos submission flow | Kudos submission form or modal |
| **Celebrate** | Kudos spotlight item | Inline button, compact | Increments celebrate count on the kudos entry | In-place action (no navigation) |

### Destination Links (Navigate Away)

| CTA | Location | Variant | Behavior | Destination (P04) |
|-----|----------|---------|----------|-------------------|
| **View All Kudos** | Module header (wide mode only) | `HbcPremiumCta` ghost, small | Navigates to Kudos archive | Kudos listing/archive page |
| **View all** | Module footer | Ghost text link, right-aligned | Navigates to People & Culture hub | People & Culture hub/landing page |
| **Announcement headline** | Announcement card | Text link (implicit tap target) | Navigates to announcement detail | Announcement detail page (if exists) |
| **Kudos headline** | Recent kudos headline row | Text link (implicit tap target) | Navigates to kudos detail | Kudos detail page (if exists) |

### Intentionally No CTA

| Element | Reason |
|---------|--------|
| Celebration avatar/tile | Ambient content — no meaningful deep destination for a birthday listing. Tapping does nothing. |
| Announcement type badge | Decorative indicator, not interactive. |
| Region eyebrow labels | Structural labels, not links. |

---

## CTA Visibility Rules

| Condition | Give Kudos | View All Kudos | View all (footer) | Celebrate | Headline links |
|-----------|-----------|---------------|-------------------|-----------|---------------|
| Destination wired | Show | Show (wide only) | Show | Show | Show |
| Destination not wired | **Hide** | **Hide** | **Hide** | **Hide** | Render as plain text (not clickable) |
| Region suppressed (empty) | Still visible in header | Hidden (no Kudos region) | Still visible | Hidden (no spotlight) | Hidden (no items) |
| Loading state | Hidden | Hidden | Hidden | Hidden | Hidden |
| Edit mode | Show (normal rendering) | Show (normal rendering) | Show | Show | Show |

**Rule:** A CTA is never rendered in a broken or dead-link state. If the destination is unknown or unavailable, the CTA does not appear in the DOM. Headline text still renders but without link treatment.

---

## CTA Styling Guide

| CTA Type | Component | Size | Variant | Icon |
|----------|-----------|------|---------|------|
| Give Kudos | `HbcPremiumCta` | small | ghost | None |
| View All Kudos | `HbcPremiumCta` | small | ghost, with arrow | Arrow right |
| View all (footer) | `HbcPremiumCta` | small | ghost, with arrow | Arrow right |
| Celebrate | Custom inline button | compact | Warm accent (`#E57E46`) | Heart or similar (P02 decision) |
| Headline links | Native anchor or button | body text size | Underline on hover | None |

---

## Homepage vs Destination Relationship

```
Homepage Surface (summary)          Destination Pages (full)
─────────────────────────          ─────────────────────────
Kudos spotlight (1 item)     →     Kudos detail page
Kudos recent (up to 4-6)    →     Kudos archive / listing
Announcement cards (up to 3-4) →  Announcement detail / archive
Celebrations strip (up to 6-8) →  (no destination — ambient)
"Give Kudos" prompt          →     Kudos submission flow
"View all" footer            →     People & Culture hub page
```

The homepage surface shows the **latest and most featured** content. It is not a paginated list or a dashboard. Its job is to give a pulse-check and invite participation, then get out of the way.

---

## P04 Wiring Contract

When P04 wires destinations, each CTA must resolve to one of:

1. **Internal SPFx page route** — a SharePoint page within the tenant
2. **External URL** — a link to an external tool or form
3. **In-place action** — a client-side action that does not navigate (e.g., Celebrate count increment)
4. **Hidden** — the CTA is suppressed because no destination exists yet

P04 must not invent placeholder pages. If a destination does not exist, the CTA stays hidden until the destination is built.
