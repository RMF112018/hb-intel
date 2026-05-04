# Validation Command Reference

## Always Capture

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
git diff --check
git diff --name-only
git diff --stat
```

## Staged Proof Before Commit

```bash
git diff --cached --name-only
git diff --cached --stat
git diff --cached --check
```

## Documentation Validation

```bash
pnpm exec prettier --check <touched markdown/json files>
python3 -m json.tool <each touched json file>
```

## Package Validation

Do not guess scripts. Inspect package manifests first:

```bash
cat package.json
cat packages/models/package.json
cat backend/functions/package.json
cat apps/project-control-center/package.json
```

Likely commands, only if repo truth confirms scripts:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
```

## Lockfile Gate

Record before and after:

```bash
md5 pnpm-lock.yaml
```

Expected recent value: `c56df7b79986896624536aab74d609f4`.
