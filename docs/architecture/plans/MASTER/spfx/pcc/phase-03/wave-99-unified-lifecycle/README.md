# PCC Unified Lifecycle Implementation Prompt Set

## Purpose

This package instructs a local code agent to implement, harden, and close out the PCC Unified Lifecycle feature set in the HB Intel repo. It uses the same staged prompt-set structure as the Wave 13 Buyout Log implementation package, but the subject is the cross-cutting unified lifecycle layer rather than one workflow module.

The package is **implementation-focused** and **repo-truth-first**. Prompt 01 must revalidate the local repo before any source change. Later prompts are no-op aware: if a capability already exists and passes the stated contract, the agent must not churn files.

## Working Directory

```text
/Users/bobbyfetting/hb-intel
```

## Controlling Objective

Implement PCC Unified Lifecycle as the connective project operating layer across Project Home, Project Readiness, workflow modules, Project Memory, traceability, warranty, cross-project knowledge, and Ask-HBI grounding — while preserving one PCC shell, source-of-record discipline, permission/redaction rules, fixture-first preview posture, and no live external-system mutation.

## Exact Instruction Required In Every Prompt

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Prompt Sequence

1. `01_Unified_Lifecycle_Implementation_Readiness_Audit.md` — read-only repo audit; no edits.
2. `02_Model_Contracts_Fixtures_State_Machines_And_Security_Invariants.md` — model/fixture/state/security contract implementation or verification.
3. `03_Backend_GET_Only_Read_Model_Provider_And_Routes.md` — backend GET-only read-model route/provider implementation or verification.
4. `04_SPFX_Client_Fixtures_Adapters_And_Hooks.md` — SPFx client, fixture, adapter, and hook parity implementation or verification.
5. `05_Project_Home_Project_Readiness_Surface_Integration.md` — non-routed Project Home / Project Readiness integration implementation or verification.
6. `06_Ask_HBI_Search_Knowledge_Reuse_And_Warranty_Guards.md` — Ask-HBI / unified search / warranty / knowledge-reuse guard hardening.
7. `07_Tests_Guardrails_And_Implementation_Closeout.md` — test suite, guardrails, validation evidence, closeout, and commit.
8. `08_Fresh_Reviewer_Prompt.md` — follow-on review prompt for a fresh session.

## Execution Rule

Run prompts sequentially. Do not skip Prompt 01. Do not implement beyond the current prompt scope. Commit only when the prompt explicitly authorizes a commit and all validation gates pass.

## Guardrail Summary

This package forbids:

- creating a standalone unified-lifecycle shell route or departmental workspace;
- live Microsoft Graph, SharePoint REST/PnP, Procore, Sage, Autodesk, CRM, Adobe, DocuSign, or other source-system runtime calls unless a later gate explicitly authorizes them;
- backend write routes;
- source-system writeback, sync, scrape, mirror, or mutation;
- Procore/Sage/Graph/Autodesk runtime integration;
- production rollout;
- legal, claim, accounting, entitlement, responsibility, delay-damages, or forensic schedule-analysis determinations;
- uncited HBI grounded answers;
- HBI source-of-truth claims;
- cross-project search without explicit permission/redaction gates;
- package, dependency, lockfile, manifest, workflow/CI, or tenant changes unless separately authorized and justified.

## Post-Execution Review

After local execution, run Prompt 08 in a fresh session to audit repo truth, implementation correctness, test evidence, guardrails, and readiness for the next PCC Phase 3 wave.
