# Prompt 02 — Backend / Saga Remediation

You are acting as a senior backend workflow, SharePoint provisioning, lifecycle-state, and repo-truth remediation engineer for HB Intel.

## Objective

Using the validated findings from Prompt 01 only, implement the backend, repository, and saga fixes required to make the Monday-critical provisioning workflow materially correct and deliverable.

## Scope boundary

You are fixing only the Monday-critical backend path:

- project setup request submission / persistence
- request retrieval / scoping
- approval-to-provisioning handoff
- provisioning saga continuity
- timer continuity where needed
- backend behaviors directly required by Estimating, Accounting, and Admin saga surfaces

Do not broaden into general accounting-domain features or non-saga Phase 4 work.

## Important instruction

Do not re-read files that are still within your current context or memory.
Reuse active context when available.
Only open additional files when necessary to implement or verify a validated deficiency.

## Inputs

Use the validated deficiency register from Prompt 01 as the sole remediation authority.
If Prompt 01 invalidated a finding, do not fix it here.

## Primary files likely in scope

- `backend/functions/src/functions/projectRequests/index.ts`
- `backend/functions/src/services/project-requests-repository.ts`
- `backend/functions/src/functions/provisioningSaga/index.ts`
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
- `backend/functions/src/functions/timerFullSpec/handler.ts`
- `backend/functions/src/functions/provisioningSaga/steps/step5-web-parts.ts`
- `backend/functions/src/functions/provisioningSaga/steps/step6-permissions.ts`
- any closely related types / models / mappers required by the validated fixes

## Required work

### 1. Fix validated request persistence deficiencies
If validated in Prompt 01, make the request persistence path fully preserve all fields needed by:
- requester surfaces
- Accounting review surface
- Step 6 permissioning / group assignment
- downstream completion / continuity state

This includes fixing both:
- submission handler mapping
- repository upsert / read mapping

### 2. Fix validated requester scoping deficiencies
If validated in Prompt 01:
- support requester-scoped request retrieval on the backend
- support requester filtering in the repository
- preserve admin / controller visibility requirements
- ensure requester-facing flows can retrieve only the correct user records

### 3. Fix any validated backend continuity issues in the provisioning saga
Examples:
- incorrect state reconciliation
- missing data handoff into the saga
- incorrect timer-continuity handling
- incorrect admin action behavior
- any other validated backend defect that materially threatens Monday delivery

### 4. Keep risk low
Prefer minimal, targeted, repo-consistent fixes.
Do not redesign the architecture if targeted remediation is sufficient.

## Validation requirements during implementation

After changes are made:
- run the smallest relevant existing backend test suites first
- add or update focused backend tests for every validated defect you fix
- verify no regression in the approval-to-provisioning path
- verify no regression in timer / retry / failure paths touched by your changes

## Required deliverables

### 1. Code changes
Implement all validated Monday-critical backend fixes.

### 2. Focused backend tests
Add or update tests that prove:
- the validated defect existed before the fix or was unprotected before the fix
- the corrected behavior now works
- the saga continuity remains intact

### 3. Final report
Provide:
- exact files changed
- each validated deficiency fixed
- each validated deficiency intentionally not fixed, with rationale
- tests added / updated
- commands run
- pass / fail results
- any remaining Monday risk

## Guardrails

- Do not fix anything that Prompt 01 did not validate.
- Do not broaden into non-critical cleanup.
- Do not weaken authorization or scope boundaries to make tests easier.
- Keep the implementation aligned with repo-truth and current architecture seams.

If you discover a new blocker while implementing, validate it with evidence before changing scope.