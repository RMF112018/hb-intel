# Prompt 02 — Shared Foleon Reader View Model and Layout Registry

You are working in a fresh ChatGPT / local code-agent session against the live `RMF112018/hb-intel` repo.

Use the live `main` branch as repo truth. Do not rely on memory, summaries, or prior assumptions when source files are available. Do not re-read files that are still within your current context or memory unless you need verification.

Follow all existing repo governance, UI doctrine, package-version authority, and SPFx build/package proof standards.

Do not implement unrelated changes. Do not change Safety Field Excellence, HB Kudos, People & Culture, backend sync, SharePoint list schemas, Foleon iframe governance, or Foleon routes unless this prompt explicitly instructs you to do so.

## Objective

Refactor the Foleon reader rendering path so preview and production states share a normalized view model and route through a lane-specific layout registry.

Do not yet perform the full visual redesign of all lanes. Establish the architecture seam first.

## Required Source Areas

```text
packages/foleon-reader/src/readers/FoleonReaderModule.tsx
packages/foleon-reader/src/readers/FoleonReaderPreview.tsx
packages/foleon-reader/src/readers/readerConfigs.ts
packages/foleon-reader/src/readers/ProjectSpotlightReader.tsx
packages/foleon-reader/src/readers/CompanyPulseReader.tsx
packages/foleon-reader/src/readers/LeadershipMessageReader.tsx
packages/foleon-reader/src/readers/__tests__/**
```

## Required Architecture

Create or equivalent:

```text
packages/foleon-reader/src/readers/FoleonReaderViewModel.ts
packages/foleon-reader/src/readers/FoleonReaderLayoutRegistry.tsx
packages/foleon-reader/src/readers/layouts/
```

Add:

```ts
type FoleonReaderLayoutKey =
  | 'projectSpotlight'
  | 'companyPulse'
  | 'leadershipMessage';
```

Add registry:

```ts
const FOLEON_READER_LAYOUTS = {
  projectSpotlight: ProjectSpotlightReaderLayout,
  companyPulse: CompanyPulseReaderLayout,
  leadershipMessage: LeadershipMessageReaderLayout,
};
```

Create temporary layout wrappers if necessary, but ensure each lane has a unique component and layout marker.

## Required View Model

Create a normalized reader view model covering:

- lane;
- state: preview/ready;
- title;
- summary;
- eyebrow;
- preview label;
- freshness label/value;
- audience;
- archive group;
- chips/facts;
- support items;
- media/iframe readiness;
- actions;
- governance/status notes.

Preview view models must be honest and clearly labeled.

Production view models must preserve active Foleon record data and existing gate behavior.

## Required Tests

Add tests that prove:

- each lane resolves to a unique layout component;
- preview and production for the same lane share the same layout marker;
- old shared preview component is no longer the only layout authority;
- existing loading/error/blocked behavior still works.

## Required Output

Documentation:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/02_VIEW_MODEL_AND_REGISTRY_REPORT.md
```

## Do Not

- Do not change iframe origin policy.
- Do not change SharePoint list schemas.
- Do not make preview and production structurally unrelated.
