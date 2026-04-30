---
name: hb-verification-router
description: Select the smallest meaningful HB Intel validation set using repo scripts, package-local scripts, and validation reference docs.
when_to_use: Use for validation command selection, adequacy review, or when a task asks what tests/checks to run.
argument-hint: "[changed scope]"
agent: hb-verification-runner
---

# HB Verification Router

Select validation for:

```text
$ARGUMENTS
```

## Required Sources

Use:

```text
docs/reference/developer/verification-commands.md
package.json
turbo.json
vitest.workspace.ts
nearest package.json
```

## Levels

1. Changed-file/local inspection.
2. Package-local lint/typecheck/test/build.
3. Affected consumer checks.
4. Workspace checks.
5. Browser/E2E.
6. Hosted/tenant-gated proof.

## Output

- Recommended commands.
- Why this set is sufficient.
- Checks not needed.
- Checks requiring explicit authorization.
- Residual risk.
