# Validation Commands by Package

## Always

```bash
git status --short
git branch --show-current
git rev-parse HEAD
md5 pnpm-lock.yaml
git diff --check
```

## Models touched

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/models build
```

## Backend touched

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
```

## SPFx touched

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
```

## Docs/JSON touched

```bash
pnpm exec prettier --check <touched-docs-and-json>
python3 -m json.tool <each-json-artifact>
```
