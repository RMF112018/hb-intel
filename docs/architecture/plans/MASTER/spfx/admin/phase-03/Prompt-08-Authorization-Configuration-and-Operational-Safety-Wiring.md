# Prompt 08 — Authorization, Configuration, and Operational Safety Wiring

## Objective

Wire the generalized admin backend foundation into the repo’s authorization, configuration, and operational-safety posture so the new privileged backend surface is secure and supportable.

## Context efficiency rule

Do **not** re-read files that are still in your active context or memory unless they changed or this prompt explicitly requires a fresh comparison.

## Required repo-truth context

Read the smallest authoritative set necessary, including:

- the Phase 2 action/risk/config docs, if present in repo
- the Phase 3 host / API / adapter / orchestration docs created earlier in this phase
- the minimal auth middleware, env/config validation, and backend startup files needed to align with current repo patterns
- the project-setup host manifest for reference on startup config and auth posture

## Scope of work

1. Ensure the new generalized admin backend routes use the correct shared authz/authn middleware and permission checks.
2. Define and implement the minimum configuration wiring the new backend foundation needs.
3. Add operational-safety guardrails appropriate for Phase 3, such as:
   - explicit route scoping,
   - destructive-command barriers or TODO rails,
   - safe defaults,
   - startup validation,
   - clear error envelopes.
4. Record any required env vars, config dependencies, and safe fallback behavior.
5. Keep least-privilege and background-execution concerns visible in the implementation notes.

## Required outputs

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-3/admin-control-plane-authz-config-and-operational-safety-plan.md`

Implement the corresponding authz/config/safety wiring in repo.

The doc must include:
- route-level authz expectations,
- config dependencies,
- startup validation expectations,
- safety controls landed in Phase 3,
- and deferred controls for later phases.

## Implementation requirements

- Reuse shared auth middleware patterns rather than hand-rolled route auth.
- Keep configuration explicit and discoverable.
- Favor least privilege and app-only execution patterns where the backend is acting without a signed-in end user in the execution path.
- Make safety gaps explicit rather than silently leaving dangerous defaults.

## Documentation requirements

- Update backend README and related docs to reflect any new env/config requirements.
- Record any intentionally deferred high-risk safety maturity for later phases.

## Validation requirements

- Validate route protection, config loading, startup behavior, and failure messages.
- Add focused tests for auth/config guardrails where the repo already supports them.

## Acceptance / completion conditions

This prompt is complete when:
- the generalized admin backend surface is protected and configurable,
- Phase 3 safety controls are explicit,
- and later phases inherit a supportable privileged backend posture rather than an implicit one.

## No-go boundaries

- Do not attempt full later-phase safety UX maturity.
- Do not use over-broad Graph or backend permissions without documenting why.
- Do not leave route protection assumptions implicit.
