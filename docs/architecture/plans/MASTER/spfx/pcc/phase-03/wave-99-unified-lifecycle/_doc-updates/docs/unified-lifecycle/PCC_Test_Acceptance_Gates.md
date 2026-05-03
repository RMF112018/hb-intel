# PCC Test Acceptance Gates

## Purpose

Define standard validation gates for docs, models, backend, SPFx, HBI, security, and integration prompts.

## Required Validation Commands

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
git diff --check
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <touched markdown/json files>
python3 -m json.tool <each touched json file>
```

## Acceptance Rules

- No new forbidden shell routes.
- No direct source-system runtime imports in SPFx surfaces.
- No package/lockfile/manifest changes unless explicitly authorized.
- No broad formatting sweep.
- No HBI uncited answer path.
- No warranty responsibility recommendation without evidence threshold.
- No source-system writeback.
- No tenant mutation.
- All touched JSON must be valid.
- Closeout must record validation evidence.

## Reference JSON

Use `reference/validation_acceptance_gates.json` as machine-readable source.
