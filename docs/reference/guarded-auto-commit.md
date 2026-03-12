# Guarded Auto-Commit

## Purpose

`guarded-auto-commit` creates a **local commit only** when all required gates pass:

1. task is explicitly marked complete
2. changed files stay inside approved path allowlist
3. tests pass
4. typecheck passes
5. build passes

It never pushes automatically.

## CLI Usage

```bash
pnpm guarded:commit --config scripts/guarded-commit.example.sf18.json
```

### Flags

- `--config <path>` (required): task config JSON path
- `--dry-run` (optional): run all checks without `git add` or `git commit`
- `--disable-guard` (optional): hard-stop guard switch; exits non-zero unless config enables bypass

## Config Schema

```json
{
  "enabled": true,
  "taskId": "SF18-T04",
  "taskStatus": "complete",
  "approvedPaths": [
    "packages/features/estimating/**",
    "docs/architecture/plans/shared-features/SF18*.md",
    "docs/explanation/feature-decisions/PH7-SF-18-*.md"
  ],
  "validation": {
    "tests": "pnpm --filter @hbc/features-estimating test",
    "typecheck": "pnpm exec tsc --noEmit -p packages/features/estimating/tsconfig.build.json",
    "build": "pnpm --filter @hbc/features-estimating build"
  },
  "commit": {
    "summary": "Hooks & State Model implemented",
    "body": "Optional commit body.",
    "type": "chore",
    "scope": "sf18"
  },
  "dryRun": false,
  "allowDisabledBypass": false
}
```

### Field Notes

- `enabled`: master toggle; when `false`, commit is refused
- `taskId`: required task identifier included in commit message
- `taskStatus`: must be `"complete"` to allow commit
- `approvedPaths`: allowlist patterns (`*`, `**`, exact paths)
- `validation.tests|typecheck|build`: exact commands for this task/package
- `commit.summary`: required concise summary
- `commit.body`: optional second paragraph for commit body
- `commit.type|scope`: optional commit subject prefix override
- `dryRun`: optional config-level dry-run (CLI `--dry-run` also enables)
- `allowDisabledBypass`: when `true`, `--disable-guard` exits `0` without committing

## Commit Message Rules

Default subject generation:

- SF task IDs (`SFxx-*`):
  - `chore(sfxx): complete <TASK_ID> — <summary>`
- non-SF task IDs:
  - `<TASK_ID>: <summary>`

If `commit.type` is provided, subject becomes:

- `<type>(<scope>): complete <TASK_ID> — <summary>` when scope exists
- `<type>: complete <TASK_ID> — <summary>` when scope is omitted

## Gate Order and Refusal Behavior

The script runs fail-fast with explicit logs:

- `[PASS]` for successful checks
- `[FAIL]` with failing gate + command/path + exit code
- `[SKIP]` for dry-run/disabled paths

If blocked, it prints the refusal reason and exits non-zero (except disabled-bypass mode).

## SF18 Example

### Dry-run

```bash
pnpm guarded:commit --config scripts/guarded-commit.example.sf18.json --dry-run
```

### Actual local commit

1. Set `"dryRun": false` in config (or remove it)
2. Ensure task status is complete and working tree changes are allowlisted
3. Run:

```bash
pnpm guarded:commit --config scripts/guarded-commit.example.sf18.json
```

## Disable and Override

- Disable automation per task config: `"enabled": false`
- Explicit hard-stop: `--disable-guard`
- Explicit bypass for automation contexts: `"allowDisabledBypass": true`

## Optional Git Hook Integration

Hook integration is optional and not installed automatically.

Example `pre-commit` hook entry:

```bash
pnpm guarded:commit --config scripts/guarded-commit.example.sf18.json --dry-run
```

Use dry-run in hooks to enforce checks without creating commits inside a hook.
