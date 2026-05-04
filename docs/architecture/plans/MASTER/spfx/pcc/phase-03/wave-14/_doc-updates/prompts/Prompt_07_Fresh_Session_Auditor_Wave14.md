# Prompt 07A — Fresh Session Auditor for Wave 14 Documentation Package

## Objective

Run an independent, fresh-session documentation audit of the Phase 14 Wave 14 package and attest contract completeness, validation evidence, and scope safety for Prompts 01–07.

## Required Inputs

- `_doc-updates/README.md`
- `_doc-updates/PACKAGE_MANIFEST.md`
- `_doc-updates/artifacts/manifest.json`
- `_doc-updates/reference/Prompt_01_Repo_Truth_And_Scope_Lock_Closeout.md`
- `_doc-updates/reference/Prompt_02_Governing_Docs_And_Authority_Updates_Closeout.md`
- `_doc-updates/reference/Prompt_03_Target_Architecture_Domain_State_Routing_Closeout.md`
- `_doc-updates/reference/Prompt_04_Module_Integration_And_Wave13G_Alignment_Closeout.md`
- `_doc-updates/reference/Prompt_05_Read_Model_SPFX_UX_Wireframes_Closeout.md`
- `_doc-updates/reference/Prompt_06_Security_HBI_Dependencies_Test_Gates_Closeout.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-14/Wave_14_Documentation_Closeout.md`

## Auditor Checklist

1. Verify repo truth commands and lockfile checksum attestation exist in closeout evidence.
2. Verify Prompt 01–06 closeout artifacts are present and referenced.
3. Verify Wave 14 blueprint contract files exist and align with prompt scope.
4. Verify Wave 13G relationship language is present and non-contradictory.
5. Verify HBI no-authority posture is present in relevant contracts.
6. Verify wireframe screen-set coverage is complete.
7. Verify blocked scope attestation excludes runtime/code/package/tenant/writeback/prod rollout.
8. Verify manifest inventories include all closeout and prompt artifacts.
9. Verify validation evidence is recorded for Prettier/JSON/`git diff --check`/lockfile MD5.
10. Report residual risks and any contradictions requiring remediation.

## Guardrails

- Documentation audit only.
- No runtime/source-code/package/lockfile edits.
- No tenant or external-system mutation activity.

## Expected Output

Produce an auditor report with:

- pass/fail per checklist item;
- missing artifact list;
- contradiction list;
- residual risk summary;
- recommended next action.
