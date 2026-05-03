# Prompt 04B — SPFx Unified Lifecycle Adapters, Hooks, and View Models

## Objective

Create lightweight SPFx adapter/view-model seams that normalize the seven unified lifecycle read models for future preview components. This prompt prepares data for rendering but must not build full UI components or integrate with Project Home / Project Readiness surfaces.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Current Baseline

Prompt 04A should already provide typed SPFx backend/fixture client methods for:

- `getUnifiedLifecycle`
- `getProjectMemory`
- `getProjectLenses`
- `getProjectTraceability`
- `getWarrantyTrace`
- `getCrossProjectKnowledge`
- `getUnifiedSearch`

Do not rename those client methods. Do not introduce client methods for `lifecycle-timeline`, `traceability-graph`, or `closed-project-references`.

## Required Pre-Edit Repo Truth

Run and report:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

Classify all uncommitted files as:

- user-owned;
- agent-owned;
- unknown.

Preserve unrelated/user-owned changes.

## Files to Inspect

Inspect current adapter, fixture, hook, and surface conventions in:

- `apps/project-control-center/src/api/`
- `apps/project-control-center/src/fixtures/`
- `apps/project-control-center/src/surfaces/`
- `apps/project-control-center/src/surfaces/projectReadiness/`
- `apps/project-control-center/src/tests/`
- `packages/models/src/pcc/`

Do not re-read files still in current context or memory unless required to verify current repo truth.

## Required Work

Add adapter/view-model utilities or hooks, following repo conventions, for these future preview seams:

- lifecycle timeline;
- project memory;
- project lenses;
- project traceability / related records;
- warranty trace;
- cross-project knowledge / closed-project references;
- unified search / HBI grounding.

The adapters should consume the canonical read-model shapes returned by Prompt 04A client methods.

Recommended seam outputs may include:

- normalized lifecycle timeline items;
- memory summary cards;
- lens options and active lens state metadata;
- related-record clusters;
- warranty trace summary rows;
- cross-project/closed-project reference summaries;
- unified-search answer/citation/refusal view models.

Use repo naming and placement conventions. If similar adapter patterns already exist for Project Readiness or Constraints Log, follow them.

## Required Behavior

Adapters/view models must expose clear UI-ready states for:

- available data;
- loading/placeholder-compatible state if current patterns support it;
- degraded source status;
- backend/source unavailable;
- redacted records;
- restricted records;
- insufficient-evidence warranty posture;
- grounded/cited search result;
- search refusal / no grounded evidence.

## Lens Behavior

Add a lightweight lens-state model or helper that can express:

- selected lens;
- eligible lens options;
- visible vs redacted vs hidden record counts;
- same underlying project truth, different visibility context.

The lens model must not imply separate workspaces or route changes.

## Source-Lineage and Redaction

Adapters must preserve source-lineage/security posture in their output. Do not strip:

- source system;
- evidence links;
- citation references;
- security classification;
- redaction level;
- cross-project allowed posture;
- confidence/verification posture.

## Constraints

- No visual components.
- No CSS work.
- No Project Home integration.
- No Project Readiness integration.
- No shell navigation changes.
- No backend edits.
- No model edits unless required for a compile-blocking export issue.
- No package/dependency/lockfile changes.
- No live external calls.
- No tenant mutation.

## Tests

Add/update tests proving:

- adapters normalize each canonical read model without throwing;
- adapters preserve source-lineage/citation/security metadata;
- redacted/restricted records are represented as redacted/restricted, not exposed as full content;
- insufficient-evidence warranty traces remain unresolved/no-blame;
- lens switching changes visibility cues, not route/app workspace;
- cross-project/closed-project references retain security/redaction posture;
- unified-search grounded answers retain citations;
- unified-search refusals retain refusal reason and no citations;
- no adapter references non-canonical route IDs.

## Validation

Run and report:

```bash
pnpm --filter @hbc/project-control-center check-types
pnpm --filter @hbc/project-control-center test
md5 pnpm-lock.yaml
```

Run model checks only if needed:

```bash
pnpm --filter @hbc/models check-types
```

## Required Completion Summary

Return:

1. Pre-edit repo truth.
2. Workspace classification.
3. Adapter/view-model seams added.
4. Hook seams added, if any.
5. Tests added/updated.
6. Validation results.
7. Lockfile MD5 before/after.
8. Remaining gaps for Prompt 04C.
9. Commit hash if committed.
10. Confirm no push unless explicitly instructed.

## Commit Guidance

Commit only Prompt 04B-owned files. Do not push unless explicitly instructed.

Recommended commit message:

```text
feat(spfx-pcc): add unified lifecycle adapters and view models
```
