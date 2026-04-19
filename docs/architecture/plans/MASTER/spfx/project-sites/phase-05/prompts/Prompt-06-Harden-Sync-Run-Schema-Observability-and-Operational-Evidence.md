# Prompt 06 — Harden Sync-Run Schema, Observability, and Operational Evidence

## Objective

Promote the discovery service’s run-level operational truth into a stronger sync-run contract that is easier for operators to query, verify, and alert on.

## Current defect

The discovery service computes richer counters than the shared sync-run model, list descriptors, and repository write shape currently persist as first-class fields. Too much run truth is buried in `SummaryJson`.

## Why it matters

If an operator cannot easily query key counters from sync-run records, troubleshooting and run comparison become slower and less trustworthy. This weakens operational closure even after the hosted run works.

## Repo seams in scope

- `backend/functions/src/services/legacy-fallback/discovery-service.ts`
- `backend/functions/src/services/legacy-fallback/discovery-repository.ts`
- `backend/functions/src/services/legacy-fallback/list-descriptors.ts`
- `packages/models/src/provisioning/ILegacyProjectFallback.ts`
- `scripts/provision-legacy-fallback-lists.ts`
- any monitoring or runbook docs that should reference the hardened fields

## Required future state

The sync-run contract persists the run-level counters that matter operationally, and the repository/list/model/service all agree on that contract. Summary JSON can remain as a richer snapshot, but it is no longer the only place important counters live.

## Required changes

1. Decide which currently computed service counters must be persisted as first-class sync-run fields now.
2. Update the shared model, list descriptor, provisioning logic, and repository writes so they align.
3. Preserve backward tolerance for older rows where practical, but do not preserve an under-modeled current contract.
4. Update any monitoring or runbook references that should use the stronger fields.
5. Clean up comments that still describe the old weaker contract as sufficient.

## Must not change

Do not expand this into a generic analytics redesign. Keep the work bounded to sync-run operational evidence that is directly relevant to this lane.

## Closure proof required

Return:
- the final sync-run field set,
- files changed,
- how the old and new contracts differ,
- evidence from a real or controlled run showing the fields populated,
- and a short note on any backward-compatibility handling.

## Required deliverables

- updated model/list/repository/provisioning alignment
- any minimal monitoring/runbook updates
- sample evidence showing populated fields
- closure note explaining why the new contract is operationally stronger

## Local operating instruction

Do **not** re-read files that are already in your active context or memory unless you need to confirm drift, dependencies, uncertainty, or post-change impact.
