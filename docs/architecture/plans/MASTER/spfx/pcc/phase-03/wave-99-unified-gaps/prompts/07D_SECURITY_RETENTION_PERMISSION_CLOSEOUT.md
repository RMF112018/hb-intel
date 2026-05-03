# Prompt 07D — Security, Retention, Permission Closeout + Refusal Taxonomy Finalizer — Updated

## Objective

Close Prompt 07 by recording final evidence that the PCC knowledge reuse, security, retention, permission, warranty, and HBI/search grounding posture is:

1. documented in canonical architecture doctrine;
2. represented and enforced in PCC model contracts/fixtures/tests;
3. safely rendered and guarded in SPFx preview surfaces; and
4. finalized by narrowing the Ask-HBI refusal reason contract to the canonical taxonomy introduced in Prompt 07B and consumed safely by Prompt 07C.

This prompt remains a **closeout and validation prompt**, with one explicitly authorized model finalizer:

```ts
UnifiedSearchRefusal.refusalReason: string -> PccHbiRefusalReason
```

Do not create new product features, cards, routes, workspaces, runtime integrations, tenant behavior, or SPFx UI behavior.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Required Baseline

Do not begin until Prompts 07A, 07B, and 07C have completed and committed.

Expected Prompt 07 baseline:

- 07A commit:
  - `1d840cb36`
  - Added canonical `PCC_Knowledge_Reuse_Security_And_Retention_Model.md`.
- 07B commit:
  - `21220bf4e`
  - Added `PCC_HBI_REFUSAL_REASONS` and `PccHbiRefusalReason`.
  - Added executive-note and pursuit-note fixtures.
  - Added model/fixture security invariant tests.
  - Left `UnifiedSearchRefusal.refusalReason` typed as `string` because a SPFx test fixture still had a non-canonical refusal literal.
- 07C commit:
  - `1f7268f48`
  - Aligned the SPFx non-canonical refusal fixture to the canonical taxonomy.
  - Added render coverage for all five canonical refusal reasons.
  - Added restricted/degraded leak guards and Ask-HBI no-runtime/no-source-truth claim guards.
  - Intentionally deferred model type narrowing.

Expected current technical gap:

```ts
// packages/models/src/pcc/UnifiedLifecycle.ts
export interface UnifiedSearchRefusal {
  readonly refusalReason: string;
}
```

This must now become:

```ts
readonly refusalReason: PccHbiRefusalReason;
```

## Required Pre-Edit Repo Truth

Run and report:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

Expected HEAD is at or after:

```text
1f7268f48
```

Classify all uncommitted files as:

- user-owned;
- agent-owned;
- unknown.

Do not stage, modify, format, or normalize unrelated files.

## Files to Inspect

Inspect the files changed by 07A–07C and the exact model seam being finalized.

### 07A docs

```text
docs/architecture/blueprint/sp-project-control-center/PCC_Knowledge_Reuse_Security_And_Retention_Model.md
```

### 07B model files/tests

```text
packages/models/src/pcc/UnifiedLifecycle.ts
packages/models/src/pcc/index.ts
packages/models/src/pcc/fixtures/unifiedLifecycle.ts
packages/models/src/pcc/fixtures/unifiedLifecycleReadModels.ts
packages/models/src/pcc/fixtures/index.ts
packages/models/src/pcc/UnifiedLifecycle.test.ts
packages/models/src/pcc/UnifiedLifecycleReadModels.test.ts
packages/models/src/pcc/fixtures/Fixtures.test.ts
```

### 07C SPFx tests/guards

```text
apps/project-control-center/src/tests/askHbiGroundingCloseout.test.tsx
apps/project-control-center/src/tests/AskHbiGroundingPreviewPanel.test.tsx
apps/project-control-center/src/tests/PccProjectHomeAskHbiSection.test.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/pcc-import-guards.test.ts
```

If `askHbiGroundingCloseout.test.tsx` exists, inspect it. If it does not exist, state that and inspect the actual Prompt 06D closeout test file used in repo truth.

Do not inspect unrelated modules unless validation failures require it.

## Part 1 — Required Model Finalizer

### Allowed files for Part 1

Only these model files are in scope unless validation proves another model test/export file must be updated:

```text
packages/models/src/pcc/UnifiedLifecycle.ts
packages/models/src/pcc/UnifiedLifecycle.test.ts
```

`packages/models/src/pcc/index.ts` should already export `PccHbiRefusalReason` and `PCC_HBI_REFUSAL_REASONS` from 07B. Modify it only if repo truth shows the export is missing.

### Required change

In `packages/models/src/pcc/UnifiedLifecycle.ts`, change:

```ts
export interface UnifiedSearchRefusal {
  readonly answerId: string;
  readonly query: string;
  readonly response: string;
  readonly grounded: false;
  readonly citations: readonly [];
  readonly refused: true;
  readonly refusalReason: string;
}
```

to:

```ts
export interface UnifiedSearchRefusal {
  readonly answerId: string;
  readonly query: string;
  readonly response: string;
  readonly grounded: false;
  readonly citations: readonly [];
  readonly refused: true;
  readonly refusalReason: PccHbiRefusalReason;
}
```

This is a type narrowing only. Do not change runtime behavior.

### Required test hardening

Add or update one focused model test proving the type contract is narrowed.

Preferred if `expectTypeOf` is already available in model tests:

```ts
import { expectTypeOf } from 'vitest';
import type { PccHbiRefusalReason, UnifiedSearchRefusal } from './UnifiedLifecycle.js';

expectTypeOf<UnifiedSearchRefusal['refusalReason']>().toEqualTypeOf<PccHbiRefusalReason>();
```

If `expectTypeOf` is not already used or causes repo issues, use the repo’s existing compile-time type assertion pattern.

Also preserve the existing runtime test that locks:

```ts
PCC_HBI_REFUSAL_REASONS === [
  'insufficient-evidence',
  'permission-restricted',
  'out-of-scope',
  'cross-project-not-authorized',
  'responsibility-conclusion-not-supported',
]
```

### Expected impact

No fixture changes should be required because 07B changed the model fixture to `insufficient-evidence` and 07C aligned the SPFx synthetic fixture.

If any SPFx test or typecheck failure still constructs a non-canonical refusal reason, fix only that test fixture if it is clearly a test-only synthetic value. Do not change SPFx production source unless a real compile defect is discovered and can be fixed narrowly.

## Part 2 — Required Closeout Document

Create or update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-99/Prompt_07_Security_Retention_Permission_Closeout.md
```

If this folder does not exist, discover the actual Wave 99 closeout folder pattern in repo truth and use that pattern. Do not invent a second parallel closeout location.

The closeout document must include:

### 1. Prompt sequence summary

Include:

- 07A documentation / doctrine:
  - commit `1d840cb36`
  - canonical security/retention/permission architecture policy.
- 07B model/fixture hardening:
  - commit `21220bf4e`
  - model taxonomy, fixtures, and security invariant tests.
- 07C SPFx rendering/guard hardening:
  - commit `1f7268f48`
  - render, leak, no-runtime, and no-route guard tests.
- 07D finalizer / closeout:
  - current commit hash once committed;
  - refusal reason type-narrowing finalizer;
  - closeout evidence.

### 2. Final security posture decisions

Summarize, with no open decisions:

- security classes;
- redaction levels;
- persona/lens rules;
- pursuit/estimating sensitivity;
- executive-note posture;
- warranty/no-blame evidence rules;
- closed-project reference mode;
- cross-project search restrictions;
- HBI/source-truth restrictions;
- qualitative retention posture;
- summary-safe vs raw-record exposure;
- reuse blockers;
- tenant-readiness gates.

### 3. Evidence table

Include a table mapping each posture area to evidence:

- 07A architecture doc;
- 07B model files/tests;
- 07C SPFx tests/guards;
- 07D model finalizer;
- validation commands.

### 4. Refusal taxonomy closeout

Include a dedicated subsection stating:

- `PCC_HBI_REFUSAL_REASONS` is the canonical refusal taxonomy.
- `UnifiedSearchRefusal.refusalReason` is now narrowed to `PccHbiRefusalReason`.
- SPFx synthetic fixtures were aligned in 07C before narrowing.
- Grounded answers require citations.
- Refusals remain citation-free and explicit.
- Unsupported warranty/responsibility conclusions must remain refusal/insufficient-evidence.

### 5. OPERATOR-PENDING / tenant evidence posture

State that this wave does **not** provide tenant-hosted or production evidence for:

- tenant permission resolution;
- live identity/group enforcement;
- production audit logging;
- legal retention period enforcement;
- live HBI/vector/search integrations;
- live Graph/Procore/Sage retrieval.

Mark these as:

```text
OPERATOR-PENDING / future tenant-readiness evidence
```

Do not claim production readiness for any of those items.

### 6. Deferred items for Prompt 08+

Carry forward:

- production auth/middleware;
- tenant permission validation;
- audit logging;
- legal/compliance retention period finalization;
- litigation-hold and records-disposition procedures;
- live HBI/vector/Graph/Procore/Sage integration gates;
- persona-aware query policy;
- user-facing permission explanations;
- telemetry / governance reporting;
- hosted SharePoint package validation, if applicable.

### 7. Lockfile/package/manifest posture

State:

- no dependency changes;
- no package changes;
- no lockfile changes;
- no SharePoint manifest changes;
- no runtime source behavior changes unless validation forced a narrow fix and it is explicitly described.

## Allowed Changes

Allowed:

```text
packages/models/src/pcc/UnifiedLifecycle.ts
packages/models/src/pcc/UnifiedLifecycle.test.ts
packages/models/src/pcc/index.ts only if missing the 07B exports
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-99/Prompt_07_Security_Retention_Permission_Closeout.md
```

If the actual closeout path differs, use the discovered path and report it.

Allowed only if validation proves necessary:

- test-only SPFx fixture alignment for any remaining non-canonical refusal literal;
- model fixture alignment for any remaining non-canonical refusal literal.

Not allowed:

- new product features;
- new cards;
- new routes;
- new workspaces;
- Project Home behavior changes;
- Project Readiness integration;
- backend changes;
- live integrations;
- package/dependency changes;
- `pnpm-lock.yaml` changes;
- SharePoint manifest changes;
- broad formatting;
- docs other than the closeout doc unless the closeout path/index convention requires a single pointer and you report it.

## Validation

Run validation in this order.

### Model finalizer validation

```bash
pnpm --filter @hbc/models build
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

Do not stage generated `dist/` or build artifacts.

### SPFx ripple validation

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
```

### Targeted Prettier validation

Run Prettier check on all changed authored files. At minimum:

```bash
pnpm exec prettier --check   packages/models/src/pcc/UnifiedLifecycle.ts   packages/models/src/pcc/UnifiedLifecycle.test.ts   docs/architecture/blueprint/sp-project-control-center/phase-3/wave-99/Prompt_07_Security_Retention_Permission_Closeout.md
```

If the closeout path differs, update the path accordingly.

If Prettier fails, run `pnpm exec prettier --write` only on the changed file list, then rerun the targeted check.

### Lockfile validation

```bash
md5 pnpm-lock.yaml
```

Expected MD5 remains:

```text
c56df7b79986896624536aab74d609f4
```

Do not run broad repository-wide commands unless targeted commands fail due to repo conventions.

## Required Completion Summary

Return:

1. Pre-edit repo truth.
2. Workspace classification.
3. Files inspected.
4. Model finalizer changes made.
5. Closeout doc created/updated and actual path used.
6. Final posture decisions summarized.
7. Evidence table summary.
8. Validation results.
9. Lockfile MD5 before/after.
10. Prompt 07 completion statement.
11. Remaining gaps passed to Prompt 08+.
12. Commit hash if committed.
13. Confirm no push unless explicitly instructed.

## Commit Guidance

Stage only Prompt 07D-owned files. Do not stage generated build artifacts, unrelated prompt files, lockfile changes, package files, or unrelated docs.

Recommended commit message:

```text
chore(pcc): close knowledge reuse security posture hardening
```

Commit description should mention:

- finalizes `UnifiedSearchRefusal.refusalReason` as `PccHbiRefusalReason`;
- records Prompt 07 evidence and validation closeout;
- no dependencies / lockfile / manifest / runtime behavior changes;
- tenant-hosted/live-integration evidence remains OPERATOR-PENDING.

Do not push unless explicitly instructed.

## Final Instruction

Keep 07D narrow. It is a closeout gate with one model type finalizer. If the type narrowing causes unexpected broad failures, stop and report the exact failing sites rather than expanding scope.
