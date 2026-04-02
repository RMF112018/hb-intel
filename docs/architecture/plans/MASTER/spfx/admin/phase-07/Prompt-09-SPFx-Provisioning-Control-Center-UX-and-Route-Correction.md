# Prompt-09 — SPFx Provisioning Control-Center UX and Route Correction

## Objective

Turn the current provisioning operator experience in `apps/admin` into a coherent Phase 7 provisioning-control-center lane.

This prompt must fix route drift and improve operator usability without moving privileged logic into SPFx.

## Important execution rules

- Do not re-read files already in current context unless needed.
- Treat the backend as the source of truth for provisioning status/actions.
- Do not preserve misleading route indirection if dedicated provisioning UX now exists or should exist.
- Keep the UX focused on launch/readiness visibility, failure review, recovery actions, and run insight.

## Inputs

Use:
- `apps/admin/README.md`
- `apps/admin/src/router/routes.ts`
- `apps/admin/src/pages/ProvisioningFailuresPage.tsx`
- any other admin pages/components required for provisioning visibility
- provisioning package/client changes from Prompt-08
- all provisioning backend contract changes from earlier prompts

## Scope of work

Correct and improve the provisioning lane in the admin app, including as needed:

- route correctness,
- page/component wiring,
- provisioning failures inbox behavior,
- provisioning run detail/history visibility,
- operator guidance display,
- status/evidence display,
- retry/escalation interaction improvements,
- and honest empty/error/loading states.

## Minimum repo-truth issue to address

If still true at execution time:
- `apps/admin/README.md` and `routes.ts` are not aligned,
- and `/provisioning-failures` or `/error-log` are still indirectly mapped to `SystemSettingsPage`.

That drift must be explicitly resolved.

## Required implementation outcomes

1. The provisioning control-center experience is routed intentionally.
2. Operators can see clearer failure context and next-step guidance.
3. Recovery actions are not blind or contextless.
4. SPFx remains an operator console, not the execution engine.
5. Any README/page-label drift is corrected.

## Documentation requirement

Update:
- `apps/admin/README.md`

If needed, also create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-7/provisioning-control-center-ux-notes.md`

## Validation

Add/update targeted UI tests for touched provisioning pages/routes where the repo pattern supports it.
At minimum verify route behavior, empty states, and action wiring against the updated client/backend contracts.

## Completion condition

Stop after the provisioning UX/route work, docs, and tests are complete.
Do not do final reconciliation in this prompt.
