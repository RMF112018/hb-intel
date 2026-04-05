# Phase 08 Screen Reader and Keyboard Guide

Expected screen reader behavior and keyboard navigation for the homepage ecosystem.

**Note:** This guide is based on code-level DOM structure analysis. Screen reader behavior is inferred, not tested with live assistive technology. Inferences are marked with "(inferred)".

## Lane A — Expected Landmark Structure

```
<main> (SharePoint page container)
  └── <section aria-label="Homepage Top Band">        ← section landmark
        └── <div role="region" aria-label="top-band-pair"> ← region landmark
              ├── Welcome Header (HbcCard)
              └── Hero Banner (HbcCard)
  └── <section aria-label="Quick-use / Work Zone">    ← section landmark
        └── <div role="region" aria-label="priority-actions-rail">
        └── <div role="region" aria-label="tool-launcher-work-hub">
  └── <section aria-label="Communications">           ← section landmark
        └── Company Pulse (section + featured/secondary)
        └── Leadership Message (section)
        └── People & Culture (section)
  └── <section aria-label="Operational Awareness">    ← section landmark
        └── Project Spotlight (section)
        └── Safety Excellence (section)
  └── <section aria-label="Discovery">                ← section landmark
        └── Smart Search (section + nav for quick paths)
```

## Lane A — Expected Screen Reader Announcements

### VoiceOver (macOS/iOS) — (inferred)

| Action | Expected Announcement |
|--------|----------------------|
| Navigate to Welcome Header | "Good morning, [name]. heading level 2" |
| Navigate to Hero Banner | "Hero banner, region. [headline], heading level 2" |
| Hero empty state | "status: [authoring message title]. [description]" |
| Loading state | "status: Loading [label]" |
| CTA link | "Read update →, link" |
| Search input | "Search resources, search text field" |
| No search results | "status: [no results message]" |

### NVDA/JAWS (Windows) — (inferred)

| Action | Expected Announcement |
|--------|----------------------|
| Landmark navigation (NVDA: D key) | Zone sections announced by aria-label |
| Navigate to alert banner | "Banner landmark. HB Intel top ribbon" |
| Alert band update | "status: [alert message]" (polite live region) |
| Dismiss button | "Dismiss [severity] alert, button" |

## Lane A — Keyboard Navigation

### Tab order (expected)

1. Welcome Header: alert CTA (if present)
2. Hero Banner: CTA link
3. Priority Actions: action links → badges
4. Tool Launcher: tool links
5. Company Pulse: featured CTA → secondary CTAs
6. Leadership Message: CTA
7. People & Culture: CTA
8. Project Spotlight: CTA
9. Safety Excellence: CTA
10. Smart Search: search input → quick path links → resource links

### Focus-visible indicators

All interactive elements use `outline: 2px solid #225391; outline-offset: 2px` via the `.ctaLink:focus-visible` CSS module class.

The search input uses `border-color: #225391; box-shadow: 0 0 0 1px #225391` via `.searchInput:focus-visible`.

### No keyboard traps

All content is flat semantic HTML. No modals, dialogs, or custom focus management. Tab key always moves forward through the document.

---

## Lane B — Expected Landmark Structure

```
<div role="banner" aria-label="HB Intel top ribbon">  ← banner landmark
  └── <nav aria-label="Quick utilities">               ← navigation landmark
  └── <div role="status" aria-live="polite">           ← live region (alert band)

<div role="contentinfo" aria-label="HB Intel footer rail"> ← contentinfo landmark
  └── <nav aria-label="Footer utilities">              ← navigation landmark
  └── <div> (support band)
```

## Lane B — Keyboard Navigation

### Tab order (top placeholder)

1. Ribbon utility links (left to right)
2. Alert CTA links (per alert)
3. Alert dismiss buttons (per dismissible alert)

### Tab order (bottom placeholder)

1. Footer utility links (left to right)
2. Support item links (if present)

### Focus-visible indicators

Ribbon links: `outline: 2px solid #225391; outline-offset: 1px`
Alert CTAs/dismiss: `outline: 2px solid currentColor; outline-offset: 1px`
Footer links: same as ribbon

---

## Risk Points for Live Testing

| Risk | Lane | Severity | Notes |
|------|------|----------|-------|
| Secondary text at 0.75 opacity may be low contrast for small font sizes | A | Medium | 0.8125rem body text at 75% opacity ≈ 3.2:1 — borderline for normal text AA |
| Multiple `role="status"` regions on same page | A | Low | Multiple live regions may cause verbose announcements |
| `aria-atomic="true"` on alert band may re-announce all alerts on dismiss | B | Low | Intended behavior, but could be verbose with many alerts |
| Hero gradient text contrast varies with background image | A | Medium | Fallback gradient is ~5.5:1 AA; with images, contrast depends on image content |
