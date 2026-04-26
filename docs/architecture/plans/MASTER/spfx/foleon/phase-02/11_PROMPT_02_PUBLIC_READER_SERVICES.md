# Prompt 02 — Public Reader Services and Resolution

## Objective

Add the public service layer that resolves Project Spotlight and Company Pulse active reader records without implementing the visual reader module yet.

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


## Required Architecture

Add:

```text
src/readers/readerConfigs.ts
src/services/FoleonReaderContentService.ts
```

## Reader Configs

Define:

```text
project-spotlight → Project Spotlight / Project Spotlight Active
company-pulse     → Company Pulse / Company Pulse Active
```

## Service Behavior

Implement a scalar-safe public resolver that:

1. queries content registry using indexed/filter-safe public fields;
2. queries placement list if needed;
3. resolves one active reader record per config;
4. returns a typed resolution result:
   - ready;
   - preview;
   - blocked;
   - error.

## Hard Requirements

- Do not add `$expand`.
- Do not select person fields.
- Do not show preview for SharePoint query errors.
- Do not change existing Highlights, Hub, Reader, or Manager behavior yet.
- Use `evaluateFoleonReaderGate` for real record gate evaluation.

## Tests

Add service tests for:

- Project Spotlight active record resolution;
- Company Pulse active record resolution;
- placement mismatch;
- multiple active records deterministic resolution;
- no active record → preview resolution;
- blocked real record → blocked, not preview;
- query failure → error, not preview;
- public select excludes person fields.

## Validation

Run:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
```

## Commit

```text
hb-intel-foleon: add two-lane reader resolution service
```
