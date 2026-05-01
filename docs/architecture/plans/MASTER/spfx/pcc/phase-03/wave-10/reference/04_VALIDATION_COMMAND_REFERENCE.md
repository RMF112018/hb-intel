# Validation Command Reference

Use repo-correct equivalents based on package scripts.

## Baseline Commands

Run before every editing prompt:

```bash
git status --short
md5 pnpm-lock.yaml
```

Prompt 01 must additionally run:

```bash
git branch --show-current
git rev-parse HEAD
git log --oneline -8
```

## Model Validation

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

## Backend Validation

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
```

## SPFx Validation

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
```

## Universal Validation

```bash
git diff --check
pnpm exec prettier --check <exact touched files>
md5 pnpm-lock.yaml
git status --short
git diff --cached --name-only
```

## Script Source

Prompt 01 must verify actual scripts in:

- `package.json`
- `packages/models/package.json`
- `backend/functions/package.json`
- `apps/project-control-center/package.json`

If package scripts differ from this reference, use the actual scripts and report the adjustment.
