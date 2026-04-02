# README — Admin SPFx IT Control Center Phase 7 Prompt Package

## What this package contains

This package is a **local-code-agent execution set** for:

**Phase 7 — Provisioning saga refinement and seamless rollout hardening**

Included files:

1. `Admin-SPFx-IT-Control-Center-Phase-7-Summary-Plan.md`
2. `README.md`
3. `Prompt-01-Phase-7-Repo-Truth-Audit-and-Gap-Map.md`
4. `Prompt-02-Provisioning-Hardening-Baseline-and-Artifact-Plan.md`
5. `Prompt-03-Prelaunch-Dependency-Validation-Hardening.md`
6. `Prompt-04-Straight-Through-Saga-Execution-and-Failure-Model.md`
7. `Prompt-05-Recovery-Repair-and-Operator-Guidance-Contracts.md`
8. `Prompt-06-Diagnostics-Telemetry-and-Evidence-Enrichment.md`
9. `Prompt-07-Install-Bootstrap-and-Entra-Readiness-Integration.md`
10. `Prompt-08-Provisioning-Package-and-Client-Surface-Alignment.md`
11. `Prompt-09-SPFx-Provisioning-Control-Center-UX-and-Route-Correction.md`
12. `Prompt-10-Docs-Runbooks-and-Validation-Reconciliation.md`

## Intended execution order

Run the prompt files in numeric order.

Do not skip ahead unless the earlier prompt explicitly says repo truth materially differs from the assumptions carried into this package.

## How the local code agent should use these prompts

- Treat the end-state plan and verified repo truth as the governing basis.
- Read the **smallest authoritative set** needed for each prompt.
- Do **not** re-read files still in active context or memory unless:
  - the file changed,
  - the prompt explicitly requires a fresh check,
  - the earlier understanding is stale,
  - or the task widened.
- Preserve healthy provisioning foundations instead of replacing them casually.
- Keep SPFx as the operator console and the backend as the privileged executor.
- Keep the package implementation-ready and repo-path-specific.

## Phase-specific cautions

- Phase 7 is **not** a blank-sheet provisioning rewrite.
- Do not move provisioning execution or platform-side retries into SPFx.
- Do not let Phase 7 collapse into Phase 12 observability completion work.
- Do not let the provisioning hardening work become a hidden SharePoint governance implementation for Phase 8.
- Do not blur Phase 7 recovery visibility with Phase 11 destructive-action safety framework unless a narrow compatibility hook is truly necessary.
- Do not preserve route drift just because it is currently wired.

## Repo-truth signals this package assumes

Unless the repo changed after this package was generated, the code agent should expect:

- `apps/admin/README.md` describes provisioning oversight and dashboards.
- `apps/admin/src/router/routes.ts` still exposes only a narrow route set and currently redirects provisioning/error experiences into `SystemSettingsPage`.
- `apps/admin/src/pages/ProvisioningFailuresPage.tsx` exists with retry/escalate actions.
- `backend/functions/src/functions/provisioningSaga/` exists with orchestrator, steps, and tests.
- `backend/functions/src/services/table-storage-service.ts` persists run state and supports failed-run and escalation operations.
- `backend/functions/README.md` already documents provisioning staging gates and prerequisite validation.
- `packages/features/admin/README.md` still reports in-memory/deferred limitations for several observability elements.

## Expected repo outputs

These prompts are expected to produce a mix of:

- provisioning saga/backend changes,
- targeted package/client changes,
- targeted SPFx admin changes,
- phase-7 documentation artifacts,
- README/runbook updates,
- and validation evidence.

## Validation posture

Use the smallest credible validation set for each prompt, but do not under-validate provisioning behavior.

Expected validation mix across the package:
- targeted unit tests for touched provisioning logic,
- targeted integration-style verification for run state and failure handling,
- targeted UI validation for corrected provisioning routes/pages,
- minimal formatting/lint/test commands appropriate to each touched area.

Do not default to running the entire monorepo unless a prompt specifically requires it.

## Completion standard

The package is complete when:
- the provisioning lane is more robust without losing straight-through normal execution,
- the admin operator experience is coherent and honest,
- failure visibility and guidance are materially improved,
- docs match the implemented behavior,
- and validation demonstrates that the rollout path is dependable.
