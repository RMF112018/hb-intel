# HB Claude Hooks Index

## Purpose

Hooks enforce narrow deterministic behavior outside model judgment.

## Active Hook

| Hook | Event | Purpose |
| --- | --- | --- |
| `plan-library-guard.sh` | `PreToolUse` | Blocks accidental mutation of `docs/architecture/plans/**` unless explicitly authorized. |

## Project Registration

This package registers the hook in `.claude/settings.json` for `Write`, `Edit`, `MultiEdit`, and `Bash`.

Authorized canonical plan-library writes require one of:

```bash
HB_ALLOW_CANONICAL_PLAN_LIBRARY_WRITE=1
ALLOW_CANONICAL_PLAN_LIBRARY_WRITE=1
```

## Hook Rules

- Hooks must be narrow and explainable.
- Hooks do not replace plan gates.
- Hooks do not inspect archives.
- Hooks must not call tenant, deployment, Graph/PnP, Procore, app catalog, or live endpoint commands.
