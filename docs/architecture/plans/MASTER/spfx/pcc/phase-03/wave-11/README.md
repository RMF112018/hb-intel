# Wave 11 Responsibility Matrix Implementation Prompt Package v2

Generated: 2026-05-02

This package refines the prior Wave 11 implementation prompt set using current web research and connector-based repo-truth inspection.

## Controlling Objective

Generate a staged, enforceable Claude Code prompt sequence for implementing the PCC Phase 3 Wave 11 `Responsibility Matrix` module as a unified `RACI + Owner-Contract Responsibility Control Center`.

This package does **not** implement code. It instructs a local code agent to implement the module safely in controlled stages after local repo-truth validation.

## Important Environment Note

This package was generated from this ChatGPT environment using:
- the uploaded Wave 11 review prompt;
- GitHub connector inspection of `RMF112018/hb-intel`;
- live web research via web search.

The local repo path `/Users/bobbyfetting/hb-intel` was not mounted here. Therefore, Prompt 01 requires the local Claude Code agent to rerun local repo-truth commands before any implementation.

## Required Exact Phrase in Every Prompt

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Sequence

1. `01_Wave_11_Implementation_Readiness_Audit.md`
2. `02_Shared_Models_And_Fixture_Contracts.md`
3. `03_Backend_GET_Only_Mock_Read_Model.md`
4. `04_SPFX_Read_Model_Client_And_Fixture_Parity.md`
5. `05_SPFX_Responsibility_Matrix_Surface_Shell.md`
6. `06_Priority_Readiness_Approvals_Team_Document_Integration.md`
7. `07_Tests_Guardrails_And_Implementation_Closeout.md`
8. `08_Fresh_Reviewer_Prompt.md`

## Execution Rule

Run prompts in order. Do not skip Prompt 01. Do not combine prompts unless the local agent reports that a later prompt only touches files already fully validated in the immediately prior prompt and the scope remains small.
