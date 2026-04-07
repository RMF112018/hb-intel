# P01 — Homepage People & Culture Surface Blueprint

**Date:** 2026-04-07
**Phase:** 11 / P01 — Information Architecture and Surface Blueprint
**Depends on:** P00 Decision Record (PeopleCultureMerged survives, rail-first, single integrated module)

---

## Product Identity

The homepage People & Culture surface is a single integrated editorial module that combines recognition, announcements, and celebrations into one coherent experience. It is not three admin panels stacked vertically.

**Tone:** Warm, participatory, human. The surface should feel like the most personal area of the homepage — a place that knows the people, not just the org chart.

**Posture:** Rail-first. The primary design target is a narrow column (300-400px) typical of SharePoint right-rail or narrow-section placement. Wide-mode adaptation is secondary.

---

## Focal Sequence

The content regions render in a fixed priority order. The order is chosen to lead with the warmest, most participatory content and close with ambient density.

| Priority | Region | Content | Character |
|----------|--------|---------|-----------|
| 1 (top) | **Kudos Recognition** | Featured spotlight + recent headlines | Warmest — drives engagement, most visual |
| 2 (middle) | **Announcements** | Promotions, new hires, life events | Formal but human — time-sensitive |
| 3 (bottom) | **Celebrations** | Birthdays, work anniversaries this week | Lightest — ambient density, compact |

**Rationale for Kudos-first:** The remediation doctrine requires "participation-oriented, not just informational." Kudos spotlights (with names, photos, and a Celebrate action) are the strongest engagement driver and the most visually rich content. Leading with Kudos establishes warmth before the more formal announcement cards.

---

## Rail-Mode Composition (Primary)

**Target width:** 300-400px (SharePoint narrow column)
**Layout:** Single column, no internal grids

### Module Header

- Title: "People & Culture" (configurable via manifest `heading` property)
- No subtitle in rail mode
- Optional header CTA: "Give Kudos" (small, ghost variant)

### Region 1: Kudos Recognition

**Featured Spotlight** (when available):
- Recipient avatar or media (max 64px in rail)
- Headline (single line, truncated)
- Recipient name(s) (comma-separated if multiple)
- Submitter attribution ("From {name}")
- Celebrate button with count (compact inline)
- Warm accent left-border (orange `#E57E46`, 3px)

**Recent Headlines** (up to 4 in rail):
- Compact list: avatar placeholder (24px) + headline + recipient name
- No media, no excerpt — headline density only
- Ordered by approval date descending

**Transition to next region:** Subtle separator (1px, muted), not a box boundary.

### Region 2: Announcements

**Compact card sequence** (up to 3 in rail):
- Each card: announcement type badge (colored, small) + person name + headline
- One line per card — no summary text in rail mode
- Type badge colors: promotion=critical (red-orange), newHire=info (blue), baby/wedding=success (green), special=warning (amber)
- Cards stack vertically with tight spacing (8px gap)

**Transition:** Same subtle separator style.

### Region 3: Celebrations

**Dense avatar strip:**
- Horizontal row of avatar circles (32px) with name below (truncated to first name)
- Celebration type icon overlay (small, bottom-right of avatar): cake for birthday, star for anniversary
- Scrollable horizontally if more than fits in width
- Max visible: 6 in rail, overflow indicated by fade/gradient on trailing edge
- Anniversary year shown as small badge on avatar if available

### Module Footer

- "View all" link → People & Culture destination page (when wired, P04)
- Ghost style, right-aligned, small text

---

## Wide-Mode Adaptation (Secondary)

**Trigger:** Container width > 480px (detected via `useResponsiveTier` or container query)

**Differences from rail:**

| Element | Rail | Wide |
|---------|------|------|
| Kudos spotlight media | 64px avatar | Up to 120px, side-by-side with text |
| Kudos recent headlines | 4 items, single column | 6 items, single column |
| Announcement cards | Headline-only, stacked | Headline + 1-line summary, 2-column grid at >640px |
| Celebrations | Horizontal avatar strip | Grid of compact tiles (avatar + name + type + date) |
| Module header CTA | "Give Kudos" only | "Give Kudos" + "View All Kudos" side by side |
| Max announcements | 3 | 4 |
| Max celebrations | 6 | 8 |

Wide mode does **not** change the focal sequence or the suppression rules. It simply allows each region more visual breathing room.

---

## Unified Visual Language

To avoid the "three stacked admin modules" failure mode:

1. **Single module header** — only the top-level "People & Culture" header renders as a section title. Regions use lightweight inline labels (eyebrow text, not section headers).
2. **Shared badge system** — all type indicators (announcement types, celebration types, Kudos status) use `HbcPremiumBadge` with consistent sizing.
3. **Shared CTA system** — all interactive prompts use `HbcPremiumCta` with consistent ghost/arrow variants.
4. **Separator rhythm** — regions are separated by subtle 1px separators, not card borders or background color changes. The module itself has the only visible boundary.
5. **Color discipline** — primary blue `#225391` for structural elements, warm orange `#E57E46` only for Kudos accent and celebrate actions. No per-region color theming.
6. **Typography scale** — module title at section scale, region eyebrow labels at caption scale, content at body scale. No competing heading sizes between regions.

---

## Relationship to Destination Pages

The homepage surface is a **summary view** — it shows the most recent/featured content and provides entry points to deeper experiences.

| Homepage Surface | Destination Page |
|-----------------|-----------------|
| Kudos featured spotlight | Full Kudos detail view |
| Kudos recent headlines | Kudos archive / listing |
| Announcement cards | Announcement detail or archive |
| Celebration avatars | (No deep link — ambient only) |
| "Give Kudos" CTA | Kudos submission flow |
| "View all" footer | People & Culture hub page |

Destination pages are **out of scope for P01** but must be assumed to exist for CTA wiring in P04. If a destination does not exist at wiring time, the CTA must render as a disabled or hidden element — never as a dead link.

---

## Governing References

- P00 Decision Record: `phase-11/P00-Decision-Record.md`
- SPFx Governing Standard: `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- Homepage Overlay: `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- Design Brief §13.8: People & Culture signature webpart
- Remediation Summary: `phase-11/People_Culture_Remediation_Package_Summary.md`
