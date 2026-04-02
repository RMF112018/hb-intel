# README — Admin SPFx IT Control Center Phase 10 Prompt Package

## What this package is for

This package is the local-code-agent execution set for **Phase 10 — Live admin-maintained standards and configuration governance** of the Admin SPFx IT Control Center.

It is intended to be run **after** the foundational admin control-plane, operator console, and early domain surfaces are sufficiently in place to support a real standards/configuration lane.

## What this package contains

1. `Admin-SPFx-IT-Control-Center-Phase-10-Summary-Plan.md`
2. `README.md`
3. `Prompt-01-Phase-10-Repo-Truth-and-Configuration-Gap-Audit.md`
4. `Prompt-02-Phase-10-Hybrid-Source-of-Truth-Baseline.md`
5. `Prompt-03-Standards-and-Config-Taxonomy-Catalog.md`
6. `Prompt-04-Live-Config-Registry-Store-and-Provider-Abstractions.md`
7. `Prompt-05-Versioning-Audit-Diff-and-Concurrency-Model.md`
8. `Prompt-06-Resolution-Engine-and-Run-to-Config-Traceability.md`
9. `Prompt-07-Admin-API-and-Authorization-Boundaries.md`
10. `Prompt-08-Admin-SPFx-Standards-and-Configuration-Lane.md`
11. `Prompt-09-Seeding-Migration-and-Wave-0-Reconciliation.md`
12. `Prompt-10-Docs-Runbooks-and-Operational-Guidance.md`
13. `Prompt-11-Validation-and-Phase-10-Exit-Reconciliation.md`

## Intended execution order

Run the prompt files in numeric order.

Do not skip the early audit/baseline prompts. The later implementation prompts assume the hybrid source-of-truth boundary is already frozen.

## Required authority order for the code agent

When signals disagree, use this order:

1. verified live code and current config seams
2. `docs/architecture/blueprint/current-state-map.md`
3. attached / repo-carried admin end-state plan
4. existing configuration docs under `docs/reference/configuration/`
5. prior admin phase docs already landed in repo
6. older/historical plan text

## Critical execution posture

- Read the smallest authoritative set necessary for the current prompt.
- Do **not** re-read files still in active context or memory unless:
  - they changed,
  - context is stale,
  - or the current prompt explicitly requires a fresh check.
- Preserve healthy repo-native seams where they already exist.
- Do not push secrets into a live admin-editable store.
- Do not convert infrastructure-governed settings into business-editable settings just to simplify the UI.
- Do not let the SPFx admin surface become the privileged executor.
- Do not over-pull Phase 11 safety work into this phase.

## Strong implementation recommendation carried by this package

Unless repo truth uncovered during Prompt-01 materially contradicts it, implement Phase 10 with this posture:

- **Code registry / schema** remains authoritative for config item definitions and defaults.
- **Live override/version store** is built on the repo’s existing persistence pattern behind an abstraction.
- **Secrets and infrastructure-controlled settings** remain in environment / Key Vault / protected config, not in the live admin-maintained store.
- **Resolution service** computes the effective config and provenance.
- **Audit/history** captures all live changes and ties them to downstream runs.

This package prefers that path because it fits current repo truth and preserves future flexibility.

## Expected kinds of repo outputs

- new or updated backend config contracts, services, and APIs
- new or updated admin app routes/pages/components
- new or updated docs under:
  - `docs/architecture/plans/MASTER/spfx/admin/`
  - `docs/reference/configuration/`
  - related runbook/ops guidance areas

## Validation posture

Use the smallest credible validation set that still proves correctness.

Expected validation mix:
- targeted TypeScript/typecheck checks
- focused test additions for resolution/version/audit behavior
- targeted route/API tests
- docs/link reconciliation
- no broad workspace churn without cause

## Completion standard

The package is complete when the repo has:
- a canonical phase-10 baseline,
- a real governed live config model,
- version/audit/provenance behavior,
- an admin UI lane for standards/config governance,
- and reconciled configuration documentation without material contradiction.
