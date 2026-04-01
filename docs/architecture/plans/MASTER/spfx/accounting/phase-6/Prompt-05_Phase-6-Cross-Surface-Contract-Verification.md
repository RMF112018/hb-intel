# Prompt-05 — Phase 6: Cross-Surface Contract Verification

## Objective

Verify that the hardened Project Setup data contract works consistently across the repo surfaces that consume it, especially the Accounting review flow, backend request lifecycle, provisioning linkage, and shared client seams.

## Required work

1. Verify contract compatibility across:
   - Accounting app request queue/detail surfaces
   - backend request lifecycle handlers
   - provisioning launch linkage
   - shared provisioning client behavior
   - any requester/PWA/admin reads that depend on request identity or status

2. Confirm that all consumers use the same semantics for:
   - `requestId`
   - `projectId`
   - `projectNumber`
   - request `state`
   - completion/site URL fields
   - clarification fields

3. Identify any consumer mismatches, stale assumptions, or hardcoded field expectations.

4. Fix or document any mismatches needed to make the contract safe across surfaces.

## Minimum review targets

- `backend/functions/src/functions/projectRequests/index.ts`
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
- `packages/provisioning/src/api-client.ts`
- `apps/accounting/src/pages/ProjectReviewQueuePage.tsx`
- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
- `apps/accounting/src/router/routes.ts`
- any current docs that describe those consumer semantics

## Required report update

Append a cross-surface verification section to:

`docs/architecture/reviews/project-setup-phase-6-data-contract-and-schema-audit.md`

The section must summarize:
- compatible consumers
- incompatible consumers
- fixes made
- any remaining controlled gaps

## Acceptance criteria

- consumer semantics are explicit
- any mismatches are fixed or clearly documented
- no downstream consumer is left relying on unstated identifier or schema assumptions
