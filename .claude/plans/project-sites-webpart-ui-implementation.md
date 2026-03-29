# Project Sites Web Part — UI Implementation

**Date:** 2026-03-29
**Scope:** Prompt 03 — UI surface, card rendering, year context, empty/error states
**Package:** `@hbc/spfx` v0.0.3

---

## 1. Files Changed

### Created
| File | Purpose |
|------|---------|
| `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx` | Polished project-site link card using HbcCard |

### Modified
| File | Change |
|------|--------|
| `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx` | Replaced stub with full production UI — year header, card grid, empty/error/loading states |
| `packages/spfx/package.json` | Added `@griffel/react ^1.5.0` dependency, bumped version to 0.0.3 |
| `pnpm-lock.yaml` | Lockfile updated |

---

## 2. UI Structure

```
ProjectSitesRoot
├── Year context header
│   ├── "Project Sites" title (h2, 1.25rem, 700 weight)
│   ├── Year badge (pill, white-on-brand-blue, 0.8125rem 700 weight)
│   └── Count label (muted, "{N} projects")
├── Card grid (CSS Grid, auto-fill, minmax 300px)
│   └── ProjectSiteCard × N
│       └── HbcCard weight="standard"
│           ├── Header: project number badge + stage badge
│           ├── Body: project name (h3) + metadata grid
│           └── Footer: department label + "Open Site" action
├── Empty states (HbcEmptyState)
│   ├── no-year: settings icon + configuration guidance
│   ├── empty: search icon + "No projects for {year}"
│   └── error: alert icon + error message
└── Loading state (HbcSpinner size="lg")
```

---

## 3. Card Composition

### ProjectSiteCard

**Wrapper:** Full-card anchor (`<a>`) wrapping `HbcCard weight="standard"` when site URL is available. When site URL is missing (provisioning), renders as a disabled `<div>`.

**Header zone:**
- Project number: compact pill badge, `#004B87` text on `#E8F1F8` background
- Project stage: Active (green badge), Pursuit (amber badge), or neutral

**Body zone:**
- Project name: `h3`, 1rem/600, 2-line clamp with ellipsis
- Metadata grid (2-column label/value): Client, Location, Type — only when data is available

**Footer zone:**
- Department: uppercase, muted, 0.6875rem
- "Open Site" link with arrow icon (brand-action blue)
- Provisioning label when SiteUrl is empty

**Interaction:**
- Hover: elevation lift (Level 1 → Level 2) + 2px translateY
- Focus-visible: 2px solid brand-blue outline with 2px offset
- Reduced-motion: transitions disabled
- Disabled state: 0.65 opacity, no hover lift

---

## 4. Page-Year Context Behavior

| State | Header | Content |
|-------|--------|---------|
| No year resolved | Hidden | HbcEmptyState: "Year Not Configured" with settings icon and guidance text |
| Loading | "Project Sites" + year badge | HbcSpinner centered, lg size |
| Error | "Project Sites" + year badge | HbcEmptyState: "Unable to Load" with alert icon |
| Empty results | "Project Sites" + year badge | HbcEmptyState: "No Project Sites" with search icon |
| Success | "Project Sites" + year badge + count | Card grid with fade-in animation |

The year badge is always visible when a year is resolved, making the filter context unambiguous regardless of the data state.

---

## 5. Deviations from Initial Architecture

| Planned | Actual | Reason |
|---------|--------|--------|
| `@griffel/react` not in `packages/spfx` deps | Added as dependency | Required for `makeStyles` — all `@hbc/ui-kit` components and consuming apps use Griffel as the CSS-in-JS approach |
| Inline SVG icons instead of Fluent UI icons | Inline SVGs used | `packages/spfx` does not depend on `@fluentui/react-icons` and adding it would be disproportionate for 4 small decorative icons. Inline SVGs use repo brand colors and are `aria-hidden` |
| HbcStatusBadge for stage | Custom stage badges | HbcStatusBadge's variant set (success/warning/error/info etc.) doesn't map cleanly to project stages (Active/Pursuit). Lightweight inline badges using the same visual language (pill shape, color-coded) avoid forcing a semantic mismatch |

---

## 6. Verification Results

| Check | Result |
|-------|--------|
| `tsc --noEmit` | Pass (0 errors) |
| `eslint src/ --ext .ts,.tsx` | Pass (0 errors, 0 warnings) |
| Unit tests | N/A — no test infrastructure in `packages/spfx` |
| Manual SharePoint validation | Required — card rendering, page-year resolution, responsive layout |
