# Accounting Phase 8 Prompt Package Audit Report

## Executive Summary

The attached Phase 8 package is **directionally correct and structurally sound**, but it is **not yet precise enough to serve as a safe execution guide for a local code agent without revision**.

The strongest parts of the package are:

- it correctly treats Phase 8 as a **verification, degraded-path, and operational-readiness** phase rather than a broad feature-build phase
- it correctly keeps the work ordered as audit → lifecycle coverage → integration/E2E → degraded path → runbooks/support → closure
- it correctly recognizes that pilot/release readiness depends on more than happy-path feature completion
- it correctly includes degraded behavior and support documentation as first-class verification targets

The main issues are not foundational misunderstanding. They are **precision and evidence-discipline issues**:

1. the prompts do not force enough review of the current authoritative evidence set that already exists in the repo
2. the prompts do not sharply distinguish **repo-proven verification**, **environment-gated validation**, and **tenant/Azure out-of-repo prerequisites**
3. multiple prompt sections still use older **launch** wording that can drift back toward pre-freeze lifecycle language instead of the current approval-to-`ReadyToProvision` handoff plus backend auto-start model
4. the operational-readiness prompts do not explicitly require reconciliation against the existing maintenance runbooks and verification matrix that already function as Wave 0 evidence
5. the package is too loose about exact test files, observability sources, admin alerting/probe seams, and failure-mode registries that should drive the work
6. Prompt-02 contains a stray formatting defect (`n   - request submission and validation`) that should be cleaned up before use

Bottom line:

- **phase structure:** keep it
- **overall sequence:** keep it
- **verification intent:** keep it
- **source review requirements:** strengthen them
- **lifecycle wording:** sharpen it
- **repo-proof vs environment-proof classification:** make explicit
- **operational doc reconciliation:** make much more concrete

This revised package preserves the good structure and makes the execution safer.

---

## Current Repo-Truth Reliability / Testing / Operational Readiness Summary

### 1. The repo already has an authoritative current-state evidence map

`docs/architecture/blueprint/current-state-map.md` remains the canonical current-state authority and already classifies the major Wave 0 testing, support, runbook, and observability artifacts that Phase 8 should treat as primary evidence.

For Phase 8 purposes, the current-state map already identifies:

- the Accounting queue/detail tests
- the Admin oversight tests
- the PWA parity tests
- the maintenance runbooks
- the provisioning verification matrix
- the admin monitoring and probing seams
- Wave 0 closeout status and explicit deferred items

That means Prompt-01 should not begin from a generic repo search only. It should begin from the current-state map and verify the listed evidence against live files.

### 2. Accounting verification already covers materially important controller behavior

The current Accounting queue and detail test files already verify meaningful controller behavior, not just rendering.

`apps/accounting/src/test/ProjectReviewQueuePage.test.tsx` covers:

- queue filtering by state
- tab switching
- core table structure
- route linkage
- a responsive/failure-mode regression note tied to the G4 failure catalog

`apps/accounting/src/test/ProjectReviewDetailPage.test.tsx` covers:

- approval flow
- required project-number capture and validation
- clarification flow
- failed-only Admin routing
- no retry/recovery actions in Accounting
- admin-URL-missing failure handling
- expert-tier audit/diagnostic visibility

So Phase 8 should explicitly use these tests as baseline evidence, then identify what is still missing.

### 3. Admin verification already covers a broad recovery and supportability surface

`apps/admin/src/test/ProvisioningOversightPage.test.tsx` is much richer than the attached package implies.

It already verifies:

- filtered tabs and failed-run visibility
- retry, archive, escalation, and force-state override behavior
- retry-count ceiling guidance
- permission-gated action visibility
- expert-tier diagnostics
- `?projectId=` cross-app context handoff
- coaching/runbook callout behavior

In addition, `apps/admin/src/test/alertPollingService.test.ts` already verifies alert synthesis from failed requests and stuck runs, ingestion into the alert API, polling lifecycle behavior, and severity escalation.

That means Phase 8 should explicitly treat admin monitoring and support verification as part of the baseline, not only as later hardening targets.

### 4. The repo already has a consolidated provisioning verification matrix

`docs/reference/provisioning/verification-matrix.md` already functions as a pass/fail evidence register across:

- happy path
- clarification path
- failure and recovery path
- admin recovery path
- explainability
- supportability
- dead wiring audit

This is crucial for the audit because the attached Phase 8 package currently acts as if the local code agent must discover all readiness evidence from scratch. That is no longer true.

The better approach is:

- validate the matrix against current repo truth
- correct drift where it exists
- fill the real gaps
- avoid re-documenting already-proven behavior as if it were absent

### 5. The repo already has operational runbooks that must be treated as first-class Phase 8 evidence

Two maintenance docs are already present and materially relevant:

- `docs/maintenance/provisioning-runbook.md`
- `docs/maintenance/provisioning-observability-runbook.md`

These docs already cover:

- retry and escalation procedures
- storage diagnostics
- manual Step 5 rerun guidance
- timer diagnostics
- App Insights KQL queries
- alert rule definitions
- admin intervention paths
- supportability verification notes

Therefore Prompt-05 should not generically say “audit and reconcile runbooks.”  
It should explicitly require reconciliation of these exact docs against current repo truth.

### 6. The current repo already distinguishes repo-proven readiness from out-of-repo platform readiness

The observability runbook explicitly states that Azure alert rules are configured in Azure Portal / ARM and are not directly created from the repo. The operations runbook likewise includes portal/manual procedures.

That means Phase 8 must explicitly separate:

- **repo-proven code/test/doc evidence**
- **environment-gated validation**
- **Azure / tenant / portal work that remains outside repo-local proof**

The attached package does not currently make that distinction strongly enough.

### 7. “Launch” wording is now too loose for current lifecycle truth

Several Phase 8 docs still use language like:

- launch / provisioning trigger behavior
- approve / launch behavior
- launch-to-status correlation

That wording is not totally wrong in casual speech, but it is too loose for an execution prompt because the live contract is more precise:

- Accounting approval advances the request to `ReadyToProvision`
- the backend auto-starts the saga from that transition
- the runtime then owns progression into `Provisioning`

So the Phase 8 prompts should use current contract language such as:

- approval-to-handoff
- `ReadyToProvision` transition
- backend auto-start
- provisioning runtime progression

### 8. The repo already documents intentional incomplete items that Phase 8 must not over-promise away

The current-state map and verification matrix already record intentional Wave 1 or later gaps such as:

- in-memory-only admin persistence seams
- Teams webhook delivery confirmation not implemented
- live SMTP not implemented
- deferred monitors and probes
- ErrorLogPage placeholder state

Phase 8 should therefore avoid promising full operational completeness where the repo has already classified some items as intentionally deferred. The goal is accurate closure, not inflated closure.

---

## Confirmed Phase 8 Prompt-Package Facts

The attached package does several things well.

### Confirmed strengths

- It correctly defines Phase 8 as a reliability / testing / operations verification phase.
- It correctly requires degraded-path validation rather than happy-path-only proof.
- It correctly includes supportability, telemetry, and runbook alignment.
- It correctly separates the work into an audit-first sequence before later hardening.
- It correctly aims for closure reporting rather than open-ended implementation.

### Confirmed weaknesses

- It does not force review of the current authoritative evidence set:
  - `docs/architecture/blueprint/current-state-map.md`
  - `docs/reference/provisioning/verification-matrix.md`
  - `docs/maintenance/provisioning-runbook.md`
  - `docs/maintenance/provisioning-observability-runbook.md`
- It does not force enough exact source review for:
  - Accounting tests
  - Admin oversight tests
  - alert polling tests
  - PWA parity/progress surfaces
  - failure-mode registries
  - admin monitors/probes
- It uses loose “launch” wording that can drift away from current lifecycle semantics.
- It does not require an explicit repo-proof vs environment-proof vs out-of-repo classification.
- It does not explicitly prevent a local agent from over-claiming true E2E/prod proof where only repo-local deterministic proof exists.
- Prompt-02 contains a visible formatting defect that should be cleaned before execution.

---

## Prompt-Package ↔ Repo Alignment Analysis

## 1. Overall phase purpose vs repo truth

**Assessment:** aligned.

The package’s purpose is correct. The repo does need a disciplined reliability / verification / supportability pass before pilot/release hardening.

## 2. Prompt ordering vs repo truth

**Assessment:** aligned.

The current order is the right one:

1. audit current evidence
2. harden lifecycle coverage
3. harden integration/E2E coverage
4. harden degraded-path and observability validation
5. reconcile runbooks/support docs
6. close with one authoritative readiness report

No structural reordering is needed.

## 3. Verification baseline framing vs repo truth

**Assessment:** partially aligned but under-specified.

The package understands what categories of evidence matter, but it does not force the local agent to anchor the work in the current authoritative evidence inventory that already exists.

That is risky because the agent could underuse or overlook the very documents and tests that now define current Wave 0 verification truth.

## 4. Lifecycle wording vs repo truth

**Assessment:** partially aligned but too loose.

The package’s recurring use of “launch” is serviceable shorthand but too loose for a current-state execution prompt.

The live repo is more precise than that, and the prompts should now use that precision consistently.

## 5. Operational-readiness framing vs repo truth

**Assessment:** aligned in intent, weak in concrete source targeting.

The package correctly includes runbooks, telemetry, and supportability, but it does not explicitly require the agent to reconcile the already-existing maintenance docs and verification matrix.

## 6. Degraded-path framing vs repo truth

**Assessment:** aligned in concept, incomplete in evidence set.

The package recognizes SignalR, polling fallback, backend/API failure, and connected-service partial availability, which is good.

But it does not explicitly require the agent to reconcile against:

- failure-mode catalog (`packages/provisioning/src/failure-modes.ts`)
- alert polling behavior
- admin probes/monitors
- runbook-stated alert/query mechanics
- current PWA provisioning progress surface assumptions

## 7. Closure/reporting framing vs repo truth

**Assessment:** good but incomplete.

The final closure prompt should explicitly require a three-way classification:

- repo-proven
- environment-gated / tenant-gated
- still unresolved / deferred / out-of-repo

Without that, the closure report can be too optimistic or too vague.

---

## Stale-Assumption and Authority-Drift Analysis

## 1. The package behaves as if most readiness evidence still has to be discovered

That is no longer true.

The current-state map, verification matrix, and maintenance docs already act as a substantial readiness package. The Phase 8 prompts should treat them as primary artifacts to validate and extend, not as incidental background material.

## 2. “Launch” wording is now a drift risk

Because prior phases already froze the request lifecycle more precisely, continued loose wording around “launch” can cause the local agent to backslide into older or vaguer semantics.

The revised package should use current contract language consistently.

## 3. The package risks over-claiming E2E proof

The current repo contains meaningful integration, route-level, and supportability evidence, but not all real-world Azure / tenant / portal behavior is repo-local proof.

The revised package must explicitly tell the agent not to overstate local test evidence as full production-environment proof.

## 4. The package under-specifies operational evidence sources

Without named runbook and observability files, the agent may produce generic support docs that duplicate or drift away from the existing operational sources.

---

## Phase Order and Dependency-Flow Analysis

## Overall verdict

Keep the six-stage structure and order.

## Dependency-flow improvements needed

The order is correct, but the package should make the dependencies between stages more explicit:

- Prompt-01 must establish the authoritative existing evidence inventory
- Prompt-02 must harden lifecycle coverage against the already-frozen workflow contract
- Prompt-03 must separate repo-local integration proof from environment-gated proof
- Prompt-04 must validate degraded-path behavior against actual failure-mode and observability seams
- Prompt-05 must reconcile existing maintenance docs rather than producing support language from scratch
- Prompt-06 must close with evidence categories, not generic confidence statements

---

## Gap Analysis

## Gap 1 — Missing current authoritative evidence sources

**Severity:** High

The package does not force review of the most important current evidence artifacts:

- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/provisioning/verification-matrix.md`
- `docs/maintenance/provisioning-runbook.md`
- `docs/maintenance/provisioning-observability-runbook.md`

## Gap 2 — Missing exact test-source requirements

**Severity:** High

The package names app areas generally but does not force review of key live tests such as:

- `apps/accounting/src/test/ProjectReviewQueuePage.test.tsx`
- `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx`
- `apps/admin/src/test/ProvisioningOversightPage.test.tsx`
- `apps/admin/src/test/alertPollingService.test.ts`
- `apps/admin/src/test/OperationalDashboardPage.test.tsx`
- `apps/pwa/src/test/parity/stateLabels.test.ts`
- `apps/pwa/src/test/parity/wizardConfig.test.ts`

## Gap 3 — Lifecycle terminology drift

**Severity:** Medium-High

The recurring “launch” wording is too loose for the current frozen contract and should be revised.

## Gap 4 — No explicit evidence classification model

**Severity:** High

The prompts do not force the local agent to distinguish:

- repo-proven verification
- environment-gated validation
- out-of-repo Azure / tenant / portal work
- intentionally deferred items

This is the biggest readiness-reporting weakness in the current package.

## Gap 5 — Degraded-path prompt does not force reconciliation against failure/observability seams

**Severity:** Medium-High

The degraded-path prompt should explicitly pull in:

- failure-mode catalog
- integration rules
- admin monitors/probes
- alert polling
- observability runbook

## Gap 6 — Operational-readiness prompt does not target the concrete runbooks

**Severity:** Medium

The runbook/support prompt should name the exact maintenance docs and verification matrix rather than relying on generic wording.

## Gap 7 — Prompt-02 formatting defect

**Severity:** Low

The stray `n` in the bullet list should be corrected before execution.

---

## Risk Analysis

## Primary execution risk

A local code agent could execute the current package and produce a **mostly reasonable but overstated** readiness package by:

- missing existing authoritative evidence
- using loose lifecycle wording
- overstating repo-local proof as production-like proof
- duplicating or drifting from the existing runbooks
- under-classifying out-of-repo dependencies

## Secondary execution risk

The agent could spend effort adding new tests/docs in the wrong places instead of first reconciling the substantial evidence already in the repo.

## Lower-order risk

The closure report could sound stronger than the evidence actually supports because the prompts do not yet require the right proof categories.

---

## Package-Quality / Execution-Readiness Assessment

## Current package status

**Assessment:** usable as a draft, not safe enough as-is for strict execution.

### Ratings

- **phase purpose:** strong
- **sequence/order:** strong
- **scope discipline:** strong
- **source targeting:** moderate
- **lifecycle precision:** moderate
- **evidence classification:** weak-to-moderate
- **operational-doc targeting:** moderate
- **execution safety for a local agent:** moderate

## Revised package status

**Assessment:** safe enough to use as the working Phase 8 package.

The revised package strengthens:

- exact source review
- lifecycle terminology
- repo-proof vs environment-proof separation
- degraded-path evidence requirements
- runbook/support reconciliation
- closure rigor

---

## Prioritized Refinement List

## Priority 1 — Force review of the current authoritative evidence set

Add explicit required review of:

- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/provisioning/verification-matrix.md`
- `docs/maintenance/provisioning-runbook.md`
- `docs/maintenance/provisioning-observability-runbook.md`

## Priority 2 — Expand the exact required test/evidence files

Add explicit required review of:

- Accounting queue/detail tests
- Admin oversight tests
- alert polling tests
- operational dashboard tests
- PWA parity tests
- failure-mode / integration-rule registries
- admin monitors/probes

## Priority 3 — Replace loose “launch” wording

Use current contract language such as:

- approve / handoff
- transition to `ReadyToProvision`
- backend auto-start
- provisioning runtime progression
- status correlation

## Priority 4 — Add hard evidence categories to every prompt

Require explicit classification of findings as:

- repo-proven
- environment-gated
- out-of-repo / tenant/Azure prerequisite
- intentionally deferred

## Priority 5 — Tighten degraded-path and observability prompt

Require explicit reconciliation against:

- failure-mode catalog
- admin alert polling
- operational dashboards
- observability runbook
- probe/monitor seams

## Priority 6 — Tighten operational-readiness prompt

Make the local agent reconcile the exact maintenance docs and verification matrix rather than creating generic support content.

## Priority 7 — Clean up formatting and closure criteria

Fix Prompt-02 formatting and make the closure report explicitly answer whether the solution is:

- repo-ready
- environment-ready
- tenant-ready
- pilot-ready
- still blocked

---

## Explicit Unresolved Questions

These are not blockers to revising the package, but they should remain explicit.

1. **Which environment-gated validations are expected to be executable from the repo in this phase versus merely documented as out-of-repo pilot/release prerequisites?**
2. **How much true browser-level / hosted-environment proof is expected inside this phase versus deterministic route/integration proof plus a residual external validation register?**
3. **Should Phase 8 continue to maintain one consolidated verification matrix, or should future phases split lifecycle/support/observability evidence into separate documents?**

---

## Final Assessment

The attached Phase 8 package is worth preserving.  
It needed refinement for:

- exact evidence-source targeting
- lifecycle wording precision
- degraded-path source coverage
- runbook reconciliation
- proof-category discipline

The revised package included with this audit keeps the good structure and makes the prompt set much safer for a local code agent to execute.
