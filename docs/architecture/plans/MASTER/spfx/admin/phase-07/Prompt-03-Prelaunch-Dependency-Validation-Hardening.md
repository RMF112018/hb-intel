# Prompt-03 — Prelaunch Dependency Validation Hardening

## Objective

Harden provisioning dependency validation so the system catches more rollout blockers **before** or **at** launch with actionable operator-facing explanations.

## Important execution rules

- Do not re-read files already in current context unless needed.
- Build on existing prerequisite/gating behavior instead of replacing it casually.
- Keep validation logic in the backend/control-plane boundary.
- Preserve straight-through execution for healthy runs.

## Inputs

Use:
- `backend/functions/README.md`
- `backend/functions/src/functions/provisioningSaga/**`
- `backend/functions/src/services/sharepoint-service.ts`
- `backend/functions/src/services/graph-service.ts`
- any existing prerequisite-validation helpers
- the Phase 7 hardening baseline and artifact plan

## Scope of work

Implement or refine backend-side dependency validation for provisioning launch, covering the most material rollout blockers such as:

- missing or invalid environment gates,
- missing app catalog/package prerequisites,
- missing SharePoint prerequisites,
- missing Entra/group prerequisites or confirmations,
- malformed or incomplete request data,
- and any current launch-time assumptions that should be checked explicitly.

## Required implementation outcomes

1. A clear, typed validation result model for provisioning launch readiness.
2. Failure codes / categories that are operator-meaningful.
3. Aggregated prerequisite failure reporting where that improves operator clarity.
4. No hidden launch into the saga when prerequisites are already known to fail.
5. Compatibility with existing straight-through run launch behavior when prerequisites are satisfied.

## Documentation requirement

Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-7/provisioning-prelaunch-validation-model.md`

It must document:
- validation categories,
- when launch is blocked,
- what evidence is returned,
- and how operators should interpret failures.

## Validation

Add or update targeted tests proving:
- valid requests still launch,
- invalid prerequisites fail early,
- error payloads are stable and actionable,
- and no privileged action is shifted into SPFx.

Run only the smallest credible backend test set for touched files.

## Completion condition

Stop after the backend validation hardening, doc, and tests are complete.
Do not yet redesign failure recovery semantics in this prompt.
