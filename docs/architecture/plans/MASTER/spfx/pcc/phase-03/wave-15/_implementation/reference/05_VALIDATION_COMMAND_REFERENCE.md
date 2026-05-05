# Validation Command Reference

## Initial Repo Truth

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

## Models

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

## Backend

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
```

## SPFx PCC

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm --filter @hbc/spfx-project-control-center lint
```

## JSON

```bash
python3 -m json.tool path/to/file.json >/dev/null
```

## Formatting

Use targeted formatting only for touched files. Do not run broad full-repo formatting unless requested.

## Lockfile Check

Run before and after implementation prompts:

```bash
md5 pnpm-lock.yaml
```

The MD5 should remain unchanged unless the prompt explicitly authorizes dependency/package changes. This package does not authorize them.
