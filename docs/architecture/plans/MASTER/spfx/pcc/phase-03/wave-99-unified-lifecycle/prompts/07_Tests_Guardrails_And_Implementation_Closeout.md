# 07 — Tests, Guardrails, and Implementation Closeout

## Objective

Run final validation across all unified lifecycle implementation areas, close remaining guardrail/test gaps, and create implementation closeout documentation. Commit only if changes are required and all gates pass.

## Required Instruction

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Working Directory

```text
/Users/bobbyfetting/hb-intel
```

## Required Audit Before Edits

Re-run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

## Required Validation Areas

- Model contracts/fixtures/security invariants.
- Backend GET-only read-model routes/provider.
- SPFx client/fixture/backend parity.
- Unified lifecycle adapters/view models/components/hooks.
- Project Home and Project Readiness integration.
- Ask-HBI grounding/refusal/security/no-live-runtime guards.
- No shell route / no workspace drift.
- No package/lockfile/manifest/workflow changes unless explicitly authorized.

## Closeout Document

Create or update, subject to repo conventions:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-99/Unified_Lifecycle_Implementation_Closeout.md
```

If a closeout already exists, update minimally or create a follow-on closeout with repo-consistent naming. Do not overwrite prior aggregate gap-remediation closeouts unless explicitly directed.

## Closeout Must Include

- branch and HEAD;
- files changed by prompt sequence;
- what was implemented;
- what was verified as already complete;
- what intentionally remains future-gated;
- validation commands and results;
- lockfile MD5 before/after;
- guardrail confirmations;
- remaining operator-pending gates;
- recommended next wave.

## Required Validation Commands

After script inspection, run appropriate package tests. Include at least targeted equivalents of:

```bash
git diff --check
git diff --name-only
git diff --stat
git diff --cached --name-only
git diff --cached --stat
```

Likely package validations, if scripts exist:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
```

## Commit Summary

If committing:

```text
chore(pcc): close unified lifecycle implementation
```

## Final Output Requirements

Return:

- files inspected;
- files changed;
- validation results;
- lockfile MD5 before/after;
- no runtime/live integration/tenant/source mutation guardrails;
- closeout path;
- commit summary/description/hash if committed.
