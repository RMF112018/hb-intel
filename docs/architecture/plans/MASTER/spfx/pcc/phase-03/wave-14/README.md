# PCC Wave 14 Approvals / Checkpoints Implementation Prompt Set

## Purpose

This package instructs a local code agent to implement Phase 3 / Wave 14 **Approvals / Checkpoints** for the Project Control Center as a staged, repo-truth-gated implementation.

This is a prompt package only. It does not implement source code.

## Controlling Objective

Implement Wave 14 as the PCC-native approval/checkpoint control layer:

- checkpoint queue semantics;
- route-step semantics;
- decision semantics;
- audit-event semantics;
- decision-history semantics;
- source-aware Priority Actions and readiness impact semantics;
- HBI no-authority/refusal posture;
- read-model-first / command-model-gated architecture.

## Environment Note

The package was generated from:

- user-provided objective prompt;
- remote GitHub repo-truth audit of `RMF112018/hb-intel` at/around `8924b5ce6432a7afe154d5f67fda8cf28164ec67`;
- public subject-matter research completed on `2026-05-04`.

The generation environment could not mount `/Users/bobbyfetting/hb-intel`, so Prompt 01 requires a fresh local audit before implementation.

## Required Exact Phrase in Every Prompt

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Prompt Sequence

1. `01_Wave_14_Implementation_Readiness_Audit.md` — read-only audit.
2. `02_Shared_Models_Fixtures_State_Machine_And_Contracts.md` — shared model contracts and deterministic fixtures.
3. `03_Backend_GET_Only_Mock_Read_Model.md` — GET-only backend read models.
4. `04_SPFX_Read_Model_Client_And_Fixture_Parity.md` — typed SPFx client and fixture/backend parity.
5. `05_SPFX_Approvals_Checkpoints_Surface_Shell.md` — user-facing surface shell.
6. `06_Priority_Readiness_Source_Module_And_Wave13G_Seams.md` — integration seams.
7. `07_Tests_Guardrails_And_Implementation_Closeout.md` — validation and closeout.
8. `08_Fresh_Reviewer_Prompt.md` — post-implementation reviewer prompt.

## Execution Rule

Run prompts sequentially. Do not skip Prompt 01. Do not begin a later prompt if an earlier prompt reports unresolved repo-truth contradictions, package/lockfile drift, unauthorized staged files, or guardrail violations.

## Guardrail Summary

- No live approval execution.
- No backend write routes.
- No external-system writeback or sync.
- No SharePoint/Graph/PnP tenant/list/group/security mutation.
- No Power Automate runtime dependency.
- No evidence-binary ownership.
- No HBI decision authority.
- No legal/claim/accounting/pricing/award determinations.
- No package/lockfile/SPFx manifest/workflow changes without explicit authorization.

## Post-Execution Review

After Prompt 07 is committed, run Prompt 08 in a fresh session to audit implementation correctness, target architecture compliance, evidence quality, and hard guardrail preservation.
