# Package Manifest — PCC Phase 3 Wave 13 Buyout Log Implementation Prompt Set

## Package Name

`pcc_wave13_buyout_log_implementation_prompt_set`

## Purpose

Generate a staged local-code-agent implementation sequence for PCC Phase 3 Wave 13, the `Buyout Log` module with user-facing subtitle `Buyout Control Center`.

This package is based on the Wave 13 planning closeout baseline:

```text
5bb2cbbfeaffddad59d785542677d58914e6f61b
docs(pcc): close wave 13 buyout log planning
```

## Content Inventory

| Path | Purpose |
| --- | --- |
| `README.md` | Execution instructions, sequence, guardrails, and review posture. |
| `docs/00_EXISTING_WAVE_13_DOCUMENTATION_MAP.md` | Map of governing docs, Wave 13 artifacts, reference JSONs, source workbook, and implementation seams. |
| `docs/01_REPO_TRUTH_AUDIT_SUMMARY.md` | Repo-truth findings gathered during prompt-package generation and what Prompt 01 must revalidate locally. |
| `docs/02_IMPLEMENTATION_SEQUENCE_OVERVIEW.md` | Staged implementation plan, dependencies, expected deliverables, validation, and stop conditions. |
| `prompts/01_Wave_13_Implementation_Readiness_Audit.md` | Read-only local audit prompt. |
| `prompts/02_Shared_Models_Fixtures_State_Machine_And_Contracts.md` | Shared model/fixture/state-machine implementation prompt. |
| `prompts/03_Backend_GET_Only_Mock_Read_Model.md` | Backend GET-only read-model implementation prompt. |
| `prompts/04_SPFX_Read_Model_Client_And_Fixture_Parity.md` | SPFx client and fixture/backend parity prompt. |
| `prompts/05_SPFX_Buyout_Log_Surface_Shell.md` | SPFx Buyout Log surface shell prompt. |
| `prompts/06_Priority_Readiness_Approvals_Document_Control_External_Seams.md` | Safe cross-module seam prompt. |
| `prompts/07_Tests_Guardrails_And_Implementation_Closeout.md` | Final test, guardrail, and implementation closeout prompt. |
| `prompts/08_Fresh_Reviewer_Prompt.md` | Fresh-session reviewer prompt after local implementation. |
| `reference/00_CONTROLLING_OBJECTIVE.md` | Module identity and controlling objective. |
| `reference/01_REQUIRED_REPO_TRUTH_FILES.md` | Required repo-truth file list and inspection questions. |
| `reference/02_WAVE_13_REQUIRED_FIELDS_STATUSES_AND_CONTRACTS.md` | Required fields, statuses, child records, state-machine and completion expectations. |
| `reference/03_HARD_GUARDRAILS.md` | Non-negotiable Wave 13 implementation prohibitions. |
| `reference/04_VALIDATION_COMMAND_REFERENCE.md` | Validation command reference; agents must still inspect scripts locally. |
| `reference/05_RESEARCH_PATTERN_REFERENCE.md` | Public research pattern summary and source list. |

## Hard Usage Rules

1. Execute prompts in numeric order.
2. Do not skip Prompt 01. It is the local repo-truth gate.
3. Do not implement runtime code from the planning docs until the relevant implementation prompt authorizes it.
4. Each implementation prompt must stage only files within that prompt’s authorized scope.
5. Each implementation prompt must report `git status --short`, touched files, validation commands, and lockfile status.
6. Every commit must use the summary/body provided or a materially equivalent local-repo-truth-adjusted version.
7. Stop if `pnpm-lock.yaml`, manifests, workflows, deployment files, or `docs/architecture/plans/**` change unexpectedly.
8. Stop if any proposed code introduces external-system runtime calls, writeback, sync, accounting posting, or approval execution.

## Package Limitations

- Local workspace commands were not executed by this package generator against `/Users/bobbyfetting/hb-intel`; Prompt 01 must re-run them locally.
- GitHub `main` was used as the observable pushed repo source for package generation.
- The `buyout-log -> procurement-and-buyout` mapping remains an implementation-phase decision point, not resolved in this package.
- Public research is product-pattern input only. It is not authority to clone third-party UX or change system-of-record boundaries.
