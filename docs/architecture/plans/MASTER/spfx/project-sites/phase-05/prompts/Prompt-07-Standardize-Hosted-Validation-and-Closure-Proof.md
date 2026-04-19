# Prompt 07 — Standardize Hosted Validation and Closure Proof

## Objective

Create one closure-grade hosted validation path for the legacy fallback backend so future claims of completion rely on the right evidence and in the right order.

## Current defect

The repo currently makes it too easy to confuse successful packaging or deployment with actual hosted closure. Registration proof, trigger-sync proof, persistence proof, and operator evidence are not yet standardized tightly enough.

## Why it matters

Without a single reusable hosted validation standard, this lane can regress or be declared “fixed” again on insufficient proof.

## Repo seams in scope

- `docs/how-to/administrator/run-legacy-fallback-discovery.md`
- `docs/how-to/administrator/legacy-fallback-production-readiness-checklist.md`
- `.github/workflows/deploy-functions.yml` if a reusable post-deploy validation step should be added or documented
- any scripts or templates used to collect hosted evidence
- monitoring and alert references if they are part of the validation standard

## Required future state

Operators have one standard sequence that proves: correct deployment path, correct route registration surface, successful hosted execution, sync-run persistence, registry writes, expected logs/telemetry, and reusable closure evidence.

## Required changes

1. Update the runbook/checklist so the validation order is explicit and hard to misuse.
2. Separate registration proof from business-success proof.
3. Require evidence of sync-run row creation/completion and registry writes, not just `/admin/functions`.
4. Provide a concise closure template or report format that future operators can reuse.
5. If a small helper script or standardized command block would materially improve repeatability, add it now.

## Must not change

Do not reopen architecture or packaging decisions here unless a tiny follow-on change is strictly required to make the validation standard truthful.

## Closure proof required

Return:
- exact commands or scripts used for hosted validation,
- exact evidence collected,
- files changed,
- the final reusable checklist/template,
- and a short statement of the new closure standard.

## Required deliverables

- updated runbook(s)
- updated production-readiness / closure checklist
- optional helper script if truly useful
- final closure template/report structure

## Local operating instruction

Do **not** re-read files that are already in your active context or memory unless you need to confirm drift, dependencies, uncertainty, or post-change impact.
