# Phase 2 Step 4 — Dry-Run Proof Artifact Generation Closeout

**Effort:** SP Project Control Center (PCC) — Standard Project Site Template
**Companion to:** [`Phase_2_Step_1_Provisioning_Foundation_Audit.md`](./Phase_2_Step_1_Provisioning_Foundation_Audit.md), [`Phase_2_Step_1_Consumer_Boundary.md`](./Phase_2_Step_1_Consumer_Boundary.md), [`Phase_2_Step_1_Closeout.md`](./Phase_2_Step_1_Closeout.md), [`Phase_2_Step_2_Project_Site_Provisioning_Mapper_Scaffold_Closeout.md`](./Phase_2_Step_2_Project_Site_Provisioning_Mapper_Scaffold_Closeout.md), [`Phase_2_Step_3_Provisioning_Manifest_Mapper_Expansion_Closeout.md`](./Phase_2_Step_3_Provisioning_Manifest_Mapper_Expansion_Closeout.md)
**Baseline commit (audit start):** `bbe2d92e0cf18c31199c05c6ba87da7d70d2a4aa`
**Manifest version produced by `@hbc/project-site-provisioning`:** `0.2.0-contract-coverage` (unchanged)
**Proof artifact version introduced:** `0.1.0-dry-run-proof`
**Date:** 2026-04-28

---

## Objective

Generate deterministic dry-run proof artifacts (JSON envelope + Markdown operator summary) from the Step 3 contract-coverage manifest, commit a deterministic baseline pair under the package's own `proof/` folder, and add a regenerator script and validator. Preserve the no-mutation boundary established in Steps 1–3.

## Files Created

- `packages/project-site-provisioning/src/contracts/dry-run-proof-artifact.ts`
- `packages/project-site-provisioning/src/proof/serialize-dry-run-proof-json.ts`
- `packages/project-site-provisioning/src/proof/render-dry-run-proof-markdown.ts`
- `packages/project-site-provisioning/src/proof/create-dry-run-proof-artifacts.ts`
- `packages/project-site-provisioning/src/proof/validate-dry-run-proof-artifact.ts`
- `packages/project-site-provisioning/scripts/generate-baseline-proof.mjs`
- `packages/project-site-provisioning/proof/project-site-provisioning-dry-run-baseline.json`
- `packages/project-site-provisioning/proof/project-site-provisioning-dry-run-baseline.md`
- `packages/project-site-provisioning/test/dry-run-proof-artifact.test.ts`
- `packages/project-site-provisioning/test/baseline-determinism.test.ts`
- `packages/project-site-provisioning/test/fixtures/invalid-proof-dry-run-false.fixture.json`
- `packages/project-site-provisioning/test/fixtures/invalid-proof-tenant-mutation-allowed.fixture.json`
- `packages/project-site-provisioning/test/fixtures/invalid-proof-incomplete-coverage.fixture.json`
- `packages/project-site-provisioning/test/fixtures/invalid-proof-failed-scan.fixture.json`
- `packages/project-site-provisioning/docs/Phase_2_Step_4_Dry_Run_Proof_Artifact_Notes.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-2/Phase_2_Step_4_Dry_Run_Proof_Artifact_Generation_Closeout.md` (this file)

## Files Modified

- `packages/project-site-provisioning/package.json` — added `generate:proof` script; expanded `files` to include `proof/`; updated description.
- `packages/project-site-provisioning/src/index.ts` — exports the new contract types, constants, generator, serializer, renderer, and validator.
- `packages/project-site-provisioning/README.md` — Step 4 status section; proof artifact summary; validation commands include `generate:proof`.

No edits under `packages/project-site-template/**`, `backend/**`, `apps/**`, `tools/**`, SPFx manifests, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, or `pnpm-lock.yaml`.

## Dry-Run Proof Artifact Summary

- **JSON envelope** at `proof/project-site-provisioning-dry-run-baseline.json` — version-controlled, `JSON.stringify(artifact, null, 2) + '\n'` formatting, contains the full Step 3 manifest, an operator summary (per-family coverage, scans, plannedHash, source coverage), an `approvalState` defaulted to `not-requested` / `null`, and the canonical non-execution statement.
- **Markdown summary** at `proof/project-site-provisioning-dry-run-baseline.md` — operator-readable: artifact identity, source, manifest version, mutation gate, site plan, 14-row object-plan coverage table, integrity + scans, source coverage, warnings, blockers, a 9-item operator review checklist, and the canonical non-execution statement at the bottom.

Both artifacts were generated with the frozen clock `2026-04-28T00:00:00.000Z` and frozen project inputs (`26-000-00 / "HB Standard Project Site Baseline"`).

## Mutation Gate Confirmation

- The artifact carries `dryRunOnly: true` and `tenantMutationAllowed: false` as compile-time literal constants.
- The embedded manifest's `mutationGate` remains `{ mutationLocked: true, liveMutationAllowed: false, requiresHumanApproval: true }`.
- `approvalState` defaults: `approvalStatus: 'not-requested'`, `approvedBy: null`, `approvedAt: null`, `approvalRef: null`.
- The validator rejects any artifact where any of the above is tampered.

## No-Execution Confirmation

- The canonical non-execution statement is exported as `NON_EXECUTION_STATEMENT` and embedded verbatim in both the JSON envelope (`artifact.nonExecutionStatement`) and at the bottom of the Markdown.
- The validator fails the artifact if either copy is missing or altered.
- Tests assert both presence in Markdown and exact match in JSON.
- The package surface continues to expose no live-operation verb names; the source-import discipline scan continues to pass without expanding its exclusion list (the new `src/proof/` modules contain forbidden tokens only as Markdown table data, never in import statements or `fetch()` calls, so the existing regex-based scan does not match them).

## Determinism Confirmation

- Same manifest + same metadata → byte-identical JSON and Markdown (asserted by `dry-run-proof-artifact.test.ts`).
- Meaningful manifest change → different JSON, Markdown, and `plannedHash` (asserted).
- Different `createdAt` only → only `createdAt` lines change; `plannedHash` unchanged (asserted).
- The committed baseline pair byte-equals the regenerated output (asserted by `baseline-determinism.test.ts`).
- The Step 3 SHA-256 plannedHash algorithm and exclusions are unchanged.

## Validation Results

| Command | Result |
|---|---|
| `git status --short` (pre) | only pre-existing untracked dirs outside scope |
| `pnpm --filter @hbc/project-site-template validate:all` (pre) | **PASS** — 15 schemas; contract + 14 valid fixtures pass; 7 invalid fixtures correctly rejected; `unexpectedOutcomes: 0`; 16/16 integrity checks pass |
| `pnpm --filter @hbc/project-site-provisioning check-types` | **PASS** — `tsc --noEmit` exit 0 |
| `pnpm --filter @hbc/project-site-provisioning generate:proof` | **PASS** — wrote `proof/project-site-provisioning-dry-run-baseline.{json,md}` |
| `pnpm --filter @hbc/project-site-provisioning test` | **PASS** — 70/70 tests across 7 files (`provisioning-manifest.test.ts`: 6, `no-mutation-guard.test.ts`: 9, `site-plan-derivation.test.ts`: 7, `contract-coverage.test.ts`: 10, `scans.test.ts`: 18, `dry-run-proof-artifact.test.ts`: 18, `baseline-determinism.test.ts`: 2) |
| `pnpm --filter @hbc/project-site-template validate:all` (post) | **PASS** — Phase 1 gate parity preserved |
| `git status --short` (post) | scope confirmed: only files under `packages/project-site-provisioning/**` and this closeout doc; no changes under `packages/project-site-template/**`, `backend/**`, `apps/**`, `tools/**`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `pnpm-lock.yaml`, or any SPFx manifest |

## What Was Not Implemented

| Not implemented | Why |
|---|---|
| Backend executor adapter, Azure Functions, PnP runner scripts, SPFx wiring, admin UI, deployment changes, CI/CD changes | Out of scope; reserved for Step 5+ |
| Tenant mutations, Graph mutations, PnP calls, SharePoint creation | Forbidden in this package |
| Approval-flow unlock | `approvalState` defaults remain `not-requested` / `null`; any approval transition belongs to a later step |
| Procore SDK / HTTP client / secrets / mirror tables / write-back | Permanently out of scope for MVP per locked invariants |
| Per-instance object enumeration | Step 3 limitation carried forward; deferred until a richer enumeration source exists |
| Timestamped ad-hoc per-run proof outputs | Step 4 scope is the deterministic baseline pair only |
| New ADRs | No architecture reversal |
| SPFx solution manifest or version bumps | No SPFx package was touched |
| Edits under `packages/project-site-template/**` | None required; Phase 1 gate parity confirmed pre and post |

## Remaining Limitations

- Per-instance enumeration deferred.
- `enforcementLayers` per family entry still not populated.
- `noSecretScan` value-content scanning still deferred.
- Loader requires explicit package-root path.
- No timestamped per-run proof outputs alongside the committed baseline.

## Phase 2 Step 5 Readiness Decision

**READY.**

Rationale:

- Dry-run proof generator produces deterministic JSON + Markdown artifacts that pass validation.
- Committed baseline pair is byte-equal to regenerated output, gated by `baseline-determinism.test.ts`.
- Mutation gate, dry-run flag, tenant-mutation flag, and approval state are locked at compile time and runtime.
- Markdown carries the canonical non-execution sentinel verbatim; validator enforces it as a hard requirement.
- Phase 1 schema gate parity preserved.
- Public-export and source-import disciplines unchanged and still passing.
- No outstanding architecture decisions block the Step 5 executor-adapter boundary scaffolding.

## Recommended Next Prompt

> **Phase 2 Step 5 — Non-Production Executor Adapter Boundary and Apply-Gate Scaffold**
>
> Scaffold the boundary contract for a future executor adapter under `backend/functions/` that consumes a frozen, signed, approved provisioning manifest plus its dry-run proof artifact. Define the apply-gate (operator approval state shape, manifest immutability requirement, proof-artifact byte-match requirement, target tenant declaration, rollback posture). Define the seam between `@hbc/project-site-provisioning` and the future executor: which manifest types are public, which are private, and how the executor verifies proof-artifact integrity before any future tenant call. Do not implement live execution, Graph calls, PnP calls, SharePoint creation, SPFx wiring, Procore runtime, or backend deployment behavior. The output is contract scaffolding plus documentation; no executor code that runs against a tenant.

## Proposed Commit Summary

```
feat(pcc): add provisioning dry-run proof artifacts
```

## Proposed Commit Description

```
Manifest: SharePoint Project Control Center (Standard Project Site Template Contract)

Version: 1.0.0-proposed unchanged; this step adds dry-run proof artifact generation to the headless Phase 2 consumer and does not change the template contract surface.

Extends @hbc/project-site-provisioning with deterministic dry-run proof
artifact generation. Adds JSON and Markdown proof outputs that summarize
the planned provisioning manifest, derived PCC site URL, object-plan
family coverage, mutation gate status, plannedHash, source coverage,
scan results, warnings, blockers, and a fixed operator review checklist.

Commits a deterministic baseline pair under
packages/project-site-provisioning/proof/ regenerable via
`pnpm --filter @hbc/project-site-provisioning generate:proof`. The
baseline-determinism test fails on any drift between the generator and
the committed baseline.

The generated proof artifacts are dry-run planning artifacts only. They
do not create or modify SharePoint, Graph, PnP, Procore, SPFx, backend,
or tenant resources. The mutation gate remains locked
(mutationLocked=true, liveMutationAllowed=false,
requiresHumanApproval=true), and approvalState defaults to
not-requested with null approval fields.

Adds Phase 2 Step 4 package notes and blueprint closeout documentation.

Validation:
  - pnpm --filter @hbc/project-site-template validate:all (pre and
    post): clean (15 schemas; contract + 14 valid fixtures pass; 7
    invalid correctly rejected; unexpectedOutcomes: 0; 16/16 integrity
    checks pass)
  - pnpm --filter @hbc/project-site-provisioning check-types: clean
  - pnpm --filter @hbc/project-site-provisioning generate:proof: wrote
    baseline pair
  - pnpm --filter @hbc/project-site-provisioning test: 70/70 tests pass
    across 7 files

No tenant mutation. No backend changes. No SPFx changes. No tools/PnP
runner changes. No Graph/PnP operations. No Procore runtime. No SPFx
solution or manifest version changes. No template contract version
change. No edits under packages/project-site-template/**, backend/**,
apps/**, tools/**, pnpm-workspace.yaml, turbo.json, tsconfig.base.json,
or pnpm-lock.yaml.

Phase 2 Step 5 readiness: READY.
```

---

## Cross-References

- [`Phase_2_Step_1_Provisioning_Foundation_Audit.md`](./Phase_2_Step_1_Provisioning_Foundation_Audit.md)
- [`Phase_2_Step_1_Consumer_Boundary.md`](./Phase_2_Step_1_Consumer_Boundary.md)
- [`Phase_2_Step_1_Closeout.md`](./Phase_2_Step_1_Closeout.md)
- [`Phase_2_Step_2_Project_Site_Provisioning_Mapper_Scaffold_Closeout.md`](./Phase_2_Step_2_Project_Site_Provisioning_Mapper_Scaffold_Closeout.md)
- [`Phase_2_Step_3_Provisioning_Manifest_Mapper_Expansion_Closeout.md`](./Phase_2_Step_3_Provisioning_Manifest_Mapper_Expansion_Closeout.md)
- [`packages/project-site-provisioning/README.md`](../../../../../packages/project-site-provisioning/README.md)
- [`packages/project-site-provisioning/docs/Phase_2_Step_4_Dry_Run_Proof_Artifact_Notes.md`](../../../../../packages/project-site-provisioning/docs/Phase_2_Step_4_Dry_Run_Proof_Artifact_Notes.md)
- [PCC blueprint README](../README.md)
