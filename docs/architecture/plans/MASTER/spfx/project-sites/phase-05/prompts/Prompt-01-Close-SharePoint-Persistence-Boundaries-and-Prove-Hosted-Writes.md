# Prompt 01 — Close SharePoint Persistence Boundaries and Prove Hosted Writes

## Objective

Close the first durable hosted execution boundary for the legacy fallback lane by making `startSyncRun()` and the downstream hosted write path succeed and by proving that success with real hosted evidence.

## Current defect

The current repo no longer appears stuck at function registration, but the first durable write boundary remains the earliest unclosed runtime seam. `LegacyFallbackDiscoveryService.run()` calls `LegacyFallbackDiscoveryRepository.startSyncRun()` before project-index load, folder enumeration, or registry upserts. Until that boundary is proven in the hosted environment, the backend is not actually closed.

## Why it matters

A hosted lane that can register but cannot durably write its sync-run state is not operational. It cannot prove end-to-end success, and it cannot safely support downstream registry updates, review workflows, or repeatable operator validation.

## Repo seams in scope

- `backend/functions/src/functions/legacyFallbackDiscovery/index.ts`
- `backend/functions/src/services/legacy-fallback/discovery-service.ts`
- `backend/functions/src/services/legacy-fallback/discovery-repository.ts`
- `backend/functions/src/services/legacy-fallback/list-descriptors.ts`
- `scripts/provision-legacy-fallback-lists.ts`
- `docs/how-to/administrator/create-legacy-fallback-lists.md`
- `docs/how-to/administrator/run-legacy-fallback-discovery.md`

## Required future state

The hosted legacy fallback run can create a sync-run row, proceed into downstream discovery work, and complete with persisted sync-run and registry evidence. Any auth/config/list-schema problems encountered at this boundary are fixed in repo truth, not merely worked around in the portal.

## Required changes

1. Inspect the exact hosted failure mode at the first persistence boundary and identify whether the failure is caused by token acquisition, list addressing, field/schema mismatch, permissions, or payload shape.
2. Correct the code, schema descriptor, provisioning script, and/or runbook as needed so the first sync-run write succeeds.
3. Do not stop at “row created once.” Verify the lane can also update/completion-write the sync-run row and proceed into downstream registry behavior.
4. If a real repo-truth mismatch exists between descriptor-authoritative schema and repository payload shape, fix it now.
5. Back-port any required operational configuration into scripted/IaC-backed truth; do not rely on ad hoc portal-only state as closure.

## Must not change

Do not broaden this prompt into host narrowing, deployment-method reconciliation, or artifact minimization unless a tiny supporting change is strictly necessary to make hosted write proof truthful. Keep this prompt focused on the first durable SharePoint persistence boundary and the evidence that it is genuinely closed.

## Closure proof required

Return all of the following:
- exact root cause of the hosted write failure or uncertainty,
- files changed,
- the final sync-run write path after remediation,
- evidence of a hosted run that creates and completes a sync-run row,
- evidence that registry writes can occur after the sync-run start boundary,
- and a concise statement of what remained unchanged.

## Required deliverables

- code and/or schema fixes
- any necessary list-provisioning adjustments
- updated operator instructions if validation steps changed
- a short closure note explaining why this boundary is now closed

## Local operating instruction

Do **not** re-read files that are already in your active context or memory unless you need to confirm drift, dependencies, uncertainty, or post-change impact.
