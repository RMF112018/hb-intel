# Prompt-01 — Phase 2 Backend Lifecycle Repo-Truth And Gap Audit

## Objective

Conduct a comprehensive repo-truth audit of the Project Setup backend lifecycle and provisioning-launch behavior so Phase 2 begins from verified implementation reality rather than PH6-era assumptions.

This audit must explicitly distinguish between:

- the **project setup request-state lifecycle**
- the **provisioning run / durable status lifecycle**

Do not treat them as interchangeable.

## Required Working Rules

- Treat the live repo as authoritative.
- Use `docs/architecture/blueprint/current-state-map.md` and current living references before PH6 and older MVP task plans.
- Do not re-read files already in active context unless needed to verify a contradiction or capture exact evidence.
- Do not implement behavior changes in this prompt unless an extremely small correction is necessary to complete the audit safely.
- Distinguish clearly between:
  - confirmed repo fact
  - confirmed repo-doc intent
  - contradiction
  - unresolved issue
- Be precise, but do not confuse historical documentation with current authority.

## Primary Audit Targets

Review at minimum:

```text
backend/functions/src/functions/projectRequests/index.ts
backend/functions/src/functions/provisioningSaga/index.ts
backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts
backend/functions/src/functions/provisioningSaga/steps/*
backend/functions/src/state-machine.ts
backend/functions/src/hosts/project-setup/index.ts
backend/functions/src/hosts/project-setup/service-factory.ts
backend/functions/src/services/project-requests-repository.ts
backend/functions/src/services/table-storage-service.ts
backend/functions/src/middleware/auth.ts
backend/functions/src/middleware/authorization.ts
backend/functions/package.json
packages/provisioning/src/*
apps/accounting/src/pages/ProjectReviewQueuePage.tsx
apps/accounting/src/pages/ProjectReviewDetailPage.tsx
apps/accounting/src/router/routes.ts
apps/accounting/package.json
docs/architecture/blueprint/current-state-map.md
docs/reference/spfx-surfaces/controller-review-surface.md
docs/reference/spfx-surfaces/admin-recovery-boundary.md
docs/reference/spfx-surfaces/coordinator-visibility-spec.md
docs/reference/provisioning/state-machine.md
docs/reference/provisioning/saga-steps.md
docs/reference/provisioning/verification-matrix.md
docs/reference/developer/project-setup-connected-service-posture.md
docs/maintenance/provisioning-runbook.md
```

Review the following as likely historical drift sources rather than primary authority:

```text
docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md
docs/architecture/plans/PH6.11-Accounting-App.md
docs/architecture/plans/MVP/project-setup/MVP-Project-Setup-T03-Controller-Gate-and-Request-Orchestration.md
docs/architecture/plans/MVP/project-setup/MVP-Project-Setup-T05-Provisioning-Orchestrator-and-Status.md
```

## Required Questions To Answer

1. What exact **request-state** transitions are implemented today?
2. What exact **provisioning run / status** transitions are implemented today?
3. What exact backend event currently starts the provisioning saga for the controller workflow?
4. What other launch entry points exist today besides controller approval?
5. Does the backend preserve a meaningful distinction between `ReadyToProvision` and `Provisioning`, or is one effectively transitional in practice?
6. What Accounting actions exist today that rely on backend support?
7. Where does the current backend contract leave the Accounting UI in a dead end or ambiguous state?
8. Which server-side validations are implemented today?
9. Which validations described in repo docs are missing, partial, or overstated in code?
10. What duplicate-run protections exist today?
11. What durable request/run/status correlation exists today?
12. What documentation is materially out of sync with repo truth?

## Required Output

Create or update:

```text
docs/architecture/reviews/project-setup-accounting-phase-2-backend-lifecycle-hardening-report.md
```

If the report does not exist yet, create it in this prompt. Treat that as an expected deliverable, not a repository defect.

The report must include:

- Executive Summary
- Confirmed Repo Facts
- Confirmed Repo-Doc Intent
- Request-State Model Versus Provisioning-Run Model
- Lifecycle / Trigger Contradictions
- Backend Validation Inventory
- Idempotency / Duplicate-Run Inventory
- Accounting Compatibility Risks
- Stale Authority Paths And Why They Are Stale
- Recommended Phase 2 Remediation Order
- Explicit Unresolved Questions

## Constraints

- Do not hand-wave.
- Quote exact paths and symbols.
- Where implementation and docs disagree, say so directly.
- Focus on backend lifecycle truth and compatibility risk, not frontend redesign.

## Verification

Run or perform the equivalent of:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test || true
pnpm --filter @hbc/provisioning check-types
```

If commands fail, capture the exact failure meaning in the report.

## Acceptance Criteria

- a single authoritative Phase 2 audit report exists
- the current controller-facing provisioning trigger point is explicitly identified
- request-state and provisioning-run-state models are explicitly distinguished
- lifecycle contradictions are explicitly documented
- stale authority paths are explicitly classified
- the report clearly states what must be fixed in Prompt-02
