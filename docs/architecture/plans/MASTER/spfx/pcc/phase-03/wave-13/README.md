# PCC Phase 3 Wave 13 — Buyout Log Implementation Prompt Set

## Purpose

This package instructs a local code agent to implement Wave 13 `Buyout Log` / `Buyout Control Center` safely and incrementally after a fresh local repo-truth audit.

## Controlling Objective

Implement `Buyout Log` as a PCC Project Readiness workflow module that surfaces buyout posture, budget-vs-commitment exposure, unbought scope, Procore/Sage reconciliation, compliance/SDI/bond posture, procurement timing, evidence links, audit history, source lineage, and Priority Action candidates.

Required governance sentence:

```text
Buyout Log is an MVP Project Readiness workflow module with Procurement / Project Controls classification and future Procurement & Buyout Center affinity.
```

## Environment Note

Working directory for every prompt:

```text
/Users/bobbyfetting/hb-intel
```

This package was generated from observable pushed repo truth and public research. The local agent must revalidate branch, HEAD, workspace cleanliness, lockfile MD5, scripts, and file paths before editing.

## Required Exact Phrase in Every Prompt

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Prompt Sequence

1. `01_Wave_13_Implementation_Readiness_Audit.md` — read-only repo audit and implementation plan.
2. `02_Shared_Models_Fixtures_State_Machine_And_Contracts.md` — shared models, fixtures, state machine, completion gates, and source-model bridge/correction if repo truth supports it.
3. `03_Backend_GET_Only_Mock_Read_Model.md` — GET-only backend mock read model.
4. `04_SPFX_Read_Model_Client_And_Fixture_Parity.md` — SPFx read-model client, fixture fallback, and parity tests.
5. `05_SPFX_Buyout_Log_Surface_Shell.md` — user-facing read-only/safe-local surface shell.
6. `06_Priority_Readiness_Approvals_Document_Control_External_Seams.md` — safe references to readiness, priority actions, approvals, document control, and external launchers.
7. `07_Tests_Guardrails_And_Implementation_Closeout.md` — complete validation, guardrail checks, and implementation closeout.
8. `08_Fresh_Reviewer_Prompt.md` — fresh-session reviewer prompt.

## Execution Rule

Run one prompt at a time. Do not proceed to the next prompt until the current prompt’s final output, validation evidence, and staged-file proof are reviewed.

## Guardrail Summary

- GET-only backend.
- Fixture-first SPFx.
- No external-system runtime behavior.
- No Procore/Sage writeback.
- No accounting posting.
- No legal/claim/accounting determinations.
- No evidence-binary ownership.
- No Wave 14 approval execution.
- No `docs/architecture/plans/**` mutation.
- No broad Prettier write.
- No lockfile/package/manifest/workflow changes unless explicitly authorized and justified.

## Post-Execution Review Instruction

After Prompt 07 is complete and committed, run Prompt 08 in a fresh session. The reviewer must audit repo truth, actual changed files, test evidence, guardrails, and alignment with Wave 13 target architecture before Wave 14 or hardening work proceeds.
