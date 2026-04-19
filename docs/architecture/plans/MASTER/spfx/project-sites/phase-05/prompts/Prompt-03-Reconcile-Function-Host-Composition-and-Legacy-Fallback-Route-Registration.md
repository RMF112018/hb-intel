# Prompt 03 — Reconcile Function Host Composition and Legacy Fallback Route Registration

## Objective

Make one explicit, repo-truth-correct decision about the authoritative host entrypoint for the legacy fallback lane and ensure every required legacy fallback route registers from that host.

## Current defect

The repo currently splits the relevant legacy fallback route surface across at least two composition paths: the shared default host (`backend/functions/src/index.ts`) and the admin-control-plane lane (`backend/functions/src/hosts/admin-control-plane/index.ts` via `functions/adminApi/index.ts`). Discovery routes and review/admin routes are not reconciled as one explicit hosted surface.

## Why it matters

If the repo documents one route surface but the chosen deploy artifact imports another, operators and audits can both be misled. This is a closure-grade defect because it affects what is actually running after deploy.

## Repo seams in scope

- `backend/functions/src/index.ts`
- `backend/functions/src/hosts/admin-control-plane/index.ts`
- `backend/functions/src/functions/adminApi/index.ts`
- `backend/functions/src/functions/adminApi/legacy-fallback-routes.ts`
- `backend/functions/src/functions/legacyFallbackDiscovery/index.ts`
- `backend/functions/package.json`
- `scripts/package-functions-artifact.ts`
- any release-scope docs that declare host boundaries

## Required future state

There is one explicit answer to the question “which host entrypoint is authoritative for the legacy fallback lane?” and the chosen answer is reflected in code, packaging, and documentation. Discovery routes and review/admin routes are either intentionally co-hosted or intentionally separated, but the result is explicit and provable.

## Required changes

1. Inspect the existing dedicated host pattern already present in the repo and choose the cleanest repo-fit solution.
2. Reconcile the discovery and review/admin route surfaces with that host decision.
3. Ensure the chosen host entrypoint imports exactly the route families that are required for the legacy fallback backend objective.
4. Update packaging references if the authoritative entrypoint changes.
5. Update comments and scope docs so the repo stops implying contradictory route-registration truth.

## Must not change

Do not turn this into a repo-wide backend domain split. Keep the work bounded to the legacy fallback lane and the minimum host-composition changes required to make its route surface truthful.

## Closure proof required

Return:
- the chosen authoritative host entrypoint and why it was chosen,
- files changed,
- the final list of legacy fallback routes expected from that host,
- proof that those routes register from the chosen host surface,
- and a concise note about what route families remain intentionally out of scope.

## Required deliverables

- host composition changes
- packaging/entrypoint updates if required
- updated comments/docs reflecting the authoritative host decision
- a closure note stating the final route-registration truth

## Local operating instruction

Do **not** re-read files that are already in your active context or memory unless you need to confirm drift, dependencies, uncertainty, or post-change impact.
