# README — Admin SPFx IT Control Center Phase 11 Prompt Package

## What this package is

This package contains a **complete local-code-agent prompt set** for **Phase 11 — High-risk action safety model** of the Admin SPFx IT Control Center effort.

It is designed to be executed against the live repo in the order provided.

## Files included

1. `Admin-SPFx-IT-Control-Center-Phase-11-Summary-Plan.md`
2. `README.md`
3. `Prompt-01-Phase-11-Repo-Truth-and-Dependency-Audit.md`
4. `Prompt-02-Phase-11-Safety-Baseline-and-Risk-Taxonomy.md`
5. `Prompt-03-Shared-Safety-Contracts-and-Model-Placement.md`
6. `Prompt-04-Backend-Safety-Policy-and-Enforcement-Rails.md`
7. `Prompt-05-Preview-Dry-Run-and-Impact-Summary-Pipeline.md`
8. `Prompt-06-Operator-Safety-UX-Primitives-and-Flow-Patterns.md`
9. `Prompt-07-Destructive-Action-Confirmation-and-Checkpoint-Execution.md`
10. `Prompt-08-Post-Run-Validation-Recovery-Guidance-and-Evidence.md`
11. `Prompt-09-First-Adopter-Integration-and-Route-Reconciliation.md`
12. `Prompt-10-Tests-Docs-and-Phase-11-Exit-Reconciliation.md`

## Deliverables produced

| Prompt | Deliverable | Status |
|--------|-------------|--------|
| P11-01 | `phase-11-repo-truth-and-dependency-audit.md` | Complete |
| P11-02 | `phase-11-safety-baseline.md` | Complete |
| P11-02 | `phase-11-risk-tier-and-action-classification.md` | Complete |
| P11-03 | `phase-11-preview-dry-run-and-confirmation-model.md` + shared contracts in `@hbc/models` | Complete |
| P11-04 | `phase-11-backend-safety-enforcement.md` + safety-policy-registry + safety-action-catalog + 40 tests | Complete |
| P11-05 | `phase-11-preview-pipeline.md` + safety-preview-service + useActionSafetyPreview hook + 16 tests | Complete |
| P11-06 | Operator safety UX primitives | Pending |
| P11-07 | Destructive-action confirmation and checkpoint execution | Pending |
| P11-08 | Post-run validation, recovery guidance, and evidence | Pending |
| P11-09 | First-adopter integration and route reconciliation | Pending |
| P11-10 | `phase-11-exit-reconciliation.md` | Pending |

## Intended execution order

Run the prompts in numeric order.

Do not skip the repo-truth and dependency audit. Phase 11 depends on earlier architectural work, but current repo reality may not perfectly match the ideal phase sequence from the end-state plan. The first prompt establishes what is actually available and what must be minimally shimmed for Phase 11 to be coherent.

## Core execution assumptions

- Treat `docs/architecture/blueprint/current-state-map.md` and verified live code as present-truth authority.
- Treat the attached Admin SPFx end-state plan as the governing product destination and phase intent.
- Read only the smallest authoritative set needed for the current task.
- Do **not** re-read files that are still in current context or memory unless:
  - they changed,
  - context is stale,
  - the prompt explicitly requires a fresh check,
  - or the task scope widened.

## Architectural guardrails

- Do not move privileged execution into SPFx.
- Do not make `@hbc/features-admin` the privileged control plane.
- Put shared contracts in `@hbc/models` where both frontend and backend need them.
- Put reusable visual safety primitives in `@hbc/ui-kit`.
- Put admin-domain composition and admin-specific safety workflow UI/logic in `@hbc/features-admin`.
- Put execution gating, enforcement, durable evidence, and backend safety policy in `backend/functions`.
- Reuse the provisioning saga/control-plane pattern where healthy instead of inventing a parallel orchestration style.

## Dependency-handling rule

If earlier-phase foundations are incomplete:

- create the **smallest forward-compatible seam** necessary,
- document the variance,
- and keep Phase 11 focused on safety model delivery.

Do not backfill whole earlier phases unless a prompt explicitly requires a minimal subset for correctness.

## Validation posture

Use the smallest meaningful verification set first.

Likely package-level checks during this phase include:
- `pnpm --filter @hbc/models lint`
- `pnpm --filter @hbc/models check-types`
- `pnpm --filter @hbc/ui-kit lint`
- `pnpm --filter @hbc/ui-kit check-types`
- `pnpm --filter @hbc/ui-kit test`
- `pnpm --filter @hbc/features-admin lint`
- `pnpm --filter @hbc/features-admin check-types`
- `pnpm --filter @hbc/features-admin test`
- `pnpm --filter @hbc/functions check-types`
- `pnpm --filter @hbc/functions test`
- `pnpm --filter @hbc/spfx-admin lint`
- `pnpm --filter @hbc/spfx-admin test`
- `pnpm --filter @hbc/spfx-admin build`
- `pnpm format:check`

Use only the subset justified by the files changed in each step.

## Completion standard

The phase is complete when the repo contains:
- a coherent safety baseline,
- a reusable risk-tier model,
- backend-enforced safety rails,
- reusable frontend safety patterns,
- real first-adopter integrations,
- and exit reconciliation documenting what was implemented, what was validated, and what remains intentionally future-facing.
