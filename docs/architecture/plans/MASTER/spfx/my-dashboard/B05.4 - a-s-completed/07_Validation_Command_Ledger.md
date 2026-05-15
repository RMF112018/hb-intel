# 07 — Validation Command Ledger

## Purpose

This ledger defines the mandatory command posture for every implementation prompt and the final package closeout.

## Universal preflight

Each prompt must start with:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -20
md5 pnpm-lock.yaml
```

The agent must:

- record unrelated pre-existing changes;
- avoid staging unrelated files;
- never use `git add .`;
- stage only explicit paths.

## Prompt-specific validation posture

### Prompt 01 — read-only audit gate

```bash
git status --short
git diff --check
md5 pnpm-lock.yaml
```

No commit.

### Prompt 02 — models/contracts/fixtures

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
git diff --check
md5 pnpm-lock.yaml
```

Prettier check should target only Prompt 02 touched files.

### Prompt 03 — backend search intent/request-builder seam

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
git diff --check
md5 pnpm-lock.yaml
```

Prettier check should target only Prompt 03 touched files.

### Prompt 04 — backend adapter/provider/route/telemetry

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions build
git diff --check
md5 pnpm-lock.yaml
```

### Prompt 05 — frontend client/lazy completed state/view-model

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
git diff --check
md5 pnpm-lock.yaml
```

### Prompt 06 — Adobe card header toggle/UI closure

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard build
git diff --check
md5 pnpm-lock.yaml
```

### Prompt 07 — docs reconciliation and scoped validation

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/spfx-my-dashboard check-types
git diff --check
md5 pnpm-lock.yaml
```

### Prompt 08 — integrated final validation

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions build
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard build
git diff --check
md5 pnpm-lock.yaml
```

## Required post-validation staging proof

Before commit, every implementation prompt must run:

```bash
git status --short
git diff --stat
git diff --cached --stat
```

and must explicitly state:

- files changed;
- files staged;
- lockfile MD5 before and after;
- validations run;
- validations passed/failed;
- explicit exclusions preserved.

## Commit rule

Commit only after all prompt-scoped validations pass.

## Lockfile rule

`pnpm-lock.yaml` must remain unchanged throughout this package. The MD5 before and after each implementation prompt must match.
