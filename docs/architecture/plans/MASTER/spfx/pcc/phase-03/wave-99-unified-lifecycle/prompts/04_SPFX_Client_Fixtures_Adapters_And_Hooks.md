# 04 — SPFx Client, Fixtures, Adapters, and Hooks

## Objective

Implement or verify SPFx typed client methods, fixture fallback, backend client parity, adapters, presentational preview components, and hook/controller seams for the unified lifecycle read models. This prompt is no-op aware.

## Required Instruction

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Working Directory

```text
/Users/bobbyfetting/hb-intel
```

## Likely Files To Inspect/Edit

```text
apps/project-control-center/src/api/
apps/project-control-center/src/fixtures/
apps/project-control-center/src/surfaces/unifiedLifecycle/
apps/project-control-center/src/tests/
packages/models/src/pcc/
apps/project-control-center/package.json
```

## Required Deliverables

Verify or implement:

- `getUnifiedLifecycle`, `getProjectMemory`, `getProjectLenses`, `getProjectTraceability`, `getWarrantyTrace`, `getCrossProjectKnowledge`, `getUnifiedSearch` client methods;
- fixture client parity;
- backend client URL and query handling;
- adapter/view-model normalization;
- presentational components for lifecycle timeline, project memory, lenses, related records, warranty trace, closed-project reference, and unified search preview;
- `useUnifiedLifecycleReadModel` and `useUnifiedSearchReadModel` hook/controller seams where repo conventions support them;
- loading, error, degraded, unauthorized, forbidden, stale, insufficient-evidence states;
- tests for route IDs, no deprecated route names, no live URLs, no forbidden imports, redaction/no-blame/refusal display.

## Prohibited Scope

- No Project Home or Project Readiness integration in this prompt unless existing repo already has it and tests are only being verified.
- No shell/router/mount changes.
- No live external integrations.
- No package/lockfile/manifest changes.

## Validation

Likely, after script inspection:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
```

Always run git/lockfile/diff gates.

## Commit Summary

If committing:

```text
feat(spfx-pcc): add unified lifecycle client and preview seams
```

## Final Output Requirements

Report methods/components/hooks verified or changed, test evidence, guardrails, files changed, and lockfile MD5.
