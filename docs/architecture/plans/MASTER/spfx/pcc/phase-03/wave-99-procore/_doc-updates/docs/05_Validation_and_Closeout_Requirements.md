# Validation and Closeout Requirements

## Required Closeout

The local agent must close with:

- Commit summary.
- Commit description.
- Files changed.
- Validation commands and results.
- Lockfile MD5 before/after.
- Guardrail confirmation.
- Residual risks.
- Next recommended package or prompt.

## Required Validation

At minimum:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm exec prettier --check <touched-docs-and-json>
python3 -m json.tool <each-added-or-updated-json-artifact>
```

If code files are touched by mistake, stop and either revert or run the package-specific check-types/test/build suite and explain why code files changed.
