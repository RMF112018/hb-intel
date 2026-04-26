# Prompt 00 — Repo-Truth and Screenshot Baseline Audit

You are working in a fresh ChatGPT / local code-agent session against the live `RMF112018/hb-intel` repo.

Use the live `main` branch as repo truth. Do not rely on memory, summaries, or prior assumptions when source files are available. Do not re-read files that are still within your current context or memory unless you need verification.

Follow all existing repo governance, UI doctrine, package-version authority, and SPFx build/package proof standards.

Do not implement unrelated changes. Do not change Safety Field Excellence, HB Kudos, People & Culture, backend sync, SharePoint list schemas, Foleon iframe governance, or Foleon routes unless this prompt explicitly instructs you to do so.

## Objective

Conduct a repo-truth and screenshot-context audit before implementation. The goal is to confirm the current Foleon reader composition problem, identify every padding/edge constraint layer, and produce a short implementation baseline report.

## Required Inputs

Use these package screenshots as visual context:

- `screenshots/project_spotlight_preview_context.png`
- `screenshots/company_pulse_preview_context.png`
- `screenshots/leadership_message_preview_context.png`

Use these repo areas at minimum:

```text
packages/foleon-reader/src/readers/**
packages/foleon-reader/src/FoleonEmbeddedReaderLane.tsx
apps/hb-webparts/src/webparts/hbHomepage/zones/**
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css
apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts
apps/hb-webparts/src/webparts/hbHomepage/shell/slotComfortResolver.ts
apps/hb-webparts/src/webparts/hbHomepage/shell/occupantRegistry.ts
apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts
apps/hb-webparts/src/webparts/hbHomepage/**/entry*
apps/hb-webparts/src/webparts/hbHomepage/**/hero*
apps/hb-webparts/src/webparts/**/hbSignatureHero/**
```

## Required Findings

Document:

1. Current preview component structure.
2. Current production component structure.
3. Current lane dispatch flow.
4. Current homepage zone mounting flow.
5. Default preset row/slot placement.
6. Shell padding and gap layers.
7. Reader border/padding/chrome layers.
8. Hero mount path and whether it is outside `HbHomepageShell`.
9. Which layer must change for:
   - Foleon reader edge bleed;
   - hero edge-to-window behavior.
10. Any existing tests that cover shell pairing, no-overflow, or Foleon preview.

## Required Output

Create:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/00_BASELINE_AUDIT.md
```

The report must include:

- screenshot observations;
- repo-truth findings with file paths;
- confirmation or correction of the user’s assumption that shell styling is required for edge-to-window behavior;
- risks before implementation.

## Do Not

- Do not change source code.
- Do not update package versions.
- Do not edit generated files.
