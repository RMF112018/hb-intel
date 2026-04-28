# Phase 1 Step 5 — Schema Validation Harness Closeout (Prompt 03 — Remediation and Clean Run)

## Status

This is the **interim Step 5 remediation / clean-run closeout** produced by Prompt 03 (Run Harness and Remediate Schema Defects). It is **not** a "Phase 1 Complete" or "Ready for Phase 2" closeout. The full-extraction gate flip (`template-contract.json.status.fullExtractionComplete: true`) is the explicit responsibility of the follow-up Prompt 04 — Full Extraction Gate. As of this commit, that flag remains `false`.

`Ready for Prompt 04 — Full Extraction Gate`.

## Summary

Prompt 02 created the Phase 1 Step 5 schema validation harness and ran it. The run surfaced one mechanical contract-instance failure: `template-contract.json` validated against `template-contract.schema.json` and produced two `additionalProperties must NOT have additional properties` errors because the scaffold schema did not declare two top-level properties that the instance carries (`$schema` added in Phase 1 Step 1 and `fieldMaps` added in Phase 1 Step 3). Two minor fixture mistakes (a `notes` field in `enums.valid.json` and `validation-rules.valid.json`) were corrected in Prompt 02.

Prompt 03 (this prompt) applied the narrow scaffold-schema correction, made both validation reports deterministic and source-controlled, and ran the harness twice consecutively to verify byte-identical output. All 16 integrity checks pass; the contract instance now validates cleanly; all 14 valid fixtures pass; all 7 invalid fixtures are correctly rejected by their target schemas.

No Phase 1 family schemas were touched. No field maps were touched. No fixtures were touched. No `template-contract.json` change. No backend, SPFx, provisioning, manifest, test, generated, CI, root-workspace, dependency, package-script, or runtime-consumer change.

## Files Modified

```text
packages/project-site-template/schemas/template-contract.schema.json   (narrow $schema + fieldMaps property declarations)
packages/project-site-template/validation/validate-template-contract.mjs   (deterministic report)
packages/project-site-template/validation/contract-integrity-checks.mjs    (deterministic report)
packages/project-site-template/validation/reports/.gitignore               (allowlist 2 deterministic reports)
packages/project-site-template/validation/README.md                        (Reports section update)
packages/project-site-template/docs/Phase_1_Step_5_Schema_Validation_Harness_Notes.md   (4 new sections)
```

## Files Created

```text
packages/project-site-template/validation/reports/schema-validation-report.json
packages/project-site-template/validation/reports/contract-integrity-report.json
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_5_Schema_Validation_Harness_Closeout.md
```

## Harness Run Evidence

```text
$ node packages/project-site-template/validation/contract-integrity-checks.mjs
contract integrity checks — phase 1 step 5
  all checks passed (16/16)
  report: validation/reports/contract-integrity-report.json
exit 0

$ node packages/project-site-template/validation/validate-template-contract.mjs
schema validation harness — phase 1 step 5
  contract-instance: PASS
  14 valid fixtures: 14 PASS / 0 FAIL
  7 invalid fixtures: 7 correctly rejected
schema validation: clean
report: validation/reports/schema-validation-report.json
exit 0

$ pnpm --filter @hbc/project-site-template validate:all
(both scripts run, both exit 0)
```

Determinism verified: two consecutive runs of each script produce byte-identical reports under `validation/reports/`.

## Remediations Performed

1. **template-contract.schema.json** — declared `$schema` (string) and `fieldMaps` (object) as optional top-level properties so the scaffold schema's `additionalProperties: false` no longer rejects them. `required` array unchanged.
2. **validate-template-contract.mjs** — removed `generatedAt`, dropped absolute paths from report contents, sorted `schemasLoaded` and `results` for stable ordering, switched the console "report:" line to a relative path.
3. **contract-integrity-checks.mjs** — added deterministic report writing alongside the existing 16 checks (unchanged in logic). Stable check catalog drives row ordering.
4. **validation/reports/.gitignore** — allowlisted `schema-validation-report.json` and `contract-integrity-report.json` (plus the existing `.gitkeep` and `.gitignore`); other generated outputs continue to be ignored.
5. **validation/README.md** — Reports section updated to describe the deterministic, source-controlled posture.
6. **Phase_1_Step_5_Schema_Validation_Harness_Notes.md** — appended the four required sections: Harness Execution Results, Remediations Performed, Remaining Failures, Step 5 Closeout Readiness.

## Architecture Gaps

None. The single defect was mechanical (missing scaffold-schema property declarations) and was repaired without changing any enum meaning, contract field, or guardrail. No Prompt 05 architecture-gap escalation required.

## Procore / Sage Boundary Posture (Reaffirmed)

All Procore boundary asserts that landed in Phase 1 Step 4 Wave 3 remain in force:

- `noFullProcoreMirror` `const: true`
- `noDirectSpfxToProcore` `const: true`
- `noProcoreSecrets` `const: true`
- `procoreDirectoryComparison_ReadOnly` `const: true`
- `procoreWriteback_Deferred` `const: true`
- `procoreMapping_ProcoreCompanyId.default === "5280"`
- OC-17 (Procore Object Link Records) and OC-18 (Procore Curated Summary Records) remain `extractionTreatment: "placeholder-only"` and `mvpTreatment: "Deferred"`.
- Sage Intacct remains the accounting book of record (VR-14); Procore remains operational.

The integrity checker confirms each of these in the committed `contract-integrity-report.json`.

## Anti-Regression (Reaffirmed)

- `mvp_status` shorthand (`mvp`, `deferred`, `placeholder`) absent from every populated schema's enum definitions.
- `Archived` does not appear in any `projectStage` `$defs.enum`.
- `preconstruction_only`, `warranty_closeout`, `active_construction` do not appear in any `projectType` `$defs.enum`.
- `modules.visibilityByStage` keys are exactly the six ProjectStage tokens.
- `seedRule.keyedOn` / `verticalSeeding.keyedOn` are `const: "projectType"` everywhere they appear.

## Notes for Prompt 04 (Full Extraction Gate)

The integrity checker's check `4.fullExtractionComplete` currently hard-asserts the flag is `false`. When Prompt 04 flips `template-contract.json.status.fullExtractionComplete` to `true`, that single check must be updated (or parameterized) so `validate:all` does not begin failing post-gate. Recommended path: either (a) update the assertion to `=== true` at the moment of gate flip, or (b) introduce a script-level mode flag (`STEP_5_REMEDIATION` vs `POST_FULL_EXTRACTION`) that the script reads. The remediation prompt deliberately did not pre-flip the assertion because doing so would have caused this prompt's own `validate:all` run to fail.

## Recommended Next Prompt

```text
Phase 1 Step 5 — Prompt 04 Full Extraction Gate
```

## Commit Summary

```text
test(project-site-template): validate schema contract integrity
```
