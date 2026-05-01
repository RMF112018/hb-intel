# PCC Phase 3 / Wave 9 — Project Lifecycle Readiness Center Prompt Bundle

Generated: 2026-05-01

## Objective

This package instructs a local code agent working in `/Users/bobbyfetting/hb-intel` to implement **PCC Phase 3 / Wave 9 — Project Lifecycle Readiness Center** in a controlled, repo-truth-driven sequence.

Wave 9 turns the repo-resident startup, safety, and closeout checklist source content into a structured, role-aware, evidence-backed lifecycle-readiness module. The objective is not to digitize PDFs or clone Procore. The objective is to preserve source traceability while creating lifecycle utility: readiness gates, ownership, evidence posture, blockers, exceptions, future closeout exposure, and read-model/UI signals that can be reused throughout the project lifecycle.

## Hard Dependency

Before any Wave 9 source implementation begins, the local agent must verify that **Wave 8 — Project Readiness Module Framework** is implemented and closed, or that current repo truth explicitly authorizes Wave 9 to add the missing framework seams. If Wave 8 is not implemented/closed, Prompt 01 must stop source implementation and produce a blocker closeout.

Wave 9 must consume the Wave 8 framework; it must not reinvent it.

## Package Contents

```text
README.md
00_EXISTING_WAVE_9_PLANNING_DOCUMENTATION_MAP.md
01_REPO_TRUTH_FINDINGS_AND_IMPLEMENTATION_POSTURE.md
02_WEB_RESEARCH_FINDINGS_AND_PRODUCT_RATIONALE.md
03_WAVE_9_IMPLEMENTATION_STRATEGY.md
04_RISK_EXPOSURE_AND_GUARDRAILS.md
05_STANDARDS_AND_BEST_PRACTICES.md
06_FUTURE_WAVE_HANDOFF_NOTES.md
prompts/01_Wave_9_Gate_Repo_Truth_Audit_and_Wave_8_Dependency_Verification.md
prompts/02_Wave_9_Shared_Lifecycle_Readiness_Models_and_Fixtures.md
prompts/03_Wave_9_Backend_Mock_Read_Model_and_GET_Route.md
prompts/04_Wave_9_SPFX_Client_Fixture_Parity_and_Router_Seam.md
prompts/05_Wave_9_Project_Lifecycle_Readiness_Command_Surface.md
prompts/06_Wave_9_Item_Detail_Evidence_Risk_Degraded_States.md
prompts/07_Wave_9_Readiness_Signals_Priority_Actions_Approvals_No_Execution.md
prompts/08_Wave_9_Closeout_Validation_and_Wave_10_Handoff.md
reviewer/Implementation_Plan_Reviewer_Prompt_Wave_9.md
reference/Research_Source_Register.md
```

## Execution Rules

Each prompt is designed to be run independently in a fresh local-code-agent cycle. Every prompt requires:

- mandatory preflight;
- repo-truth verification;
- explicit unrelated-change protection;
- explicit path staging only;
- no broad `git add .`;
- `git diff --check`;
- post-validation `md5 pnpm-lock.yaml`;
- exact commit summary/body;
- closeout with files changed, validations, exclusions, risks, and next prompt.

## Recommended Use

Run prompts in order. Do not proceed from one prompt to the next until the prior prompt has been reviewed against repo truth, target architecture, and the prompt acceptance criteria.
