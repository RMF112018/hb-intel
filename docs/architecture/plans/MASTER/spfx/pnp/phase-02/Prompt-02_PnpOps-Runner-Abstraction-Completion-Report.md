# Prompt-02 Completion Report — Runner Abstraction and Frontend Contract Refactor

## Scope completed
Prompt-02 frontend refactor was implemented in `apps/hb-webparts/src/webparts/pnp/` with mode-driven runner routing as the runtime source of truth:
- `local-runner`
- `remote-runner`
- `mock`
- `legacy-admin-api` (deprecated compatibility)

Legacy `/api/admin/*` compatibility remains available; no backend routes were removed.

## Changed files
- `apps/hb-webparts/src/webparts/pnp/PnpOps.tsx`
- `apps/hb-webparts/src/webparts/pnp/pnpOpsClient.ts`
- `apps/hb-webparts/src/webparts/pnp/pnpOpsExecutionModes.ts`
- `apps/hb-webparts/src/webparts/pnp/pnpOpsValidation.ts`
- `apps/hb-webparts/src/webparts/pnp/pnpOpsRunnerClient.ts` (new)
- `apps/hb-webparts/src/webparts/pnp/pnpOpsLegacyAdminClient.ts` (new)
- `apps/hb-webparts/src/webparts/pnp/pnpOpsTransport.ts` (new)
- `apps/hb-webparts/src/webparts/pnp/pnpOpsClient.test.ts`
- `apps/hb-webparts/src/webparts/pnp/pnpOpsValidation.test.ts`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/pnp/PnpOpsWebPart.manifest.json`

## Key implementation decisions
1. Split transport concerns:
- neutral runner transport/endpoints moved to `pnpOpsRunnerClient.ts`
- legacy admin API transport kept in `pnpOpsLegacyAdminClient.ts`
- shared HTTP helpers centralized in `pnpOpsTransport.ts`

2. `pnpOpsClient.ts` now routes by `executionMode` and preserves existing UI DTO shapes for preflight/run/evidence.

3. Runtime config precedence in `PnpOps.tsx` is now runner-first:
- `executionMode`
- `runnerBaseUrl`
- `defaultTargetSiteUrl`
- optional `legacyAdminApiBaseUrl`
- legacy `backendUrl` only as compatibility fallback for legacy mode resolution.

4. `mount.tsx` only wires token acquisition when mode resolves to `legacy-admin-api`; local/remote runner mode does not require `backendAudience`.

5. Form validation is mode-aware:
- local/remote require valid runner URL
- mock relaxes runner URL checks
- legacy requires legacy endpoint config
- existing target/list/page filter behavior is preserved.

## Removed Azure-first assumptions in frontend path
- PnP UI copy now reports mode + endpoint instead of treating backend admin APIs as primary.
- Operator warnings are mode-specific (runner URL missing, mock active, legacy token prerequisite).
- Legacy bearer-token messaging is isolated to deprecated compatibility mode.

## Migration compatibility notes
- `legacy-admin-api` mode remains supported for non-breaking migration.
- `backendUrl`/`backendAudience` are retained as compatibility properties.
- manifest upgraded to `0.0.5.0` and now includes runner-oriented fields:
  - `executionMode`
  - `runnerBaseUrl`
  - `legacyAdminApiBaseUrl`
  - `defaultTargetSiteUrl`

## Verification performed
1. `pnpm --filter @hbc/spfx-hb-webparts check-types` ✅
2. `pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/pnp/pnpOpsActionCatalog.test.ts src/webparts/pnp/pnpOpsValidation.test.ts src/webparts/pnp/pnpOpsClient.test.ts` ✅

Additional note:
- Running `pnpm --filter @hbc/spfx-hb-webparts test -- pnpOpsActionCatalog.test.ts pnpOpsValidation.test.ts pnpOpsClient.test.ts` executed broader homepage suites and showed pre-existing unrelated failures outside Prompt-02 scope.

## Prompt-03/04 dependencies remaining
- Prompt-03 must provide live local runner implementation behind the neutral endpoint contract.
- Prompt-04 must provide remote runner fallback implementation and environment profile.
- Prompt-05 must complete packaging/UX validation closure against runner-backed live paths.

## Intentionally not implemented in Prompt-02
- No local or remote runner service runtime implementation.
- No backend route removal or admin control-plane decommissioning.
- No extraction workflow execution-path change beyond frontend/client contract refactor.
