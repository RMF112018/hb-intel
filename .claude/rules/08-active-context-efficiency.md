# 08 — Active Context Efficiency

## Primary Rule

Read the smallest sufficient source set. Do not re-read files already in active context unless they may have changed, line-level proof is needed, final validation requires it, or scope expanded.

## Do Not Read During Normal Work

- `.archive/**`
- `.claude/plans/logs/**`
- `**/*.log`
- `node_modules/**`
- `.next/**`
- `dist/**`
- `build/**`
- `coverage/**`
- `.turbo/**`
- `.vite/**`
- `playwright-report/**`
- `test-results/**`
- generated zip artifacts
- generated deployment/runtime proof logs

## Workspace Efficiency

Use `hb-workspace-surface-router` for unknown areas. Prefer nearest package/app files over broad repo search.

## Command Output Discipline

Prefer targeted package-local validation. Avoid root-wide commands unless the risk profile justifies the output.
