# Phase 2 Step 4 — Dry-Run Proof Artifact Notes

**Package:** `@hbc/project-site-provisioning@0.1.0-scaffold`
**Manifest version produced:** `0.2.0-contract-coverage` (unchanged from Step 3)
**Proof artifact version introduced:** `0.1.0-dry-run-proof`
**Phase:** SP Project Control Center — Phase 2 Step 4
**Baseline commit:** `bbe2d92e0cf18c31199c05c6ba87da7d70d2a4aa`
**Date:** 2026-04-28

---

## Objective

Add deterministic dry-run proof artifact generation on top of the Step 3 contract-coverage mapper. The package now emits a JSON envelope plus a Markdown operator summary from any valid `ProvisioningManifest`. A committed baseline pair under `proof/` serves as both an example artifact and a regression gate. Mutation gate stays locked end-to-end. No tenant calls. No backend / SPFx / PnP / Graph / Procore code paths.

## Files Created

```
packages/project-site-provisioning/
  proof/
    project-site-provisioning-dry-run-baseline.json
    project-site-provisioning-dry-run-baseline.md
  scripts/
    generate-baseline-proof.mjs
  src/
    contracts/dry-run-proof-artifact.ts
    proof/
      create-dry-run-proof-artifacts.ts
      serialize-dry-run-proof-json.ts
      render-dry-run-proof-markdown.ts
      validate-dry-run-proof-artifact.ts
  test/
    dry-run-proof-artifact.test.ts
    baseline-determinism.test.ts
    fixtures/
      invalid-proof-dry-run-false.fixture.json
      invalid-proof-tenant-mutation-allowed.fixture.json
      invalid-proof-incomplete-coverage.fixture.json
      invalid-proof-failed-scan.fixture.json
  docs/
    Phase_2_Step_4_Dry_Run_Proof_Artifact_Notes.md   (this file)
```

## Files Modified

- `packages/project-site-provisioning/package.json` — added `generate:proof` script; expanded `files` to include `proof/`; updated description.
- `packages/project-site-provisioning/src/index.ts` — exports the new types, constants, generator, serializer, renderer, and validator.
- `packages/project-site-provisioning/README.md` — Step 4 status, proof folder summary, validation commands include `generate:proof`.

No edits under `packages/project-site-template/**`, `backend/**`, `apps/**`, `tools/**`, SPFx manifests, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, or `pnpm-lock.yaml`.

## Proof Folder Location

`packages/project-site-provisioning/proof/`. Version-controlled. The folder contains exactly the deterministic baseline pair; no timestamped per-run outputs are introduced in Step 4 (deferred to Step 5+ if needed).

## Artifact Naming Policy

- `project-site-provisioning-dry-run-baseline.json`
- `project-site-provisioning-dry-run-baseline.md`

The base name (`project-site-provisioning-dry-run-baseline`) is also the `artifactId` carried in the JSON envelope and the Markdown title.

## JSON Artifact Shape

```jsonc
{
  "artifactVersion": "0.1.0-dry-run-proof",
  "artifactKind": "project-site-provisioning-dry-run-proof",
  "artifactId": "project-site-provisioning-dry-run-baseline",
  "createdAt": "2026-04-28T00:00:00.000Z",
  "dryRunOnly": true,
  "tenantMutationAllowed": false,
  "approvalState": {
    "approvalStatus": "not-requested",
    "approvedBy": null,
    "approvedAt": null,
    "approvalRef": null
  },
  "nonExecutionStatement": "This proof artifact is a dry-run planning artifact only. ...",
  "manifest": { /* full ProvisioningManifest from Step 3 */ },
  "operatorSummary": {
    "site": { /* derived URL + title state */ },
    "objectPlanCoverage": [ /* one row per family */ ],
    "scans": { /* three scan results */ },
    "plannedHash": "...",
    "hashAlgorithm": "sha256",
    "sourceCoverage": { /* counters */ }
  },
  "validation": { "manifestValidationStatus": "ok", "errors": [] }
}
```

JSON is encoded as `JSON.stringify(artifact, null, 2) + '\n'` for stable diffs.

## Markdown Artifact Sections

In order:

1. Title (`# Project Site Provisioning Dry-Run Proof — {artifactId}`)
2. Artifact identity (table)
3. Source (table)
4. Manifest version (inline literal)
5. Mutation gate (table)
6. Site plan (table)
7. Object plan coverage (14-row table; ordered by `OBJECT_PLAN_KEYS`)
8. Integrity and scans (table)
9. Source coverage (table)
10. Warnings (bullet list or `(none)`)
11. Blockers (bullet list or `(none)`)
12. Operator review checklist (9 fixed checkbox items)
13. Horizontal rule
14. Canonical non-execution statement (verbatim sentinel)

A trailing newline closes the file.

## Determinism Policy

- Same manifest + same metadata → byte-identical JSON and Markdown.
- Meaningful manifest change (different inputs producing a different `plannedHash`) → different JSON and Markdown.
- Different `createdAt` only → only the `createdAt` line(s) change; `plannedHash` unchanged.
- Different `sourceCommit` only → only those lines change; `plannedHash` unchanged.
- The baseline files were generated with frozen inputs:
  - `projectInputs: { projectNumber: '26-000-00', projectName: 'HB Standard Project Site Baseline' }`
  - `context.now: () => new Date('2026-04-28T00:00:00.000Z')`
  - `metadata: { artifactId: 'project-site-provisioning-dry-run-baseline', createdAt: '2026-04-28T00:00:00.000Z' }`
  - no `sourceCommit`.

## Re-emission Rules

- The committed baseline pair is the canonical reference.
- After any intentional source change to the mapper, contract types, scans, or renderer, run `pnpm --filter @hbc/project-site-provisioning generate:proof` and commit the regenerated pair alongside the source change.
- The `baseline-determinism.test.ts` test will fail in CI if the generator output drifts from the committed baseline, forcing the regeneration step.

## Mutation Gate Relationship

- `artifact.dryRunOnly: true` and `artifact.tenantMutationAllowed: false` are literal-type constants; cannot be widened without explicit type assertion.
- `approvalState.approvalStatus` defaults to `'not-requested'`; `approvedBy`, `approvedAt`, `approvalRef` are `null`.
- The validator rejects any artifact where the gate triple, dry-run flag, tenant-mutation flag, or approval-state shape is tampered.
- The proof artifact does not unlock mutation; any future approval flow lives in a later step.

## Tests Added / Updated

| File | Tests | Coverage |
|---|---|---|
| `test/dry-run-proof-artifact.test.ts` (new) | 18 | Locked dry-run envelope; preserved mutation gate; verbatim non-execution statement; all 14 family rows in Markdown; trailing newline; plannedHash + scan results in operator summary; byte-identical output for identical inputs; different output for content changes; plannedHash stable when only `createdAt` changes; validator passes on freshly generated artifact; validator rejects each invalid fixture (dry-run flipped, tenant-mutation flipped, incomplete coverage, failed scan, missing sentinel, approved state, blockers without `allowBlockers`); blockers accepted when `allowBlockers: true`; non-object input rejected |
| `test/baseline-determinism.test.ts` (new) | 2 | JSON byte-equal to committed baseline; Markdown byte-equal to committed baseline |

Step 2 + Step 3 tests remain unchanged; **all 70 tests pass across 7 files** (Step 2: 9 + 6 = 15; Step 3: 7 + 10 + 18 = 35; Step 4: 18 + 2 = 20).

## Validation Commands Run

| Command | Purpose | Result |
|---|---|---|
| `git status --short` (pre and post) | Scope verification | recorded in blueprint Step 4 closeout |
| `pnpm --filter @hbc/project-site-template validate:all` (pre and post) | Phase 1 gate parity | clean both runs (15 schemas; contract + 14 valid fixtures pass; 7 invalid correctly rejected; 16/16 integrity checks pass) |
| `pnpm --filter @hbc/project-site-provisioning check-types` | Type discipline | clean (`tsc --noEmit` exit 0) |
| `pnpm --filter @hbc/project-site-provisioning generate:proof` | Baseline regeneration | wrote `proof/project-site-provisioning-dry-run-baseline.{json,md}` |
| `pnpm --filter @hbc/project-site-provisioning test` | Vitest run | 70/70 tests pass across 7 files |

Out-of-scope and not run: SPFx solution build, backend test suite, tenant smoke tests, hosted runtime proof, Procore connectivity tests.

## Known Limitations

- Per-instance object enumeration still deferred (Step 3 limitation carried forward).
- `noSecretScan` is still key-scoped only; value-content scanning still deferred.
- No timestamped ad-hoc per-run proof outputs in Step 4; only the deterministic baseline pair is committed.
- `enforcementLayers` per family entry still not populated.
- Loader still requires explicit package-root path (no node_modules resolution magic).

## Intentionally Not Implemented

- Backend executor adapter, Azure Functions, PnP runner scripts, SPFx wiring, admin UI, deployment changes, CI/CD changes.
- Tenant mutations, Graph mutations, PnP calls, SharePoint creation.
- Approval-flow unlock; `approvalState` defaults remain `not-requested` / `null`.
- Procore SDK / HTTP client / secrets / mirror tables / write-back.
- New ADRs.
- SPFx solution manifest or version bumps.
- Edits under `packages/project-site-template/**`.

## Phase 2 Step 5 Readiness

**READY** — Step 5 (Non-Production Executor Adapter Boundary and Apply-Gate Scaffold) may proceed under the boundary, mutation gate, validator, hash, scans, and proof-artifact contract established here. Step 5 should design the executor seam under `backend/functions/` that consumes a frozen, signed, approved manifest (no execution yet — boundary + apply-gate scaffold only).
