# Prompt 01 — Shell Edge-to-Window Contract for Hero and Post-Hero Lanes

You are working in a fresh ChatGPT / local code-agent session against the live `RMF112018/hb-intel` repo.

Use the live `main` branch as repo truth. Do not rely on memory, summaries, or prior assumptions when source files are available. Do not re-read files that are still within your current context or memory unless you need verification.

Follow all existing repo governance, UI doctrine, package-version authority, and SPFx build/package proof standards.

Do not implement unrelated changes. Do not change Safety Field Excellence, HB Kudos, People & Culture, backend sync, SharePoint list schemas, Foleon iframe governance, or Foleon routes unless this prompt explicitly instructs you to do so.

## Objective

Implement the smallest safe shell/wrapper contract needed to support edge-to-window behavior for:

1. the three Foleon reader lanes in the post-hero homepage shell; and
2. the hero / entry-stack surface, only after confirming its actual mount path.

This prompt may implement shell/host metadata and CSS variables, but it must not redesign the readers themselves.

## Required Repo-Truth First Step

Inspect:

```text
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css
apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts
apps/hb-webparts/src/webparts/hbHomepage/shell/slotComfortResolver.ts
apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts
apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/**
apps/hb-webparts/src/webparts/hbHomepage/**/entry*
apps/hb-webparts/src/webparts/hbHomepage/**/hero*
apps/hb-webparts/src/webparts/**/hbSignatureHero/**
```

## Required Post-Hero Contract

Add non-breaking data attributes:

```text
data-shell-band-layout="paired|stacked"
data-shell-slot-visual-side="left|right|full"
data-shell-slot-edge-bleed="left|right|both|none"
```

Resolve `visual-side` from shell layout, not DOM order:

- stacked / one column: `full`
- left-dominant + major: `left`
- left-dominant + minor: `right`
- right-dominant + minor: `left`
- right-dominant + major: `right`

Resolve edge bleed:

- `left` visual side -> `left`
- `right` visual side -> `right`
- `full` visual side -> `both`

Apply edge-bleed eligibility only to:

```text
project-portfolio-spotlight
company-pulse
leadership-message
```

Do not apply to Safety, HB Kudos, or People & Culture.

## Hero / Entry-Stack Requirement

Audit the hero mount path. If the hero is outside `HbHomepageShell`, do not force hero behavior through shell slot code.

Instead, add or propose a wrapper-level data contract such as:

```text
data-hb-homepage-edge-mode="standard|edge-to-window"
data-hb-homepage-hero-edge="none|both"
```

Only implement the hero edge behavior if the repo clearly exposes the correct root/entry wrapper and tests can be added safely. If not, document it as a separate follow-up with exact files and proof steps.

## CSS Requirements

Expose reusable variables:

```css
--hb-homepage-shell-body-inset-inline
--hb-homepage-edge-safe-inline
```

Do not use hard-coded tenant page widths. Do not use global `overflow-x: hidden` to mask defects.

## Required Tests

Add/update shell tests proving:

- Row 1 Project Spotlight major-left resolves left/both rules correctly by layout mode.
- Row 2 Company Pulse major-right resolves `visual-side=right`.
- Row 3 Leadership Message major-left resolves `visual-side=left`.
- Stacked mode resolves `visual-side=full`, `edge-bleed=both`.
- Existing shell attributes remain unchanged.

## Required Output

- Source changes.
- Tests.
- Documentation note:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/01_EDGE_CONTRACT_REPORT.md
```

## Do Not

- Do not redesign Foleon readers in this prompt.
- Do not change iframe governance.
- Do not alter default row placement.
