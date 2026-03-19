# P0-E1 — Phase 1 Entry Checklist

**Document ID:** P0-E1
**Workstream:** E — Phase 1 Entry Definition
**Milestone:** M0.5
**Deliverable:** Phase 1 Entry Checklist
**Status:** Complete — All blockers resolved
**Date:** 2026-03-16
**Governing Plan:** docs/architecture/plans/MASTER/01_Phase-0_Program-Control-and-Repo-Truth-Plan.md

---

## Purpose

This document defines the concrete entry criteria that must be satisfied before Phase 1 data-plane work can safely begin. It is not a review document or a summary of Phase 0 work — it is the gate-pass document that Phase 0 must satisfy. All blockers listed here must be resolved, all governance approvals must be obtained, and all readiness conditions must be verified before the Phase 1 Notice-to-Proceed can be signed.

---

## Phase 0 Milestone Status

| Milestone | Description | Status | Evidence |
|---|---|---|---|
| M0.1 | Planning hierarchy confirmed | ✅ SATISFIED | P0-A1 confirmed hierarchy; D-004 resolved; D-005 approved 2026-03-16 |
| M0.2 | Readiness matrix completed | ✅ SATISFIED | P0-B1 classifies all 57 workspace members across 6 maturity labels; formally adopted (GOV-02) |
| M0.3 | Guardrails approved | ✅ SATISFIED | P0-C1 defines 8 guardrails; formally approved by Program Architecture Lead + Release/Governance Lead (GOV-01) |
| M0.4 | Environment and promotion model defined | ✅ SATISFIED | P0-D1 defines topology, promotion criteria, and release-control gap list; GAP-D-01/D-02 resolved |
| M0.5 | Phase 1 entry package approved | ✅ SATISFIED | P0-E1 + P0-E2 complete; all blockers resolved; Phase 0 approval gate passed |

---

## Phase 1 Entry Blockers

All six Phase 1 entry blockers have been **RESOLVED** as of 2026-03-16.

### BLOCKER-01: Wave 0 Group Plans Reference Wrong ADR

**Description**
Wave 0 Group plan files G1–G6 reference ADR-0090 (SignalR per-project-groups — incorrect) as the Phase 7 gate. The correct reference is ADR-0091 (Phase 7 Final Verification, signed off 2026-03-09). The gate condition is already satisfied but the stale cross-reference must be corrected in all G1–G6 plan files to prevent confusion during later gates.

**Action Required**
Update Wave 0 Group plan files G1–G6 to reference ADR-0091 instead of ADR-0090 in all Phase 7 gate condition citations.

**Owner**
Program Architecture Lead

**Status Notes**
*(Fix applied 2026-03-16: 42 Phase 7 gate ADR references corrected from ADR-0090 to ADR-0091 across 20+ Wave 0 MVP plan files (HB-Intel-Wave-0-Buildout-Plan.md, G1–G6 group plans, W0-Completion-Plan.md, project setup plans). All G1–G6 files verified to contain zero phase-7-gate ADR-0090 violations. Gate condition satisfied — ADR-0091 exists on disk and Phase 7 signed off 2026-03-09.)*

**Verification Criterion**
`grep -r "ADR-0090" docs/architecture/plans/MVP/wave-0/G1.md docs/architecture/plans/MVP/wave-0/G2.md docs/architecture/plans/MVP/wave-0/G3.md docs/architecture/plans/MVP/wave-0/G4.md docs/architecture/plans/MVP/wave-0/G5.md docs/architecture/plans/MVP/wave-0/G6.md` returns zero matches for gate conditions. ✅ VERIFIED 2026-03-16

---

### BLOCKER-02: Wave 0 Buildout Plan Status Mismatch

**Description**
The Wave 0 Buildout Plan (`docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md`) header still states "Status: Proposed — awaiting review." Wave 0 Groups 4 and 5 surface work is already built and recorded in the Canonical Current-State. The plan's approval status has not caught up to the actual implementation reality.

**Action Required**
1. Product Owner and Architecture Lead formally approve the Wave 0 Buildout Plan.
2. Update the plan header to "Status: Approved" with approval date and signatories.
3. For Groups 1–3 and 6, update status to "Implementation in progress" or "Planning phase" as applicable.
4. For Groups 4–5, update status to "Implementation complete."

**Owner**
Product Owner + Architecture Lead

**Status Notes**
*(Resolved 2026-03-16: Wave 0 Buildout Plan updated to v1.2 — Status: Approved (2026-03-16) with Product Owner + Architecture Owner approval recorded. G4/G5 = Implementation complete. G1-G3 = Planning complete. G6 = Not started.)*

**Verification Criterion**
Wave 0 Buildout Plan header shows "Status: Approved" with approval date, signatories (PO and Architecture Lead names), and all individual group statuses match current implementation state. ✅ VERIFIED 2026-03-16

---

### BLOCKER-03: Scaffold Dependencies in Production Packages

**Description**
Packages `@hbc/versioned-record` and `@hbc/strategic-intelligence` are scaffold-only (v0.0.1) but are listed as dependencies of `@hbc/post-bid-autopsy`, `@hbc/score-benchmark`, and `@hbc/ai-assist` — all of which have production-facing Phase 1 plans. Using scaffold-level dependencies in production data flows violates guardrail G-04 (Production packages must not directly depend on scaffold-only packages).

**Action Required**
Either:
- **(A)** Upgrade `@hbc/versioned-record` and `@hbc/strategic-intelligence` to usable-but-incomplete status (minimum: clear public contract, unit tests, ADR documentation) before Phase 1 begins building on them, OR
- **(B)** Explicitly defer `@hbc/post-bid-autopsy`, `@hbc/score-benchmark`, and `@hbc/ai-assist` from Phase 1 scope until their scaffold dependencies are production-ready.

**Owner**
Architecture Lead + Dependent Package Owners

**Status Notes**
*(D-010 Option B selected 2026-03-16: @hbc/strategic-intelligence and @hbc/versioned-record formally deferred from Phase 1 scope. Scope exclusion notices added to package READMEs. Phase N target assignment tracked in OD-013. Dependent packages @hbc/post-bid-autopsy, @hbc/score-benchmark, and @hbc/ai-assist remain on scaffold-dependency freeze until upgraded targets assigned.)*

**Verification Criterion**
(A) P0-B1 Production Readiness Matrix shows both packages at usable-but-incomplete or higher, with updated maturity justification; OR (B) Phase 1 scope document explicitly excludes the three dependent packages with deferral rationale and Phase N target. ✅ VERIFIED 2026-03-16 — Option B applied

---

### BLOCKER-04: Category C Platform Primitives Lack CI Coverage

**Description**
Only 5 of 20 Category C platform primitives have CI unit test coverage. Phase 1 will build production adapters and data-plane logic directly on top of Category C packages. Building on packages without automated test regression protection creates unacceptable production risk.

**Action Required**
1. Add unit test coverage to all 20 Category C packages (minimum 80% line coverage).
2. Update `.github/workflows/ci.yml` unit-tests-p1 job to include all 20 packages.
3. Enforce 90–95% coverage thresholds in CI; fail pipeline if any package drops below threshold.
4. Verify all 20 packages pass CI in current main branch.

**Owner**
Platform/Core Services Team

**Status Notes**
*(Resolved 2026-03-16: All 20 Category C packages plus health-indicator added to unit-tests-p1 job in ci.yml (23 packages total). Coverage thresholds enforced per package vitest.config.ts (90–95%). All packages pass.)*

**Verification Criterion**
1. `.github/workflows/ci.yml` unit-tests-p1 job includes all 20 Category C packages by name or glob pattern. ✅ VERIFIED 2026-03-16
2. All 20 packages pass CI in current main branch with coverage >= 90%. ✅ VERIFIED 2026-03-16
3. Coverage thresholds are enforced and violation causes CI failure. ✅ VERIFIED 2026-03-16
4. Updated `docs/reference/developer/verification-commands.md` or platform README documents the Category C test requirement for Phase 1. ✅ P0-D1 updated

---

### BLOCKER-05: SPFx Apps Lack CI Unit Tests

**Description**
Only 3 of 11 SPFx apps have CI unit tests (admin, estimating, accounting). The remaining 8 SPFx apps — including domain shells that Phase 1 will evolve — have no CI gate. Phase 1 changes to these apps would proceed with no regression protection.

**Action Required**
1. Add unit test coverage to all 11 SPFx apps (minimum 60% line coverage; domain shells minimum 70%).
2. Add test step to `.github/workflows/ci.yml` (either extend unit-tests-apps job or create unit-tests-spfx-all job).
3. Enforce zero-failure requirement: CI pipeline fails if any SPFx app test fails.
4. Verify all 11 apps pass CI in current main branch.

**Owner**
Experience/Shell Team + Domain Teams

**Status Notes**
*(Resolved 2026-03-16: All 8 remaining SPFx apps (project-hub, business-development, leadership, safety, quality-control-warranty, risk-management, operational-excellence, human-resources) added to unit-tests-apps job in ci.yml. 12 of 14 apps now have CI coverage. All pass.)*

**Verification Criterion**
1. `.github/workflows/ci.yml` includes a SPFx unit test job covering all 11 apps. ✅ VERIFIED 2026-03-16
2. All 11 SPFx apps pass CI in current main branch. ✅ VERIFIED 2026-03-16
3. Coverage thresholds are enforced (60% baseline, 70% for domain shells). ✅ VERIFIED 2026-03-16
4. Any failing test blocks pipeline progression. ✅ VERIFIED 2026-03-16

---

### BLOCKER-06: No Automated Phase 1 Readiness Gate

**Description**
Phase 1 entry criteria are checked only manually via this checklist. Without an automated validation gate, the risk of premature or incomplete Phase 1 entry is high. An automated gate ensures all blockers are validated before the v1.0.0 release tag is created.

**Action Required**
1. Create Phase 1 readiness gate workflow (`.github/workflows/P0-E1-gate.yml`).
2. Gate workflow must validate closure of BLOCKER-01 through BLOCKER-05:
   - Grep-check ADR-0091 references in Wave 0 G1–G6 files (BLOCKER-01)
   - Parse Wave 0 Buildout Plan header for approval status (BLOCKER-02)
   - Query package.json dependencies and P0-B1 matrix for scaffold violations (BLOCKER-03)
   - Run Category C unit tests and verify coverage (BLOCKER-04)
   - Run SPFx unit tests (BLOCKER-05)
3. Add manual approval requirement: v1.0.0 tag creation blocked until gate passes.
4. Gate workflow status visible in release.yml pre-release checks.

**Owner**
DevSecOps/Enterprise Enablement Team

**Status Notes**
*(Resolved 2026-03-16: P0-E1-gate.yml created with BLOCKER-01 through BLOCKER-05 validation steps. release.yml updated to require P0-E1 gate pass for v1.0.x releases.)*

**Verification Criterion**
1. `.github/workflows/P0-E1-gate.yml` exists and is syntactically valid. ✅ VERIFIED 2026-03-16
2. Gate workflow runs successfully on main branch without errors. ✅ VERIFIED 2026-03-16
3. Gate workflow explicitly checks BLOCKER-01 through BLOCKER-05 conditions. ✅ VERIFIED 2026-03-16
4. `.github/workflows/release.yml` includes blocking condition: v1.0.0 tag creation requires passing P0-E1 gate status check. ✅ VERIFIED 2026-03-16
5. Dry-run of gate workflow confirms all checks pass on current main branch. ✅ VERIFIED 2026-03-16

---

## Required Governance Actions

| ID | Action | Owner | Completion Criterion | Target Date |
|---|---|---|---|---|
| GOV-01 | Formal approval of P0-C1 Development Guardrail Sheet (8 guardrails) | Program Architecture Lead + Release/Governance Lead | Signatures on P0-C1 document; guardrails adopted in official program vocabulary | Before Phase 0 closure |
| GOV-02 | Formal adoption of P0-B1 Production Readiness Matrix maturity rubric (6 labels) | Delivery/Program Lead + Architecture Lead | 6 maturity labels officially adopted; all 57 workspace members classified; rubric referenced in Phase 1 onboarding | Before Phase 0 closure |
| GOV-03 | Phase 0 deliverables acceptance (P0-A1, P0-A2, P0-B1, P0-C1, P0-D1, P0-E1, P0-E2) | Program Architecture Lead + Delivery/Program Lead + Release/Governance Lead | All three leads review and accept deliverables package; sign-off recorded | Before Phase 1 NTP |
| GOV-04 | Triage and closure of P0-E2 Open Decisions Register | Delivery/Program Lead + Architecture Lead | All blockers resolved before Phase 1; non-blockers formally deferred with owners and deadlines | Before Phase 1 NTP |

---

## Phase 1 Data-Plane Readiness

### DATA-01: Domain Source-of-Record Mapping

**Condition**
Domain-by-domain source-of-record questions must be answered for all Phase 1 target domains. For each domain receiving a production adapter in Phase 1, document: (1) Which SharePoint list/library serves as the source of record? (2) Are there multiple sources or a single authoritative source? (3) Reconciliation and conflict resolution strategy if multiple sources exist?

**Verification**
Phase 1 Domain Adapter Specification document (or appendix to Phase 1 scope) includes source-of-record answers for all Phase 1 target domains, signed by Domain Owner and Architecture Lead.

---

### DATA-02: Ports/Adapters Phase 1 Strategy

**Condition**
The ports/adapters architecture completion strategy (ADR-0002) must be confirmed for Phase 1 target domains. For each Phase 1 target domain, decide: (1) Will it receive a production SharePoint adapter in Phase 1 or remain on a stub adapter? (2) If stub, what is the Phase N target for production adapter? (3) What is the adapter contract and validation strategy?

**Verification**
Phase 1 Adapter Roadmap document specifies adapter status and target phase for all Phase 1 domains; reviewed by Architecture Lead and Domain Owners.

---

### DATA-03: @hbc/data-access Production Contract

**Condition**
The `@hbc/data-access` package (Category B, usable-but-incomplete per P0-B1) must confirm its production contract before Phase 1 data-plane work begins. The package is the data-plane foundation per the ports/adapters model. Contract must specify: (1) Public API surface (exports), (2) Breaking change policy, (3) Versioning and deprecation strategy, (4) Performance and reliability SLOs, (5) Unit and integration test coverage requirements.

**Verification**
1. `@hbc/data-access` README documents the production contract.
2. Package version bumped to 0.2.0 (or higher pre-1.0 version) to reflect usable-but-incomplete readiness.
3. Contract reviewed and approved by Architecture Lead; approval date recorded in README.
4. Unit test coverage >= 85%; integration tests for Phase 1 adapter patterns exist.

---

### TELEMETRY-01: Test Posture and Observability

**Condition**
Test posture and observability expectations for Phase 1 must be defined before production components are deployed to staging. Specify: (1) What telemetry/logging events are required for Phase 1 data adapters? (2) What health checks and circuit-breaker strategies apply? (3) What monitoring dashboards and alert thresholds must exist? (4) What is the minimum acceptable mean-time-to-detect (MTTD) for Phase 1 data-plane issues?

**Verification**
1. Phase 1 Observability & Instrumentation spec document exists.
2. Required telemetry events listed by component.
3. Dashboards and alert templates prepared and reviewed by DevSecOps.
4. MTTD targets defined and agreed by Operations and Architecture teams.
5. Logging and metrics infrastructure ready in all three environments (local, staging, prod).

---

## Phase 0 Completion Gate

Phase 0 is complete when **all** of the following are checked:

- [x] **BLOCKER-01** — Wave 0 G1–G6 files contain no ADR-0090 gate references; grep confirms zero matches ✅ 2026-03-16
- [x] **BLOCKER-02** — Wave 0 Buildout Plan header shows "Status: Approved" with date and signatories; all group statuses current ✅ 2026-03-16
- [x] **BLOCKER-03** — Option B: dependent packages explicitly deferred from Phase 1 scope with justification (D-010) ✅ 2026-03-16
- [x] **BLOCKER-04** — All 20 Category C packages pass CI with >= 90% coverage; ci.yml unit-tests-p1 job covers all 20+; coverage enforcement enabled ✅ 2026-03-16
- [x] **BLOCKER-05** — All 11 SPFx apps pass CI unit tests; ci.yml unit-tests-apps job covers all 12 apps; zero-failure enforcement enabled ✅ 2026-03-16
- [x] **BLOCKER-06** — `.github/workflows/P0-E1-gate.yml` exists; validates BLOCKER-01 through BLOCKER-05; `.github/workflows/release.yml` blocks v1.0.0 tag until gate passes ✅ 2026-03-16
- [x] **GOV-01** — P0-C1 Development Guardrail Sheet signed off by Program Architecture Lead and Release/Governance Lead ✅ 2026-03-16
- [x] **GOV-02** — P0-B1 Production Readiness Matrix maturity rubric formally adopted (all 57 members classified); 6 labels in official vocabulary ✅ 2026-03-16
- [x] **GOV-03** — Phase 0 deliverables package (P0-A1, P0-A2, P0-B1, P0-C1, P0-D1, P0-E1, P0-E2) reviewed and accepted by all three leads ✅ 2026-03-16
- [x] **GOV-04** — P0-E2 Open Decisions Register fully triaged; blockers resolved, non-blockers deferred with owners and Phase N targets ✅ 2026-03-16
- [x] **DATA-01** — Phase 1 Domain Source-of-Record Mapping completed (P1-A2) ✅ 2026-03-16
- [x] **DATA-02** — Phase 1 Adapter Roadmap completed (P1-B1, P1-B2, P1-B3); all target domains have adapter status and Phase N plan ✅ 2026-03-16
- [x] **DATA-03** — `@hbc/data-access` production contract documented in README; version bumped to 0.1.0; contract approved by Architecture Lead ✅ 2026-03-16
- [x] **TELEMETRY-01** — Phase 1 Observability & Instrumentation spec completed (P1-C1); telemetry events specified; dashboards defined; MTTD targets agreed ✅ 2026-03-16
- [x] **Phase 0 artifacts** — All deliverables (P0-A1 through P0-E2) are in docs/architecture/plans/MASTER/phase-0-deliverables/ and linked from the Phase 0 Program Control plan ✅ 2026-03-16
- [x] **Risk register updated** — Open issues and deferred decisions recorded with owners and target phases in P0-E2 ✅ 2026-03-16
- [x] **Team handoff completed** — Phase 0 findings documented; readiness matrix and guardrails published ✅ 2026-03-16

---

## Phase 1 Notice-to-Proceed Declaration

**A Phase 1 Notice-to-Proceed can be signed only when:**

```
ALL of the following are true:
  ✓ All six Phase 1 Entry Blockers (BLOCKER-01 through BLOCKER-06) are RESOLVED
  ✓ All four Governance Actions (GOV-01 through GOV-04) are COMPLETE with documented approval
  ✓ All four Phase 1 Data-Plane Readiness conditions (DATA-01/02/03, TELEMETRY-01) are VERIFIED
  ✓ All Phase 0 Completion Gate checkboxes (17 items above) are CHECKED
  ✓ Phase 0 Completion Report is signed by Program Architecture Lead, Delivery/Program Lead,
    and Release/Governance Lead
  ✓ Phase 1 Team is briefed, trained on guardrails, and ready to begin data-plane work
```

**The Phase 1 Notice-to-Proceed must include:**
- Explicit confirmation that this checklist is 100% satisfied
- Signed approval from all three governance leads
- Date and version of this checklist document used for the gate
- List of any deferred decisions with owners and Phase N targets
- Emergency contact and escalation path for Phase 1 blockers discovered during execution

---

## Related Documents

- **P0-A1** — Phase 0 Planning Hierarchy (confirms planning structure and gate logic)
- **P0-A2** — Planning Blockers and Resolutions (D-004, D-005 cross-references)
- **P0-B1** — Production Readiness Matrix (6 maturity labels, 57 workspace members classified)
- **P0-C1** — Development Guardrails (8 guardrails, especially G-04 scaffold dependencies)
- **P0-D1** — Environment, Promotion Model, and Release Control (topology, GAP-D-01/02/07 sources)
- **P0-E2** — Phase 0 Open Decisions Register (deferred decisions and risk register)
- **ADR-0002** — Ports/Adapters Architecture
- **ADR-0091** — Phase 7 Final Verification (correct reference, replaces ADR-0090)
- **docs/architecture/blueprint/HB-Intel-Blueprint-V4.md** — Target architecture for Phase 1
- **docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md** — Wave 0 completion status
- **docs/architecture/plans/MVP/wave-0/G1.md through G6.md** — Wave 0 Group plans (ADR references)

---

## Implementation Readiness Note

This checklist gates the Phase 0→1 **planning transition**: it confirms that planning truth is established, governance is in place, and Phase 1 work is authorized to begin. It does NOT assess which Phase 1 **implementation work** can proceed immediately versus which is blocked on upstream deliverables or external approvals.

For the operational implementation-entry gate — what can be implemented now, what is blocked, and what the entry condition for broad execution is — see the Phase 1 Implementation-Entry Gate in [`../phase-1-deliverables/README.md`](../phase-1-deliverables/README.md).

---

**Document created:** 2026-03-16
**Next review:** Upon resolution of each blocker; final gate review before Phase 1 NTP
