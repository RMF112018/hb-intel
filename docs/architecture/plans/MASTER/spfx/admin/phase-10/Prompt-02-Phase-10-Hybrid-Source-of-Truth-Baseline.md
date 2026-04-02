# Prompt-02 — Phase 10 Hybrid Source-of-Truth Baseline

## Objective

Create the canonical Phase 10 architecture baseline for **hybrid standards/configuration governance**.

This document must freeze what belongs in:
- code defaults,
- live admin-maintained config,
- infrastructure-controlled config,
- secret storage,
- config resolution,
- version/audit history,
- and run-time traceability.

## Important execution rules

- Do **not** re-read files still in active context unless needed.
- Use the Prompt-01 audit output as the immediate evidence base.
- Keep this document architecture-clear and implementation-useful.
- Do not over-pull Phase 11 safety work into this baseline.

## Inputs

Use:
- `docs/architecture/plans/MASTER/spfx/admin/phase-10/admin-spfx-phase-10-repo-truth-and-gap-audit.md`
- `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-it-control-center-end-state-plan.md`
- the verified repo files from Prompt-01

## Create

- `docs/architecture/plans/MASTER/spfx/admin/phase-10/admin-spfx-phase-10-hybrid-config-baseline.md`

## Required sections

1. **Purpose**
2. **Why Phase 10 exists**
3. **Current repo foundations**
4. **Canonical source-of-truth layers**
   - code defaults / registry
   - live admin-maintained overrides
   - infrastructure-controlled settings
   - secrets / key-vault-bound settings
5. **Allowed precedence order**
6. **Explicit non-editable categories**
7. **Resolution / provenance doctrine**
8. **Versioning and audit doctrine**
9. **Run-to-config traceability doctrine**
10. **Phase boundaries and non-goals**
11. **Cross-links to later implementation prompts**

## Required baseline decisions

Unless repo truth makes a correction necessary, the baseline must explicitly lock these points:

- Config item definitions and validation rules remain code-defined.
- Only a bounded subset of non-secret standards/config values are live-admin-editable.
- Infrastructure-only and secret settings remain outside live admin editing.
- Effective config must always carry provenance.
- Publish/revert/history behavior is mandatory for live-admin-maintained settings.
- Downstream admin runs must be able to record the effective config/version they consumed.
- The admin app is the operator surface; backend remains the privileged executor.

## Required explicit no-go statements

- no secrets in the live admin-maintained store
- no infrastructure-only env var editor disguised as “config governance”
- no SPFx-side privileged persistence logic
- no ambiguous effective-value computation
- no undocumented precedence between defaults and overrides

## Completion condition

Stop when the baseline doc is complete, internally consistent, and suitable to govern the rest of the phase.
