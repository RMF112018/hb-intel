# `@hbc/project-site-provisioning`

Headless deterministic mapper / planner for the SP Project Control Center (PCC) **Standard Project Site Template Contract**.

This package consumes the schema-only contract owned by [`@hbc/project-site-template`](../project-site-template/README.md) and produces a frozen, mutation-locked provisioning manifest with planned-only family coverage, deterministic proof hash, and three guard scans. Tenant mutation, Graph / PnP calls, SPFx code, and Procore runtime concerns belong elsewhere — see the boundary tables below.

---

## Current step status

**Phase 2 Step 4 — Provisioning Manifest Dry-Run Proof Artifact Generation.** This step:

- introduces `createDryRunProofArtifacts`, which assembles a JSON envelope and Markdown summary from a Step 3 provisioning manifest,
- introduces a runtime `validateDryRunProofArtifact` that enforces `dryRunOnly: true`, `tenantMutationAllowed: false`, the canonical non-execution sentinel, complete object family coverage, and locked manifest scans,
- adds a deterministic baseline pair under [`proof/`](./proof/) — `project-site-provisioning-dry-run-baseline.json` and `project-site-provisioning-dry-run-baseline.md`,
- adds a package-local regenerator script (`pnpm --filter @hbc/project-site-provisioning generate:proof`) that builds the package and rewrites the baseline pair from real `@hbc/project-site-template` artifacts using a frozen clock and frozen project inputs,
- adds a baseline-determinism test that catches drift between the generator and the committed baseline,
- preserves the Step 2 mutation gate, public-export, and source-import disciplines.

The proof artifact is a planning artifact only; the manifest mutation gate stays locked, and `approvalState` defaults to `not-requested` with `null` approval fields.

### Step 3 reference

The Step 3 mapper underneath this step:

- bumps the manifest version to `0.2.0-contract-coverage`,
- introduces a `TemplateArtifacts` model and a synchronous `loadTemplateArtifactsFromPackage(packageRoot)` loader,
- maps every contract family fixture into one family-level planned object entry with identity, source traceability, mvp status, validation refs, field counts, and dependency edges,
- expands `sitePlan` with the frozen PCC URL derivation rule (`/sites/{ProjectBaseNumberNoHyphen}` from the first six characters of the accounting project number with non-numerics stripped),
- adds a deterministic `proof.plannedHash` (SHA-256, sorted-keys canonicalization, redacted non-deterministic sections),
- adds three runtime scans: `noSecretScan`, `noProcoreMirrorScan`, `noTenantMutationScan`,
- preserves all Step 2 mutation-gate, public-export, and source-import disciplines.

Per-instance object enumeration (e.g., the 17 individual pages, 12 individual libraries, 10 individual permission templates) is **deferred**. The machine-readable contract carries family-level fixtures and field maps but does not enumerate per-instance records; that source data lives in contract markdown prose.

## Object plan coverage

`ObjectPlans` keys are aligned 1:1 with the 14 declared contract families. Step 2's placeholder keys `groups` and `permissionTemplates` were removed in favor of the contract-aligned `permissions` family (which carries group + template structure as nested fields within one record).

| `ObjectPlans` key | Contract family | Has fixture | Has field map | Has catalog row |
|---|---|---|---|---|
| `templateManifest` | `template-manifest` | yes | yes | yes |
| `enums` | `enums` | yes | no (cross-cutting) | no |
| `settings` | `settings` | yes | yes | yes |
| `permissions` | `permissions` | yes | yes | yes |
| `site` | `site` | yes | yes | yes (OC-01) |
| `pages` | `pages` | yes | yes | yes (OC-02) |
| `libraries` | `libraries` | yes | yes | yes |
| `lists` | `lists` | yes | yes | yes |
| `modules` | `modules` | yes | yes | yes |
| `workflows` | `workflows` | yes | yes | yes |
| `integrations` | `integrations` | yes | yes | yes |
| `siteHealth` | `site-health` | yes | yes | yes |
| `provisioningValidation` | `provisioning-validation` | yes | yes | yes |
| `validationRules` | `validation-rules` | yes | no (cross-cutting) | no |

Each family-level entry includes (when derivable):

- `id`, `family`, `kind`,
- `sourceContractSection`, `sourceCatalogId`, `sourceBlueprintSection`, `sourceDecisionRef`,
- `mvpStatus`, `ownerCategory`, `validationRuleRefs`,
- `blocksGenerationIfMissing` (true when the source object catalog row is `Frozen for MVP` or the family is in `globalReferences.referencedBy`),
- `fieldCount`, `requiredFieldCount`, `optionalFieldCount` (from the family field map's `familyFields`),
- `dependencies` (from `family-field-dependencies.json`),
- `plannedOnly: true`, `mutationAllowed: false`.

`enforcementLayers` per family-level entry is intentionally not populated in this step; the source data does not carry it per family. Future expansion may add it.

## Source artifact model

`TemplateArtifacts` covers six artifact slots:

- `templateContract` — `template-contract.json` (declarations + family schema pointers),
- `familyFixtures` — `validation/fixtures/valid/*.valid.json` (one example record per family),
- `familyFieldMaps` — `fields/families/*.fields.json` (12 of 14; cross-cutting `enums` and `validation-rules` excluded by Phase 1 design),
- `objectCatalog` — `fields/object-catalog-field-disposition.json` (18 OC-NN rows),
- `fieldDependencies` — `fields/family-field-dependencies.json`,
- `commonFields` — `fields/common-fields.json`.

Callers may either:

- pass a `TemplateArtifacts` instance directly to the mapper (recommended for tests and headless callers), or
- call `loadTemplateArtifactsFromPackage(packageRoot)` with the resolved path to `packages/project-site-template`.

## Proof / hash policy

- **Algorithm:** `sha256` (Node built-in `crypto`; no new dependency).
- **Canonicalization:** recursive `Object.keys(...).sort()` then `JSON.stringify`.
- **Included sections:** `manifestVersion`, `generatedFrom`, the three locked `mutationGate` flags, `sitePlan`, `objectPlans`.
- **Excluded sections:** `generatedAt`, `proof`, `warnings`, `blockers`, and the optional approval triplet on `mutationGate` (`approvedBy`, `approvedAt`, `approvalRef`).
- **Determinism:** identical artifacts + identical project inputs + identical `context.now`/`context.sourceCommit` → identical hash.

## No-secret scan policy

The `noSecretScan` is **key-scoped** for this step. It walks the manifest object graph (case-insensitively) for any of: `client_secret`, `clientsecret`, `refresh_token`, `refreshtoken`, `dmsa_credential`, `dmsacredential`, `oauth_secret`, `oauthsecret`, `api_key`, `apikey`, `bearer_token`, `bearertoken`, `accesstoken`, `access_token`. Value-content scanning is documented as deferred to a later step to avoid false positives on descriptive prose.

## No-Procore-mirror scan policy

The `noProcoreMirrorScan` combines:

- a structural key scan over the manifest for `procoreMirror`, `mirrorTable`, `mirrorRecords` (and underscored variants), with
- two source-of-truth assertions against the loaded artifacts:
  - the integrations fixture must keep `noFullProcoreMirror !== false` and `procoreWriteback_Deferred !== false`,
  - object-catalog rows OC-17 and OC-18 must remain `extractionTreatment: 'placeholder-only'` and `mvpTreatment: 'Deferred'`.

## No-tenant-mutation scan policy

The `noTenantMutationScan` combines a structural key scan over the prohibited mutation key list (Step 2: `execute, apply, provision, mutate, createSite, createList, createLibrary, createGroup, assignPermission`) with a word-boundaried verb-phrase scan over string values: `\b(create site|create list|create library|create group|assign permission|graph write|pnp write|provision live)\b`. Word boundaries prevent false positives on `'planned'` and `'plannedOnly'`.

## Mutation gate (unchanged from Step 2)

Compile-time and runtime gating both enforce `{ mutationLocked: true, liveMutationAllowed: false, requiresHumanApproval: true }`. The validator additionally requires every scan in `proof` to report `ok: true`.

## Public export discipline (unchanged from Step 2)

`src/index.ts` exposes no live-operation function names. Asserted by test.

## Source import discipline (unchanged from Step 2)

`src/mapper/**`, `src/contracts/**`, `src/loaders/**`, and `src/index.ts` contain no `@pnp/`, `@azure/`, `@microsoft/sp-`, `spHttpClient`, or `GraphClient` references. `src/guards/`, `src/validation/`, and `src/scans/` are excluded from the scan because they legitimately reference forbidden tokens as data. Asserted by test.

## Known limitations

- **Per-instance enumeration deferred.** Each family produces one family-level planned entry, not one entry per page/library/list/permission-template instance. The contract markdown enumerates instances; a later step that consumes a richer enumeration source can populate them.
- **`enforcementLayers` not populated** at the family-level entry. Source data does not expose it per family.
- **Secret value scanning deferred.** `noSecretScan` is key-scoped only.
- **No production loader path resolution.** `loadTemplateArtifactsFromPackage` requires the caller to supply the resolved package root; pnpm node_modules path resolution is left to consumers.

## Proof artifacts (Step 4)

- **Folder:** [`proof/`](./proof/) (committed; `.gitignore` covers `dist/` only).
- **Baseline pair:**
  - `proof/project-site-provisioning-dry-run-baseline.json` — JSON envelope (`{ artifactVersion, artifactKind, artifactId, createdAt, dryRunOnly: true, tenantMutationAllowed: false, approvalState, nonExecutionStatement, manifest, operatorSummary, validation }`).
  - `proof/project-site-provisioning-dry-run-baseline.md` — Markdown operator summary covering artifact identity, source, manifest version, mutation gate, site plan, the 14-family coverage table, integrity + scans, source coverage, warnings, blockers, the operator review checklist, and the canonical non-execution statement.
- **Determinism rules:**
  - same manifest + same metadata → byte-identical JSON and Markdown,
  - meaningful manifest change → different JSON and Markdown (`plannedHash` reflects the change),
  - different `createdAt` only → only the `createdAt` line changes; `plannedHash` is unchanged,
  - committed timestamps in the baseline use the frozen clock `2026-04-28T00:00:00.000Z`.
- **Regeneration:** `pnpm --filter @hbc/project-site-provisioning generate:proof` builds the package and rewrites the baseline pair. The build output (`dist/`) is gitignored; only the `proof/` pair is committed.
- **Validation sentinel:** the canonical non-execution statement is `"This proof artifact is a dry-run planning artifact only. It does not create or modify SharePoint, Graph, PnP, Procore, SPFx, backend, or tenant resources."` — the validator fails any artifact that omits or alters it.
- **Mutation gate relationship:** the artifact carries `dryRunOnly: true` and `tenantMutationAllowed: false` as compile-time literals. `approvalState.approvalStatus` is `'not-requested'` by default and may transition to `'pending'` only via a future approval-flow step (not in scope here).

## Future steps

- **Step 5 — Non-production executor adapter boundary and apply-gate scaffold** under `backend/functions/`, consuming a frozen, signed, approved manifest.
- **Future expansion:** per-instance enumeration, `enforcementLayers` per entry, secret-value scanning, timestamped per-run proof outputs alongside the committed baseline.

## Validation commands

From the workspace root:

```bash
pnpm --filter @hbc/project-site-provisioning check-types
pnpm --filter @hbc/project-site-provisioning generate:proof
pnpm --filter @hbc/project-site-provisioning test
```

Phase 1 gate (must remain clean):

```bash
pnpm --filter @hbc/project-site-template validate:all
```

## Boundary with `@hbc/project-site-template`

- Read-only consumer: this package only reads contract data via `TemplateArtifacts`.
- One-way directional `dependencies` declaration in `package.json` (`workspace:*`).
- The template package must not import from this package.

## Boundary with `backend/functions/`

- This package is not consumed by the backend in Step 3.
- A future executor adapter under `backend/functions/` will consume only the manifest type and validator, never the planner internals.
- The executor must operate on a frozen, signed, approved manifest and must never re-derive plans inside the backend.

## Boundary with SPFx

- SPFx surfaces must not import this package as a runtime dependency in Step 3.
- A later step may expose read-only typed views of the manifest for SPFx consumption; live tenant calls must remain backend-only.

## Boundary with Procore

- No Procore SDK, no Procore HTTP client, no Procore secrets.
- No full Procore mirror in any manifest produced by this package; enforced by `noProcoreMirrorScan`.
- All Procore API traffic stays behind `backend/functions/`; SPFx-direct calls remain forbidden.

## Boundary with `tools/pnp-runner-local/`

- This package does not invoke PnP runner scripts.
- Step 4 will emit proof artifacts that the PnP runner can consume for non-production apply runs, reusing the existing timestamped proof-folder convention.

---

## See also

- [Phase 2 Step 1 Provisioning Foundation Audit](../../docs/architecture/blueprint/sp-project-control-center/phase-2/Phase_2_Step_1_Provisioning_Foundation_Audit.md)
- [Phase 2 Step 1 Consumer Boundary](../../docs/architecture/blueprint/sp-project-control-center/phase-2/Phase_2_Step_1_Consumer_Boundary.md)
- [Phase 2 Step 1 Closeout](../../docs/architecture/blueprint/sp-project-control-center/phase-2/Phase_2_Step_1_Closeout.md)
- [Phase 2 Step 2 Closeout](../../docs/architecture/blueprint/sp-project-control-center/phase-2/Phase_2_Step_2_Project_Site_Provisioning_Mapper_Scaffold_Closeout.md)
- [Phase 2 Step 3 Closeout](../../docs/architecture/blueprint/sp-project-control-center/phase-2/Phase_2_Step_3_Provisioning_Manifest_Mapper_Expansion_Closeout.md)
- [Phase 2 Step 4 Closeout](../../docs/architecture/blueprint/sp-project-control-center/phase-2/Phase_2_Step_4_Dry_Run_Proof_Artifact_Generation_Closeout.md)
- [`@hbc/project-site-template` README](../project-site-template/README.md)
- [PCC blueprint README](../../docs/architecture/blueprint/sp-project-control-center/README.md)
- [`docs/Phase_2_Step_2_Scaffold_Notes.md`](./docs/Phase_2_Step_2_Scaffold_Notes.md)
- [`docs/Phase_2_Step_3_Contract_Coverage_Notes.md`](./docs/Phase_2_Step_3_Contract_Coverage_Notes.md)
- [`docs/Phase_2_Step_4_Dry_Run_Proof_Artifact_Notes.md`](./docs/Phase_2_Step_4_Dry_Run_Proof_Artifact_Notes.md)
