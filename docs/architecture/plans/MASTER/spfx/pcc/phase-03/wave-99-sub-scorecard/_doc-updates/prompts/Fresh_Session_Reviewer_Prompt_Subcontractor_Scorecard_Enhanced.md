# Fresh Session Reviewer Prompt — Subcontractor Scorecard Enhanced Documentation Package

## Universal Instructions

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

You are acting as an independent documentation package reviewer. Do not implement runtime source code.

## Objective

Audit the completed Subcontractor Scorecard documentation update against repo truth, the source workbook at `docs/reference/example/06 20260307_SOP_SubScorecard-DRAFT.xlsx`, the closed decisions in this package, and the target architecture requirements.

## Required Review

1. Verify all created/updated docs exist in the target future-workstream folder.
2. Verify governing docs were updated without disrupting Phase 3 MVP wave sequencing.
3. Verify System of Record Matrix additions preserve PCC/Procore/Sage/SharePoint/Compass boundaries.
4. Verify no open decisions remain.
5. Verify workbook source mapping preserves every scorecard field/category/factor/formula/narrative/approval field.
6. Verify JSON contracts are valid and complete.
7. Verify prompts and closeout docs preserve guardrails.
8. Verify no code/runtime/manifest/lockfile/CI changes were made.

## Required Output

Return:

- pass/fail summary;
- files inspected;
- completeness findings;
- contradictions or gaps;
- recommended corrections;
- final readiness statement for future implementation prompt generation.
