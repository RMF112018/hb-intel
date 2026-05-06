# 05 — Validation and Evidence Strategy

## Validation Principles

Each prompt runs the smallest meaningful validation set for its changed files.

Do not run broad workspace checks unless:

- package-local checks fail in a suspicious way,
- a shared package is modified,
- a dependency or type export changes,
- the prompt explicitly requires it.

## Standard Runtime Prompt Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm exec prettier --check <changed-files>
```

Use focused tests before full tests when developing, but close each runtime prompt with package-local full tests where feasible.

## Screenshot Evidence

Screenshots are required when browser/harness tooling is available.

If not available, do not block code implementation. Document the evidence gap in the prompt closeout and mark tenant-hosted proof as operator-pending.

Recommended evidence path:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/evidence/shell-remediation/
```

## Key Visual Widths

Capture if possible:

- 1180px
- 1181px
- 1366px
- 1440px
- 1441px
- 1600px
- 1920px

## Closeout Requirements

Every prompt closeout must include:

- outcome,
- files changed from actual git diff,
- validation commands/results,
- lockfile MD5 before/after,
- screenshots or evidence gap,
- context-efficiency statement,
- residual risks,
- next prompt handoff,
- no final 56/56 claim.
