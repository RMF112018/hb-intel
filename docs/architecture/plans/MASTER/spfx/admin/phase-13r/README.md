# README — Admin SPFx IT Control Center Phase 13 Prompt Package

## What this package contains

This package is a **local-code-agent execution set** for **Phase 13 — Production hardening and expansion rails** of the Admin SPFx IT Control Center effort.

Included files:

1. `Admin-SPFx-IT-Control-Center-Phase-13-Summary-Plan.md`
2. `README.md`
3. `Prompt-01-Phase-13-Production-Posture-and-Gap-Audit.md`
4. `Prompt-02-Phase-13-Release-Readiness-Baseline-and-Gates.md`
5. `Prompt-03-Phase-13-Environment-Identity-and-Dependency-Baseline.md`
6. `Prompt-04-Phase-13-Support-Model-and-Escalation-Matrix.md`
7. `Prompt-05-Phase-13-Deployment-and-Rollback-Runbooks.md`
8. `Prompt-06-Phase-13-Incident-Triage-Recovery-and-Break-Glass-Runbooks.md`
9. `Prompt-07-Phase-13-Operational-Doctrine-and-Service-Boundaries.md`
10. `Prompt-08-Phase-13-Expansion-Rails-Architecture.md`
11. `Prompt-09-Phase-13-Doc-Alignment-and-Production-Readiness-Package.md`
12. `Prompt-10-Phase-13-Validation-and-Exit-Reconciliation.md`

## Intended execution order

Run the prompt files in numeric order.

Do **not** skip forward unless repo truth discovered in Prompt-01 shows that a later prompt must be re-scoped before execution.

## How the local code agent should use these prompts

- Treat verified live repo state as present-truth authority.
- Use the smallest authoritative file set needed for each prompt.
- Do **not** re-read files that are still within active context or memory unless:
  - the file changed,
  - the prompt explicitly requires a fresh check,
  - or context became stale.
- Keep this phase focused on **productionization, supportability, operational doctrine, and expansion rails**.
- Avoid feature creep and avoid rewriting healthy earlier-phase artifacts unless they materially block production readiness.

## Required authority posture for the code agent

When sources disagree, use this order:

1. verified live code and configuration
2. current environment/deployment docs and runbooks in repo
3. `docs/architecture/blueprint/current-state-map.md`
4. completed admin phase docs already in repo
5. target architecture and end-state plan
6. older implementation plans or superseded notes

## Execution cautions

- This package is for **Phase 13 only**.
- Do not use this phase as an excuse to redesign the product.
- Do not broaden production scope to tenant-wide governance beyond what earlier phases established.
- Do not move privileged logic into SPFx for convenience.
- Do not write speculative “future production” content as if already implemented.
- Keep expansion rails clearly separated from current release scope.

## Expected repository outputs from executing this package

Expected outputs are mostly documentation and readiness artifacts under:

- `docs/architecture/plans/MASTER/spfx/admin/`
- `docs/architecture/plans/MASTER/spfx/admin/phase-13/`
- repo runbook / ops / support docs as appropriate

There may also be tightly scoped README or configuration-doc updates in:
- `apps/admin/`
- `packages/features/admin/`
- `backend/functions/`

## Validation posture

Use the smallest meaningful validation set.

Typical expectation:
- link and path verification
- reconciliation against current repo docs
- formatting checks for touched markdown/doc files if justified
- no broad workspace test runs by default for docs-only work unless the prompt explicitly requires it or touched code/config warrants it

## Completion standard

The package is complete when the repo has:
- one coherent production readiness package,
- one clear release-gate baseline,
- one clear support/escalation model,
- one usable production runbook set,
- one clear operational-doctrine set,
- one clear expansion-rails architecture,
- and one final exit reconciliation with residual risk disclosure.
