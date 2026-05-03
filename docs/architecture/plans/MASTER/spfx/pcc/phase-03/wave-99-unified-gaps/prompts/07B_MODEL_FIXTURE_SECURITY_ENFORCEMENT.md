# Prompt 07B — Model and Fixture Security Invariant Hardening

## Objective

Verify and, only where necessary, harden PCC model contracts, fixtures, and model tests so they enforce the security, redaction, evidence, and permission posture documented in Prompt 07A.

This prompt is **models-only**.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Required Baseline

Do not begin until Prompt 07A has completed and committed the canonical documentation.

Expected model baseline:

- Unified lifecycle contracts already include:
  - security classifications;
  - redaction levels;
  - security posture;
  - source lineage;
  - evidence links;
  - warranty responsibility recommendations;
  - cross-project references;
  - closed-project reference read models;
  - grounded/refusal Ask-HBI responses.

Do not duplicate existing model vocabulary unless a clear gap remains.

## Required Pre-Edit Repo Truth

Run and report:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

Classify uncommitted files as user-owned, agent-owned, or unknown.

## Files to Inspect

Inspect only model files relevant to unified lifecycle/security posture:

```text
packages/models/src/pcc/UnifiedLifecycle.ts
packages/models/src/pcc/UnifiedLifecycleReadModels.ts
packages/models/src/pcc/UnifiedLifecycle.test.ts
packages/models/src/pcc/UnifiedLifecycleReadModels.test.ts
packages/models/src/pcc/fixtures/unifiedLifecycle.ts
packages/models/src/pcc/fixtures/unifiedLifecycleReadModels.ts
packages/models/src/pcc/fixtures/Fixtures.test.ts
packages/models/src/pcc/index.ts
packages/models/src/pcc/fixtures/index.ts
```

Also inspect the Prompt 07A doc to align assertions with the documented posture.

## Required Model/Test Hardening

First audit current model coverage. Add only missing invariants.

Tests must prove:

### 1. Security Posture Required

Every relevant fixture record includes security posture:

- lifecycle events;
- lifecycle context references;
- memory records;
- decisions;
- assumptions;
- obligation trace records;
- vendor/product trace records;
- warranty trace records;
- cross-project references;
- project knowledge references.

Assertions must verify:

- classification exists;
- redactionLevel exists;
- allowedPersonas exists;
- crossProjectAllowed exists.

### 2. Cross-Project References

Every cross-project reference must include:

- classification;
- status;
- eligible lens types;
- source lineage;
- security posture;
- crossProjectAllowed true only when allowed by documented posture.

Restricted/redacted cross-project references must not be modeled as raw unrestricted records.

### 3. Ask-HBI Grounding

Ask-HBI fixture responses must satisfy:

- grounded answer requires at least one citation;
- citation includes sourceLineage;
- citation includes recordType and recordId;
- citation includes excerpt;
- refusal answer has `citations: []`;
- refusal answer has non-empty `refusalReason`;
- no grounded answer lacks evidence/source posture.

### 4. Warranty No-Blame / Evidence Requirement

Warranty trace records must satisfy:

- `insufficient-evidence`, `unresolved-responsibility`, and `pending-evidence` statuses do not include a recommendation;
- recommendation-bearing statuses include confidence and evidenceLinkIds;
- recommendation evidenceLinkIds are non-empty;
- recommendation does not exist without evidence posture;
- source/evidence links exist before responsibility can be shown.

### 5. Closed-Project Summary vs Raw Access

Closed-project / future-pursuit reference fixtures must distinguish:

- summary-safe references;
- restricted/redacted references;
- raw-record access posture through security/redaction;
- future-pursuit references as references, not copied source ownership.

If the existing model lacks a dedicated summary/raw-access enum, do not add a large new contract unless necessary. Prefer tests over existing security/redaction fields first. If a minimal field is required, add it narrowly and update fixtures/tests.

### 6. Executive / Pursuit Sensitivity

Fixture records with `executive-note` or `pursuit-note` must be:

- restricted or privileged;
- limited to appropriate allowed personas;
- redacted/masked/withheld when exposed outside permitted lenses;
- not crossProjectAllowed by default unless summary-safe posture exists.

### 7. Source Ownership

Model tests must assert:

- HBI/search responses do not change source ownership;
- source-system-reference records retain source lineage;
- PCC-native records are explicitly marked;
- cross-project references do not claim PCC owns source-system records.

## Allowed Changes

Allowed:

- model tests;
- model fixtures;
- minimal type/contract hardening if current contracts cannot represent Prompt 07A posture;
- model export updates if a new minimal type is added.

Not allowed:

- apps/SPFx changes;
- backend changes;
- docs changes except a tiny closeout note only if required by repo convention;
- package/dependency changes;
- `pnpm-lock.yaml` changes;
- broad formatting.

## Validation

Run and report:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
md5 pnpm-lock.yaml
```

Do not run SPFx tests unless model export changes break SPFx typecheck; if so, explain why.

## Required Completion Summary

Return:

1. Pre-edit repo truth.
2. Workspace classification.
3. Model files inspected.
4. Gaps found.
5. Model/fixture/test changes made.
6. Validation results.
7. Lockfile MD5 before/after.
8. Remaining gaps for Prompt 07C.
9. Commit hash if committed.
10. Confirm no push unless explicitly instructed.

## Commit Guidance

Commit only Prompt 07B-owned model files. Do not push unless explicitly instructed.

Recommended commit message:

```text
test(models-pcc): enforce knowledge reuse security invariants
```
