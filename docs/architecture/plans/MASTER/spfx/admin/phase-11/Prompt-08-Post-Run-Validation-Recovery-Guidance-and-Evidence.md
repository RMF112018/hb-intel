# Prompt-08 — Post-Run Validation, Recovery Guidance, and Evidence

## Objective

Implement the post-execution hardening layer for Phase 11:
- post-run validation,
- recovery guidance,
- and durable safety evidence attachment.

## Important execution rules

- Prefer extending existing durable run/audit structures rather than inventing a parallel dead-end store.
- If current durable structures are incomplete, attach the smallest forward-compatible evidence representation possible and document the limitation.
- Keep recovery guidance honest; do not imply automatic rollback if only operator guidance is available.

## Scope of work

Add support for:
- action-specific post-run validation result capture,
- structured recovery guidance capture,
- evidence of what was previewed vs what was executed,
- evidence of who confirmed,
- evidence of scope used,
- evidence of warnings shown,
- evidence of validation outcome.

## Deliverables

1. Backend evidence/validation additions
2. Frontend/admin-domain display for validation and recovery guidance
3. Documentation:
   - `docs/architecture/plans/MASTER/spfx/admin/phase-11/phase-11-post-run-validation-and-recovery-model.md`

## Required outputs

The system should be able to show an operator, after a risky action:
- what was expected,
- what actually ran,
- whether validation passed,
- what follow-up checks are recommended,
- and what recovery guidance exists if the result is wrong or incomplete.

## Validation

Use the smallest justified validation set for touched packages, likely:
- `@hbc/functions`
- `@hbc/features-admin`
- `@hbc/spfx-admin`

## Completion condition

Stop after the evidence/validation/recovery layer, docs, and validation are complete.
