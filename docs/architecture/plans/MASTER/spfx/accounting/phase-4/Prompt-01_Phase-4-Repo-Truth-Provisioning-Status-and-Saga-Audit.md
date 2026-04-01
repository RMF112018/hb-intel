# Prompt-01 — Phase 4 Repo-Truth Provisioning Status and Saga Audit

## Objective

Audit the current repo truth for the provisioning status model and saga interaction boundary, then write an evidence-based audit report that establishes the exact Phase 4 baseline.

This is an audit prompt, not a broad implementation prompt.

## Working Rules

- Treat the live repo as the authority.
- Do not re-read files that are still within your current context or memory unless needed to verify a contradiction, retrieve exact evidence, or inspect newly changed content.
- Prefer targeted, minimal edits unless broader restructuring is required by the prompt.
- Preserve package and app boundaries unless the prompt explicitly directs otherwise.
- Be explicit about repo fact vs inference vs unresolved issue.
- Do not silently change business semantics established in earlier phases. If you detect a contradiction, document it and resolve it deliberately.
- Do not assume the current status model is blank or unfinished; audit what exists first.

## Required Focus

Audit the current implementation for all of the following:

- provisioning launch path
- request → provisioning run → durable status correlation
- physical status persistence shape
- logical project-scoped read model
- status creation timing
- status update timing
- currentStep / overallStatus / step metadata semantics
- retry correlation behavior
- timer Step 5 follow-on behavior
- SignalR negotiate and event publication flow
- client store merge behavior
- polling / status endpoint behavior
- terminal-state cleanup behavior
- Admin direct status consumption
- Accounting indirect compatibility via request reconciliation and messaging
- any divergence between repo docs and implementation truth

## Required Files and Areas to Inspect

### Backend
- `backend/functions/src/functions/projectRequests/index.ts`
- `backend/functions/src/functions/provisioningSaga/index.ts`
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
- `backend/functions/src/functions/signalr/index.ts`
- `backend/functions/src/functions/timerFullSpec/handler.ts`
- `backend/functions/src/services/table-storage-service.ts`
- `backend/functions/src/services/signalr-push-service.ts`
- relevant provisioning saga tests if present

### Shared package / models
- `packages/models/src/provisioning/IProvisioning.ts`
- `packages/provisioning/src/api-client.ts`
- `packages/provisioning/src/store.ts`
- `packages/provisioning/src/hooks/useProvisioningSignalR.ts`
- `packages/provisioning/README.md`

### App consumers
- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
- `apps/admin/src/pages/ProvisioningOversightPage.tsx`
- `apps/admin/src/test/ProvisioningOversightPage.test.tsx`
- `apps/pwa/src/routes/provisioning/ProvisioningProgressView.tsx`
- `apps/pwa/src/hooks/provisioning/useProvisioningApi.ts`

### Docs
- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/spfx-surfaces/admin-recovery-boundary.md`
- `docs/reference/spfx-surfaces/controller-review-surface.md`
- `docs/reference/spfx-surfaces/estimating-requester-surface.md`
- `docs/reference/models/provisioning.md`
- `docs/explanation/provisioning-architecture.md`
- `docs/how-to/developer/spfx-signalr-auth.md`
- `docs/reference/provisioning/*`
- `docs/maintenance/*`

## Questions You Must Answer

1. What is the physical durable status persistence model today?
2. What is the logical project-scoped read model today?
3. Is the repo truth best described as:
   - one status row per project
   - one durable status row per run plus latest-run reads per project
   - some hybrid
4. What exact identifiers correlate:
   - request
   - run
   - durable status
5. What exact response is returned by launch and retry endpoints?
6. When and where is request state reconciled from provisioning status changes?
7. Which mutation paths reconcile request state correctly today, and which do not?
8. How do retry and timer follow-on behavior affect run identity and latest-run reads?
9. Which surfaces consume provisioning truth directly, and which consume it indirectly?
10. How does SignalR currently interact with authoritative status reads?
11. Where can request/status drift occur today?
12. Which current docs are materially stale or incomplete for Phase 4?

## Deliverables

Create an audit report at:

`docs/architecture/reviews/phase-4-provisioning-status-and-saga-audit.md`

## The Report Must Include

- Executive Summary
- Confirmed Repo Facts
- Confirmed Repo-Doc Intent
- Physical Persistence Model
- Logical Read Model
- Request / Run / Status Correlation Map
- Reconciliation Map
- SignalR / Polling / Client-Store Interaction Map
- Direct Consumer Map
- Indirect Compatibility Surface Map
- Identified Contradictions
- Unresolved Issues
- Recommended Implementation Targets for Prompt-02 through Prompt-05
- Exact Files Inspected

## Constraints

- Do not change code in this prompt unless a tiny mechanical correction is required to complete the audit report accurately.
- If you make any code or doc change, keep it minimal and explain why it was unavoidable.

## Completion Standard

This prompt is complete only when later prompts can rely on one evidence-backed baseline description of the live status/saga model instead of vague assumptions.
