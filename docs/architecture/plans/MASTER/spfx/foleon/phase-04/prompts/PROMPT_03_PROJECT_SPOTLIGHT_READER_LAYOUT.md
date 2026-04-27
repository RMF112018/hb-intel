# Prompt 03 — Project Spotlight Reader Layout

You are working in a fresh ChatGPT / local code-agent session against the live `RMF112018/hb-intel` repo.

Use the live `main` branch as repo truth. Do not rely on memory, summaries, or prior assumptions when source files are available. Do not re-read files that are still within your current context or memory unless you need verification.

Follow all existing repo governance, UI doctrine, package-version authority, and SPFx build/package proof standards.

Do not implement unrelated changes. Do not change Safety Field Excellence, HB Kudos, People & Culture, backend sync, SharePoint list schemas, Foleon iframe governance, or Foleon routes unless this prompt explicitly instructs you to do so.

Use 00_BASELINE_AUDIT.md, 01_EDGE_CONTRACT_REPORT.md, and 02_VIEW_MODEL_AND_REGISTRY_REPORT.md as controlling baseline documents.

Do not reopen the edge contract or registry architecture unless implementation evidence proves they are defective.

This pass should replace only the Project Spotlight compatibility layout with a true lane-owned Project Spotlight composition. Do not redesign Company Pulse or Leadership Message yet except as needed to preserve shared types/tests.

## Objective

Implement a lane-specific Project Spotlight reader layout that feels like a monthly visual project profile, not a generic preview card.

## Required Files

Inspect and modify only as necessary:

```text
packages/foleon-reader/src/readers/layouts/ProjectSpotlightReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css
packages/foleon-reader/src/readers/FoleonReaderViewModel.ts
packages/foleon-reader/src/readers/__tests__/**
```

## Design Requirements

The layout must include:

- edge-bleed-capable visual story surface;
- large media/story panel;
- project metadata ribbon;
- “Why this project matters” block;
- project facts such as client/location/market/team/milestone where available or preview placeholders;
- monthly cadence marker;
- archive/gallery secondary action;
- clear preview label when in preview mode;
- production-ready iframe/action handling from the shared view model.

## Responsive Requirements

- Desktop paired: left edge bleed when shell visual side is left.
- Desktop full-width/stacked: bleed both sides.
- Tablet: media banner + text/facts below.
- Mobile: both-side bleed, shorter media, facts as list.

## Visual Requirements

- Remove heavy outer card border.
- Use background band and internal safe area.
- Avoid three generic support cards.
- Keep focus outlines visible.

## Required Tests

- Project Spotlight renders `data-foleon-layout="project-spotlight-feature"`.
- It does not render Company Pulse or Leadership Message layout markers.
- Preview and production share the same layout marker.
- It does not render the old generic three-card support skeleton.
- It keeps preview sample labeling.

## Required Output

Documentation:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/03_PROJECT_SPOTLIGHT_LAYOUT_REPORT.md
```
