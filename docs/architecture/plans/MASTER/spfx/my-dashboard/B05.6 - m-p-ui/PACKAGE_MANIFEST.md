# Package Manifest — My Projects Flagship UI/UX Implementation Package

## Package purpose

Execution-ready prompt package for the **My Dashboard → My Projects** flagship UI/UX rebuild.

## File inventory

| Path | Purpose |
|---|---|
| `README.md` | Package overview, execution order, global constraints |
| `00_FULL_IMPLEMENTATION_PLAN.md` | Complete implementation strategy and workstream plan |
| `01_TARGET_STATE_DECISION_LOCK.md` | Final decisions that must not be reopened |
| `02_REPO_TRUTH_BASELINE.md` | Current repo truth and critical seams |
| `03_PROJECT_ITEM_COMPOSITION_SPEC.md` | Final item/tile layout and content hierarchy |
| `04_BREAKPOINT_SHELL_FIT_CONTRACT.md` | Responsive contract and visible-count rules |
| `05_ACCESSIBILITY_AND_INTERACTION_SPEC.md` | Menu/dialog/search/focus behavior |
| `06_TEST_VALIDATION_AND_EVIDENCE_MATRIX.md` | Test plan, acceptance criteria, hosted evidence matrix |
| `07_DEPENDENCY_AND_FILE_OWNERSHIP_MAP.md` | File plan, dependency decisions, implementation ownership |
| `prompts/Prompt_01_*.md` | Required repo-truth preflight |
| `prompts/Prompt_02_*.md` | Card shell and content reset |
| `prompts/Prompt_03_*.md` | Project tile primitives and identity block |
| `prompts/Prompt_04_*.md` | Launch menu implementation |
| `prompts/Prompt_05_*.md` | Full portfolio browser + search |
| `prompts/Prompt_06_*.md` | Visual polish, motion, responsive closure |
| `prompts/Prompt_07_*.md` | Tests, DOM contracts, accessibility hardening |
| `prompts/Prompt_08_*.md` | Final validation, hosted evidence, closeout |
| `supporting/Agent_Closeout_Report_Template.md` | Standard result format for each prompt |
| `supporting/Acceptance_Scorecard_Worksheet.md` | Targeted flagship closure worksheet |
| `supporting/Hosted_Evidence_Capture_Checklist.md` | Hosted screenshot/evidence checklist |
| `supporting/Commit_Message_Template.md` | Commit-ready summary format |
| `supporting/Package_Execution_Checklist.md` | Operator checklist across prompt sequence |
| `manifest.json` | Machine-readable package map |

## Execution order

1. Prompt 01
2. Prompt 02
3. Prompt 03
4. Prompt 04
5. Prompt 05
6. Prompt 06
7. Prompt 07
8. Prompt 08

## Scope guardrails

This package is **UI/UX implementation only**. Do not reopen backend/auth/data remediation. Do not alter Adobe Sign behavior. Do not change home-surface card spans. Do not introduce a new product concept outside the locked target state.

## Required no-churn principle

If a prompt discovers that a requested target state is already fully present, do not churn code. Record no-op closure, run the required validation lane, and proceed only as instructed.
