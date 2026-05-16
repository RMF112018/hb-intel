# 03 — Command and Validation Lanes

## Standard Repo Baseline Commands

Run before implementation prompts unless the prompt explicitly says to use the prior captured baseline and no state-changing command has occurred since.

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -20
md5 pnpm-lock.yaml
```

## Pre-Edit Diff Awareness

When a prompt begins after a prior prompt commit or when the worktree may contain changes:

```bash
git diff --stat
git diff --name-only
```

## Required Validation Commands for Code Prompts

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard lint
git diff --check
```

## Post-Validation Lockfile Check

After validation:

```bash
md5 pnpm-lock.yaml
```

The lockfile checksum must match the pre-edit checksum.

## Explicit Staging Pattern

Use explicit paths only:

```bash
git add path/to/file-a.tsx path/to/file-b.module.css
git diff --cached --stat
git diff --cached --name-only
```

Do not use:

```bash
git add .
```

## Suggested Commit Form

```bash
git commit -m "<summary>"
```

Use the prompt's proposed summary/body or an equivalent accurate message.

## Prompt 01 Read-Only Special Rule

Prompt 01 is read-only. It may run:

- git inspection commands;
- file reads;
- search commands.

It must not:

- edit files;
- stage;
- commit;
- install packages;
- run tests/builds;
- format files.

## Prompt 08 Documentation/Evidence Rule

Prompt 08 may create closeout documentation. It should still run validations if the preceding implementation prompts are complete and uncommitted work does not invalidate results.
