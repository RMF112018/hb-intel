# Prompt-06 — Operator Safety UX Primitives and Flow Patterns

## Objective

Build the reusable operator-side Phase 11 safety UX primitives and compose them into admin-domain workflow patterns without violating package boundaries.

## Important execution rules

- Put reusable visual primitives in `@hbc/ui-kit`.
- Put admin-domain composition and admin-specific workflow UI in `@hbc/features-admin`.
- Keep `apps/admin` focused on app integration and routing, not long-lived reusable component ownership.
- Do not create reusable visual safety components inside `apps/admin`.

## Inputs

Use:
- Phase 11 doctrine docs
- shared contracts
- preview pipeline results
- current `@hbc/ui-kit` and `@hbc/features-admin` structures

## Scope of work

Create reusable UI patterns for at least:
- risk badge / risk banner
- action summary card
- impact summary presentation
- preview result panel
- dry-run result panel
- destructive-action warning block
- scope confirmation step
- “what happens next” / post-run validation panel
- recovery-guidance panel
- evidence summary panel if appropriate

Then create admin-domain composition components/workflow wrappers that can orchestrate those primitives for real admin actions.

## Deliverables

1. Reusable UI primitives in `packages/ui-kit/**`
2. Admin-domain workflow composition in `packages/features/admin/**`
3. Documentation:
   - `docs/architecture/plans/MASTER/spfx/admin/phase-11/phase-11-operator-safety-ux.md`

## UX requirements

The UI must make risky actions feel:
- deliberate,
- bounded,
- understandable,
- and reviewable.

It must not:
- bury risk level,
- hide scope,
- or make destructive actions feel like trivial routine actions.

## Validation

Use the smallest justified set, likely:
- `pnpm --filter @hbc/ui-kit lint`
- `pnpm --filter @hbc/ui-kit check-types`
- `pnpm --filter @hbc/ui-kit test`
- `pnpm --filter @hbc/features-admin lint`
- `pnpm --filter @hbc/features-admin check-types`
- `pnpm --filter @hbc/features-admin test`

## Completion condition

Stop after the reusable primitives, admin composition, docs, and validation are complete.
