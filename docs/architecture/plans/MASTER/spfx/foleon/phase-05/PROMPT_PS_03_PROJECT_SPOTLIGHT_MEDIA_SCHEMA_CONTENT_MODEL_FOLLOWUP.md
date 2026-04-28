# PROMPT PS-03 — Project Spotlight Media Schema / Content Model Follow-Up

You are working in the `RMF112018/hb-intel` repository. Use current `main` as repo truth.

## Objective

Design the future schema, Manager UI, data model, tests, and provisioning changes required to support a truly media-rich Project Spotlight lane with gallery images, video, captions, alt text, focal points, credits, and media sort order.

This prompt is a follow-up. Do not execute schema changes unless explicitly instructed after the audit/design phase.

## Critical Instruction

Do not re-read files that are still within your current context or memory unless needed to verify current repo truth, line-level details, contradictions, dependencies, or drift after changes.

## Problem to Solve

The immediate visual-first layout can use `heroImageUrl` and `thumbnailUrl`, but the desired Project Spotlight experience needs multiple media items:

- primary hero image or video;
- supporting image/video tiles;
- captions;
- alt text;
- media credits;
- focal point/crop controls;
- video thumbnail;
- ordering;
- optional feature labels.

## Files to Inspect

```text
packages/foleon-reader/src/types/foleon-content.types.ts
packages/foleon-reader/src/readers/FoleonReaderViewModel.ts
apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx
apps/hb-intel-foleon/src/pages/manage/*
apps/hb-intel-foleon/src/**
docs/reference/sharepoint/list-schemas/**
docs/architecture/plans/MASTER/spfx/foleon/**
```

Also inspect current SharePoint provisioning/list schema files for the Foleon content registry and placements lists.

## Required Audit Output

### 1. Existing content registry fields

Map current list/schema/type fields for:

- title;
- summary;
- hero image;
- thumbnail;
- published URL;
- embed URL;
- preview URL;
- project number/name;
- region;
- sector;
- audience;
- cadence;
- archive;
- sort/order.

### 2. Missing media model

Propose a media schema, for example:

```ts
interface ProjectSpotlightMediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  altText: string;
  credit?: string;
  sortRank: number;
  focalPointX?: number;
  focalPointY?: number;
}
```

### 3. Storage strategy options

Evaluate:

1. JSON field on Foleon content registry.
2. Separate `HB_FoleonMediaAssets` list with lookup to content record.
3. Document library metadata linked to content record.
4. Hybrid: library for files, list records for metadata/order.

For each option include:

- pros/cons;
- SharePoint threshold/index implications;
- Manager UX impact;
- migration complexity;
- test/provisioning impact.

### 4. Recommended strategy

Recommend one approach. Default recommendation unless repo truth suggests otherwise:

- separate media assets list or library+metadata model for scalability;
- keep content registry focused on edition-level metadata;
- Manager UI manages media assets/order/captions/alt text per active Project Spotlight record.

### 5. Manager UI requirements

Define admin/marketing workflow:

- choose Project Spotlight record;
- add/edit hero image;
- add supporting images/videos;
- enter captions;
- enter required alt text;
- set focal point;
- set sort order;
- preview homepage lane;
- validate missing media/alt text before marking ready.

### 6. Reader changes

Define how `FoleonReaderViewModel` should consume rich media when available, falling back to `heroImageUrl`/`thumbnailUrl`.

### 7. Tests and validation

Define tests for:

- parsing media JSON/list records;
- required alt text;
- safe URL/origin handling;
- no fabrication;
- preview vs ready behavior;
- Manager form validation;
- schema provisioning.

## Do-Not-Touch Boundaries

- Do not weaken Foleon iframe governance.
- Do not change accepted origins.
- Do not implement schema changes without explicit approval.
- Do not fabricate production media.
- Do not require schema migration for PS-02 visual layout rescue.

## Closure Requirements

Return:

```text
Summary:
Current schema truth:
Recommended media model:
Implementation waves:
Files likely to change:
Provisioning impact:
Risks:
Prompt package for implementation:
```

## Commit Target If Documentation Only

```text
Project Spotlight media model: plan gallery and video content support
```
