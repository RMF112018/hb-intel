# Prompt-05 — Phase 6: Cross-Surface Contract Verification

## Objective

Verify that the hardened Project Setup data contract works consistently across the repo surfaces that consume it, especially the Accounting review flow, provisioning lifecycle, and any requester-facing or admin-facing reads.

## Required work

1. Verify contract compatibility across:
   - Accounting app request queue/detail surfaces
   - backend request lifecycle handlers
   - provisioning status linkage
   - any requester/PWA reads of request records
   - any admin views dependent on request identity or status

2. Confirm that all consumers use the same semantics for:
   - `requestId`
   - `projectId`
   - `projectNumber`
   - request `state`
   - completion/site URL fields
   - clarification fields

3. Identify any consumer mismatches, stale assumptions, or hardcoded field expectations.

4. Fix or document any mismatches needed to make the contract safe across surfaces.

## Required report update

Append a cross-surface verification section to the Phase 6 review report summarizing:
- compatible consumers
- incompatible consumers
- fixes made
- any remaining controlled gaps
