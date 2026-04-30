# Phase 3 / Wave 3 — PCC Backend Read-Model Foundation

## Objective

Wave 3 establishes the backend-normalized read-model foundation for the Project Control Center (PCC). The goal is to move from Wave 2's fixture-only SPFx preview shell toward controlled backend read models, without introducing tenant mutation, provisioning execution, Procore runtime, deployment, or live operational behavior.

Wave 2 is complete. The PCC SPFx shell frame, UI/UX basis, flexible bento layout, MVP surface navigation, preview dashboard cards, fallback states, and no-runtime guard tests are implemented and documented. The shell is ready for Wave 3 backend read-model planning, but it is not a live operational PCC release.

## Governing Repo-Truth Inputs

Inspect and follow:

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/Wave_2_Closeout.md`
- `apps/project-control-center/README.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/03_PCC_Backend_Service_Contract_Design.md`
- `backend/functions/README.md`
- `backend/functions/package.json`
- `packages/models/src/pcc/`
- `apps/project-control-center/src/`

## Wave 3 Scope

Wave 3 may define and implement:

- PCC read-model DTOs/contracts.
- Backend read-model envelope conventions.
- Backend route namespace.
- Mock/local read-model provider.
- Read-only backend route handlers.
- SPFx API-client boundary.
- Fixture fallback and backend-unavailable states.
- Static no-mutation/no-runtime guard tests.
- Closeout documentation and Wave 4 readiness recommendation.

## Wave 3 Forbidden Work

Wave 3 must not introduce:

- provisioning executor behavior;
- tenant mutation;
- Graph/PnP mutation;
- SharePoint list/library/page/group/permission mutation;
- Procore API runtime;
- Procore secrets;
- Procore mirror/write-back;
- Document Crunch runtime;
- Adobe Sign runtime;
- Site Health automated scan or repair;
- Team & Access permission execution;
- approval execution;
- workflow write routes unless a later approved prompt explicitly authorizes them;
- SPFx package deployment;
- `.sppkg`;
- app catalog upload;
- production rollout;
- package/version/manifest bumps unless explicitly authorized.

## Human Decisions Adopted for This Package

| Decision | Status | Adopted Position |
|---|---|---|
| Wave title | Frozen for Wave 3 | Phase 3 Wave 3 — PCC Backend Read-Model Foundation |
| Route namespace | Frozen for MVP (Prompt 01 lock) | `/api/pcc/projects/{projectId}/...` |
| Shared DTO placement | Frozen for MVP (Prompt 01 lock) | `packages/models/src/pcc/` exposed via `@hbc/models/pcc` |
| Backend implementation placement | Frozen for MVP (Prompt 02 lock) | `backend/functions/src/hosts/pcc-read-model/` (architecture placement only; no source created in Prompt 02) |
| Initial route behavior | Frozen for Wave 3 | Read-only, mock/local provider first |
| Write routes | Deferred | Not in Wave 3 unless separately authorized |
| Graph/PnP calls | Deferred | No live calls or mutation |
| Procore runtime | Deferred | No runtime, SDK, secret, mirror, or write-back |
| SPFx default data mode | Proof-gated | Keep fixture fallback; no default runtime cutover |
| Packaging/deployment | Deferred | Not in Wave 3 |

## Prompt Sequence

1. Repo-truth gate and scope lock.
2. Backend route/DTO architecture lock and backend source placement decision closure (W3-OD-003), documentation only.
3. PCC read-model contracts.
4. Backend mock read-model provider.
5. Read-only backend routes in mock mode.
6. SPFx client boundary with no default runtime cutover.
7. Wave 3 closeout, proof, and Wave 4 readiness.

## Required Validation Pattern

Each implementation prompt must run the narrowest package-scoped commands for touched packages. Use repo-correct equivalents.

Common command set:

```bash
git status --short
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions build
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
```

Do not run deployment, tenant, Graph/PnP, Procore, provisioning executor, app catalog, or `.sppkg` commands during Wave 3.
