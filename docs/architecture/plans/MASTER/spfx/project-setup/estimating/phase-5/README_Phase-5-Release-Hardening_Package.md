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

5. `Prompt-04_Deployment-Rehearsal_Rollback-and-Recovery.md`
   - Rehearse deployment and validation flow end to end
   - Document rollback, recovery, and degraded-mode handling
   - Make release execution safe, repeatable, and supportable

6. `Prompt-05_Production-Readiness-Signoff-and-Handoff-Assets.md`
   - Build the final handoff artifacts, signoff notes, and operator documentation
   - Consolidate unresolved risks and explicit release prerequisites
   - Prepare the package for decision-ready signoff

7. `Prompt-06_Final-Verification_and-Handoff.md`
   - Run the final verification pass
   - Produce handoff notes, unresolved items, and immediate next-step recommendations

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
