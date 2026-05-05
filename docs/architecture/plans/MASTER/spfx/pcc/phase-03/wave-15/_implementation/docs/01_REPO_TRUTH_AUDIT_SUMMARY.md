# Repo-Truth Audit Summary

## Audit Boundary

This package was generated from remote GitHub repo truth plus public research. The generator could not run commands inside `/Users/bobbyfetting/hb-intel`.

The local agent must perform a read-only Prompt 01 audit before implementation.

## Remote GitHub Findings

Repository:

```text
RMF112018/hb-intel
Default branch: main
```

Wave 15 closeout commit found:

```text
8f95f3f3146b9f90e752e80a0bcdd4dad2c5027d docs(pcc): finalize wave 15 closeout and auditor handoff
```

Current `main` was observed one commit ahead of that Wave 15 closeout:

```text
fca4748bdc774c4e613b1f613f531aef6b8573d4 feat(spfx-pcc): wave 14 priority/readiness/wave-13G integration seams
```

That newer commit changes Wave 14 approvals/project-home/project-readiness seams. Wave 15 implementation must account for those changed seams when integrating External Systems with Priority Actions, Project Home, Project Readiness, and Wave 14 checkpoint handoff.

## Current External Systems Runtime Posture

Existing files indicate the runtime is not Wave 15-ready:

```text
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsSurface.tsx
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemTile.tsx
packages/models/src/pcc/ExternalSystems.ts
packages/models/src/pcc/PccReadModels.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts
apps/project-control-center/src/api/pccReadModelClient.ts
apps/project-control-center/src/api/pccBackendReadModelClient.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
```

Observed posture:

- External Systems surface is Wave 2 / Prompt 06-era preview UI.
- Tiles resolve from `SAMPLE_EXTERNAL_SYSTEM_LINKS` and `SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS`.
- UI says preview only / launch link not active.
- No live API calls.
- No `<a href>` launch behavior.
- Procore configuration/status card is display-only.
- No Procore SDK, no Procore link, no enabled mutation.
- Shared model currently has `ExternalSystemId`, `IExternalSystemLink`, `IExternalSystemMissingConfig`, and catalog-level metadata only.
- Read-model family currently has `external-links`, not a full Wave 15 Launch Pad family.
- Backend route family includes `GET /api/pcc/projects/{projectId}/external-links`, not the full Wave 15 route set.
- SPFx backend client/fallback seam is strong and should be extended rather than replaced.

## Package Scripts Observed Remotely

Expected package scripts to verify locally:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm --filter @hbc/spfx-project-control-center lint
```

Observed package posture:

- `@hbc/models` depends on `zod` and has `build`, `check-types`, `lint`, `test`.
- `@hbc/functions` depends on Azure Functions, Azure Identity, PnP packages, `@hbc/models`, and has `build`, `check-types`, `lint`, `test`.
- `@hbc/spfx-project-control-center` depends on `@hbc/models`, `@hbc/ui-kit`, React 18, and has `build`, `check-types`, `lint`, `test`, `dev`.
- Root package uses pnpm/turbo and has `format:check`.

## Local Revalidation Requirements

Prompt 01 must verify:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

Prompt 01 must also verify whether the latest local HEAD includes or supersedes:

```text
8f95f3f3146b9f90e752e80a0bcdd4dad2c5027d
fca4748bdc774c4e613b1f613f531aef6b8573d4
```

## Stop Conditions

Stop before implementation if:

- worktree has unexplained user-owned drift;
- `pnpm-lock.yaml` MD5 changes during read-only audit;
- Wave 15 docs/artifacts are missing;
- Wave 14 seam files differ materially from this package's assumptions;
- package scripts are missing or renamed;
- repo has already implemented Wave 15 in a different architecture and this package would conflict.
