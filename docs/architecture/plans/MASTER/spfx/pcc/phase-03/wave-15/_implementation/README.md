# PCC Wave 15 — External Systems Launch Pad Implementation Prompt Set

## What This Package Is

This is a staged implementation prompt package for local Claude Code / code-agent execution in `/Users/bobbyfetting/hb-intel`.

It turns Wave 15 documentation, repo-truth audit findings, and web-research guidance into a controlled implementation sequence for the `External Systems Launch Pad`.

## What This Package Is Not

This package is not authorization for:

- SharePoint tenant mutation;
- list provisioning;
- Graph/PnP/SharePoint REST writes;
- Procore/Sage/AHJ/camera API integration;
- iframe/current-image camera embeds;
- package/lockfile dependency changes;
- SPFx manifest/package-solution changes;
- deployment or production rollout.

## Execution Order

1. `prompts/01_Wave_15_Implementation_Readiness_Audit.md`
2. `prompts/02_Shared_Models_Fixtures_And_Domain_Contracts.md`
3. `prompts/03_Backend_GET_Only_Mock_Read_Model_Family.md`
4. `prompts/04_SPFX_Read_Model_Client_And_Fixture_Parity.md`
5. `prompts/05_SPFX_Launch_Pad_Surface_Shell.md`
6. `prompts/06_Project_Link_Drawer_Review_Queue_And_URL_Policy_UX.md`
7. `prompts/07_Registry_Mapping_Health_Audit_And_Lineage_Surfaces.md`
8. `prompts/08_Project_Home_Priority_Readiness_Wave14_And_HBI_Seams.md`
9. `prompts/09_Tests_Guardrails_And_Implementation_Closeout.md`
10. `prompts/10_Fresh_Reviewer_Prompt.md`

## Commit Pattern

- Prompt 01: no commit; read-only report.
- Prompts 02-09: one commit per prompt unless the prompt explicitly stops for user guidance.
- Prompt 10: reviewer report only unless user separately asks for remediation.

## Required Local Revalidation

Every prompt starts from local repo truth. Do not trust the remote audit alone.

Run and record:

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

If the worktree is dirty, identify unrelated files and do not stage them.

## Validation Baseline

Use targeted validations. Do not run broad formatting across the full repo unless explicitly requested.

Expected targeted validations include:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm --filter @hbc/spfx-project-control-center lint
md5 pnpm-lock.yaml
```

If a validation fails due to unrelated pre-existing drift, capture the exact failure and do not conceal it.

## Package Design Note

The package intentionally embeds context that a local agent would otherwise rediscover by repeatedly reading docs. Use the reference files first, then inspect repo files only when verifying current truth, resolving contradictions, or implementing scoped changes.
