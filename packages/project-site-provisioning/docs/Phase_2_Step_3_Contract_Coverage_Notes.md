# Phase 2 Step 3 — Contract Coverage Notes

**Package:** `@hbc/project-site-provisioning@0.1.0-scaffold`
**Manifest version produced:** `0.2.0-contract-coverage`
**Phase:** SP Project Control Center — Phase 2 Step 3
**Baseline commit:** `66a9ef1b070cc1d4392b1f90e712857595bf34a7`
**Date:** 2026-04-28

---

## Objective

Expand the Phase 2 Step 2 scaffold from planned-only placeholder slots into deterministic family-level contract coverage. The mapper now consumes real `@hbc/project-site-template` artifacts, populates one planned entry per declared contract family, derives the frozen PCC site URL from project inputs, and emits a deterministic SHA-256 proof hash plus three guard scans (no-secret, no-Procore-mirror, no-tenant-mutation). The package remains headless and no-mutation.

## Files Created

```
packages/project-site-provisioning/src/contracts/template-artifacts.ts
packages/project-site-provisioning/src/loaders/load-template-artifacts.ts
packages/project-site-provisioning/src/mapper/derive-site-plan.ts
packages/project-site-provisioning/src/mapper/extract-family-entries.ts
packages/project-site-provisioning/src/mapper/compute-planned-hash.ts
packages/project-site-provisioning/src/scans/no-secret-scan.ts
packages/project-site-provisioning/src/scans/no-procore-mirror-scan.ts
packages/project-site-provisioning/src/scans/no-tenant-mutation-scan.ts
packages/project-site-provisioning/test/fixtures/invalid-secret-bearing-manifest.fixture.json
packages/project-site-provisioning/test/fixtures/invalid-procore-mirror-manifest.fixture.json
packages/project-site-provisioning/test/fixtures/invalid-tenant-mutation-manifest.fixture.json
packages/project-site-provisioning/test/site-plan-derivation.test.ts
packages/project-site-provisioning/test/contract-coverage.test.ts
packages/project-site-provisioning/test/scans.test.ts
packages/project-site-provisioning/docs/Phase_2_Step_3_Contract_Coverage_Notes.md   (this file)
```

## Files Modified

```
packages/project-site-provisioning/src/contracts/provisioning-manifest.ts
packages/project-site-provisioning/src/mapper/create-provisioning-manifest.ts
packages/project-site-provisioning/src/validation/validate-provisioning-manifest.ts
packages/project-site-provisioning/src/index.ts
packages/project-site-provisioning/test/provisioning-manifest.test.ts
packages/project-site-provisioning/test/no-mutation-guard.test.ts
packages/project-site-provisioning/README.md
```

No edits under `packages/project-site-template/**`, `backend/**`, `apps/**`, `tools/**`, SPFx manifests, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, or `pnpm-lock.yaml`.

## Mapping Coverage Summary

- **Manifest version**: bumped from `0.1.0-scaffold` to `0.2.0-contract-coverage`. Single source of truth: `MANIFEST_VERSION` exported from `src/contracts/provisioning-manifest.ts`. The literal type makes a stale callsite a compile-time error.
- **Site plan**: PCC frozen URL convention applied. Given `projectNumber: '26-000-00'` → `projectBaseNumber: '26-000'` → `projectBaseNumberNoHyphen: '26000'` → `resolved: '/sites/26000'`. Missing inputs yield placeholder fields and structured warnings. No SharePoint availability check.
- **Object plans**: one family-level entry per contract family that has a fixture; entry shape captures source traceability, mvp status, validation refs, field counts, and dependency edges.
- **Proof**: deterministic SHA-256 over a sorted-keys canonical form of the planned content with non-deterministic sections excluded; three scan results inline.
- **Source coverage**: counters reflect what was actually loaded from the artifacts (`contractFamiliesDeclared = 14`, `fixturesProcessed = 14`, `fieldMapsProcessed = 12`, `objectCatalogRowsProcessed = 18`).

## Object Plan Family Coverage

| `ObjectPlans` key | Source family | Entries in Step 3 |
|---|---|---|
| `templateManifest` | `template-manifest` | 1 |
| `enums` | `enums` | 1 |
| `settings` | `settings` | 1 |
| `permissions` | `permissions` | 1 |
| `site` | `site` | 1 |
| `pages` | `pages` | 1 |
| `libraries` | `libraries` | 1 |
| `lists` | `lists` | 1 |
| `modules` | `modules` | 1 |
| `workflows` | `workflows` | 1 |
| `integrations` | `integrations` | 1 |
| `siteHealth` | `site-health` | 1 |
| `provisioningValidation` | `provisioning-validation` | 1 |
| `validationRules` | `validation-rules` | 1 |

**Step 3 provides family-level object plan coverage only, not per-instance enumeration of all pages, libraries, lists, groups, or permission templates.** Per-instance enumeration is deferred to a later step that consumes a richer enumeration source.

## ObjectPlans Key Normalization

Step 2 had ten placeholder slots. Step 3 realigns them 1:1 with the 14 contract families:

- **Removed:** `groups`, `permissionTemplates` — these were Step 2 placeholder guesses; the contract carries a single `permissions` family that holds group + template structure as nested fields within one record.
- **Added:** `templateManifest`, `enums`, `settings`, `permissions`, `site`, `validationRules`.

Safe because no external consumers exist. Recorded explicitly in the blueprint Step 3 closeout.

## Mutation Gate Confirmation

- Compile-time: `MutationGate` literal `true` / `false` types unchanged from Step 2; gate cannot be widened without explicit type assertion.
- Runtime: `createFrozenMutationGate()` returns the locked frozen triple.
- Validator now requires `proof.noSecretScan.ok`, `proof.noProcoreMirrorScan.ok`, and `proof.noTenantMutationScan.ok` to all be true, in addition to the Step 2 gate triple checks.
- Self-validation: `createProvisioningManifest` runs the validator before returning and throws on any internal contradiction (catches programmer errors, never user-input errors). Validator was not weakened to make tests pass.

## Proof / Hash Confirmation

- Algorithm: `sha256` via `node:crypto` (Node built-in; no dependency added).
- Canonicalization: recursive sorted-key `JSON.stringify`.
- Included sections: `manifestVersion`, `generatedFrom`, three locked `mutationGate` fields, `sitePlan`, `objectPlans`.
- Excluded sections: `generatedAt`, `proof`, `warnings`, `blockers`, optional approval triplet on `mutationGate`.
- Tests prove: 64-char hex format; determinism across runs with identical inputs; different content → different hash; different `generatedAt` → same hash.

## Scan Confirmation

- **`noSecretScan`** (key-scoped): walks the manifest for the secret-key token list. Tests prove pass on real manifests, fail on `client_secret` / `api_key` / `bearer_token` / `dmsa_credential` / `refresh_token`. **Value scanning is deferred and explicitly documented in the README.**
- **`noProcoreMirrorScan`**: combines a structural key scan with two source-of-truth assertions (integrations fixture posture + OC-17/OC-18 catalog disposition). Tests prove pass on real manifests, fail on `procoreMirror` keys, fail when `noFullProcoreMirror` flips to `false`, fail when OC-17 disposition changes.
- **`noTenantMutationScan`**: prohibited-key scan + word-boundaried verb-phrase scan over string values. Tests prove pass on real manifests, fail on `createSite` keys, fail on phrases like `"create site for tenant"` / `"graph write"` / `"pnp write"`, no false positive on `'planned'` / `'plannedOnly'` / `'noTenantMutationScan'`.

## Tests Added / Updated

| Test file | Tests | Coverage |
|---|---|---|
| `test/provisioning-manifest.test.ts` (updated) | 6 | Step 3 manifest version; locked mutation gate; 14 object-plan slots; deterministic JSON; validator pass; frozen graph |
| `test/no-mutation-guard.test.ts` (extended) | 9 | Frozen gate factory; `assertNoMutationKeys` happy/throw; validator unlocked-gate / mutation-key / non-object rejection; export-name discipline; source-import discipline (excluding guards/validation/scans) |
| `test/site-plan-derivation.test.ts` (new) | 7 | `26-000-00 → /sites/26000`; `26-123-45 → /sites/26123`; non-numeric stripping `2A6-X00 → /sites/260`; missing/empty inputs → placeholder + warnings |
| `test/contract-coverage.test.ts` (new) | 10 | Loads all 14 fixtures + 12 field maps; one entry per family with full metadata; 64-char hex hash; deterministic hash; hash sensitivity to content; insensitivity to `generatedAt`; source coverage counters; validator pass; placeholder site URL when inputs absent |
| `test/scans.test.ts` (new) | 18 | All three scan types: clean pass; key/value violations; integrations posture flips; OC-17 disposition flips; validator rejection of false-scan-result manifests; manifest-version mismatch rejection |

**Total: 50 tests pass, distributed across 5 files.** All Step 2 mutation-gate, public-export, and source-import disciplines are preserved; the source-import discipline scan now also skips `src/scans/` (matching the existing skip for `src/guards/` and `src/validation/`).

## Validation Commands Run

| Command | Purpose | Result |
|---|---|---|
| `git status --short` (pre and post) | Scope verification | recorded in blueprint Step 3 closeout |
| `pnpm --filter @hbc/project-site-template validate:all` (pre and post) | Phase 1 gate parity | clean both runs (15 schemas; contract + 14 valid fixtures pass; 7 invalid correctly rejected; 16/16 integrity checks pass; `unexpectedOutcomes: 0`) |
| `pnpm --filter @hbc/project-site-provisioning check-types` | Type discipline | clean (`tsc --noEmit` exit 0) |
| `pnpm --filter @hbc/project-site-provisioning test` | Vitest run | 50/50 tests pass across 5 files |

Out-of-scope and not run: SPFx solution build, backend test suite, tenant smoke tests, hosted runtime proof, Procore connectivity tests.

## Known Limitations

- **Per-instance enumeration is deferred.** Each family produces one family-level entry, not one entry per page/library/list/permission-template instance.
- **`enforcementLayers` not populated** at the family-level entry. Source data does not expose it per family.
- **`noSecretScan` is key-scoped only.** Value-content scanning is documented as deferred to avoid false positives on descriptive prose.
- **Loader requires explicit package-root path.** No pnpm node_modules path resolution is performed inside the loader; callers supply the resolved root.

## Intentionally Not Implemented

- Backend executor adapter, Azure Functions, PnP runner scripts, SPFx wiring, admin UI, deployment changes, CI/CD changes.
- Tenant mutations, Graph mutations, PnP calls, SharePoint creation.
- Procore SDK / HTTP client / secrets / mirror tables / write-back.
- New ADRs (no architecture reversal in this step).
- SPFx solution manifest or version bumps.
- Edits under `packages/project-site-template/**`.
- Edits to `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, or `pnpm-lock.yaml`.

## Phase 2 Step 4 Readiness

**READY** — Step 4 (Provisioning Manifest Dry-Run Proof Artifact Generation) may proceed under the boundary, mutation gate, validator, and proof contract established here. Step 4 should emit a timestamped JSON + Markdown proof artifact to a version-controlled `proof/` folder, reusing the convention established by `tools/pnp-runner-local/scripts`.
