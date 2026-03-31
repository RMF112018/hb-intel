# Phase 4 — Infrastructure Package

This package contains a sequenced implementation kit for bringing the **HB Intel Estimating / Project Setup SPFx package** through **Phase 4 — Infrastructure**.

## Included files

1. `Phase-4_Infrastructure_Action-Plan.md`
   - Master action plan
   - Workstreams
   - Deliverables
   - Acceptance criteria
   - Execution sequence

2. `Prompt-01_Repo-Truth-and-Infrastructure-Surface-Baseline.md` **[COMPLETE]**
   - Establish the exact current infrastructure and connected-services posture
   - Inventory hosting, startup validation, runtime dependencies, and service identities
   - Produce the canonical infrastructure baseline before hardening work starts
   - **Deliverables:**
     - [`Phase-4_Infrastructure-Baseline-Matrix.md`](Phase-4_Infrastructure-Baseline-Matrix.md) — Complete dependency inventory: ~94 function registrations (~20 required), 14 service factory entries (9 required), 8 required env vars, 7 provisioning prerequisites, 6 connected Azure/M365 services, 3 timer jobs
     - [`Phase-4_Infrastructure-Gap-Summary.md`](Phase-4_Infrastructure-Gap-Summary.md) — 8 infrastructure gaps: over-broad function surface, eager service factory, mocked SignalR push, unscoped boot blockers, missing CORS in code, stub email delivery, no monitoring alerts

3. `Prompt-02_Functions-Hosting-Startup-and-Configuration-Scope.md` **[COMPLETE]**
   - Scope Azure Functions startup to the actual Project Setup deployment
   - Reduce over-broad boot blockers
   - Lock required configuration, feature gating, and environment validation
   - **Deliverables:**
     - [`Phase-4_Startup-Scope-Contract.md`](Phase-4_Startup-Scope-Contract.md) — Tiered config validation (core/sharepoint/provisioning), lazy domain service initialization, Redis removal, health endpoint tiered status

4. `Prompt-03_Managed-Identity-Storage-and-Secrets-Hardening.md` **[COMPLETE]**
   - Harden managed identity usage, storage dependencies, and secret handling
   - Replace unsafe or unclear credential patterns
   - Align runtime services to production-safe identity boundaries
   - **Deliverables:**
     - [`Phase-4_Identity-Storage-Secrets.md`](Phase-4_Identity-Storage-Secrets.md) — MI usage matrix (6 services), removed AZURE_CLIENT_SECRET (pure MI), conditional SignalR init with NoOpSignalRPushService, storage/secret classification, stub status for email delivery

5. `Prompt-04_CORS-Connected-Services-and-Permission-Model.md` **[COMPLETE]**
   - Finalize browser-origin rules, SharePoint / Graph access posture, and connected-service permissions
   - Remove or document unsupported service dependencies
   - Align platform permissions to least privilege and actual deployment scope
   - **Deliverables:**
     - [`Phase-4_CORS-Permissions-Connected-Services.md`](Phase-4_CORS-Permissions-Connected-Services.md) — CORS allowlist in host.json, least-privilege permission matrix (MI + app registration + SharePoint admin), connected-service classification (6 retained, 2 optional, 3 unsupported/stub), unresolved tenant dependencies

6. `Prompt-05_Observability-Release-Readiness-and-Operational-Guards.md` **[COMPLETE]**
   - Add monitoring, diagnostics, readiness checks, and deployment safeguards
   - Build operator-facing failure visibility and release gates
   - Add infrastructure-focused regression and readiness checks
   - **Deliverables:**
     - [`Phase-4_Operational-Readiness-and-Handoff.md`](Phase-4_Operational-Readiness-and-Handoff.md) — Health endpoint interpretation, pre-deployment checklist, release go/no-go gates, failure triage runbook, telemetry event catalog, recommended alert rules, remaining blind spots

7. `Prompt-06_Final-Verification_and-Handoff.md` **[COMPLETE]**
   - Run the final verification pass
   - Produce handoff notes, unresolved items, and next-phase blockers
   - **Deliverables:**
     - [`Phase-4_Handoff.md`](Phase-4_Handoff.md) — Final verification results, success criteria assessment (all 6 met), 15 deliverables across prompts, 6 deferred items, 7 deployment prerequisites, 8 safe assumptions for later phases

8. `Prompt-07_Phase-4-Infrastructure-Architecture-Freeze-and-Deployment-Scope-Revalidation.md` **[COMPLETE]**
   - Re-verify Phase 4 audit findings against current repo truth
   - Classify infrastructure surfaces as canonical vs transitional vs documentary-only
   - Freeze the Project Setup infrastructure model in implementation terms
   - Update audit report with architecture freeze progress note and closure language
   - **Deliverables:**
     - Audit report progress note (P4-07): re-verification table, canonical/transitional classification, frozen infrastructure posture, updated Phase 4 status from "Partial to substantial" to "Substantially Closed"

9. `Prompt-08_Phase-4-Deployment-Scoped-Config-Validation-and-Health-Readiness-Alignment.md` **[COMPLETE]**
   - Re-verify config validation and health/readiness alignment against PS deployment boundary
   - Confirm all acceptance criteria already satisfied by P1-09, P4-02, P4-05
   - Document canonical validation scope, health mapping, and boot blocker absence
   - **Deliverables:**
     - Audit report progress note (P4-08): validation scope table, health/readiness mapping, over-broad boot blocker confirmation absent, environment-gated dependencies

10. `Prompt-09_Phase-4-CORS-Managed-Identity-and-Downstream-Permission-Scoping.md` **[COMPLETE]**
    - Re-verify CORS, managed identity, and downstream permission posture against PS deployment boundary
    - Confirm all acceptance criteria already satisfied by P1-09, P1-10, P4-03, P4-04, P4-07
    - Document CORS comparison (PS vs monolithic), MI service matrix, downstream dependency classification
    - **Deliverables:**
      - Audit report progress note (P4-09): CORS posture table, MI permission matrix (6 services), downstream dependency classification (5 canonical, 1 optional, 3 excluded/deferred), transitional surface labeling, least-privilege follow-up items

11. `Prompt-10_Phase-4-Observability-Operationalization-and-Readiness-Proof.md` **[COMPLETE]**
    - Audit all observability/readiness artifacts and classify into evidence categories
    - Add evidence classification guardrail to observability README
    - Document what is repo-proven vs deployment-dependent vs documentary-only
    - **Deliverables:**
      - Evidence classification section in `backend/functions/observability/README.md` (P4-10)
      - Audit report progress note (P4-10): 15-artifact evidence table, 6 repo-proven items, 6 deployment-dependent items, readiness guardrail description

12. `Prompt-11_Phase-4-Documentation-Reconciliation-and-Audit-Closure.md` **[COMPLETE]**
    - Reconcile Phase 4 assessment, cross-phase findings, gap analysis, and deferred inventory with P4-07–P4-10 results
    - Annotate stale "partially implemented" and "missing items" findings with resolution status
    - Downgrade CORS/MI/permissions from launch blocker to environment-gated prerequisite
    - **Deliverables:**
      - Audit report reconciliation (P4-11): 10 sections updated, Phase 4 substantially closed, blocker count reduced from 5 to 4

## Recommended use

- Run the prompts **in order**.
- Do **not** merge work from a later prompt until the acceptance criteria from the prior prompt are satisfied.
- Treat this package as **Phase 4 only**.
- Keep broad feature redesign, data-contract churn, or UX polish out of this phase unless a prompt explicitly allows a narrowly scoped enabling change.

## Governing intent for Phase 4

Phase 4 is complete only when all of the following are true:

- The Project Setup deployment has a **clearly scoped and production-safe infrastructure footprint**.
- Azure Functions startup, configuration validation, and service initialization are aligned to the actual deployment scope.
- Managed identity, storage, secrets, and connected-service dependencies are explicit, least-privilege, and production-appropriate.
- CORS, App Catalog / SharePoint / Graph permissions, and runtime service prerequisites are documented and enforced.
- Operators have release-readiness checks, diagnostics, and monitoring signals for the retained Project Setup infrastructure surface.
