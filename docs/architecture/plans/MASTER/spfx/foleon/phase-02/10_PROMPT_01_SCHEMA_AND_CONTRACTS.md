# Prompt 01 — Foleon Two-Lane Schema and Contracts

## Objective

Implement the type, schema, Feature Framework, and backend/frontend contract changes needed to support two governed Foleon reader lanes:

- Project Spotlight
- Company Pulse

Do not implement public reader UI yet.

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


## Files to Inspect

```text
apps/hb-intel-foleon/src/types/foleon-content.types.ts
apps/hb-intel-foleon/src/types/foleon-placement.types.ts
apps/hb-intel-foleon/src/types/foleon-management.types.ts
apps/hb-intel-foleon/src/schema/foleonListSchemas.ts
apps/hb-intel-foleon/sharepoint/assets/*.xml
apps/hb-intel-foleon/scripts/validate-foleon-feature-assets.ts
backend/functions/src/services/foleon-types.ts
backend/functions/src/services/foleon-service.ts
docs/reference/sharepoint/list-schemas/hbcentral/lists/*.md
```

## Required Changes

### Content Type Choices

Add:

```text
Project Spotlight
Company Pulse
```

Retain all existing choices.

### New Content Registry Fields

Add schema support for:

```text
ReaderKey
Cadence
HomepageSlot
ArchiveGroup
ActiveEdition
PrimaryAudience
LastEditorialUpdate
```

Use scalar-safe field types. Prefer `Choice`, `Text`, `Boolean`, and `DateTime`.

### Placement Keys

Add placement choices:

```text
Project Spotlight Active
Company Pulse Active
```

### Frontend Types

Update content, placement, and management types to include the new fields.

### Backend DTOs

Update backend content summary/detail/mutation DTOs for the new fields.

### Backend Mapping

Update content mapping functions so the new fields round-trip through:

- list content;
- get content;
- create/update content;
- publish/suppress where relevant.

Do not implement one-active enforcement yet unless trivial and already localized.

## Tests

Add/update tests proving:

- new choice values are schema-valid;
- Feature Framework XML aligns with schema constants;
- frontend/backend DTOs compile;
- public scalar-safe projection is not broadened to person fields.

## Validation

Run:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
```

Run backend type/test commands for touched backend package using repo-truth filter names.

## Commit

Commit only Prompt 01 files:

```text
hb-intel-foleon: add two-lane reader schema contracts
```

## Closure Report

Include:

- files changed;
- fields added;
- choice values added;
- backend DTO changes;
- tests and validation;
- confirmation no public route/UI behavior changed;
- commit SHA.
