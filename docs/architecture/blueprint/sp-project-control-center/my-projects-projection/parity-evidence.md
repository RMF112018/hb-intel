# My Projects Projection — Parity Evidence

> Classification: **Canonical Current-State** (active evidence for cutover readiness).
> Sprint: B05.13 backend, Prompt 10.
> Read-mode default at the time of writing: `legacy`. Cutover NOT performed.

## Purpose

Prove that the projection-backed read path (Prompts 07–09) produces the same per-actor `MyProjectLinkItem[]` as the current legacy aggregation provider, across the representative scenarios that gate cutover (Doc 10 § 7.1).

## What runs

`backend/functions/src/services/__tests__/my-projects-projection-parity.test.ts` is the executable form of this evidence. Every commit that touches the projection slice engine, the registry repository, the reverse mapper, or the read providers re-validates these scenarios.

For each scenario the harness:

1. Computes a baseline item list via the legacy `reconcileProjectLinks(actor, projects, registry, { ok: true, bounded: false } × 2)` — the same function the legacy provider calls during request handling.
2. Drives the projection pipeline against the same source row state:
   - `ProjectionSliceEngine.recompute({ sourceListKind: 'Projects', changedItemIds: <every project id> })`,
   - then `recompute({ sourceListKind: 'LegacyRegistry', changedItemIds: <every registry id> })` (for legacy-only emission),
   - reads back the resulting helper rows via `IMyProjectsRegistryRepository.findActiveByUserUpn(actor)`,
   - reverse-maps each row via `mapRegistryRowToProjectLinkItem`,
   - sorts via the shared `sortItems`.
3. Asserts both lists are deep-equal on every business dimension (`recordKey`, `source`, `projectName`, `projectNumber`, `projectStage`, `assignmentRoles`, all four launch-action objects with `state`/`label`/`kind`/`href`/`procoreProject`, `provenance`, `warnings`).
4. Asserts the summary counts (from the shared `buildSummary`) are byte-identical.

## Scenarios covered

| #   | Scenario                           | What it exercises                                                                                                                                                                                                                                                        |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `projects-only`                    | Projects-side role assignment, no Registry counterpart; SharePoint site URL → `project-site` action; valid Procore token → `Open Procore`; BuildingConnected + Document Crunch URLs surfaced.                                                                            |
| 2   | `merged-explicit-match`            | Registry row with `MatchedProjectListItemId` → merged emission; Projects stage takes precedence over Registry stage; `legacy-role-data-preserved` warning.                                                                                                               |
| 3   | `merged-fallback-number-year`      | Registry row matched by unique `ProjectNumber + LegacyYear` (not explicit ID); merged emission with `fallbackMatchMethod`/`fallbackMatchConfidence` in provenance.                                                                                                       |
| 4   | `legacy-only`                      | Active Registry row with no Projects counterpart, `matchStatus = 'unmatched'`; `legacy-match-state-excluded` warning fires.                                                                                                                                              |
| 5   | `missing-launch-url-warnings`      | Projects row with no SharePoint/Procore/BuildingConnected/Document Crunch surfaces; all four `*-launch-unavailable` warnings fire; actions report `state: 'unavailable'`.                                                                                                |
| 6   | `invalid-procore-token`            | Procore token contains whitespace/illegal characters → `procore-project-invalid` + `procore-launch-unavailable` warnings; action degrades to unavailable while retaining the trimmed `procoreProject` token.                                                             |
| 7   | `projects-role-fallback`           | Projects row with empty canonical role arrays but populated legacy four-field fallback fields (`leadEstimatorUpn`); `schema-transition-legacy-role-fallback-used` warning fires.                                                                                         |
| 8   | `soft-deactivation / reactivation` | Three-pass lifecycle: insert → deactivate when assignment removed (`assignment-removed` reason) → reactivate when assignment restored (deactivation fields cleared). Verifies stored row state across the engine's full row-lifecycle, not just final-state equivalence. |

## Intentional differences between legacy and projection paths

These do NOT fire in the harness (the harness runs both paths with `ok: true, bounded: false` source flags) but are documented for operator awareness:

- `assignment-source-bounded`, `projects-source-partial`, `legacy-registry-source-partial` — emitted by the legacy provider only when its at-request source loaders observe a bounded result or a Graph failure. The projection-backed provider never emits these because the helper list is the projection's source of truth (no source-load partiality concept at read time). When projection read fails, the envelope returns `sourceStatus: 'source-unavailable'` per the locked decision (Doc 07 §9) — no automatic fallback.

## Diagnostic envelope additions (additive, backward compatible)

The projection-backed provider stamps three optional fields on `MyProjectLinksDiagnostics`:

- `projectionMode: 'projection'` (legacy provider stamps `'legacy'`).
- `projectionMaxLastProjectedAtUtc` — max `LastProjectedAtUtc` across the helper rows that produced the response.
- `projectionBatchId` — most recent batch id observed.

Existing SPFx fixtures and tests do not assert on these fields; the additions are forward-compatible.

## How to rerun

```sh
pnpm --filter @hbc/functions test -- my-projects-projection-parity
```

The full backend suite (`pnpm --filter @hbc/functions test`) includes this file.

## Status

| Date       | HEAD          | Status                |
| ---------- | ------------- | --------------------- |
| 2026-05-18 | (this commit) | All 8 scenarios pass. |
