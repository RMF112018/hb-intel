# Prompt-05 — Phase 2 Accounting Workflow Compatibility And Contract Verification

## Objective

Verify that the hardened backend contract actually supports the current Accounting controller workflow and identify the exact frontend follow-up items that should be deferred to Phase 3.

## Preconditions

- Prompt-04 is complete
- the backend contract is frozen and hardened

## Working Rules

- This is a compatibility and verification pass, not a frontend redesign phase.
- Do not re-read files already in active context unless needed to verify a contradiction or capture exact evidence.
- Only make frontend changes if a tiny compatibility fix is necessary to keep the repo internally consistent.
- Evaluate the live Accounting surface as it exists today, including the real `AwaitingExternalSetup` gap.

## Required Review Targets

```text
apps/accounting/src/pages/ProjectReviewQueuePage.tsx
apps/accounting/src/pages/ProjectReviewDetailPage.tsx
apps/accounting/src/router/routes.ts
packages/provisioning/src/api-client.ts
packages/provisioning/src/*
docs/reference/spfx-surfaces/controller-review-surface.md
docs/reference/provisioning/state-machine.md
docs/architecture/reviews/project-setup-accounting-phase-2-backend-lifecycle-hardening-report.md
```

Treat `docs/architecture/plans/PH6.11-Accounting-App.md` as historical comparison input rather than primary authority.

## Required Questions To Answer

1. Does the current Accounting UI still map cleanly to the hardened backend contract?
2. Is the `AwaitingExternalSetup` path backend-safe and clearly defined, even if the UI still lacks a forward action?
3. Does the UI require a new explicit final-launch action, or can it remain as-is under the frozen contract?
4. Are the status banners, labels, and action names still semantically correct?
5. What exact Phase 3 frontend work is required, and what is intentionally not part of Phase 2?

## Required Output

Update the Phase 2 report with dedicated sections:

- Accounting Workflow Compatibility Verification
- Required Phase 3 Frontend Follow-Ups
- No-Go Issues Remaining (if any)

If a tiny compatibility correction is made, document it clearly and keep it tightly scoped.

## Verification

Run the most relevant valid package-local checks:

```bash
pnpm --filter @hbc/spfx-accounting build
pnpm --filter @hbc/spfx-accounting lint
pnpm --filter @hbc/spfx-accounting test || true
pnpm --filter @hbc/provisioning check-types
```

Do not call a non-existent `check-types` script for `@hbc/spfx-accounting`.

## Acceptance Criteria

- the report clearly states whether the current Accounting surface is backend-compatible
- required Phase 3 frontend items are isolated and explicitly listed
- no backend ambiguity remains hidden behind frontend assumptions
