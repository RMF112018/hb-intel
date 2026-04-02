# Prompt-09 — First-Adopter Integration and Route Reconciliation

## Objective

Adopt the Phase 11 safety framework into the strongest currently implemented admin actions and reconcile routing/app integration so the framework is actually exercised in the live admin app.

## Important execution rules

- Use real current surfaces as first adopters.
- Do not wait for hypothetical later-domain pages if there are current actions that can adopt the safety framework now.
- Keep the adoption set honest and limited to what the repo currently supports.

## Required first-adopter review

Inspect the live/admin actions currently available and choose the best first adopters, prioritizing:
1. provisioning failure actions (`retry`, `escalate`, related operator interventions),
2. any currently live access-control / role-change admin actions if they fit the Phase 11 risk model,
3. any other current admin actions that are sensitive enough to justify the framework.

## Required route/app reconciliation

Inspect `apps/admin/src/router/routes.ts` and related app composition.
Reconcile any routing that still points placeholder routes back into `SystemSettingsPage` when a real Phase-11-adopted page/component should now be used.

Do this carefully:
- preserve working behavior,
- avoid broad IA rewrites,
- and route only what the repo is ready to support cleanly.

## Deliverables

1. Real first-adopter integrations in:
   - `apps/admin/**`
   - `packages/features/admin/**`
   - and backend/functions as required
2. A new doc:
   - `docs/architecture/plans/MASTER/spfx/admin/phase-11/phase-11-adoption-map.md`

## Required adoption-map content

For each adopted action, document:
- action name,
- risk tier,
- preview/dry-run behavior,
- confirmation requirement,
- validation behavior,
- evidence behavior,
- route/page integration point.

Also document:
- deferred actions,
- why they were deferred,
- and what dependency they need before adoption.

## Validation

Use the smallest meaningful set for touched packages, likely:
- `pnpm --filter @hbc/spfx-admin lint`
- `pnpm --filter @hbc/spfx-admin test`
- `pnpm --filter @hbc/spfx-admin build`
- plus any affected package-local checks

## Completion condition

Stop after first-adopter integration, route reconciliation, docs, and validation are complete.
