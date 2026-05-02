# Package Manifest — PCC Wave 12 Constraints Log Implementation Prompt Set

Package name: `pcc_wave12_constraints_log_implementation_prompt_set`
Generated: 2026-05-02

## Purpose

This package provides a staged, enforceable local-code-agent prompt sequence for implementing PCC Phase 3 Wave 12 `Constraints Log` as the `Make-Ready Constraint & Risk Exposure Center`.

It does not implement source code. It instructs a local agent to implement safely after local repo-truth validation.

## Content Inventory

| Path | Purpose |
| --- | --- |
| `README.md` | Package usage, sequence, guardrails, execution rules |
| `docs/00_EXISTING_WAVE_12_DOCUMENTATION_MAP.md` | Existing docs/source map and implementation seams |
| `docs/01_REPO_TRUTH_AUDIT_SUMMARY.md` | GitHub-inspected repo-truth summary and gaps |
| `docs/02_IMPLEMENTATION_SEQUENCE_OVERVIEW.md` | Stage dependencies, deliverables, validation expectations |
| `prompts/01_Wave_12_Implementation_Readiness_Audit.md` | Read-only readiness audit |
| `prompts/02_Shared_Models_Fixtures_Scoring_And_State_Contracts.md` | Model contracts, fixtures, scoring, state transitions, placement correction |
| `prompts/03_Backend_GET_Only_Mock_Read_Model.md` | GET-only backend read model |
| `prompts/04_SPFX_Read_Model_Client_And_Fixture_Parity.md` | SPFx client + fixture parity |
| `prompts/05_SPFX_Constraints_Log_Surface_Shell.md` | SPFx Constraints Log UI shell |
| `prompts/06_Priority_Readiness_Approvals_Document_Scheduler_Integration.md` | Reference-only integration seams |
| `prompts/07_Tests_Guardrails_And_Implementation_Closeout.md` | Final validation and implementation closeout |
| `prompts/08_Fresh_Reviewer_Prompt.md` | Independent reviewer prompt |
| `reference/00_CONTROLLING_OBJECTIVE.md` | Module identity and implementation objective |
| `reference/01_REQUIRED_REPO_TRUTH_FILES.md` | Required local audit file paths |
| `reference/02_WAVE_12_REQUIRED_FIELDS_STATUSES_AND_SCORING.md` | Required field/status/scoring/state expectations |
| `reference/03_HARD_GUARDRAILS.md` | Non-negotiable guardrails |
| `reference/04_VALIDATION_COMMAND_REFERENCE.md` | Validation command reference |
| `reference/05_RESEARCH_PATTERN_REFERENCE.md` | Research themes and source URLs requiring refresh |

## Hard Usage Rules

1. Run prompts in order.
2. Do not skip Prompt 01.
3. Do not execute implementation from this package without local repo-truth validation.
4. Do not edit `docs/architecture/plans/**` unless separately authorized.
5. Do not make package, lockfile, manifest, workflow, deployment, tenant, or external-system changes unless explicitly authorized.
6. Treat all external-system behavior as reference/launcher-only.
7. Do not create legal/claim/delay determination behavior.
8. Keep backend work GET-only.
9. Keep SPFx fixture-first unless repo-standard backend opt-in is locally verified.
10. Require staged-file proof before every commit.

## Package Limitations

- The local repo path `/Users/bobbyfetting/hb-intel` was not mounted in the package-generation environment.
- Local `git` commands and `md5 pnpm-lock.yaml` could not be run here.
- Live web search was unavailable; research references are structured starting points and must be refreshed if web access is available.
- The package is grounded in GitHub connector inspection and Wave 12 closeout docs, but all implementation prompts require local revalidation.
