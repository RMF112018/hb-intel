# Phase 2 Step 3 — Provisioning Manifest Mapper Expansion Closeout

**Effort:** SP Project Control Center (PCC) — Standard Project Site Template
**Companion to:** [`Phase_2_Step_1_Provisioning_Foundation_Audit.md`](./Phase_2_Step_1_Provisioning_Foundation_Audit.md), [`Phase_2_Step_1_Consumer_Boundary.md`](./Phase_2_Step_1_Consumer_Boundary.md), [`Phase_2_Step_1_Closeout.md`](./Phase_2_Step_1_Closeout.md), [`Phase_2_Step_2_Project_Site_Provisioning_Mapper_Scaffold_Closeout.md`](./Phase_2_Step_2_Project_Site_Provisioning_Mapper_Scaffold_Closeout.md)
**Baseline commit (audit start):** `66a9ef1b070cc1d4392b1f90e712857595bf34a7`
**Manifest version produced by `@hbc/project-site-provisioning`:** `0.2.0-contract-coverage` (template `templateVersion: 1.0.0-proposed` unchanged)
**Date:** 2026-04-28

---

## Objective

Expand the Phase 2 Step 2 mapper scaffold into a deterministic contract-coverage mapper. After this step, `createProvisioningManifest` reads real `@hbc/project-site-template` artifacts and produces one family-level planned entry per declared contract family, with the frozen PCC URL derivation, a deterministic SHA-256 proof hash, and three guard scans. The no-mutation boundary established in Steps 1–2 is preserved.

## What Was Completed

1. **New `TemplateArtifacts` model** at `src/contracts/template-artifacts.ts` covering `templateContract`, `familyFixtures`, `familyFieldMaps`, `objectCatalog`, `fieldDependencies`, `commonFields`.
2. **New synchronous loader** `loadTemplateArtifactsFromPackage(packageRoot)` at `src/loaders/load-template-artifacts.ts` reading the canonical JSON files via `node:fs`.
3. **Manifest version bumped** to `0.2.0-contract-coverage` (literal type; single source of truth `MANIFEST_VERSION`).
4. **`OBJECT_PLAN_KEYS` realigned** 1:1 with the 14 contract families. Step 2 placeholder keys `groups` and `permissionTemplates` removed in favor of the contract-aligned `permissions` (and 5 other newly-added keys).
5. **Per-family extractor** at `src/mapper/extract-family-entries.ts` produces one `PlannedObjectEntry` per family with `id`, `family`, `kind`, `sourceContractSection`, `sourceCatalogId`, `sourceBlueprintSection`, `sourceDecisionRef`, `mvpStatus`, `ownerCategory`, `validationRuleRefs`, `blocksGenerationIfMissing`, `fieldCount`, `requiredFieldCount`, `optionalFieldCount`, `dependencies`, `plannedOnly: true`, `mutationAllowed: false`.
6. **Site plan derivation** at `src/mapper/derive-site-plan.ts` applies the frozen PCC URL convention: take the first six characters of the accounting project number, strip non-numerics, prefix with `/sites/`. Missing inputs produce explicit placeholders and structured warnings.
7. **Deterministic hash** at `src/mapper/compute-planned-hash.ts`: SHA-256 via `node:crypto` over a sorted-keys canonicalization with non-deterministic sections (`generatedAt`, `proof`, `warnings`, `blockers`, optional approval triplet on `mutationGate`) excluded.
8. **Three guard scans** at `src/scans/`:
   - `noSecretScan` — key-scoped scan over the secret-token list.
   - `noProcoreMirrorScan` — structural key scan plus source-of-truth assertions on integrations posture and OC-17 / OC-18 disposition.
   - `noTenantMutationScan` — prohibited-key scan plus word-boundaried verb-phrase scan over string values.
9. **Validator extended** to require correct `manifestVersion`, 64-char hex `plannedHash`, `hashAlgorithm: 'sha256'`, all three scans `ok: true`, valid `sourceCoverage` counters, `validationStatus: 'planned-coverage'`, and the 14 object-plan slots.
10. **Self-validation inside the mapper** — `createProvisioningManifest` runs the validator before returning and throws on internal contradictions.
11. **Public surface updated** at `src/index.ts` to export the new types and helpers without exposing any live-mutation function name.
12. **Test suite expanded** to 5 files / 50 tests covering Step 2 invariants plus Step 3 contract coverage, site-plan derivation, scans, and validator extensions.
13. **Three new invalid-fixture JSONs** for scan-rejection tests.
14. **Documentation:** package `README.md` rewritten for Step 3, package `docs/Phase_2_Step_3_Contract_Coverage_Notes.md` created, this blueprint closeout created.

## Mapping Coverage Summary

For each of the 14 contract families with a `validation/fixtures/valid/*.valid.json`, the mapper extracts identity, source traceability, MVP status, validation refs, field counts (when a field map exists), and dependency edges, and emits one `PlannedObjectEntry`. Source coverage counters embedded in `proof.sourceCoverage`:

- `contractFamiliesDeclared = 14`
- `fixturesProcessed = 14`
- `fieldMapsProcessed = 12` (cross-cutting `enums` and `validation-rules` excluded by Phase 1 design)
- `objectCatalogRowsProcessed = 18`

**Step 3 provides family-level object plan coverage only, not per-instance enumeration of all pages, libraries, lists, groups, or permission templates.** Per-instance enumeration is deferred to a later step that consumes a richer enumeration source. This limit is documented in the package README and the Step 3 contract-coverage notes.

## Object Plan Key Normalization (recorded explicitly)

Step 2 introduced ten placeholder slots: `pages, libraries, lists, groups, permissionTemplates, modules, workflows, integrations, siteHealth, provisioningValidation`. Step 3 realigns the slot list 1:1 with the contract's 14 declared families:

```
templateManifest, enums, settings, permissions, site, pages, libraries,
lists, modules, workflows, integrations, siteHealth, provisioningValidation,
validationRules
```

- **Removed:** `groups`, `permissionTemplates`. These were Step 2 placeholder guesses; the contract carries a single `permissions` family that holds group + permission-template structure as nested fields within one record.
- **Added:** `templateManifest`, `enums`, `settings`, `permissions`, `site`, `validationRules`.

This is a deliberate, documented breaking change to the Step 2 export. It is safe because no external consumers exist.

## Mutation Gate Confirmation

- Compile-time literal-`true` / literal-`false` typing unchanged from Step 2.
- Runtime `createFrozenMutationGate()` returns the locked frozen triple.
- Validator now requires `proof.noSecretScan.ok === true`, `proof.noProcoreMirrorScan.ok === true`, `proof.noTenantMutationScan.ok === true` in addition to the gate triple.
- Validator was not weakened to make tests pass; the only test fix during execution corrected an inverted expectation in `site-plan-derivation.test.ts` for the `2A6-X00` non-numeric-stripping case (test expected `'26'`; correct output per the rule is `'260'`).

## Proof / Hash Confirmation

- `proof.plannedHash` is a 64-character lowercase hex string from `crypto.createHash('sha256')`.
- Canonicalization: recursive sorted-key `JSON.stringify`.
- Tests prove deterministic across runs, sensitive to content changes, insensitive to `generatedAt`.
- `proof.hashInputSummary` records included and excluded sections plus the canonicalization rule.

## Scan Confirmation

- **`noSecretScan`** is **key-scoped for this step**. Value scanning is documented as deferred (README, Step 3 notes) to avoid false positives on descriptive prose.
- **`noProcoreMirrorScan`** combines a structural key scan with two source-of-truth assertions on the loaded artifacts; preserves OC-17 / OC-18 placeholder-only / Deferred posture.
- **`noTenantMutationScan`** combines a prohibited-key scan with word-boundaried verb-phrase value matching to flag live-operation phrases without false-positiving on `'planned'` / `'plannedOnly'` / `'noTenantMutationScan'`.

## Dependency Confirmation

- Runtime deps unchanged: `@hbc/project-site-template` (`workspace:*`).
- Dev deps unchanged: `typescript`, `vitest`.
- No `@pnp/*`, `@azure/*`, `@microsoft/sp-*`, Procore SDK, or backend dependencies introduced.
- Hashing uses `node:crypto` (built-in); no new runtime dependency.

## Validation Results

| Command | Result |
|---|---|
| `git status --short` (pre) | only pre-existing untracked directories outside the approved scope |
| `pnpm --filter @hbc/project-site-template validate:all` (pre) | **PASS** — 15 schemas; contract + 14 valid fixtures pass; 7 invalid fixtures correctly rejected; `unexpectedOutcomes: 0`; 16/16 integrity checks pass |
| `pnpm --filter @hbc/project-site-provisioning check-types` | **PASS** — `tsc --noEmit` exit 0 |
| `pnpm --filter @hbc/project-site-provisioning test` | **PASS** — 50/50 tests across 5 files |
| `pnpm --filter @hbc/project-site-template validate:all` (post) | **PASS** — Phase 1 gate parity preserved (counters unchanged) |
| `git status --short` (post) | scope confirmed: only files under `packages/project-site-provisioning/**` and this closeout doc; no changes under `packages/project-site-template/**`, `backend/**`, `apps/**`, `tools/**`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `pnpm-lock.yaml`, or any SPFx manifest |

## Files Changed

**Modified:**
- `packages/project-site-provisioning/src/contracts/provisioning-manifest.ts`
- `packages/project-site-provisioning/src/mapper/create-provisioning-manifest.ts`
- `packages/project-site-provisioning/src/validation/validate-provisioning-manifest.ts`
- `packages/project-site-provisioning/src/index.ts`
- `packages/project-site-provisioning/test/provisioning-manifest.test.ts`
- `packages/project-site-provisioning/test/no-mutation-guard.test.ts`
- `packages/project-site-provisioning/README.md`

**New:**
- `packages/project-site-provisioning/src/contracts/template-artifacts.ts`
- `packages/project-site-provisioning/src/loaders/load-template-artifacts.ts`
- `packages/project-site-provisioning/src/mapper/derive-site-plan.ts`
- `packages/project-site-provisioning/src/mapper/extract-family-entries.ts`
- `packages/project-site-provisioning/src/mapper/compute-planned-hash.ts`
- `packages/project-site-provisioning/src/scans/no-secret-scan.ts`
- `packages/project-site-provisioning/src/scans/no-procore-mirror-scan.ts`
- `packages/project-site-provisioning/src/scans/no-tenant-mutation-scan.ts`
- `packages/project-site-provisioning/test/fixtures/invalid-secret-bearing-manifest.fixture.json`
- `packages/project-site-provisioning/test/fixtures/invalid-procore-mirror-manifest.fixture.json`
- `packages/project-site-provisioning/test/fixtures/invalid-tenant-mutation-manifest.fixture.json`
- `packages/project-site-provisioning/test/site-plan-derivation.test.ts`
- `packages/project-site-provisioning/test/contract-coverage.test.ts`
- `packages/project-site-provisioning/test/scans.test.ts`
- `packages/project-site-provisioning/docs/Phase_2_Step_3_Contract_Coverage_Notes.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-2/Phase_2_Step_3_Provisioning_Manifest_Mapper_Expansion_Closeout.md` (this file)

## What Was Not Implemented (and Why)

| Not implemented | Why |
|---|---|
| Per-instance enumeration of pages / libraries / lists / permission templates | Machine-readable contract carries family-level fixtures and field maps but does not enumerate per-instance records; deferred to a later step. |
| `enforcementLayers` per family-level entry | Source data does not expose it per family. |
| Value-content secret scanning | Risks false positives on descriptive prose. Deferred. |
| Backend executor adapter, PnP runner scripts, Graph mutations, SPFx wiring, admin UI | Out of scope for any planner step; reserved for Step 5+. |
| Procore SDK / HTTP client / secrets / mirror / write-back | Permanently out of scope for MVP per locked invariants. |
| New ADRs | No architecture reversal in this step. |
| SPFx solution manifest or version bumps | No SPFx package was touched. |
| Edits under `packages/project-site-template/**` | None required; Phase 1 gate parity confirmed pre and post. |

## Remaining Limitations

- Per-instance enumeration deferred (recorded above).
- `enforcementLayers` deferred (recorded above).
- `noSecretScan` value-content scanning deferred (recorded above).
- Loader does not perform package-root resolution; callers supply the path.

## Phase 2 Step 4 Readiness Decision

**READY.**

Rationale:

- All 14 contract families are mapped to one family-level planned entry each.
- Site URL derivation follows the frozen PCC convention with deterministic placeholders for missing inputs.
- Proof hash is deterministic, content-sensitive, generation-time-insensitive.
- Three scans cover secrets (key-scoped), Procore mirror (structural + artifact-truth), and tenant mutation (key + verb-phrase).
- Validator is strict; mapper self-validates before returning.
- Phase 1 gate parity preserved.
- Public surface and source imports respect the no-mutation boundary; assertions are testable and pass.
- No outstanding architecture decisions block proof-artifact emission.

## Recommended Next Prompt

> **Phase 2 Step 4 — Provisioning Manifest Dry-Run Proof Artifact Generation**
>
> Emit deterministic proof artifacts (JSON manifest + Markdown summary) to a version-controlled `proof/` folder, reusing the timestamped naming convention established by `tools/pnp-runner-local/scripts`. Define the artifact-folder location, the Markdown sections required for operator review (intent, derived URL, family-by-family target counts, integrity-check parity, scan results, plannedHash), the rules for re-emitting on input change, and the relationship between the artifact and the mutation-gate approval flow. Maintain the Step 1–3 invariants: no tenant mutation, no Graph / PnP, no SPFx, no Procore runtime, no backend executor adapter.

## Proposed Commit Summary

```
feat(pcc): expand provisioning mapper contract coverage
```

## Proposed Commit Description

```
Manifest: SharePoint Project Control Center (Standard Project Site Template Contract)

Version: 1.0.0-proposed unchanged; this step expands the headless Phase 2 consumer mapper and does not change the template contract surface. The new manifest version produced by @hbc/project-site-provisioning is 0.2.0-contract-coverage.

Expands @hbc/project-site-provisioning from the Step 2 scaffold into a
deterministic contract-coverage mapper. The package now consumes
@hbc/project-site-template artifacts via a new TemplateArtifacts model
and a synchronous loader, populates one family-level planned entry per
contract family, derives the frozen PCC site URL convention
(/sites/{ProjectBaseNumberNoHyphen}), emits a deterministic SHA-256
plannedHash, and records noSecretScan / noProcoreMirrorScan /
noTenantMutationScan results. Realigns ObjectPlans keys 1:1 with the 14
contract families: removes Step 2 placeholder keys groups and
permissionTemplates; adds templateManifest, enums, settings,
permissions, site, validationRules.

Preserves @hbc/project-site-template as schema/contract/validation-only.
Maintains the locked mutation gate: mutationLocked=true,
liveMutationAllowed=false, requiresHumanApproval=true. The package still
does not introduce tenant execution, backend adapters, SPFx wiring, PnP
scripts, Graph/PnP mutations, Procore runtime code, secrets, full
Procore mirror behavior, or write-back behavior. Step 3 provides
family-level object plan coverage only, not per-instance enumeration.

Adds Phase 2 Step 3 package notes and blueprint closeout documentation.

Validation:
  - pnpm --filter @hbc/project-site-template validate:all (pre and
    post): clean (15 schemas; contract + 14 valid fixtures pass; 7
    invalid correctly rejected; unexpectedOutcomes: 0; 16/16 integrity
    checks pass)
  - pnpm --filter @hbc/project-site-provisioning check-types: clean
  - pnpm --filter @hbc/project-site-provisioning test: 50/50 tests pass
    across 5 files

No tenant mutation. No backend changes. No SPFx changes. No tools/PnP
runner changes. No SPFx solution or manifest version changes. No
template contract version change. No edits under packages/project-site-
template/**, backend/**, apps/**, tools/**, pnpm-workspace.yaml,
turbo.json, tsconfig.base.json, or pnpm-lock.yaml.

Phase 2 Step 4 readiness: READY.
```

---

## Cross-References

- [`Phase_2_Step_1_Provisioning_Foundation_Audit.md`](./Phase_2_Step_1_Provisioning_Foundation_Audit.md)
- [`Phase_2_Step_1_Consumer_Boundary.md`](./Phase_2_Step_1_Consumer_Boundary.md)
- [`Phase_2_Step_1_Closeout.md`](./Phase_2_Step_1_Closeout.md)
- [`Phase_2_Step_2_Project_Site_Provisioning_Mapper_Scaffold_Closeout.md`](./Phase_2_Step_2_Project_Site_Provisioning_Mapper_Scaffold_Closeout.md)
- [`packages/project-site-provisioning/README.md`](../../../../../packages/project-site-provisioning/README.md)
- [`packages/project-site-provisioning/docs/Phase_2_Step_3_Contract_Coverage_Notes.md`](../../../../../packages/project-site-provisioning/docs/Phase_2_Step_3_Contract_Coverage_Notes.md)
- [PCC blueprint README](../README.md)
