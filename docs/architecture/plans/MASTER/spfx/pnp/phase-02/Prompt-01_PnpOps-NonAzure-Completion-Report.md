# Prompt-01 — Completion Report

## Summary
Prompt-01 completed as an architecture-lock and minimal scaffolding pass.

Implemented:
- non-Azure execution direction locked (`local-runner` primary, `remote-runner` fallback, `mock`, deprecated `legacy-admin-api`)
- current Azure/backend couplings audited and documented
- canonical neutral runner contract and frontend config lock documented
- TODO-safe frontend scaffolding added without runtime behavior changes

Not implemented (intentionally deferred):
- local runner runtime/service
- remote runner runtime/auth host
- live transport cutover from `/api/admin/*`

## Changed Files
- `docs/architecture/plans/MASTER/spfx/pnp/phase-02/Prompt-01_PnpOps-NonAzure-Architecture-Audit-Report.md`
- `docs/architecture/plans/MASTER/spfx/pnp/phase-02/Prompt-01_PnpOps-Runner-Contract-Lock.md`
- `docs/architecture/plans/MASTER/spfx/pnp/phase-02/Prompt-01_PnpOps-NonAzure-Completion-Report.md`
- `docs/architecture/plans/MASTER/spfx/pnp/phase-02/00_README.md`
- `apps/hb-webparts/src/webparts/pnp/pnpOpsExecutionModes.ts`
- `apps/hb-webparts/src/webparts/pnp/pnpOpsClient.ts` (TODO marker only)
- `apps/hb-webparts/src/webparts/pnp/PnpOps.tsx` (TODO marker only)

## Key Design Decisions
1. Azure-admin API is no longer the required architecture target for live extraction.
2. Runner abstraction is contract-first and deployment-neutral across local/remote.
3. Prompt-01 preserves DTO compatibility to minimize Prompt-02 frontend churn.
4. `legacy-admin-api` is explicitly temporary and deprecated.

## Risks and Tradeoffs
1. Legacy compatibility may increase temporary complexity in Prompt-02.
2. Runner contract stability depends on disciplined reuse in Prompt-03/04.
3. Browser-safe local HTTPS + trust/CORS remains the highest operational risk and is deferred to implementation prompts.

## Open Questions for Later Prompts
1. Exact local runner packaging/deployment shape (`tools/` vs `apps/`) and lifecycle model.
2. Remote-runner auth mechanism choice (API key vs stronger internal controls).
3. Final timeline for removing `legacy-admin-api` mode after successful migration.

## Prompt-02..05 Implementation Map
- Prompt-02: refactor frontend transport/config to execution-mode + runner endpoint abstraction (`PnpOps.tsx`, `pnpOpsClient.ts`, `pnpOpsValidation.ts`, `mount.tsx`, PnP manifest props).
- Prompt-03: implement local runner with real read-only PnP.PowerShell extraction and neutral contract.
- Prompt-04: add remote self-hosted fallback using same contract and explicit auth/safety posture.
- Prompt-05: UX cleanup by mode, packaging proof, and final closure evidence.

## Validation Performed
- `pnpm --filter @hbc/spfx-hb-webparts check-types`
- `cd apps/hb-webparts && pnpm vitest run --config vitest.config.ts src/webparts/pnp/pnpOpsActionCatalog.test.ts src/webparts/pnp/pnpOpsValidation.test.ts src/webparts/pnp/pnpOpsClient.test.ts`

Result: pass.
