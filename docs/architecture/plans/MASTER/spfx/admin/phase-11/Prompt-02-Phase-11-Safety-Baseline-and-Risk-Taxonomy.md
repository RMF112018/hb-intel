# Prompt-02 — Phase 11 Safety Baseline and Risk Taxonomy

## Objective

Create the canonical doctrine for the Phase 11 safety model, including:
- the safety baseline,
- the risk-tier model,
- the action classification model,
- and the required safety rails per class of action.

## Important execution rules

- Use the Prompt-01 audit as the controlling repo-truth input.
- Do not invent a phase-wide framework that contradicts current package boundaries.
- Keep the doctrine reusable across provisioning, SharePoint control, Hybrid Identity control, and future admin domains.

## Inputs

Use:
- `docs/architecture/plans/MASTER/spfx/admin/phase-11/phase-11-repo-truth-and-dependency-audit.md`
- `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-target-architecture.md`
- the attached end-state plan direction for Phase 11

## Create

1. `docs/architecture/plans/MASTER/spfx/admin/phase-11/README.md`
2. `docs/architecture/plans/MASTER/spfx/admin/phase-11/phase-11-safety-baseline.md`
3. `docs/architecture/plans/MASTER/spfx/admin/phase-11/phase-11-risk-tier-and-action-classification.md`

## Required doctrine content

### In the safety baseline
Define:
- why Phase 11 exists,
- why single-admin operation requires strong safety rails,
- what the frontend owns vs what the backend owns,
- why backend enforcement is mandatory,
- how preview/dry-run/validation/recovery fit together,
- what “safe enough for single-admin execution” means in this product.

### In the risk-tier and action-classification doc
Define:
- routine actions,
- elevated actions,
- destructive actions,
- tenant-sensitive actions,
- optionally a “preview-only” or “advisory” class if repo truth supports it.

For each class, specify:
- whether preview is required,
- whether dry-run is required when technically possible,
- whether explicit confirmation is required,
- whether external checkpointing is required,
- whether post-run validation is required,
- whether recovery guidance is required,
- what evidence must be stored.

## Required quality bar

The classification must be explicit enough that a later code path can map an action to a required safety envelope without guesswork.

## Documentation constraints

- Keep the language developer-facing and operational.
- Use tables where they clarify requirements.
- Cross-link the new Phase 11 docs.

## Validation

Before finishing:
- confirm the docs do not contradict the repo audit,
- confirm they do not blur frontend safety UX with backend enforcement,
- confirm they are reusable and not provisioning-only.

## Completion condition

Stop after the doctrine docs are complete.
