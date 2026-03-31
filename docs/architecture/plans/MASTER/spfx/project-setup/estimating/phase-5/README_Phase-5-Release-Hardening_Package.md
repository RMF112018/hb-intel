# Phase 5 — Release Hardening Package

This package contains a sequenced implementation kit for bringing the **HB Intel Estimating / Project Setup SPFx package** through **Phase 5 — Release hardening**.

## Included files

1. `Phase-5_Release-Hardening_Action-Plan.md`
   - Master action plan
   - Workstreams
   - Deliverables
   - Acceptance criteria
   - Execution sequence

2. `Prompt-01_Repo-Truth-and-Release-Hardening-Baseline.md` **[COMPLETE]**
   - Establish the exact current release-hardening posture
   - Inventory remaining blockers, existing tests, diagnostics, readiness checks, deployment notes, and handoff assets
   - Produce the canonical release-hardening baseline before closure work starts
   - **Deliverables:**
     - [`Phase-5_Release-Hardening-Baseline.md`](Phase-5_Release-Hardening-Baseline.md) — Launch surface (20 backend routes + 6 frontend surfaces), test inventory (1,254 tests across 126 files), 27 phase deliverable docs, 5 launch blockers (A1–A5), 4 significant gaps (B1–B4), 5 cleanup items (C1–C5), 0 unresolved contradictions

3. `Prompt-02_Integration-Regression-and-End-to-End-Coverage.md` **[COMPLETE]**
   - Add or tighten the integration, regression, and end-to-end coverage required for production confidence
   - Validate the isolated package against retained backend contracts and deployment modes
   - Turn critical launch assumptions into executable tests
   - **Deliverables:**
     - [`Phase-5_Test-Coverage-Evidence.md`](Phase-5_Test-Coverage-Evidence.md) — 22 new tests (request lifecycle, unsupported scope guard, mode switching), apiAudience bug fix, updated totals (1,276 tests across 128 files), closes A1 partial + B1 + B3

4. `Prompt-03_Operational-Diagnostics-and-Release-Gates.md` **[COMPLETE]**
   - Add clear operator-facing diagnostics, release gates, go/no-go checks, and health visibility
   - Ensure failures are actionable for deployment and support teams
   - Make production readiness measurable rather than subjective
   - **Deliverables:**
     - [`Phase-5_Release-Gates-and-Diagnostics.md`](Phase-5_Release-Gates-and-Diagnostics.md) — 7 pre-deploy gates, 4 deploy gates, 4 post-deploy gates, diagnostic interpretation guide, failure→resolution map
     - `post-deploy-smoke.test.ts` — 7 env-gated smoke checks (health, auth rejection, authenticated paths)
     - `release-gates.test.ts` — 10 release prerequisite regression tests (config tiers, CORS, auth contract, MI enforcement)

5. `Prompt-04_Deployment-Rehearsal_Rollback-and-Recovery.md` **[COMPLETE]**
   - Rehearse deployment and validation flow end to end
   - Document rollback, recovery, and degraded-mode handling
   - Make release execution safe, repeatable, and supportable
   - **Deliverables:**
     - [`Phase-5_Deployment-Runbook.md`](Phase-5_Deployment-Runbook.md) — Prerequisites checklist, 5-phase release sequence (pre-deploy → deploy → post-deploy → frontend → monitoring), rollback triggers and steps, 5 degraded-mode recovery procedures, operator decision/escalation matrix, printable release execution checklist

6. `Prompt-05_Production-Readiness-Signoff-and-Handoff-Assets.md` **[COMPLETE]**
   - Build the final handoff artifacts, signoff notes, and operator documentation
   - Consolidate unresolved risks and explicit release prerequisites
   - Prepare the package for decision-ready signoff
   - **Deliverables:**
     - [`Phase-5_Production-Readiness-Signoff.md`](Phase-5_Production-Readiness-Signoff.md) — Executive summary, 0 code-level blockers (all 5 closed), 8 accepted risks, deployment prerequisites checklist, 1,288+ test evidence summary, 3-tier support escalation matrix, post-release monitoring plan, documentation index, signoff form

7. `Prompt-06_Final-Verification_and-Handoff.md` **[COMPLETE]**
   - Run the final verification pass
   - Produce handoff notes, unresolved items, and immediate next-step recommendations
   - **Deliverables:**
     - [`Phase-5_Handoff.md`](Phase-5_Handoff.md) — Final verification (130 test files, 1,288 tests, all green), all 6 success criteria met, 0 code-level blockers, 8 accepted risks, complete phase summary (24 prompts across Phases 2–5, 33 deliverables), recommendation: ready for production release decision review

8. `Prompt-07_Phase-5-Release-Scope-Freeze-and-Repo-Truth-Revalidation.md` **[COMPLETE]**
   - Re-verify Phase 5 audit findings against current repo truth
   - Freeze the retained Project Setup release surface (backend: 8 families, frontend: 6 surfaces)
   - Classify all Phase 5 evidence into repo-proven / env-gated / operational / overstated
   - Document frontend test baseline: 10 failures across 4 files on retained launch surface
   - **Deliverables:**
     - Audit report progress note (P5-07): re-verification table, canonical release surface, evidence classification (16 items), frontend test detail (4 failing files), 4 remaining blockers, 4 release-readiness questions

9. `Prompt-08_Phase-5-Retained-Surface-Frontend-Test-Baseline-and-Stability.md` **[COMPLETE]**
   - Fix all 10 frontend test failures (root cause: mock client injection gap)
   - Mock `useProjectSetupBackend` in 3 test files; add `getApiToken` to test harness
   - Bring retained frontend test surface to green baseline: 19 files, 138 tests, 0 failures
   - **Deliverables:**
     - Fixed tests: `NewRequestPage.test.tsx` (5), `RequestDetailPage.test.tsx` (2), `RequestDetailPage.coordinator.test.tsx` (2), `ProjectSetupUiReviewMode.test.tsx` (1)
     - Infrastructure fix: `renderWithProviders.tsx` (`getApiToken` option, `functionAppUrl` for mode switch)
     - Audit report progress note (P5-08): root cause, fix table, retained proof set (19 files), verification results
     - Version bump: `@hbc/spfx-project-setup` 0.2.24 → 0.2.25

## Recommended use

- Run the prompts **in order**.
- Do **not** merge work from a later prompt until the acceptance criteria from the prior prompt are satisfied.
- Treat this package as **Phase 5 only**.
- Keep broad redesign, data-contract churn, and unrelated feature work out of this phase unless a prompt explicitly allows a narrowly scoped enabling change.

## Governing intent for Phase 5

Phase 5 is complete only when all of the following are true:

- The retained Project Setup package has **objective release evidence**, not just design intent.
- Integration, regression, and deployment checks exist for the isolated frontend/backend surface.
- Operators have explicit go/no-go criteria, diagnostics, rollback steps, and recovery procedures.
- Production readiness is documented in a form leadership, IT, and support teams can review and sign off on.
- The release can be executed, validated, and reversed safely without tribal-knowledge-only steps.
