# Prompt 02 — Implement My Dashboard Runtime Config and Production Readiness

## Role
Act as a careful runtime-config implementation agent. Execute only this prompt’s scope and preserve unrelated repo work.

## Context
Prompt 01 should already have created the My Dashboard app/package scaffold. This prompt implements the runtime configuration and production-readiness primitives required by B02.

## Read-first instruction
Do **not** re-read files that remain within your current context or memory unless exact current text is needed for patching or drift is suspected. Open only what is necessary for accurate edits.

## Objective
Implement My Dashboard runtime configuration and production-readiness modules under:

```text
apps/my-dashboard/src/config/
```

without creating downstream read-model clients or shell/UI behavior.

## Required repo inspection before edits
Inspect current implementations of:

- `apps/estimating/src/config/runtimeConfig.ts`
- `apps/accounting/src/config/runtimeConfig.ts`
- `apps/estimating/src/project-setup/backend/ProjectSetupBackendContext.tsx`
- `apps/accounting/src/backend/AccountingBackendContext.tsx`

Use them to preserve the repo’s existing runtime-config vocabulary and readiness posture.

## Required creation scope
Create:

```text
apps/my-dashboard/src/config/runtimeConfig.ts
apps/my-dashboard/src/config/productionReadiness.ts
```

If the cleanest implementation keeps readiness calculation inside `runtimeConfig.ts` to match repo precedent, still provide `productionReadiness.ts` as a small My Dashboard-specific export surface or thin wrapper so the B02 file-placement contract remains fulfilled.

## Closed implementation contract

### Runtime config shape
Implement a My Dashboard-specific runtime config type that supports:

```ts
functionAppUrl?: string;
backendMode?: 'production' | 'ui-review';
allowBackendModeSwitch?: boolean;
apiAudience?: string;
```

### Resolution order
Runtime config getters must prefer:

1. shell/runtime injection set during `mount(...)`,
2. Vite/local fallback env values,
3. safe default or explicit config error depending on the function.

### Approved env vocabulary
Reuse the repo’s established public dev/build fallback vocabulary:

- `VITE_FUNCTION_APP_URL`
- `VITE_BACKEND_MODE`
- `VITE_ALLOW_BACKEND_MODE_SWITCH`
- `VITE_API_AUDIENCE`

Do **not** introduce `MY_DASHBOARD_*` public bundle env keys.

### Required getters / helpers
Implement My Dashboard equivalents of:

- `setRuntimeConfig(...)`,
- `getBackendMode()`,
- `getAllowBackendModeSwitch()`,
- `getFunctionAppUrl()`,
- `getApiAudience()`,
- `hasRuntimeConfig()` if consistent with repo precedent,
- `_resetConfig()` for tests if the local app uses the same test pattern.

### Readiness contract
Provide a My Dashboard readiness assessment equivalent to:

```ts
interface IMyDashboardProductionReadiness {
  ready: boolean;
  issues: string[];
}
```

At minimum it must evaluate:

1. whether the Function App URL is available for production mode,
2. whether an API token-provider capability is available.

### Safe behavior rules
- `ui-review` mode should not require a live Function App URL.
- Missing production prerequisites must produce explicit readiness issues.
- Do not silently create fake “live” readiness.
- Do not include tokens/secrets in config or readiness output.

## Optional tests if repo convention supports them
If adjacent app runtime-config modules have nearby test patterns, add focused tests for:

- backend mode normalization,
- runtime injection priority over Vite env where testable,
- Function App URL trimming,
- `ui-review` URL behavior,
- production readiness issue reporting.

Do not invent an oversized test harness if the My Dashboard app does not yet have one after Prompt 01.

## Prohibited scope
Do not:

- implement React app mount,
- implement read-model clients,
- implement backend route URLs,
- implement queue UI,
- implement Adobe/provider logic,
- update package orchestrator.

## Validation
Run what is now possible, such as:

```bash
rg -n "VITE_FUNCTION_APP_URL|VITE_BACKEND_MODE|VITE_ALLOW_BACKEND_MODE_SWITCH|VITE_API_AUDIENCE|ProductionReadiness" apps/my-dashboard/src/config
```

If the package and TS config are already coherent enough, run:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
```

If it fails because Prompt 03 files are intentionally not yet present, document that exact reason and do not over-patch.

## Required closeout
Return:

1. files created/modified,
2. runtime config API surface implemented,
3. readiness behavior implemented,
4. tests added or intentionally deferred,
5. validation results,
6. any prompt variance and why.
