# PCC Phase 3 Wave 13 Buyout Log — Unified Lifecycle Implementation Prompt Set

## Purpose

This package adapts the attached Wave 13 Buyout Log implementation prompt package to the newly published PCC unified lifecycle developer-contract layer.

The original package remains the structural baseline, but this version treats the unified lifecycle developer contracts as a controlling implementation authority. It preserves the Wave 13 module intent while adding hard requirements for bounded contexts, route taxonomy, state machines, field dictionary, permission/redaction, HBI citation/refusal, source-system integration contracts, audit events, degraded states, module onboarding, validation gates, source-lineage, Project Memory, traceability, and no-workspace-fragmentation controls.

## Environment

Repo path:

```text
/Users/bobbyfetting/hb-intel
```

Latest observed GitHub PCC commit during package generation:

```text
58f53d49d59f8c70683725c999e8f55e2bc2dfef
docs(pcc): close unified lifecycle developer documentation
```

Local agents must re-run repo-truth commands before each implementation prompt. This package was generated from connected GitHub/repo context and the attached Wave 13 package, but it cannot prove the current local working tree.

## Required Exact Phrase in Every Prompt

Every local-code-agent prompt includes:

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Controlling Objective

Implement Wave 13 Buyout Log as a source-lineage-aware Project Readiness / Project Controls workflow module that contributes to the unified lifecycle layer without creating a disconnected buyout workspace, external-system clone, accounting tool, procurement marketplace, claims tool, or production integration.

## Prompt Sequence

1. `01_Wave_13_Implementation_Readiness_Audit.md` — read-only audit and updated repo-truth plan.
2. `02_Shared_Models_Fixtures_State_Machine_And_Contracts.md` — models, fixtures, state machines, completion gates, source-lineage contracts.
3. `03_Backend_GET_Only_Mock_Read_Model.md` — GET-only fixture-backed backend read-model route/provider.
4. `04_SPFX_Read_Model_Client_And_Fixture_Parity.md` — SPFx client seam, fixture fallback, backend parity tests.
5. `05_SPFX_Buyout_Log_Project_Readiness_Surface.md` — Project Readiness embedded Buyout Log command-center UI region.
6. `06_Unified_Lifecycle_Integration_Seams.md` — Priority Actions, readiness, memory, traceability, HBI-eligibility, Document Control, External Systems launcher-only seams.
7. `07_Tests_Guardrails_And_Implementation_Closeout.md` — hardening, tests, closeout evidence.
8. `08_Fresh_Reviewer_Prompt.md` — independent implementation review prompt.

## Execution Rule

Run the prompts in order. Do not skip Prompt 01. Do not begin Prompt 02 until Prompt 01 confirms the exact package names, scripts, route taxonomy, model exports, backend read-model conventions, SPFx conventions, and any `buyout-log` mapping correction/bridge decision.

## Guardrail Summary

- No external-system runtime integration.
- No Procore/Sage/Microsoft Graph writeback or mirror.
- No standalone Buyout workspace unless current route taxonomy explicitly permits it.
- No evidence binary ownership.
- No legal/claim/accounting determinations.
- No approval execution.
- No broad formatting.
- No package/lockfile/manifest/workflow changes.
- Preserve unified lifecycle doctrine and developer contracts.

## Post-Execution Review

After Prompt 07 is complete and committed, run Prompt 08 in a fresh session to audit implementation correctness, guardrails, tests, and readiness for Wave 14 / hardening.
