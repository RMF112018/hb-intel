# Prompt 06 — Wave 5 Guardrails, Validation, and Fallback Hardening

You are working in the live `RMF112018/hb-intel` repository on `main`.

Do not reread files that are still available in your current context or memory. Do not implement Prompt 07 early. Use repo truth only. If repo truth conflicts with Wave 5 scope, closed decisions, or prior Wave 5 prompt outputs, stop and report the conflict.

## Objective

Harden Wave 5 guardrails, fallback behavior, and regression tests after the Priority Actions Rail has been integrated and, if safe, wired to the existing explicit backend opt-in route.

This prompt must not add feature behavior. It is a stabilization and proof prompt.

## Repo-Truth Basis

Inspect only relevant Wave 5 outputs and guard files:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-5/Wave_5_Scope_Lock.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-5/Wave_5_Closed_Decisions.md
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.tsx
apps/project-control-center/src/surfaces/projectHome/priorityActionsRailAdapter.ts
apps/project-control-center/src/surfaces/projectHome/projectHomeViewModel.ts
apps/project-control-center/src/surfaces/projectHome/useProjectHomeReadModel.ts
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/PccApp.optIn.test.tsx
apps/project-control-center/src/tests/pcc-api-dormancy.test.ts
apps/project-control-center/README.md
backend/functions/src/services/__tests__/pcc-read-model-no-runtime.test.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts
```

## Allowed Files

Modify only the narrow files necessary to harden assertions and docs:

```text
apps/project-control-center/src/tests/pcc-api-dormancy.test.ts
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/PccApp.optIn.test.tsx
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.test.tsx
apps/project-control-center/src/surfaces/projectHome/priorityActionsRailAdapter.test.ts
apps/project-control-center/README.md
```

Only if tests expose a small fallback bug introduced by Prompts 02–05, minimally modify the implicated Wave 5 files:

```text
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.tsx
apps/project-control-center/src/surfaces/projectHome/priorityActionsRailAdapter.ts
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx
apps/project-control-center/src/surfaces/projectHome/projectHomeAdapter.ts
apps/project-control-center/src/surfaces/projectHome/useProjectHomeReadModel.ts
```

## Forbidden Files / Forbidden Scope

Do not modify:

```text
packages/**
backend/**
apps/project-control-center/src/api/pccBackendReadModelClient.ts
apps/project-control-center/src/api/pccReadModelClient.ts
apps/project-control-center/src/api/pccReadModelClientFactory.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
apps/project-control-center/src/mount.tsx
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
pnpm-lock.yaml
package.json
.github/**
*.json manifests
```

Do not add feature scope, new routes, new clients, new package dependencies, or deployment artifacts.

## Implementation Requirements

Harden or add tests proving:

1. **Fixture default remains default**
   - `<PccApp />` or `mount(el)` default path performs no `fetch(`.

2. **Backend opt-in remains explicit**
   - Backend mode requires explicit `_config.readModel = { readModelMode: 'backend', backendBaseUrl }`.
   - Missing/blank backend URL stays safe fallback.

3. **No new transport path**
   - `fetch(` remains limited to `pccBackendReadModelClient.ts` and its direct test.

4. **Project Home remains sole consumer**
   - `PccSurfaceRouter` still threads `readModelClient` to exactly one surface.

5. **Rail category suppression**
   - Visible user-facing rail does not render `documents`, `health`, or `safety` actions.

6. **No direct UI-kit priority rail import**
   - Add a source-scan assertion that PCC app source does not import `HbcPriorityRail` or `packages/ui-kit/src/HbcPriorityRail`.
   - General `@hbc/ui-kit/theme` usage remains allowed where already standard.

7. **No action execution**
   - Rail action controls are disabled/non-executing.
   - No live `http(s)` hrefs in Project Home.
   - No mutation/action callback path is introduced.

8. **Bento/grid invariant**
   - Project Home remains 10 direct-child cards under `[data-pcc-bento-grid]`.

9. **Active surface invariant**
   - Exactly one `[data-pcc-active-surface-panel="project-home"]` exists.

10. **Fallback states**
   - Empty groups render cleanly.
   - Backend-unavailable/error state renders cleanly.
   - Unauthorized/missing-config/unavailable-fixture states remain valid through existing card state behavior.

Update README to accurately describe final Wave 5 posture after Prompt 05:

- if backend wiring proceeded, state that explicit backend mode consumes `home`, `priority-actions`, and `document-control` for Project Home;
- if backend wiring was deferred, state that priority rail remains fed by fixture/home-envelope actions and standalone priority-actions route consumption is deferred;
- state that `documents`, `health`, and `safety` are suppressed from the user-facing MVP rail;
- state that all action controls are non-executing;
- state no direct `HbcPriorityRail` reuse occurred.

## Guardrails to Preserve

- Fixture remains default.
- Backend mode remains explicit opt-in only.
- No backend default.
- No new fetch callsite.
- No write routes.
- No tenant mutation.
- No package/lockfile/manifest/workflow/deployment changes.
- No Graph/PnP/SharePoint REST runtime.
- No Procore/Document Crunch/Adobe Sign runtime.
- No auth token wiring.
- No Site Health scan/repair execution.
- No Team & Access permission mutation.
- No approval execution.
- No direct `HbcPriorityRail` import.
- No shared model mutation.

## Tests / Validation Commands

Run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions build
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
md5 pnpm-lock.yaml
git status --short
git diff --stat HEAD
git diff --name-only HEAD
```

Do not run deployment, `.sppkg`, app catalog, tenant, Graph/PnP live operations, Procore, provisioning executor, repair runner, or tenant mutation commands.

## Stop Conditions

Stop without editing if:

- Prior Wave 5 prompts are incomplete or unaccepted.
- Tests require source changes outside allowed Wave 5 files.
- Guardrail hardening would require loosening the `fetch(` allowlist beyond existing backend client/test.
- Direct `HbcPriorityRail` import already exists and cannot be removed without broad UI rewrite.
- Any validation failure suggests backend default, mutation, package/lockfile, manifest, workflow, or deployment drift.

## Required Closeout Response

End with:

- files changed;
- guardrails added/hardened;
- validation results;
- lockfile md5 before/after;
- final default fixture proof;
- final backend opt-in proof or deferral proof;
- final category suppression proof;
- final non-executing action proof;
- final no-direct-UI-kit-rail proof;
- explicit no-runtime/no-mutation/no-deployment statement.

## Recommended Commit Summary

```text
test(spfx-pcc): harden wave 5 priority actions rail guardrails
```

## Recommended Commit Description

```text
Hardens Phase 3 Wave 5 guardrails for the PCC Priority Actions Rail.

Adds or updates tests and documentation proving fixture-default behavior, explicit backend opt-in posture, no new fetch callsites, Project Home-only read-model consumption, suppressed documents/health/safety actions in the user-facing MVP rail, disabled/non-executing controls, no live launch URLs, no direct HbcPriorityRail import, preserved bento/card invariants, and fallback state handling.

No shared model mutation, backend route change, write route, backend default, auth wiring, tenant mutation, package/lockfile change, manifest change, workflow change, deployment, .sppkg, app catalog upload, hosted validation, or production rollout is introduced.
```
