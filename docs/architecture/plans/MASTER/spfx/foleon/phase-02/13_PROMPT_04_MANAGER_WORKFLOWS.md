# Prompt 04 — Manager Workflows for Two Reader Lanes

## Objective

Update the Foleon Manager so admins can govern Project Spotlight and Company Pulse lanes from the Manager route without direct SharePoint list editing.

## Global Rules

- Work in `/Users/bobbyfetting/hb-intel` on `main`.
- Use live repo truth. Do not rely on summaries without checking current files.
- Do not re-read files still in your current context unless verifying a specific contradiction or line.
- Do not touch unrelated `.gitignore`, Safety/backend files outside Foleon scope, or untracked phase docs.
- Do not weaken Foleon reader gate, origin allowlist, preview URL blocking, or runtime proof.
- Preserve the scalar-safe public content registry projection.
- Do not add public `$select` of `MarketingOwner`, `AudienceGroups`, or any person field without a specific `$expand` design and tests.
- Do not make tenant changes unless this prompt explicitly asks for a tenant migration step.
- Keep generated artifacts out of commits unless repo policy proves they are committed.


## Required Manager Changes

Update:

```text
src/types/foleon-management.types.ts
src/pages/manage/ManageContentEditorPanel.tsx
src/pages/manage/manageMutationUtils.ts
src/pages/manage/ManagePlacementPanel.tsx
src/pages/manage/ManageMetricCards.tsx
backend/functions/src/services/foleon-service.ts
backend/functions/src/services/foleon-types.ts
```

## Fields to Expose

Add form support for:

```text
ReaderKey
Cadence
HomepageSlot
ArchiveGroup
ActiveEdition
PrimaryAudience
LastEditorialUpdate
```

## Presets

Add draft-only presets:

- Configure as Project Spotlight
- Configure as Company Pulse

Presets must only update local draft state until Save.

## Validation / Guidance

Add warnings for:

- more than one active Project Spotlight;
- more than one active Company Pulse;
- active edition not public-ready;
- placement/content lane mismatch;
- Company Pulse missing LastEditorialUpdate;
- Project Spotlight missing ArchiveGroup.

## Placement Support

Allow placement keys:

```text
Project Spotlight Active
Company Pulse Active
```

Validate content alignment.

## Tests

Cover:

- new fields load/save;
- presets update local draft only;
- validation warnings;
- placement alignment;
- no silent field loss;
- existing Manager workflows still render.

## Validation

Run frontend and backend validation for touched packages.

## Commit

```text
hb-intel-foleon: add manager workflows for reader lanes
```
