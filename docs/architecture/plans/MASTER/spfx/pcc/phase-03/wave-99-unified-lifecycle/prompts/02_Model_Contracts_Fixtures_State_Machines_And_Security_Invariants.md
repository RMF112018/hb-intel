# 02 — Model Contracts, Fixtures, State Machines, and Security Invariants

## Objective

Implement or verify the PCC Unified Lifecycle shared model contracts, read-model DTOs, deterministic fixtures, state machines, refusal taxonomy, security/redaction posture, and model-level tests. This prompt is no-op aware: if repo truth already satisfies the objective, do not churn files.

## Required Instruction

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Working Directory

```text
/Users/bobbyfetting/hb-intel
```

## Likely Files To Inspect/Edit

Subject to Prompt 01 repo truth:

```text
packages/models/src/pcc/UnifiedLifecycle.ts
packages/models/src/pcc/UnifiedLifecycleReadModels.ts
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/fixtures/
packages/models/src/pcc/*.test.ts
packages/models/src/pcc/index.ts
packages/models/src/index.ts
packages/models/package.json
```

## Required Deliverables

Verify or implement:

- lifecycle stages/events/checkpoints/gate signals;
- project memory / decisions / assumptions;
- role/stage/task/future-reference lens contracts;
- traceability edge contracts;
- obligation/vendor/product/warranty trace contracts;
- cross-project knowledge/reference contracts;
- unified search/HBI response/refusal/citation contracts;
- canonical `PccHbiRefusalReason` taxonomy;
- security classification, redaction, source-lineage, evidence-link posture;
- deterministic fixture data covering ready, redacted, withheld, insufficient-evidence, cross-project denied, degraded, and refusal cases;
- tests for enum exhaustiveness, fixture invariants, redaction/security invariants, no-blame warranty posture, and refusal taxonomy.

## Prohibited Scope

- No backend routes.
- No SPFx changes.
- No package/lockfile changes unless explicitly justified and approved.
- No live integrations.

## Validation

After inspecting package scripts, run repo-correct model validation. Likely:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

Always run:

```bash
git status --short
md5 pnpm-lock.yaml
git diff --check
git diff --name-only
```

## Staged-File Proof Before Commit

If changes are required:

```bash
git diff --cached --name-only
git diff --cached --stat
git diff --cached --check
```

## Commit Summary

If committing:

```text
feat(models-pcc): implement unified lifecycle model contracts
```

## Commit Description Requirements

Include:

- model contracts added/verified;
- fixture and invariant tests;
- no backend/SPFx/runtime/source-system changes;
- validation results;
- lockfile MD5 before/after.

## Final Output Requirements

Report files inspected, files changed, validation results, lockfile MD5 before/after, guardrails, and commit hash if committed.
