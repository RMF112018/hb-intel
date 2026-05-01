# Prompt 08 — Fresh Reviewer Prompt

## Objective

You are a fresh ChatGPT session reviewing the completed Phase 3 / Wave 10 Permit & Inspection Control Center implementation in `/Users/bobbyfetting/hb-intel`.

Perform a comprehensive repo-truth review of the implementation sequence after Prompts 02–07 have been executed.

Do not implement code unless explicitly asked after the review. Do not edit files during the review.

## Context Discipline

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Required Local Commands

Run and report:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -10
md5 pnpm-lock.yaml
```

## Review Scope

Audit all Wave 10 implementation commits and touched files.

At minimum, inspect:

- `packages/models/src/pcc/PermitInspectionControlCenter.ts`
- `packages/models/src/pcc/PermitInspectionControlCenter.test.ts`
- `packages/models/src/pcc/PccReadModels.ts`
- `packages/models/src/pcc/WorkflowModules.ts`
- `packages/models/src/pcc/ProjectReadinessFramework.ts`
- `packages/models/src/pcc/index.ts`
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts`
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts`
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts`
- `backend/functions/src/hosts/pcc-read-model/*.test.ts`
- `apps/project-control-center/src/api/pccReadModelClient.ts`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.ts`
- `apps/project-control-center/src/api/pccBackendReadModelClient.ts`
- `apps/project-control-center/src/surfaces/permitInspectionControlCenter/**`
- `apps/project-control-center/src/surfaces/projectReadiness/**`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/tests/**`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Implementation_Closeout.md`

## Required Review Questions

Answer:

1. Did implementation remain within Wave 10 scope?
2. Are the target-added fields present and tested?
   - `revision`
   - `applicationValue`
   - `permitFee`
   - `reInspectionFee`
3. Is failed/reinspection lineage parent/child traceable?
4. Is AHJ posture still launcher-only?
5. Is Procore still launcher/reference-only?
6. Is evidence still reference-only, with no upload/storage/sync/mirror behavior?
7. Are backend routes GET-only?
8. Are no backend write routes introduced?
9. Are no Graph/PnP/SharePoint REST runtime paths introduced?
10. Does SPFx remain fixture-first by default?
11. Does backend opt-in use existing PCC patterns?
12. Are Priority Actions, Project Readiness, and Approvals integrations metadata/signal-only?
13. Were package manifests and `pnpm-lock.yaml` unchanged?
14. Were `docs/architecture/plans/**` untouched?
15. Are tests sufficient?
16. Are docs aligned with implementation?
17. Are there any stale user-facing references to only `Permit Log`?
18. Are there any contradictions with Wave 8 or Wave 14 boundaries?

## Validation Commands

Run repo-correct equivalents:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
git diff --check
pnpm exec prettier --check <Wave 10 touched files>
md5 pnpm-lock.yaml
```

Use actual package scripts if package scripts differ.

## Prohibited Scope

Do not edit files.

Do not stage files.

Do not commit.

Do not run broad formatting writes.

Do not add package dependencies.

Do not change lockfiles, manifests, workflows, deployment, or tenant configuration.

Do not call AHJ, Procore, Microsoft Graph, SharePoint REST, PnP, or external systems.

## Final Output Requirements

Return:

1. current branch, HEAD, lockfile hash;
2. implementation review summary;
3. pass/fail table against each required review question;
4. validation results;
5. staged/untracked file status;
6. defects, if any, ranked by severity;
7. recommended remediation prompts, if any;
8. explicit confirmation that no files were edited, staged, or committed.
