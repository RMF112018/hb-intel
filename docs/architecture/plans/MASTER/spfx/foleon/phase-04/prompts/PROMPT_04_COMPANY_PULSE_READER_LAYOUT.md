# Prompt 04 — Company Pulse Reader Layout

You are working in a fresh ChatGPT / local code-agent session against the live `RMF112018/hb-intel` repo.

Use the live `main` branch as repo truth. Do not rely on memory, summaries, or prior assumptions when source files are available. Do not re-read files that are still within your current context or memory unless you need verification.

Follow all existing repo governance, UI doctrine, package-version authority, and SPFx build/package proof standards.

Do not implement unrelated changes. Do not change Safety Field Excellence, HB Kudos, People & Culture, backend sync, SharePoint list schemas, Foleon iframe governance, or Foleon routes unless this prompt explicitly instructs you to do so.

Use 00_BASELINE_AUDIT.md, 01_EDGE_CONTRACT_REPORT.md, 02_VIEW_MODEL_AND_REGISTRY_REPORT.md, and 03_PROJECT_SPOTLIGHT_LAYOUT_REPORT.md as controlling baseline documents.

Do not reopen the shell edge contract, shared view-model registry, or Project Spotlight layout unless implementation evidence proves a defect.

This pass should replace only the Company Pulse compatibility layout with a true lane-owned briefing/newsroom digest composition. Do not redesign Leadership Message yet, and do not modify Project Spotlight except for shared type/test adjustments required by Company Pulse.

Company Pulse should not mimic the Project Spotlight feature layout. It should be a scannable, frequent-update briefing with a latest-update lead, compact secondary update zones, category chips, freshness context, and preview/production parity.

## Objective

Implement a lane-specific Company Pulse reader layout that feels like a frequent newsroom / company briefing digest, not a project feature card.

## Required Files

Inspect and modify only as necessary:

```text
packages/foleon-reader/src/readers/layouts/CompanyPulseReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css
packages/foleon-reader/src/readers/FoleonReaderViewModel.ts
packages/foleon-reader/src/readers/__tests__/**
```

## Design Requirements

The layout must include:

- latest-update lead item;
- secondary compact updates;
- freshness / last editorial update label;
- category chips such as news, events, recognition, operations;
- optional pulse/timeline strip;
- archive action;
- clear preview label when in preview mode;
- production-ready iframe/action handling from the shared view model.

## Responsive Requirements

- Desktop paired: right edge bleed when shell visual side is right.
- Desktop full-width/stacked: bleed both sides.
- Tablet: lead update + secondary grid or list.
- Mobile: latest update first, secondary rows stacked, chips wrap.

## Critical Shell Requirement

Company Pulse is in a right-dominant row as a major slot. Do not infer bleed direction from DOM order. It must use the resolved `data-shell-slot-visual-side="right"` / `data-shell-slot-edge-bleed="right"` contract.

## Visual Requirements

- Less image-heavy than Project Spotlight.
- No large generic media block unless production content specifically requires it.
- Scannable, current, digest-oriented.
- Remove heavy outer border.

## Required Tests

- Company Pulse renders `data-foleon-layout="company-pulse-briefing"`.
- It does not render Project Spotlight or Leadership Message layout markers.
- It does not render the old generic three-card support skeleton.
- It resolves right-edge bleed in Row 2 hosted shell context.
- Preview and production share the same layout marker.

## Required Output

Documentation:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04_COMPANY_PULSE_LAYOUT_REPORT.md
```
