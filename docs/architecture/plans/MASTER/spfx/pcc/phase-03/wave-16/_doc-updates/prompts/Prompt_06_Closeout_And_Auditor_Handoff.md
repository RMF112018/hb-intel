# Prompt 06 Closeout And Auditor Handoff

## Objective
Finalize closeout and auditor handoff.

## Standing instruction
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Required repo checks
```bash
git status --short
git branch --show-current
git rev-parse HEAD
md5 pnpm-lock.yaml
```

## Blocked scope
No runtime source changes, package/lockfile changes, SPFx manifest changes, tenant mutation, live integration execution, or raw secret exposure.

## Validation
Run Prettier on touched markdown/json and `python3 -m json.tool` on touched JSON artifacts.

## Closeout
Report files changed, validation evidence, lockfile MD5, blocked-scope attestation, and residual risks.
