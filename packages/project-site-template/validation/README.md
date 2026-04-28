# Project Site Template Validation Harness

Phase 1 Step 5 — package-local schema validation harness for the SP Project Control Center machine-readable Project Site Template Contract.

## Purpose

Compile every populated family schema and the high-level scaffold schema, validate `template-contract.json` and a representative fixture set, run cross-file integrity checks, and surface any schema defects. This harness is the first executable code introduced into `@hbc/project-site-template`. It is package-local: it does not run during `pnpm build`, does not ship as a runtime dependency of any other package, and does not participate in CI pipelines yet.

## Commands

From the package directory:

```bash
pnpm validate:schemas      # node validation/validate-template-contract.mjs
pnpm validate:integrity    # node validation/contract-integrity-checks.mjs
pnpm validate:all          # runs both, sequentially
```

From the repo root:

```bash
pnpm --filter @hbc/project-site-template validate:all
```

Or directly:

```bash
node packages/project-site-template/validation/validate-template-contract.mjs
node packages/project-site-template/validation/contract-integrity-checks.mjs
```

## Tooling

- **ajv@^8.17.1** with Draft 2020-12 support (`ajv/dist/2020`).
- **ajv-formats@^3.0.1** for `format` keywords (`uri`, `date`, `date-time`, `uuid`).
- Both are package-local devDependencies. No runtime dependencies are introduced.
- Strict mode is disabled because the family schemas carry intentional vendor-extension fields (`canonicalEnumSets`, `initialRules`, `ruleCategoryCatalog`, `enforcementLayerCatalog`, `familyReferences`) that ajv would otherwise warn about.

## Schema Coverage

The harness loads and compiles all 14 family schemas plus `template-contract.schema.json`:

```text
schemas/families/template-manifest.schema.json
schemas/families/enums.schema.json
schemas/families/settings.schema.json
schemas/families/permissions.schema.json
schemas/families/site.schema.json
schemas/families/pages.schema.json
schemas/families/libraries.schema.json
schemas/families/lists.schema.json
schemas/families/modules.schema.json
schemas/families/workflows.schema.json
schemas/families/integrations.schema.json
schemas/families/site-health.schema.json
schemas/families/provisioning-validation.schema.json
schemas/families/validation-rules.schema.json
schemas/template-contract.schema.json
```

`template-contract.json` is validated against `template-contract.schema.json` directly.

## Fixture Coverage

### Valid fixtures (one per family — 14 total)

Located in `validation/fixtures/valid/`. Naming convention `<family>.valid.json`. Each fixture is validated against `schemas/families/<family>.schema.json` and is expected to pass.

### Invalid fixtures (7 targeted violations)

Located in `validation/fixtures/invalid/`. Each fixture targets exactly one violation, declared in `validation/fixtures/fixture-manifest.json`:

| Fixture | Target Schema | Violation |
|---|---|---|
| `invalid_project_type_active_construction.json` | site | `ProjectType` set to `active_construction` (VR-05) |
| `invalid_project_stage_archived.json` | site | `ProjectStage` set to `Archived` (VR-04) |
| `invalid_mvp_status_shorthand.json` | template-manifest | `mvp_status` set to scaffold shorthand `mvp` (VR-24) |
| `invalid_integration_missing_procore_boundary_consts.json` | integrations | `noFullProcoreMirror: false` violates `const: true` (VR-16) |
| `invalid_integration_procore_secret_like_field.json` | integrations | Extra property with secret-class field name violates `additionalProperties: false` (VR-13) |
| `invalid_module_visibility_keyed_on_project_type.json` | modules | `visibilityByStage` contains a ProjectType key (VR-07) |
| `invalid_template_contract_missing_family.json` | template-contract | Missing `enums` family entry (template-contract.schema.json `families.required`) |

## Integrity Checks

`contract-integrity-checks.mjs` runs 16 cross-file structural checks without external dependencies:

1. All 14 family schema files exist on disk.
2. All 14 families listed in `template-contract.json.families`.
3. All 14 families have `status === "populated"`.
4. `template-contract.json.status.fullExtractionComplete === false` (Step 5 stage; gate flips only after the follow-up "Run Harness and Remediate" prompt).
5. Family schema paths declared in `template-contract.json` resolve.
6. Field maps exist for the 12 Step 3 field-map families.
7. `fields/object-catalog-field-disposition.json` has exactly 18 rows.
8. OC-17 and OC-18 carry `extractionTreatment: "placeholder-only"` and `mvpTreatment: "Deferred"`.
9. `integrations.schema.json` Procore boundary asserts:
   - `noFullProcoreMirror` `const: true`
   - `noDirectSpfxToProcore` `const: true`
   - `noProcoreSecrets` `const: true`
   - `procoreDirectoryComparison_ReadOnly` `const: true`
   - `procoreWriteback_Deferred` `const: true`
   - `procoreMapping_ProcoreCompanyId.default === "5280"`
10. **Structural secret-class scan** across `schemas/`, `fields/`, and `validation/fixtures/valid/`. Object keys and string values are scanned for `client_secret`, `clientSecret`, `refresh_token`, `refreshToken`, `dmsa_credential`, `dmsaCredential`, `oauth_secret`, `oauthSecret`, `api_key`, `apiKey`, `bearer_token`, `bearerToken` (case-insensitive substrings). The scanner **skips** any subtree under a `description` key (descriptions legitimately discuss these tokens in guardrail prose) and **skips** the entire `validation/fixtures/invalid/` directory (those fixtures are designed to demonstrate violations).
11. No enum definition uses scaffold shorthand values (`mvp`, `deferred`, `placeholder`).
12. No `projectType` `$defs` enum contains forbidden tokens (`preconstruction_only`, `warranty_closeout`, `active_construction`).
13. No `projectStage` `$defs` enum contains `Archived`.
14. `modules.visibilityByStage.properties` keys are exactly the six ProjectStage tokens.
15. `seedRule.keyedOn` and `verticalSeeding.keyedOn` are `const: "projectType"` everywhere they appear.
16. `package.json` declares no backend / SPFx / provisioning / Procore-runtime dependencies.

Non-zero exit on any check failure.

## Reports

Both validation scripts write deterministic JSON reports to:

```text
validation/reports/schema-validation-report.json
validation/reports/contract-integrity-report.json
```

Reports are **deterministic and source-controlled** as of Phase 1 Step 5 Prompt 03 remediation:

- No timestamps.
- No absolute paths.
- Stable sorted ordering (schemasLoaded, results, checks).
- Byte-identical across consecutive runs.

The local `validation/reports/.gitignore` allowlists exactly these two report filenames plus `.gitkeep` and `.gitignore`; any other generated artifacts in `reports/` are ignored by default.

## Guardrails

- No runtime dependencies; ajv + ajv-formats are devDependencies only.
- The harness does not modify any schema, field map, or contract instance.
- The harness does not invoke backend, SPFx, provisioning, deployment, or CI tasks.
- The harness does not write outside `validation/reports/`.

## What This Does Not Validate

- Behavior at runtime in PCC (SPFx, backend, Site Health) — those layers consume validated instances downstream.
- Per-list field expansion beyond the bounded `lists.schema.json` shape.
- The contents of the `canonicalEnumSets` / `initialRules` / `ruleCategoryCatalog` / `enforcementLayerCatalog` / `familyReferences` vendor-extension blocks (they are informational data in the schema files, not part of the JSON Schema specification).
- Cross-instance consistency (e.g., that a site's `ProjectStage` matches a permissions instance's stage — this is a runtime invariant validated downstream, not a schema invariant).
- Procore live API contracts. Procore boundary is enforced structurally only.
