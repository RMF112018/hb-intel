# README — Admin SPFx IT Control Center Phase 9 Prompt Package

## What this package contains

This package is a **local-code-agent implementation set** for **Phase 9 — Broad Entra administration foundation**.

Included files:

1. `Admin-SPFx-IT-Control-Center-Phase-9-Summary-Plan.md`
2. `README.md`
3. `Prompt-01-Phase-9-Repo-Truth-Prerequisites-and-Gap-Map.md`
4. `Prompt-02-Phase-9-Entra-Architecture-Baseline-and-Scope.md`
5. `Prompt-03-Identity-Action-Catalog-Risk-Taxonomy-and-Permission-Matrix.md`
6. `Prompt-04-Graph-Service-Expansion-and-Test-Hardening.md`
7. `Prompt-05-Entra-Backend-Contracts-Models-and-Workflow-Primitives.md`
8. `Prompt-06-User-Administration-Workflows.md`
9. `Prompt-07-Group-Administration-Workflows.md`
10. `Prompt-08-Admin-SPFx-Entra-Control-Lane-and-Routing.md`
11. `Prompt-09-Operator-Safety-Preview-Audit-and-History-UX.md`
12. `Prompt-10-Docs-Runbooks-Env-Guidance-and-README-Alignment.md`
13. `Prompt-11-Validation-Reconciliation-and-Phase-9-Exit.md`

## Intended execution order

Run the prompts in numeric order.

Do not skip ahead unless a prompt explicitly says to stop because repo truth has materially changed and later prompts would become unsafe.

## How the local code agent should use these prompts

- Treat current live repo code and `docs/architecture/blueprint/current-state-map.md` as present-truth authority.
- Use the smallest authoritative file set necessary for each prompt.
- Do **not** re-read files that are still within active context or memory unless:
  - they changed,
  - the prompt explicitly requires a fresh check,
  - the context has gone stale,
  - or the task widened materially.
- Keep the phase boundary intact: build the Entra foundation without backfilling unrelated phases.
- Prefer existing repo patterns over inventing a new architecture if the repo already has a sound precedent.

## Key assumptions

- Phase 9 is allowed to build real backend and frontend capability, unlike Phase 1 which was doctrine-first.
- The repo may still lack generalized admin-run contracts from earlier idealized phases. If so, implement the smallest clean phase-local substrate needed for Phase 9 without pretending the whole broader admin control plane is complete.
- Existing provisioning/orchestration patterns are seeds to extend, not discard.
- Microsoft Graph production work should prefer stable v1.0 APIs and least-privileged permissions unless a documented exception is genuinely required.

## Execution cautions

- Do not place privileged Graph execution in SPFx.
- Do not let `@hbc/features-admin` become the privileged control plane.
- Do not request or depend on broader Graph permissions than the action matrix requires.
- Do not lump all user and group actions into one unstructured endpoint or one generic UI page.
- Do not treat rollout-critical identity actions and broader identity administration as identical-risk operations.
- Do not ship destructive identity actions without corresponding audit/evidence behavior and clear guardrails.

## Prerequisite validation expectation

Prompt 01 is expected to verify:
- current repo state,
- existing admin shell reality,
- existing Graph service reality,
- any missing prerequisites that materially affect Phase 9,
- and the exact gap map that the rest of the package will close.

## Expected repository outputs

### Documentation
Phase 9 docs under:
- `docs/architecture/plans/MASTER/spfx/admin/phase-9/`

### Frontend
Primarily under:
- `apps/admin/**`

### Backend
Primarily under:
- `backend/functions/**`

### Reusable admin package
Only where necessary:
- `packages/features/admin/**`

## Validation posture

Use the smallest meaningful validation set for each prompt, but unlike pure-doc phases, this phase is expected to include real code changes and therefore real tests.

Likely validation includes:
- focused unit tests,
- route/build checks where applicable,
- TypeScript correctness,
- and final phase reconciliation.

## Completion standard

The package is complete when the Admin app can execute real broad Entra user/group administration through the privileged backend with:
- a dedicated Entra control lane,
- action/risk separation,
- explicit permission/role posture,
- and audit-backed operator workflows.
