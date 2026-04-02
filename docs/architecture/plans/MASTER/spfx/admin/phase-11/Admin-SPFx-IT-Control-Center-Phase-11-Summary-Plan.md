# Admin SPFx IT Control Center — Phase 11 Summary Plan

## Purpose

Phase 11 implements the **high-risk action safety model** for the Admin SPFx IT Control Center.

Its purpose is to make single-admin operation of sensitive platform actions safe, deliberate, explainable, auditable, and recoverable without collapsing the frontend/backend boundary or turning high-risk actions into casual button clicks.

This phase should harden how risky admin actions are **classified, previewed, confirmed, executed, validated, and recovered from**.

## Governing basis

### End-state-plan directives carried into Phase 11
Phase 11 is defined in the attached end-state plan as the phase that must add:

- previews,
- dry runs,
- scoped execution,
- impact summaries,
- explicit destructive-action warnings,
- post-run validation,
- recovery guidance,

and must differentiate:

- routine actions,
- destructive actions,
- tenant-sensitive actions.

### Repo-truth signals that shape this phase
Current repo truth indicates:

- `apps/admin` exists, but today the operator surface is still relatively thin and centered more on access control / admin settings than a mature safety-oriented command system.
- `apps/admin/src/router/routes.ts` currently routes `/error-log` and `/provisioning-failures` through `SystemSettingsPage` sections rather than to durable dedicated Phase-11-grade safety workflows.
- `ProvisioningFailuresPage` already exists and is one of the clearest live candidates for first adoption of a high-risk safety framework.
- `ErrorLogPage` is still placeholder-level.
- `@hbc/features-admin` already exists and is the right home for **admin-intelligence and admin-domain UI/logic**, but not the privileged executor.
- `@hbc/ui-kit` is the right home for reusable visual safety primitives and risk-aware operator components.
- `@hbc/models` is the right place for shared types/enums/contracts that must be consumed by both frontend and backend.
- `backend/functions` already has real auth middleware, a service factory, Graph/SharePoint adapters, and a provisioning saga with retries, compensation, audit writes, and progress signaling.

## Major objectives

1. Define the canonical Phase 11 safety doctrine.
2. Introduce a stable risk-tier model for admin actions.
3. Define and implement a reusable safety contract model:
   - action classification,
   - preview / dry-run result shape,
   - impact summary,
   - required confirmation shape,
   - scope limits,
   - post-run validation result,
   - recovery guidance result.
4. Add backend enforcement so risky actions cannot bypass required safety rails.
5. Add operator-console UX patterns for:
   - preview,
   - dry-run review,
   - warnings,
   - scoped confirmation,
   - post-run validation,
   - recovery guidance.
6. Adopt the framework into the currently implemented admin actions that most naturally fit Phase 11, starting with provisioning-related operator actions and any already-live sensitive flows.
7. Produce documentation and validation proving that high-risk actions are no longer casual or opaque.

## What Phase 11 is really solving

Because the end-state plan allows **single authorized admin approval** for even high-risk actions, safety must come from:

- strong classification,
- explicit risk presentation,
- preview before commit,
- dry-run behavior where technically possible,
- scoped confirmation,
- durable evidence,
- post-run validation,
- recovery guidance,
- and backend enforcement that prevents UI bypass.

## In-scope repo/doc/code areas

### Code
- `apps/admin/**`
- `packages/features/admin/**`
- `packages/ui-kit/**`
- `packages/models/**`
- `backend/functions/**`

### Documentation
- `docs/architecture/plans/MASTER/spfx/admin/**`
- new Phase 11 docs under `docs/architecture/plans/MASTER/spfx/admin/phase-11/`
- local READMEs when boundaries, usage, or safety behavior materially change

## Expected deliverables

### Canonical docs
Under `docs/architecture/plans/MASTER/spfx/admin/phase-11/`:

1. `README.md`
2. `phase-11-repo-truth-and-dependency-audit.md`
3. `phase-11-safety-baseline.md`
4. `phase-11-risk-tier-and-action-classification.md`
5. `phase-11-preview-dry-run-and-confirmation-model.md`
6. `phase-11-post-run-validation-and-recovery-model.md`
7. `phase-11-adoption-map.md`
8. `phase-11-exit-reconciliation.md`

### Shared code outcomes
- shared safety types/contracts in `@hbc/models`
- reusable safety UI primitives in `@hbc/ui-kit`
- admin-domain safety composition in `@hbc/features-admin`
- backend safety enforcement and execution guards in `@hbc/functions`
- app-level adoption in `apps/admin`

## Recommended implementation sequence inside the phase

1. Audit repo truth and dependency reality.
2. Write the Phase 11 safety baseline and risk-tier doctrine.
3. Add shared contracts in `@hbc/models`.
4. Add backend safety enforcement, manifests, and policy gates.
5. Add preview/dry-run/impact-summary pipeline.
6. Add reusable UI-kit safety components and admin-domain composition.
7. Add destructive-action confirmation and checkpoint workflow behavior.
8. Add post-run validation, recovery guidance, and evidence capture.
9. Adopt the framework into currently live admin actions and reconcile routing.
10. Finish tests, docs, validation, and exit reconciliation.

## Key dependency reality and how to handle it

The current repo does **not** appear to have every earlier phase fully realized exactly as the end-state sequence assumes.

Therefore, Phase 11 implementation must follow this rule:

- **Do not backfill entire missing earlier phases.**
- **Do create the smallest forward-compatible seams necessary for Phase 11 to be coherent and enforceable.**

Examples:
- If the full live config/governance model from Phase 10 is not yet present, keep the safety policy registry code-defined first with a documented seam for future governed live overrides.
- If the full generalized audit spine from Phase 4 is not yet complete, attach safety evidence to the best current durable run/audit structures without inventing a parallel dead-end store.
- If SharePoint and Entra control lanes are not yet fully active, use provisioning-related actions and other live sensitive surfaces as the first adopters, while designing the framework so later domains can plug in cleanly.

## Risks Phase 11 is addressing

- single-admin high-risk actions becoming casual
- destructive actions lacking preview or scope clarity
- backend execution bypassing safety rails
- inconsistent warning/confirmation patterns across admin actions
- no durable evidence of what was previewed vs what was executed
- no standard post-run validation or recovery guidance
- UI-driven safety logic without backend enforcement
- phase drift that turns Phase 11 into ad hoc page work instead of a reusable framework

## Why Phase 11 must come before full production hardening

The end-state plan explicitly allows broad admin control and single-admin execution. Without Phase 11, those powers remain under-hardened even if the underlying actions technically work.

Production readiness requires risky operations to be:
- understandable before execution,
- constrained in scope,
- guarded by consistent patterns,
- and reviewable afterward.

## Acceptance criteria

Phase 11 is complete when all of the following are true:

- The repo has one canonical Phase 11 safety baseline.
- A stable risk-tier and action-classification system exists.
- Shared contracts exist for preview, dry-run, impact summary, confirmation, validation, and recovery guidance.
- Backend execution enforces required safety controls instead of trusting frontend-only behavior.
- Reusable UI safety patterns exist and are placed in the correct package boundaries.
- At least the currently live high-value admin actions adopt the safety framework in a real, testable way.
- Evidence of preview / confirmation / execution / validation is durable or attached to the best current durable store.
- Documentation and validation prove that high-risk actions are no longer casual or opaque.

## Explicit non-goals

Do **not** let Phase 11 become:
- a full rewrite of admin routing/IA beyond what adoption requires,
- a full backfill of Phases 2–10,
- a broad new tenant-governance wave,
- or a one-off provisioning-only UX patch without reusable safety architecture.
