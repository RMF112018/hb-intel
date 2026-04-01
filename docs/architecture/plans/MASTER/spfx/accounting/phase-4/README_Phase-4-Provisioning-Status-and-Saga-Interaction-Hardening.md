# Phase 4 — Provisioning Status and Saga Interaction Hardening

## Package Purpose

This is the revised canonical Phase 4 prompt set for provisioning-status and saga-interaction hardening in the Project Setup workflow.

Phase 4 is a **status-model, runtime-interaction, and surface-compatibility hardening phase**. It is not a broad lifecycle redesign phase and it is not a general UI redesign phase.

Its job is to harden and document the real asynchronous execution-read boundary already present in the repo:

- saga launch
- durable status persistence
- request ↔ run ↔ status correlation
- realtime versus polling behavior
- timer-driven Step 5 follow-on behavior
- failure / retry / escalation / terminal semantics
- Admin direct consumption
- Accounting indirect compatibility

## Canonical Copy Rule

Treat the repo-relative package path as canonical **only if the package has been committed there in the current workspace**:

- `docs/architecture/plans/MASTER/spfx/accounting/phase-4/`

If the package being audited is only an attached artifact or local draft, say so directly.  
Do not hard-code workstation-specific paths.

## Authority Order

Every prompt in this package must use this authority order:

1. live repo code and tests
2. `docs/architecture/blueprint/current-state-map.md`
3. current living reference docs for provisioning, admin recovery, requester progress, and connected-service posture
4. older PH6 / historical plans as drift evidence only

Do not let historical planning language override the current implementation truth.

## Repo-Truth Baseline That Motivates Phase 4

The live repo currently shows all of the following:

- provisioning status is already a concrete typed contract in `packages/models/src/provisioning/IProvisioning.ts`
- Azure Table persistence currently stores **one durable status entity per run** using `projectId` + `correlationId`
- the project-scoped status endpoint returns the **latest run** for a project
- retries create a **new run identity** with a new `correlationId`
- the saga already writes durable status, reconciles request state, and publishes best-effort SignalR progress
- timer-driven Step 5 retries already update durable status and reconcile request state on terminal success/failure
- SignalR is already a best-effort enhancement layer, not the only source of truth
- Admin directly consumes provisioning status
- Accounting does **not** directly consume provisioning status; it relies on request-state reconciliation and status-compatible lifecycle messaging
- some admin-side status mutations can create request/status drift if not deliberately verified

These facts are the starting point for this package.

## Required Working Rules For Every Prompt

- Treat the live repo as authoritative for implementation facts.
- Do not assume the current prompt wording is correct just because it already exists.
- Do not re-read files already in active context unless needed to verify a contradiction, capture exact evidence, or confirm a change.
- Keep Phase 4 focused on status-model and runtime hardening, not broad redesign.
- Prefer minimal, well-scoped changes unless a prompt explicitly justifies broader restructuring.
- Preserve package and app boundaries unless a prompt explicitly authorizes a boundary change.
- Update docs as part of implementation, not as a separate afterthought.
- Distinguish clearly between:
  - confirmed repo fact
  - confirmed repo-doc intent
  - inferred conclusion
  - unresolved issue

## Package Files

- `Accounting_Phase4_Prompt_Audit_Report.md`
- `Phase-4_Provisioning-Status-and-Saga-Interaction-Hardening_Implementation-Plan.md`
- `Prompt-01_Phase-4-Repo-Truth-Provisioning-Status-and-Saga-Audit.md`
- `Prompt-02_Phase-4-Durable-Status-Contract-and-Run-Correlation-Hardening.md`
- `Prompt-03_Phase-4-SignalR-Polling-and-Client-Status-Consumption-Hardening.md`
- `Prompt-04_Phase-4-Failure-Terminal-State-and-Retry-Interaction-Hardening.md`
- `Prompt-05_Phase-4-Accounting-and-Admin-Status-Workflow-Compatibility-Verification.md`
- `Prompt-06_Phase-4-Final-Documentation-Reconciliation-and-Readiness-Report.md`

## Phase 4 Success Standard

Phase 4 is complete only when all of the following are true:

- the durable provisioning status model is explicit and correctly documented
- request, run, and status correlation is explicit and evidenced
- the adopted repo-truth model for status persistence versus latest-run reads is clearly stated
- SignalR behavior is hardened as an enhancement layer, not a competing source of truth
- polling/status endpoint behavior remains authoritative and safe
- timer-driven Step 5 follow-on behavior is coherent and documented
- failure, retry, escalation, terminal, archive, acknowledgment, and override behaviors are coherent
- Admin direct status consumption remains correct
- Accounting indirect compatibility remains correct without turning Accounting into a recovery console
- final docs reflect actual repo truth

## Important Consumer Distinction

Do not treat all surfaces as equivalent provisioning-status consumers.

### Direct consumers
- Admin provisioning oversight
- requester/PWA provisioning progress paths
- backend admin/status routes

### Indirect compatibility surface
- Accounting controller workflow via request-state reconciliation and lifecycle-compatible messaging

This distinction must remain visible throughout the phase.

## Execution Order

Run the prompts in numeric order:

1. Prompt-01
2. Prompt-02
3. Prompt-03
4. Prompt-04
5. Prompt-05
6. Prompt-06

Do not skip order. Each later prompt depends on the repo-truth decisions captured earlier.
