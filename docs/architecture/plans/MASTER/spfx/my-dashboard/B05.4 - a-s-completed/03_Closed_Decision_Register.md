# B05.4 Prompt 03 — Backend Search Intent, Recent-Completions Request Builder, and Live Search Seam

## Execution Mode

You are executing **B05.4 Prompt 03** for the **My Dashboard Adobe Sign Completed lane**.

This prompt is **implementation-authorized** and **scope-bounded**.

You are to implement the backend **search-intent/request seam only**:

- introduce an explicit search-intent discriminator;
- preserve the current pending/action-queue search path;
- add the recent-completions request builder;
- extend the existing singular live Adobe search client so it can translate both intents into bounded Adobe request bodies;
- extend safe search-request diagnostics needed to prove the completed request posture;
- add/adjust focused backend unit tests.

You are **not** to implement the completed adapter, provider method, backend route handler, frontend client, frontend hook, UI toggle, documentation reconciliation, manifests, package versions, lockfile changes, staging, or commit work. Those are reserved for later prompts.

Do **not** re-read files that are still present in your current context or memory unless they changed, the context is stale, or the scope expanded.

---

# 1. Governing State After Prompt 02

Prompt 02 is complete and has been committed:

```text
15ce8bf37
models(my-work): add Adobe Sign recent completions contracts and fixtures
```

Prompt 03 must execute on:

```text
main at commit 15ce8bf37 or a direct descendant that preserves the Prompt 02 completed-contract foundation.
```

## 1.1 Prompt 02 truths that must be inherited

The shared model layer now locks:

```ts
'adobe-sign-recent-completions'
'my-work/me/adobe-sign/recent-completions'
```

The completed item contract is also locked to:

```ts
completionState: 'completed'
modifiedAtUtc?: string
```

and **does not include**:

```ts
completedAtUtc
```

Prompt 03 must not alter those shared model decisions.

---

# 2. Prompt 01 Research Gate — Adjudicated Outcome for Prompt 03

Prompt 01 originally returned a conservative `BLOCKED`, but the implementation posture has since been adjudicated and the B05.4 package proceeds under the following **locked technical truth**:

## 2.1 Provider family

Use the existing Adobe Sign search family:

```http
POST /api/rest/v6/search
```

## 2.2 Completed status posture

Recent completions use Adobe search criteria with a completed terminal status represented by:

```json
"status": ["SIGNED"]
```

## 2.3 Agreement asset posture

The completed lane is an agreement lane, not a mixed asset lane. Use the provider-side agreement asset narrowing that Adobe’s `/v6/search` examples expose for the completed/signed agreement posture:

```json
"type": ["AGREEMENT"]
```

## 2.4 Recent-window posture

Use a provider-side last-30-days modified-date window under:

```json
"modifiedDate": {
  "range": { ... }
}
```

The request-builder seam must produce deterministic UTC start/end values for a 30 × 24-hour lookback window from an injected `now` value.

## 2.5 Sort posture

The completed lane must request newest-first ordering using Adobe’s provider-side sort fields under:

```json
"sortByField": "...",
"sortOrder": "..."
```

### Fail-closed implementation rule for exact sort/range literals

Before editing, inspect the Prompt 01 closeout and/or the current B05.4 research artifact already present in the repo/worktree and identify the **exact comparator-key pair** used inside `modifiedDate.range` and the **exact `sortByField` literal** approved for the recent-completions search body.

- If those exact literals are already recorded, implement them.
- If they are not recorded, reopen only the official Adobe source already used in Prompt 01, confirm the exact literals, then proceed.
- If they still cannot be confirmed from authoritative source evidence, stop before editing the live-body translation and return `BLOCKED-SYNTAX-DRIFT`.
- Do **not** invent range comparator keys.
- Do **not** invent a sort field literal.

This is a technical verification checkpoint, not an open product decision.

---

# 3. Closed Decision Register Alignment

This prompt inherits the closed decisions for the B05.4 package, especially:

- one Adobe card only;
- same card, separate read-model lanes;
- completed endpoint remains:
  - `GET /api/my-work/me/adobe-sign/recent-completions`
- do not add completed content to the home envelope;
- telemetry must gain a query-intent discriminator;
- do not ship an unbounded adapter-side completed scan;
- no tenant mutation, deployment, manifest, lockfile, package, workflow, or unrelated work.

## 3.1 Prompt 01/02 refinement to row-date semantics

The closed decision register’s earlier phrase “completion/update date truthfully” must now be read through the Prompt 01 adjudication and Prompt 02 implementation:

```text
B05.4 MVP carries only modified/update date truth.
No completedAtUtc field exists in the shared completed DTO family.
Later UI prompts must render Updated {date}, not Completed {date}.
```

Prompt 03 must preserve this posture and must not introduce completion-date properties into backend request-seam types.

---

# 4. Mandatory Preflight

Run and report:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -20
md5 pnpm-lock.yaml
```

## 4.1 Expected repo posture

Prompt 02 commit should be visible in the log:

```text
15ce8bf37 models(my-work): add Adobe Sign recent completions contracts and fixtures
```

The lockfile MD5 carried forward from Prompt 02 was:

```text
8e84df40772d58ba2219257e05f8f46c
```

## 4.2 Pre-existing dirty files to preserve

Prompt 02 closeout identified these out-of-scope, pre-existing dirty files:

```text
M apps/my-dashboard/config/package-solution.json
M apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json
M docs/architecture/plans/MASTER/spfx/my-dashboard/B05.4 - a-s-completed/02_Outside_Research_Summary.md
M tools/spfx-shell/config/package-solution.json
```

Required behavior:

- Do **not** modify them.
- Do **not** stage them.
- Do **not** reset them.
- Do **not** use them as a reason to widen scope.
- If additional unexpected dirty files are present before Prompt 03 edits begin, stop and report before proceeding.
- If `HEAD` is not `15ce8bf37` or a direct descendant that preserves Prompt 02, verify the Prompt 02 model foundation remains present; stop if drift affects this prompt’s assumptions.

---

# 5. Prompt 03 Objective

Implement the **backend search-intent/request seam** needed so later prompts can safely add the completed adapter/provider/route without duplicating Adobe transport logic.

The final Prompt 03 state must satisfy all of the following:

1. The search seam exposes an explicit, type-safe intent discriminator:
   - `action-queue`
   - `recent-completions`
2. Existing action-queue request behavior remains functionally unchanged.
3. A new `buildAdobeSignRecentCompletionsRequest(...)` builder exists.
4. The recent-completions request builder:
   - clamps page size;
   - preserves cursor behavior;
   - requires an injected `now`;
   - computes a deterministic UTC 30-day lookback window;
   - encodes completed-search metadata for provider translation.
5. The singular live Adobe search client translates:
   - `action-queue` into the current existing body posture;
   - `recent-completions` into the provider-side completed-body posture.
6. Search-request diagnostics become intent-aware and prove bounded completed-query fields are present.
7. Focused unit tests prove both intents and prevent pending-lane regression.

---

# 6. Exact Files to Inspect

Inspect only what is needed to implement this prompt accurately.

```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-search-request.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-search-client.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-search-client.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-runtime-diagnostics.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-search-request.test.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-search-client.test.ts
```

Also inspect any directly adjacent current test file if repo truth shows a canonical test file for the affected diagnostic type or request seam.

Do **not** inspect or edit completed adapter/provider/route/frontend files in this prompt.

---

# 7. Files Allowed to Add or Modify

## 7.1 Add

```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-recent-completions-request.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-recent-completions-request.test.ts
```

## 7.2 Modify

```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-search-request.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-search-client.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-search-client.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-runtime-diagnostics.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-search-request.test.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-search-client.test.ts
```

If a test file name differs in repo truth but is clearly canonical for this seam, update the existing canonical file rather than creating a duplicate, and document that choice in closeout.

---

# 8. Required Search-Intent Type Design

## 8.1 Intent discriminator

Add a shared backend-local intent type:

```ts
export type AdobeSignSearchIntent =
  | 'action-queue'
  | 'recent-completions';
```

Use this intent on the request object consumed by the live search client.

## 8.2 Preserve the existing action-queue builder API

The existing action-queue builder currently used by the working pending adapter must not be broken.

If the existing function is:

```ts
buildAdobeSignSearchRequest(...)
```

preserve that function name and call signature, and have it return an action-queue request carrying:

```ts
intent: 'action-queue'
```

Do not rename it in this prompt.  
Do not require pending adapter edits.

## 8.3 Request union

Refactor the backend search request type into a discriminated union equivalent to:

```ts
export interface AdobeSignActionQueueSearchRequest {
  readonly intent: 'action-queue';
  readonly approvedStatuses: readonly AdobeSignActionableRecipientStatus[];
  readonly pageSize: number;
  readonly cursor?: string;
}

export interface AdobeSignRecentCompletionsSearchRequest {
  readonly intent: 'recent-completions';
  readonly pageSize: number;
  readonly cursor?: string;
  readonly windowDays: 30;
  readonly modifiedWindowStartAtUtc: string;
  readonly modifiedWindowEndAtUtc: string;
}

export type AdobeSignSearchRequest =
  | AdobeSignActionQueueSearchRequest
  | AdobeSignRecentCompletionsSearchRequest;
```

Use repo-consistent naming and formatting, but preserve these semantics exactly.

Do **not** add:

```ts
completedAtUtc
completedStatus
actorOverride
customWindowDays
customStatusFilter
customSortOverride
```

to the request seam.

---

# 9. Required Recent-Completions Request Builder

Add:

```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-recent-completions-request.ts
```

## 9.1 Constants

Add and export:

```ts
export const ADOBE_SIGN_RECENT_COMPLETIONS_WINDOW_DAYS = 30 as const;
```

If the repo uses existing search page-size constants from `adobe-sign-search-request.ts`, reuse them rather than duplicating clamp values.

## 9.2 Builder input

Implement a deterministic builder input shaped like:

```ts
export interface AdobeSignRecentCompletionsRequestInput {
  readonly pageSize?: number;
  readonly cursor?: string;
  readonly now: Date;
}
```

`now` is mandatory to keep tests deterministic and to allow later adapters to pass their already-injected clock.

## 9.3 Builder output

Implement:

```ts
buildAdobeSignRecentCompletionsRequest(
  input: AdobeSignRecentCompletionsRequestInput,
): AdobeSignRecentCompletionsSearchRequest
```

with:

- `intent: 'recent-completions'`
- clamped `pageSize`
- optional `cursor`
- `windowDays: 30`
- `modifiedWindowEndAtUtc = input.now.toISOString()`
- `modifiedWindowStartAtUtc = input.now - 30 * 24 * 60 * 60 * 1000`, serialized to ISO UTC

Use an exact 30 × 24-hour lookback window.  
Do not reinterpret this as calendar months or “start of day” logic.

## 9.4 Invalid `now` handling

If repo style already has a validation posture for invalid dates, follow it.  
If no existing posture exists, fail closed by throwing a bounded developer-facing `Error` for invalid `now` rather than emitting invalid ISO strings.

Do not silently coerce invalid dates.

---

# 10. Required Live Search Client Translation

Modify:

```text
adobe-sign-live-search-client.ts
```

while preserving all existing transport guarantees:

- access-point validation;
- token-in-header only;
- timeout/network normalization;
- response parsing;
- sanitized error posture.

## 10.1 Action queue body — must remain unchanged

The body generated for:

```ts
intent: 'action-queue'
```

must remain behaviorally identical to the existing working pending implementation, except for any diagnostics now becoming explicit about the intent.

Do not add completed fields to the action-queue body.

## 10.2 Recent completions body — required semantics

For:

```ts
intent: 'recent-completions'
```

generate a bounded provider-side search body that includes:

```json
{
  "scope": ["AGREEMENT_ASSETS"],
  "agreementAssetsCriteria": {
    "type": ["AGREEMENT"],
    "status": ["SIGNED"],
    "modifiedDate": {
      "range": {
        "...lower-bound-key...": "<modifiedWindowStartAtUtc>",
        "...upper-bound-key...": "<modifiedWindowEndAtUtc>"
      }
    },
    "startIndex": "<decoded cursor start index>",
    "pageSize": "<clamped page size>",
    "sortByField": "<Prompt 01 / authoritative source confirmed recency sort field>",
    "sortOrder": "<Prompt 01 / authoritative source confirmed descending sort order>"
  }
}
```

The exact range comparator keys and exact sort-field literal must follow the Prompt 01 confirmed source truth. If that confirmation is absent, invoke the fail-closed rule in Section 2.5.

## 10.3 Cursor behavior

Reuse the existing opaque cursor/start-index behavior already implemented in the live search client.

Do not invent a new cursor grammar for completed records in this prompt unless repo truth proves the existing grammar cannot support the second intent. If a cursor-seam incompatibility is discovered, stop and report it rather than widening scope.

---

# 11. Required Search-Request Diagnostics Extension

Prompt 03 must add **safe, bounded, non-secret** diagnostics proving what request shape was emitted.

## 11.1 Extend the search request diagnostics contract

In:

```text
adobe-sign-search-client.ts
```

extend the `searchRequestDiagnostics` shape with:

```ts
readonly queryIntent?: AdobeSignSearchIntent;
readonly agreementAssetsCriteriaAgreementTypeCount?: number;
readonly agreementAssetsCriteriaSignedStatusCount?: number;
readonly agreementAssetsCriteriaHasModifiedDateField?: boolean;
readonly agreementAssetsCriteriaModifiedDateHasRangeField?: boolean;
readonly agreementAssetsCriteriaModifiedDateRangeHasLowerBoundField?: boolean;
readonly agreementAssetsCriteriaModifiedDateRangeHasUpperBoundField?: boolean;
readonly agreementAssetsCriteriaHasSortByField?: boolean;
readonly agreementAssetsCriteriaHasSortOrderField?: boolean;
```

Preserve existing diagnostics fields.

## 11.2 Extend runtime diagnostic properties

In:

```text
adobe-sign-runtime-diagnostics.ts
```

add flattened counterparts:

```ts
readonly searchQueryIntent?: AdobeSignSearchIntent;
readonly searchAgreementAssetsCriteriaAgreementTypeCount?: number;
readonly searchAgreementAssetsCriteriaSignedStatusCount?: number;
readonly searchAgreementAssetsCriteriaHasModifiedDateField?: boolean;
readonly searchAgreementAssetsCriteriaModifiedDateHasRangeField?: boolean;
readonly searchAgreementAssetsCriteriaModifiedDateRangeHasLowerBoundField?: boolean;
readonly searchAgreementAssetsCriteriaModifiedDateRangeHasUpperBoundField?: boolean;
readonly searchAgreementAssetsCriteriaHasSortByField?: boolean;
readonly searchAgreementAssetsCriteriaHasSortOrderField?: boolean;
```

Import the intent type using the repo’s current type-import conventions.

## 11.3 Diagnostics builder expectations

Update the live search request diagnostics builder so that:

### For action-queue intent
- `queryIntent === 'action-queue'`
- new completed-specific booleans/counts evaluate to false/zero where applicable
- existing pending diagnostics remain valid

### For recent-completions intent
- `queryIntent === 'recent-completions'`
- agreement type count proves the agreement asset filter exists
- signed-status count proves the completed terminal-state filter exists
- modified-date field and nested range booleans prove the date bound exists
- lower/upper range-bound booleans prove both bounds were emitted
- sort field/order booleans prove provider-side descending sort fields were emitted

No raw ISO values, tokens, Adobe URLs, or response-body content should be added to diagnostics.

---

# 12. Required Tests

Add or update focused tests to lock the seam.

## 12.1 Action-queue regression tests

Prove that:

- `buildAdobeSignSearchRequest(...)` still returns the same bounded pending request posture plus `intent: 'action-queue'`;
- pending live search body remains unchanged in substance;
- pending diagnostics now identify `queryIntent: 'action-queue'`.

## 12.2 Recent request-builder tests

Create tests for:

- default page-size clamp;
- minimum clamp;
- maximum clamp;
- cursor preservation;
- required `intent: 'recent-completions'`;
- `windowDays: 30`;
- deterministic `modifiedWindowStartAtUtc`;
- deterministic `modifiedWindowEndAtUtc`;
- invalid `now` fail-closed behavior if implemented.

Use fixed timestamps. Do not use current system time in tests.

## 12.3 Recent live-body tests

Prove that:

- recent completions body includes:
  - `scope: ['AGREEMENT_ASSETS']`
  - `type: ['AGREEMENT']`
  - `status: ['SIGNED']`
  - `modifiedDate.range`
  - exact confirmed lower/upper range keys
  - start index and page size
  - exact confirmed sort field and descending sort order
- no pending-only action-status request body shape leaks into recent-completions intent.

## 12.4 Diagnostics tests

Prove:

- recent request diagnostics contain:
  - `queryIntent: 'recent-completions'`
  - agreement type count
  - signed status count
  - modified-date/range booleans
  - lower/upper bound booleans
  - sort field/order booleans
- pending request diagnostics contain:
  - `queryIntent: 'action-queue'`
- diagnostics do not contain:
  - bearer token text
  - raw Adobe response bodies
  - raw source URLs

---

# 13. Explicit Non-Scope

Do **not**:

- implement `adobe-sign-recent-completions-adapter.ts`;
- modify `my-work-read-model-provider.ts`;
- modify `my-work-adobe-sign-live-read-model-provider.ts`;
- modify `my-work-read-model-provider-resolver.ts`;
- register `GET /api/my-work/me/adobe-sign/recent-completions`;
- modify route handlers;
- modify frontend code;
- modify shared model Prompt 02 files unless a type import is absolutely required for backend compilation; if such a need appears, stop and report rather than expanding scope silently;
- update docs;
- clean whitespace in unrelated dirty docs;
- edit manifests/package solution/version files;
- touch `pnpm-lock.yaml`;
- run live Adobe calls;
- stage files;
- commit.

---

# 14. Required Validation

Run:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
git diff --check
md5 pnpm-lock.yaml
```

Run a targeted formatter/prettier check only on Prompt 03 touched files if that is already part of repo practice for similar prior prompts.

If `git diff --check` flags the already-known out-of-scope B05.4 research-summary whitespace issue, report it explicitly as pre-existing and verify the touched Prompt 03 files themselves are clean.

---

# 15. Required Final Verification

After implementation, run and report:

```bash
git status --short
git diff --stat
git diff -- backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign
md5 pnpm-lock.yaml
```

Expected lockfile posture:

```text
8e84df40772d58ba2219257e05f8f46c
```

unless the baseline already changed before Prompt 03 started. Prompt 03 itself must not change the lockfile.

Do not stage or commit.

---

# 16. Required Closeout Format

Return your closeout in this exact structure:

## 1. Implementation Decision
- `PASS`, `PARTIAL`, or `BLOCKED`

## 2. Preflight Snapshot
- branch
- HEAD
- Prompt 02 commit visibility
- original dirty-file list
- original `pnpm-lock.yaml` MD5

## 3. Prompt 01 Syntax Confirmation Consumed
- exact range comparator keys used
- exact sortByField literal used
- exact sortOrder literal used
- source of truth used for each

## 4. Files Inspected

## 5. Files Changed

## 6. Search-Intent Outcome
- exact intent type
- exact request union shape
- confirmation that pending builder API was preserved

## 7. Recent-Completions Request Builder Outcome
- exported builder name
- exported window constant
- page-size clamp behavior
- cursor behavior
- injected `now` handling
- computed window semantics

## 8. Live Search Translation Outcome
- exact recent-completions body fields emitted
- confirmation that action-queue body remained behaviorally unchanged

## 9. Diagnostics Outcome
- exact new request diagnostics fields
- exact new runtime diagnostic fields
- token/raw-body/raw-URL non-leak confirmation

## 10. Test Coverage Added or Updated

## 11. Validation Commands and Results

## 12. Lockfile / Out-of-Scope File Integrity
- final MD5
- confirmation that the four known out-of-scope dirty files were not touched
- note on any pre-existing `git diff --check` warning

## 13. Residual Risks or Follow-On Notes
- note what Prompt 04 should inherit
- do not propose new product decisions

## 14. Prompt 04 Readiness
- `READY` or `NOT READY`
- one-sentence reason

---

# 17. Stop Condition

Stop after Prompt 03 is complete.

Do not proceed to the completed adapter, provider integration, route registration, frontend work, documentation reconciliation, staging, or commit work.
