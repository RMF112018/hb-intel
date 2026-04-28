# Phase 2 Step 2 — Project Site Provisioning Mapper Scaffold Closeout

**Effort:** SP Project Control Center (PCC) — Standard Project Site Template
**Companion to:** [`Phase_2_Step_1_Provisioning_Foundation_Audit.md`](./Phase_2_Step_1_Provisioning_Foundation_Audit.md), [`Phase_2_Step_1_Consumer_Boundary.md`](./Phase_2_Step_1_Consumer_Boundary.md), [`Phase_2_Step_1_Closeout.md`](./Phase_2_Step_1_Closeout.md)
**Baseline commit (audit start):** `5dea955f30d2f968809668b3fbd71b9f2e2a146f`
**Date:** 2026-04-28

---

## What Was Completed

Created the headless `@hbc/project-site-provisioning@0.1.0-scaffold` package, the future template consumer designated by Step 1. Concrete completions:

1. New workspace package at `packages/project-site-provisioning/` matching the `@hbc/health-indicator` source-direct style: `package.json`, `README.md`, `tsconfig.json`, `vitest.config.ts`, plus `src/`, `test/`, and `docs/` subtrees.
2. **Manifest contract** (`src/contracts/`): `MutationGate`, `TemplateSource`, `ProvisioningManifest`, `SitePlanPlaceholder`, `ObjectPlans` (ten slots), `PlanArrayPlaceholder`, `ProofPlaceholder`, plus `MANIFEST_SCAFFOLD_VERSION`, `OBJECT_PLAN_KEYS`, and `REQUIRED_MANIFEST_KEYS`.
3. **No-mutation guard** (`src/guards/no-mutation-guard.ts`): `createFrozenMutationGate()`, `assertNoMutationKeys()`, `findProhibitedKeys()`, plus the canonical `PROHIBITED_MUTATION_KEYS`, `PROHIBITED_SECRET_KEYS`, and `PROHIBITED_PROCORE_MIRROR_KEYS` constants.
4. **Deterministic mapper** (`src/mapper/create-provisioning-manifest.ts`): pure function consuming only contract identity fields, producing a frozen, mutation-locked manifest with planned-only object plans and proof placeholders. Time injection via `context.now`.
5. **Runtime validator** (`src/validation/validate-provisioning-manifest.ts`): rejects unlocked / live-mutation / approval-missing manifests, prohibited mutation keys at any depth, secret-class keys, and Procore-mirror keys; returns all violations rather than throwing.
6. **Public surface** (`src/index.ts`): exports types, mapper, validator, frozen-gate factory, guard helpers, and key constants. No live-mutation function names.
7. **Fixtures**: `test/fixtures/minimal-template-contract.fixture.json` (valid input shape) and `test/fixtures/invalid-mutation-unlocked-manifest.fixture.json` (clearly marked test-only invalid manifest).
8. **Tests** (Vitest): 18 tests across two files covering happy-path mapper output, determinism, frozen objects, validator rejection cases, prohibited-key scanning at depth, public-export discipline, and source-import discipline.
9. **Package documentation**: `README.md` with purpose, scaffold status, do/don't lists, dependency direction, no-mutation policy, manifest lifecycle, expected future phases, validation commands, and explicit boundaries with `@hbc/project-site-template`, `backend/functions`, SPFx, Procore, and `tools/pnp-runner-local`.
10. **Step notes**: `packages/project-site-provisioning/docs/Phase_2_Step_2_Scaffold_Notes.md`.
11. **Workspace registration**: added `@hbc/project-site-provisioning` and `@hbc/project-site-provisioning/*` path aliases to root `tsconfig.base.json`. `pnpm-workspace.yaml` already covered `packages/*`; `turbo.json` task globs already cover the new package.
12. **Lockfile regenerated** by `pnpm install` to register the new workspace package.

## What Was Not Implemented (and Why)

| Not implemented | Why |
|---|---|
| Object-plan population from the contract families | Out of scope for Step 2; reserved for Step 3. |
| Backend executor adapter | Forbidden until the mutation gate has been satisfied through Steps 3–4. |
| Azure Functions endpoints, PnP runner scripts, SPFx wiring | Step 5+ scope; Step 2 is package scaffolding only. |
| Tenant mutations, Graph mutations, PnP calls, SharePoint creation | Forbidden in this package by design and verified by source-import scan tests. |
| Procore SDK / HTTP client / secrets / mirror tables / write-back | Permanently out of scope for MVP per locked invariants. |
| Admin UI, CI/CD workflow changes, deployment scripts | Out of scope. |
| New ADRs | Step 2 implements within the boundary already ratified by Step 1; no architecture reversal. |
| SPFx solution manifest or version bumps | No SPFx package was touched. The new package's own `0.1.0-scaffold` semver lives in its `package.json`; the template contract `templateVersion: "1.0.0-proposed"` is unchanged. |
| Edits to `packages/project-site-template/**` | None required; Phase 1 gate parity confirmed pre and post. |
| Edits to `backend/**`, `apps/**`, `tools/**` | None required and explicitly out of scope. |
| Modifications under `docs/architecture/plans/MASTER/spfx/pcc/phase-02/step-1/` | Treated as read-only reference per Step 1 execution constraints. |

## Validation Results

| Command | Result |
|---|---|
| `git status --short` (pre) | `?? docs/architecture/plans/MASTER/spfx/pcc/phase-02/` only (pre-existing untracked) |
| `pnpm --filter @hbc/project-site-template validate:all` (pre) | **PASS** — 15 schemas loaded; contract + 14 valid fixtures pass; 7 invalid fixtures correctly rejected; `unexpectedOutcomes: 0`; 16/16 integrity checks pass |
| `pnpm install` | OK — new workspace package registered; `pnpm-lock.yaml` regenerated |
| `pnpm --filter @hbc/project-site-provisioning check-types` | **PASS** — `tsc --noEmit` returned 0 |
| `pnpm --filter @hbc/project-site-provisioning test` | **PASS** — 18/18 tests across 2 files |
| `pnpm --filter @hbc/project-site-template validate:all` (post) | **PASS** — Phase 1 gate parity preserved (counters unchanged) |
| `git status --short` (post) | Modified: `pnpm-lock.yaml`, `tsconfig.base.json`. New: `packages/project-site-provisioning/**`, this closeout doc. Untracked (pre-existing): `docs/architecture/plans/MASTER/spfx/pcc/phase-02/`. |

## Package Boundary Confirmation

- `@hbc/project-site-template` remains schema-only; no edits.
- `@hbc/project-site-provisioning` declares `@hbc/project-site-template` as a `workspace:*` dependency, locking the directional dependency. No reverse edge exists.
- `packages/provisioning/` (project-intake lifecycle) is untouched and unrelated.
- No edits under `backend/**`, `apps/**`, `tools/**`, or any SPFx solution manifest.

## No-Mutation Confirmation

- Compile-time: `MutationGate` literal `true` / `false` types make a live-mutation gate ill-typed.
- Runtime: `createFrozenMutationGate()` returns a frozen `{ mutationLocked: true, liveMutationAllowed: false, requiresHumanApproval: true }`.
- Validator: rejects unlocked/live-mutation manifests, prohibited mutation keys at any depth, secret-class keys, and Procore-mirror keys.
- Public surface: `src/index.ts` exposes no function whose name implies live tenant execution; export-name discipline is asserted by test.
- Source imports: `src/mapper/**`, `src/contracts/**`, and `src/index.ts` contain no `@pnp/`, `@azure/`, `@microsoft/sp-`, `spHttpClient`, or `GraphClient` usage; asserted by test.

## Dependency Confirmation

- Runtime deps: `@hbc/project-site-template` (workspace:*) only.
- Dev deps: `typescript`, `vitest` only.
- No `@pnp/*`, `@azure/*`, SPFx, Procore, or Graph SDK dependencies in `package.json`.
- Lint inherits from the workspace; no package-local ESLint config.

## Files Changed

**Modified:**

- `tsconfig.base.json` — added `@hbc/project-site-provisioning` path aliases.
- `pnpm-lock.yaml` — regenerated by `pnpm install`.

**New:**

- `packages/project-site-provisioning/package.json`
- `packages/project-site-provisioning/README.md`
- `packages/project-site-provisioning/tsconfig.json`
- `packages/project-site-provisioning/vitest.config.ts`
- `packages/project-site-provisioning/src/index.ts`
- `packages/project-site-provisioning/src/contracts/{mutation-gate,template-source,provisioning-manifest}.ts`
- `packages/project-site-provisioning/src/guards/no-mutation-guard.ts`
- `packages/project-site-provisioning/src/mapper/create-provisioning-manifest.ts`
- `packages/project-site-provisioning/src/validation/validate-provisioning-manifest.ts`
- `packages/project-site-provisioning/test/fixtures/{minimal-template-contract,invalid-mutation-unlocked-manifest}.fixture.json`
- `packages/project-site-provisioning/test/{provisioning-manifest,no-mutation-guard}.test.ts`
- `packages/project-site-provisioning/docs/Phase_2_Step_2_Scaffold_Notes.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-2/Phase_2_Step_2_Project_Site_Provisioning_Mapper_Scaffold_Closeout.md` (this file)

## Phase 2 Step 3 Readiness Decision

**READY.**

Rationale:

- Type contracts are defined and exported.
- Mutation gate primitive is enforced at compile time and runtime.
- Validator rejects unlocked, live-mutation, secret-bearing, and Procore-mirror manifests.
- Mapper is deterministic given an injected clock.
- Phase 1 gate parity is preserved.
- Public surface and source imports respect the no-mutation boundary; assertions are testable.
- No outstanding architecture decisions block contract-coverage expansion.

## Recommended Next Prompt

> **Phase 2 Step 3 — Provisioning Manifest Mapper Expansion and Contract Coverage**
>
> Extend `@hbc/project-site-provisioning` so that `createProvisioningManifest` reads `@hbc/project-site-template`'s family schemas, fixtures, and field maps, and populates each `objectPlans.*.entries` slot deterministically. Add a normalized `plannedHash` field, derive `sitePlan.urlDerivation.resolved` and `sitePlan.title.resolved` placeholder values from contract inputs where derivable, and populate `proof.noSecretScan` / `proof.noProcoreMirrorScan` results. Bump `manifestVersion` from `0.1.0-scaffold` to a Step 3 value. Add fixture coverage that exercises every family. Maintain the mutation gate, the runtime validator, and the no-mutation source-import / export-name disciplines. Do not introduce backend, SPFx, PnP, Graph, Procore runtime, or tenant execution behavior.

## Proposed Commit Summary

```
feat(pcc): scaffold project site provisioning mapper package
```

## Proposed Commit Description

```
Manifest: SharePoint Project Control Center (Standard Project Site Template Contract)

Version: 1.0.0-proposed unchanged; this step creates the headless Phase 2 consumer scaffold and does not change the template contract surface. The new @hbc/project-site-provisioning package is introduced at 0.1.0-scaffold.

Adds packages/project-site-provisioning/ as the no-mutation mapper/planner package scaffold for the Standard Project Site Template. Defines the initial provisioning manifest contract, mutation gate, template source contract, validation helpers, deterministic mapper scaffold, fixtures, and tests, plus package documentation.

Preserves @hbc/project-site-template as schema/contract/validation-only. The new package consumes the template contract directionally via a workspace:* dependency and does not introduce tenant execution, backend adapters, SPFx wiring, PnP scripts, Graph/PnP mutations, Procore runtime code, secrets, or full Procore mirror behavior.

Adds Phase 2 Step 2 closeout documentation under docs/architecture/blueprint/sp-project-control-center/phase-2/.

Validation:
- pnpm --filter @hbc/project-site-template validate:all (pre and post): clean — 15 schemas, contract + 14 valid fixtures pass, 7 invalid fixtures correctly rejected, unexpectedOutcomes: 0, 16/16 integrity checks
- pnpm --filter @hbc/project-site-provisioning check-types: clean
- pnpm --filter @hbc/project-site-provisioning test: 18/18 tests pass

No tenant mutation. No backend changes. No SPFx changes. No tools/PnP runner changes. No package manifest/version changes outside the new package scaffold and the workspace path aliases in tsconfig.base.json.

Phase 2 Step 3 readiness: READY.
```

---

## Cross-References

- [`Phase_2_Step_1_Provisioning_Foundation_Audit.md`](./Phase_2_Step_1_Provisioning_Foundation_Audit.md)
- [`Phase_2_Step_1_Consumer_Boundary.md`](./Phase_2_Step_1_Consumer_Boundary.md)
- [`Phase_2_Step_1_Closeout.md`](./Phase_2_Step_1_Closeout.md)
- [`packages/project-site-provisioning/README.md`](../../../../../packages/project-site-provisioning/README.md)
- [`packages/project-site-provisioning/docs/Phase_2_Step_2_Scaffold_Notes.md`](../../../../../packages/project-site-provisioning/docs/Phase_2_Step_2_Scaffold_Notes.md)
- [PCC blueprint README](../README.md)
- [Plans-tree execution scaffold (read-only)](../../../plans/MASTER/spfx/pcc/phase-02/step-1/)
