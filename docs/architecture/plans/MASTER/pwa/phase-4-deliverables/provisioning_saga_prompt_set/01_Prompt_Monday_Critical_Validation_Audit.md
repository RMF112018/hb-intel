# Prompt 01 — Monday-Critical Validation Audit

You are acting as a senior repo-truth, backend-workflow, SharePoint-provisioning, SPFx workflow-surface, and release-readiness reviewer for HB Intel.

## Objective

Conduct a focused, evidence-based validation audit of the Monday-critical path only:

1. the complete provisioning saga
2. the SPFx Estimating surface involved in that saga
3. the SPFx Accounting surface involved in that saga
4. the SPFx Admin surface involved in that saga

Your first job is to validate or invalidate the previously identified findings before any remediation work is planned or performed.

## Critical scope boundary

Do not broaden this review into general Phase 4 completion or broader accounting-domain maturity.
This audit is only about whether the provisioning saga and the three SPFx surfaces are truly ready for Monday delivery.

## Important instruction

Do not re-read files that are still within your current context or memory.
Reuse active context when available.
Only open additional files when they are necessary to validate a claim or resolve uncertainty.

## Governing repo-truth sources

Start from these governing documents and treat them as authority in this order for present-truth questions:

- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/plans/MASTER/README.md`
- `docs/architecture/plans/MASTER/05_Phase-4_Core-Business-Domain-Completion-Plan.md`
- `packages/provisioning/README.md`

## Monday-critical implementation files to validate

Backend / saga:
- `backend/functions/src/index.ts`
- `backend/functions/src/functions/provisioningSaga/index.ts`
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
- `backend/functions/src/functions/projectRequests/index.ts`
- `backend/functions/src/functions/timerFullSpec/handler.ts`
- `backend/functions/src/functions/signalr/index.ts`
- `backend/functions/src/functions/provisioningSaga/steps/step1-create-site.ts`
- `backend/functions/src/functions/provisioningSaga/steps/step4-data-lists.ts`
- `backend/functions/src/functions/provisioningSaga/steps/step5-web-parts.ts`
- `backend/functions/src/functions/provisioningSaga/steps/step6-permissions.ts`
- `backend/functions/src/services/service-factory.ts`
- `backend/functions/src/services/project-requests-repository.ts`
- `backend/functions/src/services/sharepoint-service.ts`
- `backend/functions/src/services/signalr-push-service.ts`
- `backend/functions/src/utils/validate-config.ts`

SPFx surfaces:
- `apps/estimating/src/pages/NewRequestPage.tsx`
- `apps/estimating/src/pages/RequestDetailPage.tsx`
- `apps/accounting/src/pages/ProjectReviewQueuePage.tsx`
- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
- `apps/admin/src/pages/ProvisioningOversightPage.tsx`

Relevant existing tests:
- `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx`
- any other directly related provisioning / estimating / admin tests you find necessary

## Findings to validate explicitly

Validate each of the following claims individually. Do not assume they are true just because they were flagged previously.

1. Request persistence is incomplete relative to the fields submitted by the requester surfaces and/or fields needed by Accounting review and Step 6 permissioning.
2. Requester scoping is incomplete or incorrect:
   - backend list handler does not honor requester scoping
   - repository does not support requester filtering
   - requester-side flows rely on globally listed requests
3. The provisioning saga is not fully compensation-complete because Entra ID group cleanup is not implemented.
4. Step 5 and timer continuity are implemented correctly or incorrectly for the Monday-critical path.
5. The Accounting review approval test path is stale or misaligned with current project-number approval behavior.
6. Any additional Monday-critical deficiencies that materially threaten the provisioning saga or the three SPFx surfaces.

## Required validation method

For each claim:
- classify it as one of:
  - `VALIDATED`
  - `PARTIALLY VALIDATED`
  - `NOT VALIDATED`
- cite exact file and line evidence
- explain why the finding matters to Monday delivery
- rate severity:
  - `Blocker`
  - `High`
  - `Medium`
  - `Low`
- distinguish:
  - true defect
  - acceptable design choice
  - non-critical technical debt
  - documentation / test drift only

## Required outputs

Produce all of the following in your final response:

### 1. Validation matrix
A table with:
- finding ID
- finding statement
- validation status
- severity
- affected files
- evidence summary
- Monday relevance

### 2. Deficiency register
A concise ordered list of only the findings that are both:
- validated or partially validated
- materially relevant to Monday delivery

### 3. Recommended remediation order
Give the exact order in which the validated Monday-critical deficiencies should be fixed.

### 4. “Do not fix before Monday” list
Explicitly identify anything you believe should not be touched before Monday because it is:
- not validated
- not critical
- too risky relative to value
- better deferred

## Guardrails

- Do not make code changes in this prompt unless a tiny validation aid is absolutely required.
- Do not overclaim.
- If a previously identified concern turns out to be incorrect, say so clearly and remove it from the deficiency set.
- Focus on the real Monday delivery path, not theoretical completeness.

At the end, include a short “Ready for remediation” section that lists the exact validated issues the next prompt should address and nothing else.