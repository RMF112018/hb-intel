# Phase 1 Step 5 — Schema Validation Harness Notes

## Summary

Phase 1 Step 5 introduced a package-local schema validation harness for `@hbc/project-site-template` plus a representative fixture set and a cross-file integrity checker. The harness is the first executable code in this previously markdown-and-JSON-only package. Two Node ESM scripts (`validate-template-contract.mjs` and `contract-integrity-checks.mjs`) compile every populated family schema and the high-level scaffold schema, validate `template-contract.json` and 14 valid + 7 invalid fixtures, and run 16 cross-file structural checks. Generated reports are not committed; `validation/reports/.gitkeep` and a local `.gitignore` keep the directory tracked while excluding regenerated output.

`template-contract.json.status.fullExtractionComplete` remains `false`. The gate flips only after the follow-up "Run Harness and Remediate Schema Defects" prompt confirms a clean run.

## Files Created

```text
packages/project-site-template/validation/README.md
packages/project-site-template/validation/validate-template-contract.mjs
packages/project-site-template/validation/contract-integrity-checks.mjs
packages/project-site-template/validation/fixtures/fixture-manifest.json
packages/project-site-template/validation/fixtures/valid/template-manifest.valid.json
packages/project-site-template/validation/fixtures/valid/site.valid.json
packages/project-site-template/validation/fixtures/valid/settings.valid.json
packages/project-site-template/validation/fixtures/valid/permissions.valid.json
packages/project-site-template/validation/fixtures/valid/pages.valid.json
packages/project-site-template/validation/fixtures/valid/libraries.valid.json
packages/project-site-template/validation/fixtures/valid/lists.valid.json
packages/project-site-template/validation/fixtures/valid/modules.valid.json
packages/project-site-template/validation/fixtures/valid/workflows.valid.json
packages/project-site-template/validation/fixtures/valid/integrations.valid.json
packages/project-site-template/validation/fixtures/valid/site-health.valid.json
packages/project-site-template/validation/fixtures/valid/provisioning-validation.valid.json
packages/project-site-template/validation/fixtures/valid/enums.valid.json
packages/project-site-template/validation/fixtures/valid/validation-rules.valid.json
packages/project-site-template/validation/fixtures/invalid/invalid_project_type_active_construction.json
packages/project-site-template/validation/fixtures/invalid/invalid_project_stage_archived.json
packages/project-site-template/validation/fixtures/invalid/invalid_mvp_status_shorthand.json
packages/project-site-template/validation/fixtures/invalid/invalid_integration_missing_procore_boundary_consts.json
packages/project-site-template/validation/fixtures/invalid/invalid_integration_procore_secret_like_field.json
packages/project-site-template/validation/fixtures/invalid/invalid_module_visibility_keyed_on_project_type.json
packages/project-site-template/validation/fixtures/invalid/invalid_template_contract_missing_family.json
packages/project-site-template/validation/reports/.gitkeep
packages/project-site-template/validation/reports/.gitignore
packages/project-site-template/docs/Phase_1_Step_5_Schema_Validation_Harness_Notes.md
```

(Final file count taken from `git status` at commit time.)

## Files Modified

```text
packages/project-site-template/package.json   (add validate:* scripts and ajv + ajv-formats devDependencies)
pnpm-lock.yaml                                (root lockfile auto-updated by pnpm install — only root-level change)
```

No other workspace, package, schema, field map, or contract files were modified.

## Tooling Decision

Chose **ajv 8.x with Draft 2020-12 support** (`ajv/dist/2020`) plus **ajv-formats 3.x** for `format` keyword handling. Rationale:

- The Phase 1 Step 4 family schemas were authored against Draft 2020-12.
- ajv is the de facto standard for Node.js JSON Schema validation, supports Draft 2020-12, and integrates cleanly with `ajv-formats` for `uri` / `date` / `date-time` / `uuid`.
- Strict mode is disabled (`strict: false`) because the family schemas carry intentional vendor-extension fields (`canonicalEnumSets`, `initialRules`, `ruleCategoryCatalog`, `enforcementLayerCatalog`, `familyReferences`) that ajv would otherwise warn about. These extensions are informational data sitting alongside the schema definitions and were introduced in Phase 1 Step 2.
- Both packages are added as **package-local devDependencies** in `packages/project-site-template/package.json`. No runtime dependency was introduced. No root `package.json` change. No workspace-config change.
- `pnpm install` updated `pnpm-lock.yaml` at the repo root as a conventional consequence of adding package-local devDependencies. This is the only root-level file modified.

## Harness Capabilities

**`validate-template-contract.mjs`**:

1. Loads all 14 family schemas plus `template-contract.schema.json`.
2. Configures ajv with Draft 2020-12, `strict: false`, `allErrors: true`, plus `ajv-formats`.
3. Compiles each schema and registers by `$id`.
4. Validates `template-contract.json` against `template-contract.schema.json`.
5. Validates each `<family>.valid.json` fixture against `schemas/families/<family>.schema.json`; expects pass.
6. For each invalid fixture, reads `fixture-manifest.json` to determine target schema and expected failure reason; validates and expects fail.
7. Prints a per-row summary table to stdout.
8. Writes a JSON report to `validation/reports/schema-validation-report.json` (not committed).
9. Exits non-zero on any unexpected outcome.

**`contract-integrity-checks.mjs`**:

Runs 16 cross-file structural checks without external dependencies; see `validation/README.md` for the full list. Exit non-zero on any failure with a clear failure summary.

## Fixture Coverage

- 14 valid fixtures, one per family, naming convention `<family>.valid.json`.
- 7 invalid fixtures, each targeting one violation declared in `fixture-manifest.json`:
  - `ProjectType = active_construction` (VR-05)
  - `ProjectStage = Archived` (VR-04)
  - `mvp_status = "mvp"` shorthand (VR-24)
  - `noFullProcoreMirror = false` violates const true (VR-16)
  - extra `procoreClientSecret` property violates `additionalProperties: false` (VR-13)
  - `visibilityByStage` contains ProjectType key (VR-07)
  - top-level template-contract instance missing `enums` family (template-contract.schema.json `families.required`)
- All values in fixtures are clearly fake / example data: `example.invalid` URLs, zero-pattern UUIDs (`00000000-0000-4000-8000-000000000000`), `pid-26-000-00`-style IDs, `pm@example.invalid`-style UPNs. `ProcoreCompanyId = "5280"` appears as configuration only.

## Integrity Checks

The 16 checks are detailed in `validation/README.md`. Notable design decisions:

- **Secret-class scanner allowlist.** The scanner walks JSON object keys and string values. Any subtree under a `description` key is skipped because contract documentation legitimately references the guardrail tokens in prose. The entire `validation/fixtures/invalid/` directory is also skipped — those fixtures are intentionally constructed to demonstrate schema rejection of bad inputs (e.g., the `procoreClientSecret` extra property in `invalid_integration_procore_secret_like_field.json`).
- **`fullExtractionComplete` invariant.** The integrity checker explicitly requires this flag to remain `false` at this stage. The flag flips only after the follow-up prompt confirms a clean validation run.
- **OC-17 / OC-18 placeholder posture.** The integrity checker hard-asserts `extractionTreatment === "placeholder-only"` and `mvpTreatment === "Deferred"` for both rows in `object-catalog-field-disposition.json`.
- **Procore boundary const checks.** The integrity checker reads `integrations.schema.json` and asserts `const: true` for `noFullProcoreMirror`, `noDirectSpfxToProcore`, `noProcoreSecrets`, `procoreDirectoryComparison_ReadOnly`, `procoreWriteback_Deferred`, plus `procoreMapping_ProcoreCompanyId.default === "5280"`.

## Validation Commands

Documented in `validation/README.md`. Primary entry points:

```bash
pnpm --filter @hbc/project-site-template validate:all
node packages/project-site-template/validation/validate-template-contract.mjs
node packages/project-site-template/validation/contract-integrity-checks.mjs
```

## Results

### Integrity checks

```text
contract integrity checks — phase 1 step 5
  all checks passed (16/16)
```

Exit 0. All 16 cross-file structural checks pass on the populated Phase 1 Step 4 artifacts.

### Schema validation

After two mechanical fixture fixes (see "Mechanical fixture fixes" below), the harness reports:

- **14 / 14 valid fixtures**: PASS.
- **7 / 7 invalid fixtures**: PASS (each was rejected by its target schema as expected).
- **1 contract-instance failure**: `template-contract.json` fails against `template-contract.schema.json` with two `additionalProperties must NOT have additional properties` errors.

Exit 1 (because of the contract-instance failure).

### Schema defect — deferred to Run-Harness-and-Remediate prompt

`template-contract.schema.json` does not declare two top-level properties that `template-contract.json` carries:

1. `$schema` — added to the contract instance in Phase 1 Step 1.
2. `fieldMaps` — added to the contract instance in Phase 1 Step 3 to point at the `fields/` artifacts.

Both properties were added to the instance without a corresponding declaration on the scaffold schema. The scaffold schema's top-level `additionalProperties: false` therefore rejects them.

Per the prompt's guidance and the user execution refinement #4 ("If validation fails... do not broadly remediate family schemas in this prompt; document schema failures in the Step 5 notes; proceed to the 'Run Harness and Remediate Schema Defects' prompt"), this defect is **deferred**. The narrow correction to add `$schema` and `fieldMaps` declarations to `template-contract.schema.json` will land in the follow-up "Run Harness and Remediate Schema Defects" prompt, alongside any other defects that surface during a closer audit.

This is the only outstanding harness failure.

### Mechanical fixture fixes applied during this step

Two fixtures originally carried a `notes` field that the corresponding Phase 1 Step 2 schemas (`enums.schema.json`, `validation-rules.schema.json`) do not declare. Per user execution refinement #4 ("fix script or fixture mistakes if they are clearly mechanical"), the `notes` field was removed from:

- `validation/fixtures/valid/enums.valid.json`
- `validation/fixtures/valid/validation-rules.valid.json`

Both fixtures now PASS. No schema was modified. (Nine of the populated Phase 1 Step 4 family schemas declare `notes` as a top-level property; the two earlier Phase 1 Step 2 schemas — `enums` and `validation-rules` — omit it. That asymmetry can be reconciled in the follow-up remediation prompt if a downstream consumer requires it; today it is not blocking.)

### Report

See `validation/reports/schema-validation-report.json` (regenerated on each run; not committed).

## What Was Not Implemented

- CI integration of the harness.
- A standalone TypeScript surface or generated types from the schemas.
- Per-list dedicated schemas beyond the bounded `lists.schema.json` shape.
- Cross-instance consistency checks (those are runtime invariants for downstream consumers).
- Procore live-API contract validation.
- Bumping `template-contract.json.status.fullExtractionComplete` to `true` (deferred until a clean harness run is acknowledged in the follow-up prompt).

## Guardrails Preserved

- No runtime dependencies introduced.
- No backend, SPFx, provisioning, manifest, test, generated, CI, root-workspace, package, or deploy changes (only `pnpm-lock.yaml` updated as a conventional consequence of adding package-local devDependencies).
- No schema, field map, or contract instance modified.
- No new architecture decisions.
- Procore boundary, no-secret posture, ProjectStage-vs-ProjectType boundary, OC-17/OC-18 placeholder posture, and canonical Decision Closure taxonomy are all enforced structurally by the harness rather than rewritten or weakened.

## Recommended Next Step

```text
Phase 1 Step 5 — Run Harness and Remediate Schema Defects
```

The follow-up prompt runs the harness, addresses any schema defects surfaced, and (on a clean run) flips `template-contract.json.status.fullExtractionComplete` to `true` to close the Phase 1 extraction gate.
