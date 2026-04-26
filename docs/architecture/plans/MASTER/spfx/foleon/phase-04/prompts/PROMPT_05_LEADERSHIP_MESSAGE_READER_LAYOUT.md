# Prompt 05 — Leadership Message Reader Layout

You are working in a fresh ChatGPT / local code-agent session against the live `RMF112018/hb-intel` repo.

Use the live `main` branch as repo truth. Do not rely on memory, summaries, or prior assumptions when source files are available. Do not re-read files that are still within your current context or memory unless you need verification.

Follow all existing repo governance, UI doctrine, package-version authority, and SPFx build/package proof standards.

Do not implement unrelated changes. Do not change Safety Field Excellence, HB Kudos, People & Culture, backend sync, SharePoint list schemas, Foleon iframe governance, or Foleon routes unless this prompt explicitly instructs you to do so.

## Objective

Implement a lane-specific Leadership Message reader layout that feels like an executive communication / letter, not a generic media feature card.

## Required Files

Inspect and modify only as necessary:

```text
packages/foleon-reader/src/readers/layouts/LeadershipMessageReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css
packages/foleon-reader/src/readers/FoleonReaderViewModel.ts
packages/foleon-reader/src/readers/__tests__/**
```

## Design Requirements

The layout must include:

- executive message/letter composition;
- byline / portrait / monogram zone when available or preview placeholder;
- pull quote or key statement;
- focused message body;
- intent/context notes;
- limited supporting metadata;
- archive action;
- clear preview label when in preview mode;
- production-ready iframe/action handling from shared view model.

## Responsive Requirements

- Desktop paired: left edge bleed when shell visual side is left.
- Desktop full-width/stacked: bleed both sides.
- Tablet: byline stacks above or beside message.
- Mobile: both-side bleed, safe content padding, compact byline and message.

## Visual Requirements

- Calm, premium, restrained.
- Strong typography.
- Minimal decorative chrome.
- Avoid large media placeholder unless a real portrait/editorial asset exists.
- Remove heavy outer border.

## Required Tests

- Leadership Message renders `data-foleon-layout="leadership-message"`.
- It does not render Project Spotlight or Company Pulse layout markers.
- It does not render the old generic feature-card / three-support-card structure.
- Preview and production share the same layout marker.
- It preserves accessible section labeling.

## Required Output

Documentation:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/05_LEADERSHIP_MESSAGE_LAYOUT_REPORT.md
```
