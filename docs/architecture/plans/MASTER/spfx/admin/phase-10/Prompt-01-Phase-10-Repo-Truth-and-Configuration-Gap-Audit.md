# Prompt-01 — Phase 10 Repo Truth and Configuration Gap Audit

## Objective

Audit the current repo state for standards/configuration governance and produce a focused Phase 10 gap map before implementation begins.

This prompt is an evidence and scoping prompt first. It must prevent blind implementation against stale assumptions.

## Important execution rules

- Read the **smallest authoritative set** needed.
- Do **not** re-read files already in current context unless they changed or the prompt requires a fresh check.
- Do not begin Phase 10 implementation in this prompt.
- Do not assume Azure App Configuration is already live in the repo unless verified.
- Distinguish clearly between:
  - confirmed repo fact,
  - confirmed admin end-state plan requirement,
  - drift/inconsistency,
  - recommendation.

## Required authority set

Read and verify at minimum:

1. `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-it-control-center-end-state-plan.md`
2. `docs/architecture/blueprint/current-state-map.md`
3. `backend/functions/src/config/wave0-env-registry.ts`
4. `backend/functions/src/utils/validate-config.ts`
5. `docs/reference/configuration/wave-0-config-registry.md`
6. `docs/reference/configuration/sites-selected-validation.md`
7. `docs/architecture/plans/MVP/G1/W0-G1-Contracts-and-Configuration-Plan.md`
8. `backend/functions/src/services/service-factory.ts`
9. `backend/functions/src/services/table-storage-service.ts`
10. `apps/admin/src/App.tsx`
11. `apps/admin/src/router/routes.ts`
12. `apps/admin/src/pages/SystemSettingsPage.tsx`
13. `packages/features/admin/README.md`
14. any existing admin phase docs already landed under `docs/architecture/plans/MASTER/spfx/admin/phase-*` that materially affect config governance

## Required work

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-10/admin-spfx-phase-10-repo-truth-and-gap-audit.md`

## Required sections in the new file

1. **Purpose**
2. **Authority set actually used**
3. **Confirmed repo facts**
4. **Confirmed existing config foundations**
5. **Confirmed drift / contradictions**
6. **Confirmed missing Phase 10 capabilities**
7. **Explicit non-gaps**
8. **Recommended implementation posture for Phase 10**
9. **Open questions to defer beyond this prompt**

## Minimum facts that must be checked and recorded if still true

- There is already a typed wave-0 environment registry.
- There is already startup/config validation logic.
- The current config reference docs are at least partially environment-registry-oriented.
- At least one material doc/code drift exists if the reference doc no longer matches current code.
- There is not yet a true admin-maintained live override/version/audit system for standards/configuration.
- The admin app still lacks a dedicated standards/configuration operator lane.
- Existing persistence and backend foundations suggest extending current app-data patterns instead of starting from zero.

## Required drift check

You must explicitly compare:
- `backend/functions/src/config/wave0-env-registry.ts`
vs
- `docs/reference/configuration/wave-0-config-registry.md`

Record every material mismatch that matters to Phase 10.

## Completion condition

Stop when the audit doc is complete and clearly separates:
- existing foundations,
- drift,
- missing work,
- and recommendations.
