# B05.4 Prompt 02 — Shared Recent-Completions Contracts, Route Registry, and Deterministic Fixtures

## Execution Mode

You are executing **B05.4 Prompt 02** for the **My Dashboard Adobe Sign Completed lane**.

This prompt is **implementation-authorized** and **scope-bounded**.

You are to implement **shared model contracts, route-map additions, fixtures, exports, and model-level tests only**.  
You are **not** to implement backend providers, backend routes, Adobe search-client request bodies, frontend clients, hooks, UI toggle behavior, telemetry, broad documentation closeout, or commit the work. Those are reserved for later prompts in the B05.4 package.

Do **not** re-read files that are still present in your current context or memory unless they changed, the context is stale, or the scope expanded.

---

# 1. Governing Context and Locked Prompt 01 Outcome

Prompt 01 has completed and the research gate is now **GO**.

The completed lane is approved to proceed under these fixed decisions:

## 1.1 Product semantics — locked

The completed view means:

```text
Recently completed Adobe Sign agreements visible to the authenticated Adobe Sign principal.
```

Do **not** model or describe this as:

```text
Actions completed by the user.
```

No user-action attribution is permitted unless a later prompt explicitly introduces independently verified provider truth.

## 1.2 Provider query posture — locked for downstream prompts

Later backend prompts will implement the completed query using:

```text
POST /api/rest/v6/search
```

with the following confirmed implementation posture:

- completed terminal-state filter uses Adobe status:
  - `agreementAssetsCriteria.status: ["SIGNED"]`
- recent-window filter uses:
  - `agreementAssetsCriteria.modifiedDate.range`
- MVP window:
  - last 30 days
- sort:
  - newest-first using the appropriate `sortByField` + `sortOrder` body shape confirmed in Prompt 01
- pagination remains bounded and compatible with:
  - `agreementAssetsCriteria.startIndex`
  - `agreementAssetsCriteria.pageSize`

These provider-body details are **not implemented in Prompt 02**, but they govern the contract semantics you define now.

## 1.3 Date-labeling posture — revised and locked

Prompt 01 did **not** conclusively prove a distinct `/v6/search` completion timestamp response field.

Therefore, for B05.4 MVP:

- the shared completed-item contract must include:
  - `modifiedAtUtc?: string`
- the shared completed-item contract must **not** include:
  - `completedAtUtc`
- the later UI will render:
  - `Updated {date}`
- the later UI must **not** render:
  - `Completed {date}`
  unless a future, separately approved amendment proves a true provider completion timestamp field and updates the governing plan.

Do not pre-create a completion timestamp property “just in case.”

---

# 2. Repo Baseline and Preflight

Before editing, run and report:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -20
md5 pnpm-lock.yaml
```

## 2.1 Prompt 01 baseline to verify

Prompt 01 observed:

```text
branch: main
HEAD: fc9de55e3ae74e3062b54e50df25b7824c58bcec
pnpm-lock md5: 8e84df40772d58ba2219257e05f8f46c
```

Prompt 01 also observed these **pre-existing dirty files**:

```text
M apps/my-dashboard/config/package-solution.json
M apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json
M tools/spfx-shell/config/package-solution.json
```

These files are **out of scope for Prompt 02**.

### Required behavior

- Do **not** modify them.
- Do **not** stage them.
- Do **not** reset them.
- Do **not** use them as justification to widen scope.
- If additional unexpected dirty files are present before you edit, stop and report them before proceeding.
- If `HEAD` advanced beyond the Prompt 01 value, proceed only if the completed-lane work is still absent and the parser-remediation lineage remains intact; otherwise stop and report drift.

---

# 3. Prompt 02 Objective

Implement the **shared model contract foundation** for the Adobe Sign Completed lane so later prompts can safely add backend transport and frontend UI without inventing DTOs or route names.

You must complete all of the following:

1. Add a new shared contract family for Adobe Sign recent completions.
2. Add the new route registry key/path to the My Work read-model route map.
3. Add the new response-map entry for the completed read model.
4. Add deterministic fixture envelopes for all required source-state variants.
5. Export the new contract and fixture family through the existing barrel/index surfaces.
6. Add or update model-level tests to lock:
   - exact route-map parity,
   - exact DTO literals,
   - fixture completeness,
   - absence of forbidden `completedAtUtc`,
   - correct `modifiedAtUtc` posture.
7. Run scoped model validation only.
8. Stop and return a closeout suitable for Prompt 03.

---

# 4. Absolute Scope Boundary

## 4.1 In scope

Only the shared contracts/fixtures/model tests required to support the future completed lane.

## 4.2 Out of scope

Do **not** implement or edit:

- backend providers;
- backend route handlers;
- backend adapters;
- Adobe live search request bodies;
- Adobe telemetry;
- frontend read-model clients;
- frontend fixture clients outside model fixture exports;
- hooks;
- card UI;
- title-toggle behavior;
- CSS;
- My Dashboard README;
- reference docs;
- B04/B05 documentation closeout;
- architecture blueprints;
- package/manifest/version files;
- lockfile changes;
- deploy or packaging steps;
- git commit.

If you discover a necessary later-prompt dependency while implementing Prompt 02, document it in your closeout and stop at the shared-contract boundary.

---

# 5. Required Files to Inspect

Inspect only what is necessary to implement this prompt accurately.

## Shared model surfaces

```text
packages/models/src/myWork/AdobeSignActionQueue.ts
packages/models/src/myWork/MyWorkReadModels.ts
packages/models/src/myWork/index.ts
packages/models/src/myWork/fixtures/adobeSignActionQueueReadModels.ts
packages/models/src/myWork/fixtures/myWorkHomeReadModels.ts
packages/models/src/myWork/fixtures/index.ts
```

## Existing model-test surfaces

Use repo truth. If these exact files already exist, update them. If a named file is absent, create it only when needed and at the exact indicated location.

```text
packages/models/src/myWork/AdobeSignRecentCompletions.test.ts
packages/models/src/myWork/MyWorkReadModels.test.ts
```

If the repo currently uses a differently named but clearly canonical nearby model test file for route-map assertions, use that existing canonical file instead of creating a duplicate, and explain the choice in closeout. Do not scatter assertions across unrelated test files.

---

# 6. Files to Add or Modify

## 6.1 Add

```text
packages/models/src/myWork/AdobeSignRecentCompletions.ts
packages/models/src/myWork/fixtures/adobeSignRecentCompletionsReadModels.ts
```

## 6.2 Modify

```text
packages/models/src/myWork/MyWorkReadModels.ts
packages/models/src/myWork/index.ts
packages/models/src/myWork/fixtures/index.ts
```

## 6.3 Test files

Add or modify the canonical model tests needed to lock the new contract and route map. Use the exact existing repo testing conventions.

---

# 7. Required Contract Definitions

Create:

```text
packages/models/src/myWork/AdobeSignRecentCompletions.ts
```

The file should mirror the repo’s existing contract-docstring quality and type-only/read-model posture.

## 7.1 Required module ID literal

```ts
'adobe-sign-recent-completions'
```

## 7.2 Required query type

```ts
export interface MyWorkAdobeSignRecentCompletionsQuery {
  readonly pageSize?: number;
  readonly cursor?: string;
}
```

No filters, date overrides, actor overrides, status overrides, or sort overrides are permitted in the public shared query contract.

## 7.3 Required item type

Implement exactly this semantic shape:

```ts
export interface MyWorkAdobeSignRecentCompletionsItem {
  readonly itemId: string;
  readonly sourceSystem: 'adobe-sign';
  readonly agreementId: string;
  readonly agreementName: string;
  readonly completionState: 'completed';
  readonly sender?: MyWorkAdobeSignSenderSummary;
  readonly modifiedAtUtc?: string;
  readonly sourceOpenUrl?: string;
}
```

### Required import/reuse

Reuse:

```ts
MyWorkAdobeSignSenderSummary
```

from the existing action-queue contract family rather than duplicating sender shape.

### Forbidden properties

Do **not** add:

```ts
completedAtUtc
requiredAction
adobeRecipientStatus
adobeAgreementStatus
actorWhoCompleted
```

The completed lane must remain semantically truthful and provider-agnostic at the read-model boundary.

## 7.4 Required summary type

```ts
export interface MyWorkAdobeSignRecentCompletionsSummary {
  readonly countBasis: 'returned-items' | 'provider-total';
  readonly completedAgreementCount: number;
  readonly windowDays: 30;
}
```

The MVP window is contract-locked to `30`.

Do not make `windowDays` an arbitrary `number` for this prompt.

## 7.5 Required pagination type

```ts
export interface MyWorkAdobeSignRecentCompletionsPagination {
  readonly pageSize: number;
  readonly hasMore: boolean;
  readonly nextCursor?: string;
}
```

## 7.6 Required freshness type

Use the existing My Work freshness vocabulary:

```ts
MyWorkFreshnessState
```

and create:

```ts
export interface MyWorkAdobeSignRecentCompletionsFreshness {
  readonly state: MyWorkFreshnessState;
  readonly generatedAtUtc: string;
  readonly lastSuccessfulSourceReadAtUtc?: string;
}
```

## 7.7 Required read-model type

```ts
export interface MyWorkAdobeSignRecentCompletionsReadModel {
  readonly moduleId: 'adobe-sign-recent-completions';
  readonly summary: MyWorkAdobeSignRecentCompletionsSummary;
  readonly items: readonly MyWorkAdobeSignRecentCompletionsItem[];
  readonly pagination: MyWorkAdobeSignRecentCompletionsPagination;
  readonly freshness: MyWorkAdobeSignRecentCompletionsFreshness;
}
```

---

# 8. Route Registry and Response Map Changes

Modify:

```text
packages/models/src/myWork/MyWorkReadModels.ts
```

## 8.1 Required route key/path

Extend:

```ts
MY_WORK_READ_MODEL_ROUTE_PATHS
```

with:

```ts
'adobe-sign-recent-completions': 'my-work/me/adobe-sign/recent-completions'
```

Do not rename or reorder existing route semantics unless the current repo’s formatting convention requires deterministic object placement. Preserve existing exact literals for:

- `home`
- `adobe-sign-action-queue`
- `project-links`

## 8.2 Required response-map entry

Extend:

```ts
MyWorkReadModelResponseMap
```

with:

```ts
readonly 'adobe-sign-recent-completions': MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel>;
```

Add the required type import.

## 8.3 Required route-key derivation

Preserve the existing derivation pattern:

```ts
export type MyWorkReadModelRouteKey = keyof typeof MY_WORK_READ_MODEL_ROUTE_PATHS;
```

Do not create a parallel route-key list in this file unless the current repo truth already requires it elsewhere.

---

# 9. Exports

## 9.1 `packages/models/src/myWork/index.ts`

Export the new contract file using the same barrel style already used in the My Work package.

## 9.2 `packages/models/src/myWork/fixtures/index.ts`

Export the new recent-completions fixture family using the same fixture-barrel style already used by pending queue fixtures.

---

# 10. Deterministic Fixture Requirements

Add:

```text
packages/models/src/myWork/fixtures/adobeSignRecentCompletionsReadModels.ts
```

Use the same deterministic fixture posture as the existing pending queue fixture file.

## 10.1 Reuse fixture timestamp constant where appropriate

If the existing fixture timestamp constant is exported and reused across My Work fixtures, reuse it.  
If repo truth shows the current pattern is to define a local constant in each fixture family, follow that existing convention.

Do not introduce `Date.now()`, `new Date()` for runtime-varying fixture generation, or random values.

## 10.2 Required fixture exports

Create exact scenario exports for:

```ts
ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE
ADOBE_SIGN_RECENT_COMPLETIONS_EMPTY
ADOBE_SIGN_RECENT_COMPLETIONS_AVAILABLE_PAGED
ADOBE_SIGN_RECENT_COMPLETIONS_PARTIAL
ADOBE_SIGN_RECENT_COMPLETIONS_CONFIGURATION_REQUIRED
ADOBE_SIGN_RECENT_COMPLETIONS_AUTHORIZATION_REQUIRED
ADOBE_SIGN_RECENT_COMPLETIONS_PRINCIPAL_UNRESOLVED
ADOBE_SIGN_RECENT_COMPLETIONS_SOURCE_UNAVAILABLE
ADOBE_SIGN_RECENT_COMPLETIONS_BACKEND_UNAVAILABLE
```

These should be:

```ts
MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel>
```

## 10.3 Required deterministic item posture

Create deterministic completed fixture rows that include:

- stable item IDs;
- stable agreement IDs;
- agreement names suitable for testing;
- `completionState: 'completed'`;
- some rows with sender data;
- some rows without sender data if useful to preserve nullability coverage;
- `modifiedAtUtc` values only;
- at least one row with a `sourceOpenUrl`;
- at least one row without `sourceOpenUrl`.

Do **not** include `completedAtUtc`.

## 10.4 Required summary posture

Use:

```ts
windowDays: 30
```

for all summaries.

The populated fixture summary must truthfully match the item count.

The empty/degraded fixtures must use zero counts.

## 10.5 Required pagination posture

Provide:

- non-paged available fixture;
- paged fixture with:
  - `hasMore: true`
  - a deterministic `nextCursor`
  - a smaller page size appropriate for the fixture item count.

## 10.6 Required source-status posture

Use existing My Work source-status vocabulary exactly. Do not invent new source statuses.

---

# 11. Tests — Required Assertions

Implement or update the model-level tests needed to prove the contract is fixed and route alignment is exact.

## 11.1 Contract tests

Assert that the recent-completions contract family exposes the exact literals and shapes required by this prompt.

At minimum, cover:

- module id literal:
  - `adobe-sign-recent-completions`
- summary `windowDays` literal:
  - `30`
- item `completionState` literal:
  - `completed`
- item supports:
  - optional sender
  - optional `modifiedAtUtc`
  - optional `sourceOpenUrl`
- item does **not** rely on:
  - `completedAtUtc`
  - pending-action fields.

Use compile-time patterns and runtime fixture assertions consistent with existing repo practice. Do not add brittle type-level gimmicks that are foreign to the codebase.

## 11.2 Route-map tests

Assert that:

- the route registry includes the exact new key:
  - `adobe-sign-recent-completions`
- the route path is exactly:
  - `my-work/me/adobe-sign/recent-completions`
- the response-map typing recognizes the new key.
- existing route keys remain intact.

If current tests already lock the exact route-key set, update those expected literals; do not weaken them.

## 11.3 Fixture coverage tests

Assert that all required recent-completions fixture exports exist and match expected high-level posture:

- available populated;
- available empty;
- available paged;
- partial;
- configuration-required;
- authorization-required;
- principal-unresolved;
- source-unavailable;
- backend-unavailable.

Also assert:

- populated fixture rows use `modifiedAtUtc`;
- no populated fixture row contains `completedAtUtc`;
- summary counts match the fixture items.

---

# 12. Explicit Non-Goals

This prompt does **not** authorize:

- changing card copy;
- changing the visible Adobe Sign UI;
- adding the `Action Queue` / `Completed` header toggle;
- creating runtime hook state;
- adding backend searches;
- adding `/api/my-work/me/adobe-sign/recent-completions` handler code;
- adding source query telemetry;
- adding docs beyond local code comments necessary to keep new files understandable.

Leave all of that for later prompts.

---

# 13. Required Validation

Run exactly the model-scoped validation first:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

Then run:

```bash
git diff --check
```

Do not run broad backend or dashboard validations in this prompt unless model work causes an obvious package-level resolution issue that the scoped commands cannot reveal. If that happens, stop and explain why a wider validation would be needed rather than widening scope silently.

---

# 14. Required Final Verification

After implementation, run and report:

```bash
git status --short
git diff --stat
git diff -- packages/models/src/myWork
md5 pnpm-lock.yaml
```

Expected lockfile posture:

- `pnpm-lock.yaml` MD5 must remain unchanged from preflight unless the repo changed before you started;
- this prompt must not require a lockfile change.

Do not stage or commit.

---

# 15. Required Closeout Format

Return your closeout in this exact structure:

## 1. Implementation Decision
- `PASS`, `PARTIAL`, or `BLOCKED`

## 2. Preflight Snapshot
- branch
- HEAD
- original dirty-file list
- original `pnpm-lock.yaml` MD5

## 3. Files Inspected

## 4. Files Changed

## 5. Shared Contract Outcome
- exact new contract family added
- exact exported DTO names
- explicit note that `completedAtUtc` was not added
- explicit note that `modifiedAtUtc` is the only date field in the completed item contract

## 6. Route Registry Outcome
- route key
- route path
- response-map expansion

## 7. Fixture Outcome
- scenario list
- populated/empty/paged posture
- zero/degraded posture

## 8. Test Coverage Added or Updated

## 9. Validation Commands and Results

## 10. Lockfile / Out-of-Scope File Integrity
- final MD5
- confirmation that the three Prompt 01 dirty package/manifest files were not touched

## 11. Residual Risks or Follow-On Notes
- note any repo truth that Prompt 03 should inherit
- do not propose new product decisions

## 12. Prompt 03 Readiness
- `READY` or `NOT READY`
- one-sentence reason

---

# 16. Stop Condition

Stop after Prompt 02 is complete.

Do not proceed to backend implementation, frontend implementation, documentation reconciliation, or commit work.
