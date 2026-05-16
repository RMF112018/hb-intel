# B05.4 Prompt 04 — Backend Recent-Completions Adapter, Provider Integration, Protected Route, and Result Telemetry

## Execution Mode

You are executing **B05.4 Prompt 04** for the **My Dashboard Adobe Sign Completed lane**.

This prompt is **implementation-authorized** and **scope-bounded**.

You are to implement the backend read-model lane that sits on top of the already-completed Prompt 02 and Prompt 03 foundations:

- completed read-model adapter;
- provider interface + provider implementations;
- provider resolver composition;
- protected completed backend route;
- completed runtime-result telemetry;
- focused backend tests;
- precise mixed-hunk protection where Prompt 04 must edit files that already contain unrelated pre-existing working-tree drift.

You are **not** to implement frontend clients, frontend hooks, card/header toggle UI, view-model selectors, documentation reconciliation, manifests, deployment work, package versions, lockfile changes, CI/CD changes, or unrelated My Projects / project-links remediation.

Do **not** re-read files that are still in your current context or memory unless they changed, the context is stale, or the scope expanded.

---

# 1. Governing Baseline After Prompt 03

Prompt 02 committed:

```text
15ce8bf37
models(my-work): add Adobe Sign recent completions contracts and fixtures
```

Prompt 03 committed:

```text
aa4d923f6
functions(adobe-sign): add recent-completions search intent and live request seam
```

Prompt 04 must execute on:

```text
main at commit aa4d923f6 or a direct descendant that preserves both Prompt 02 and Prompt 03 foundations.
```

---

# 2. Inherited Locked Truths

## 2.1 Completed shared-model truth from Prompt 02

The completed read-model family already exists. Do **not** redesign it.

Locked route registry key:

```ts
'adobe-sign-recent-completions'
```

Locked route path:

```text
my-work/me/adobe-sign/recent-completions
```

Locked completed item posture:

```ts
completionState: 'completed'
modifiedAtUtc?: string
```

Forbidden completed item posture:

```ts
completedAtUtc
agreementStatus: 'COMPLETED'
```

The Prompt 04 adapter must map exactly into the committed Prompt 02 DTO family. It must not reintroduce stale assumptions from older package materials.

## 2.2 Completed request/search truth from Prompt 03

Prompt 03 already implemented the bounded backend search seam.

Available search intent discriminator:

```ts
'adobe-sign-action-queue'
```

is **not** the Prompt 03 intent. The actual search-intent seam is:

```ts
'action-queue'
'recent-completions'
```

Prompt 04 must consume, not redesign, the Prompt 03 seam.

Prompt 03 established:

- `AdobeSignSearchIntent = 'action-queue' | 'recent-completions'`
- `buildAdobeSignRecentCompletionsRequest(...)`
- a deterministic 30-day modified-date window;
- `type: ['AGREEMENT']`
- `status: ['SIGNED']`
- `modifiedDate.range: { gt, lt }`
- `sortByField: 'CREATED_DATE'`
- `sortOrder: 'DESC'`
- request-shape diagnostics with `searchQueryIntent` and completed-query structural booleans/counts.

Prompt 04 must not duplicate, weaken, or contradict any of that.

## 2.3 Product/UX decisions that Prompt 04 must not reopen

Prompt 04 is backend-only, but it inherits the closed B05.4 product decisions:

- one Adobe card only;
- same card, separate read-model lanes;
- the future UI header toggle remains:
  - `Action Queue`
  - `Completed`
- completed lane remains lazy-loaded later by frontend prompts;
- completed lane means recently completed agreements visible to the authenticated Adobe principal;
- no user-personal completion claims;
- no home-envelope completed projection;
- no unbounded adapter-side completed scan.

---

# 3. Mandatory Preflight

Run and report:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -20
md5 pnpm-lock.yaml
```

## 3.1 Required commit visibility

The log must show both:

```text
15ce8bf37 models(my-work): add Adobe Sign recent completions contracts and fixtures
aa4d923f6 functions(adobe-sign): add recent-completions search intent and live request seam
```

If either commit is missing or `HEAD` has drifted in a way that alters the completed-contract or search-seam assumptions, stop and report before editing.

## 3.2 Expected lockfile MD5 inherited from Prompt 03

```text
8e84df40772d58ba2219257e05f8f46c
```

Prompt 04 must not change `pnpm-lock.yaml`.

---

# 4. Known Pre-Existing Dirty Working-Tree State

Prompt 03 closeout identified the following pre-existing dirty files before its work:

```text
M apps/my-dashboard/config/package-solution.json
M apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json
M backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts
M backend/functions/src/hosts/my-work-read-model/read-models/my-work-read-model-provider.ts
M backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts
M docs/architecture/plans/MASTER/spfx/my-dashboard/B05.4 - a-s-completed/02_Outside_Research_Summary.md
M docs/architecture/plans/MASTER/spfx/my-dashboard/B05.4 - a-s-completed/03_Closed_Decision_Register.md
M tools/spfx-shell/config/package-solution.json
?? backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-runtime-diagnostics.ts
```

Prompt 04 must not reset, overwrite, stage, or claim ownership of out-of-scope drift.

## 4.1 Critical mixed-hunk overlap

Prompt 04 must edit these two files, which were already dirty before Prompt 03:

```text
backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts
backend/functions/src/hosts/my-work-read-model/read-models/my-work-read-model-provider.ts
```

Those files contain unrelated project-links drift outside Prompt 04 scope.

### Mixed-hunk preservation protocol — mandatory

Before editing either overlapping file, snapshot the existing unstaged diff:

```bash
mkdir -p /tmp/b054-p04-preexisting-diffs

git diff -- backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts \
  > /tmp/b054-p04-preexisting-diffs/routes.preexisting.diff

git diff -- backend/functions/src/hosts/my-work-read-model/read-models/my-work-read-model-provider.ts \
  > /tmp/b054-p04-preexisting-diffs/provider.preexisting.diff
```

After implementation:

1. inspect the final full diff for both files;
2. confirm the pre-existing project-links hunks are still present and not altered by Prompt 04;
3. stage only Prompt 04 hunks in overlapping dirty files using interactive staging or an equivalent hunk-isolation workflow;
4. do **not** stage unrelated project-links hunks;
5. if Prompt 04 hunks cannot be cleanly isolated from pre-existing project-links hunks, stop and return:

```text
BLOCKED-MIXED-HUNKS
```

Do not commit a mixed-scope backend route/provider diff.

---

# 5. Prompt 04 Objective

Implement the backend recent-completions read-model lane end to end, consuming the already-established Prompt 02 contracts and Prompt 03 search seam.

The final Prompt 04 state must provide:

1. a new completed adapter:
   - `adobe-sign-recent-completions-adapter.ts`
2. provider interface support:
   - `getAdobeSignRecentCompletions(...)`
3. live provider delegation:
   - `MyWorkAdobeSignLiveReadModelProvider.getAdobeSignRecentCompletions(...)`
4. mock provider support using completed fixtures:
   - `MyWorkMockReadModelProvider.getAdobeSignRecentCompletions(...)`
5. provider resolver live/mock/fallback composition support;
6. protected backend route:
   - `GET /api/my-work/me/adobe-sign/recent-completions`
7. route query validation matching the focused pending route:
   - `pageSize` integer 1–50
   - `cursor` <= 256 characters
   - actor derived from auth claims only
8. completed result telemetry:
   - `adobeSign.read.recentCompletions.result`
9. focused tests proving:
   - adapter mappings;
   - provider integration;
   - resolver composition;
   - mock provider fixture selection;
   - route behavior;
   - runtime telemetry;
   - home read model remains pending-only.

---

# 6. Search-Row Compatibility Gate

Prompt 03 completed request-body translation, but Prompt 04 must verify the **row normalization seam** is adequate for recent-completions adapter mapping before relying on it.

Current repo truth may still include a normalized `AdobeSignSearchClientItem` shape and live row mapper that are historically pending-action-oriented.

## 6.1 Required gate

Before implementing the completed adapter, inspect:

```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-search-client.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-search-client.ts
```

Confirm whether the Prompt 03 recent-completions search path will preserve rows needed by the completed adapter without requiring recipient-action semantics.

At minimum, confirm:

- completed adapter can access:
  - `agreementId`
  - `agreementName`
  - `senderDisplayName?`
  - `senderEmail?`
  - `modifiedAtUtc?`
  - `sourceOpenUrlCandidate?`
- rows are not silently discarded solely because a pending-only recipient-action property is absent.

## 6.2 Gate outcome handling

### If repo truth confirms the existing Prompt 03 seam already preserves recent-completions rows correctly

Proceed with the adapter/provider/route work.  
Do not touch search-client files.

### If repo truth shows recent-completions rows would be silently discarded or cannot reach the adapter without pending-action-only fields

Stop and return:

```text
BLOCKED-RECENT-COMPLETIONS-ROW-SEAM
```

with:

- exact file/line evidence;
- exact property that causes the row loss;
- whether the issue originates in search-client typing, live row mapping, or both.

Do **not** silently widen Prompt 04 into a search-client remediation prompt.  
Do **not** guess provider row shapes.

This gate exists to prevent Prompt 04 from shipping an adapter against a row seam that cannot carry completed records.

---

# 7. Exact Files to Inspect

Inspect only what is necessary.

## 7.1 Adapter precedent and Adobe utilities

```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-queue-adapter.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-source-handoff-policy.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-recent-completions-request.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-search-client.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-runtime-diagnostics.ts
```

## 7.2 Provider/resolver surfaces

```text
backend/functions/src/hosts/my-work-read-model/read-models/my-work-read-model-provider.ts
backend/functions/src/hosts/my-work-read-model/read-models/my-work-adobe-sign-live-read-model-provider.ts
backend/functions/src/hosts/my-work-read-model/read-models/my-work-mock-read-model-provider.ts
backend/functions/src/hosts/my-work-read-model/read-models/my-work-read-model-provider-resolver.ts
```

## 7.3 Route surface

```text
backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts
```

## 7.4 Canonical backend tests

Use repo truth to identify existing canonical tests. Prefer extending existing test files over creating duplicates.

At minimum, inspect the canonical test coverage for:

- action queue adapter patterns;
- live provider patterns;
- mock provider patterns;
- provider resolver patterns;
- route patterns;
- runtime diagnostics result event patterns.

---

# 8. Files Allowed to Add or Modify

## 8.1 Add

```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-recent-completions-adapter.ts
```

Add focused adapter tests in the canonical test location if no suitable test file already exists.

## 8.2 Modify

```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-runtime-diagnostics.ts
backend/functions/src/hosts/my-work-read-model/read-models/my-work-read-model-provider.ts
backend/functions/src/hosts/my-work-read-model/read-models/my-work-adobe-sign-live-read-model-provider.ts
backend/functions/src/hosts/my-work-read-model/read-models/my-work-mock-read-model-provider.ts
backend/functions/src/hosts/my-work-read-model/read-models/my-work-read-model-provider-resolver.ts
backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts
backend/functions/src/hosts/my-work-read-model/**/*.test.ts
```

## 8.3 Explicitly not allowed unless the Section 6 gate blocks the prompt

Do **not** modify:

```text
adobe-sign-search-client.ts
adobe-sign-live-search-client.ts
adobe-sign-search-request.ts
adobe-sign-recent-completions-request.ts
```

Prompt 03 owns those seams and is already committed.  
If Section 6 detects an unresolved row-seam problem, stop and report the blocker instead of modifying them.

---

# 9. Required Completed Adapter Contract

Add:

```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-recent-completions-adapter.ts
```

Use the action-queue adapter as structural precedent, but do **not** reuse action-specific semantics.

## 9.1 Required exports

Expose:

```ts
IAdobeSignRecentCompletionsAdapter
AdobeSignRecentCompletionsAdapterDeps
createAdobeSignRecentCompletionsAdapter(...)
```

Use repo-consistent exact naming if adjacent adapters establish a stricter pattern, but preserve this external meaning.

## 9.2 Required dependency shape

The completed adapter must accept:

- `resolvePrincipal`
- `tokenService`
- `searchClient`
- `now: () => Date`
- optional `urlPolicyConfig`

This should mirror the action-queue adapter composition posture.

## 9.3 Required method

```ts
getRecentCompletions(
  context: MyWorkReadContext,
  query: MyWorkAdobeSignRecentCompletionsQuery,
): Promise<MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel>>
```

If repo naming convention would more clearly favor `getAdobeSignRecentCompletions`, use the adapter-local name above while the provider method uses the full provider-facing name.

## 9.4 Request builder usage

The adapter must call the already-implemented Prompt 03 builder:

```ts
buildAdobeSignRecentCompletionsRequest({
  pageSize: query.pageSize,
  cursor: query.cursor,
  now,
})
```

Do not reconstruct Adobe request semantics inside the adapter.

---

# 10. Completed Adapter Behavior — Locked

## 10.1 Principal resolution

Mirror action queue:

- unresolved/failed principal result maps through existing source-status/warning vocabulary;
- empty completed read model is returned;
- completed result telemetry emits `principal-resolution`.

## 10.2 Token acquisition

Mirror action queue:

- `authorization-required` -> completed envelope `authorization-required`
- source store/unavailable posture -> completed envelope `source-unavailable`
- completed result telemetry emits `token-acquisition`.

## 10.3 Search client result handling

Mirror action queue status translation:

- search `unauthorized` -> envelope `authorization-required`
- search `unreachable` -> envelope `source-unavailable`
- search `ok` -> map completed rows

The adapter must emit the completed result event with `resultStage: 'search'` when it exits early due to search failure.

## 10.4 Completed item mapping

Map each retained row to:

```ts
MyWorkAdobeSignRecentCompletionsItem
```

with:

```ts
itemId: `adobe-sign:completed-agreement-${agreementId}`
sourceSystem: 'adobe-sign'
agreementId
agreementName
completionState: 'completed'
sender?: ...
modifiedAtUtc?: ...
sourceOpenUrl?: ...
```

### Absolutely forbidden

Do not add or map:

```ts
completedAtUtc
agreementStatus: 'COMPLETED'
requiredAction
adobeRecipientStatus
actorWhoCompleted
```

The completed adapter must not claim or infer personal completion behavior.

## 10.5 Sender mapping

Mirror the action-queue sender summary style:

- include sender only when display name or email exists;
- use the Prompt 02 shared sender summary type via the DTO contract.

## 10.6 Source-open-url policy

Reuse:

```ts
evaluateAdobeSignSourceHandoff(...)
```

with the same policy boundary as the action queue.

Behavior:

- policy `allowed` -> populate `sourceOpenUrl`
- policy `omitted` -> warning:
  - `source-open-url-omitted`
- policy `rejected` -> warning:
  - `source-open-url-policy-rejected`
  - message contains sorted, comma-separated policy reason codes, matching existing doctrine

## 10.7 Source-status rule for URL warnings

Do **not** mark the completed envelope `partial` solely because:

- source-open-url candidate was omitted; or
- source-open-url candidate was policy-rejected.

This mirrors the current action-queue doctrine: URL-handoff warnings remain warnings and do not degrade the overall source status by themselves.

## 10.8 Summary

Use:

```ts
countBasis: 'returned-items'
completedAgreementCount: items.length
windowDays: 30
```

Do not introduce provider-total behavior unless a provider total is already present in the normalized search result and the existing contract explicitly supports it. Prompt 04 does not add a provider-total seam.

## 10.9 Pagination

Map:

```ts
pageSize: request.pageSize
hasMore: searchResult.nextCursor !== undefined
nextCursor?: searchResult.nextCursor
```

## 10.10 Freshness

Use:

```ts
freshness: {
  state: 'fresh',
  generatedAtUtc,
}
```

for successful mapped results.

Use the same degraded `unknown` or empty posture already established by repo convention for early-return envelopes.

---

# 11. Runtime Diagnostics and Telemetry

Modify:

```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-runtime-diagnostics.ts
```

## 11.1 Add event name

Extend:

```ts
AdobeSignRuntimeDiagnosticEventName
```

with:

```ts
'adobeSign.read.recentCompletions.result'
```

## 11.2 Add recent-completions result stage type

Add:

```ts
export type AdobeSignRecentCompletionsResultStage =
  | 'principal-resolution'
  | 'token-acquisition'
  | 'search'
  | 'mapped-results';
```

Update diagnostic property typing so:

```ts
resultStage?: AdobeSignActionQueueResultStage | AdobeSignRecentCompletionsResultStage;
```

Do not rename or destabilize the existing action-queue result stage type.

## 11.3 Add window telemetry field

Add:

```ts
readonly windowDays?: 30;
```

to the runtime diagnostic properties.

## 11.4 Emit completed result telemetry from the adapter

Emit:

```text
adobeSign.read.recentCompletions.result
```

with bounded properties:

- `sourceStatus`
- `resultStage`
- `warningCodes`
- `itemCount` when mapping succeeds
- `hasMore` when mapping succeeds
- `windowDays: 30`

No raw URLs.  
No tokens.  
No raw Adobe bodies.  
No actor identifiers.  
No OAuth artifacts.

## 11.5 Search-query diagnostics are already owned by Prompt 03

Prompt 04 must **consume** the Prompt 03 search diagnostics.  
Do not duplicate or re-add:

- `searchQueryIntent`
- completed-request structural booleans/counts.

If an adapter forwards or flattens existing search-failure diagnostics, preserve the Prompt 03 fields exactly.

---

# 12. Provider Interface and Implementation Requirements

## 12.1 Provider interface

Modify:

```text
my-work-read-model-provider.ts
```

Add imports for:

```ts
MyWorkAdobeSignRecentCompletionsQuery
MyWorkAdobeSignRecentCompletionsReadModel
```

Add:

```ts
getAdobeSignRecentCompletions(
  context: MyWorkReadContext,
  query: MyWorkAdobeSignRecentCompletionsQuery,
): Promise<MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel>>;
```

Do not alter existing home/action-queue/project-links method signatures except where local unrelated dirty work already exists and must be preserved.

## 12.2 Live Adobe provider

Modify:

```text
my-work-adobe-sign-live-read-model-provider.ts
```

Add constructor dependency:

```ts
recentCompletionsAdapter: IAdobeSignRecentCompletionsAdapter
```

Add delegation method:

```ts
getAdobeSignRecentCompletions(...)
```

that delegates one-to-one to:

```ts
recentCompletionsAdapter.getRecentCompletions(...)
```

### Critical home-envelope rule

Do **not** change:

```ts
getMyWorkHome(...)
```

It must remain pending/action-queue-only and must not call the completed adapter.

Tests must prove this.

## 12.3 Mock provider

Modify:

```text
my-work-mock-read-model-provider.ts
```

Implement:

```ts
getAdobeSignRecentCompletions(...)
```

using the committed Prompt 02 fixtures under the completed route family.

Required mock posture:

- if `simulateBackendUnavailable === true`:
  - return completed fixture `backend-unavailable`
- if `query.cursor` is a non-empty string:
  - return completed fixture `available-paged`
- otherwise:
  - return completed fixture `available`
- stamp top-level `generatedAtUtc` through the existing mock provider `now()` posture exactly as current action queue mock behavior does.

Do not change mock-provider home behavior.

## 12.4 Provider resolver composition

Modify:

```text
my-work-read-model-provider-resolver.ts
```

### Live stack composition

Add:

- `createAdobeSignRecentCompletionsAdapter`
- `IAdobeSignRecentCompletionsAdapter`

Extend the ready composition from:

```ts
actionQueueAdapter
```

to:

```ts
actionQueueAdapter
recentCompletionsAdapter
```

Compose both adapters with:

- same principal resolver;
- same token service;
- same search client;
- same clock posture;
- same URL-policy config posture if the composition already provides one.

### Live provider composition

Construct:

```ts
new MyWorkAdobeSignLiveReadModelProvider({
  actionQueueAdapter,
  recentCompletionsAdapter,
  now,
})
```

Expose:

```ts
getAdobeSignRecentCompletions(...)
```

from the returned provider object.

### Mock/fallback provider composition

Ensure both compose paths expose:

```ts
getAdobeSignRecentCompletions(...)
```

by delegating to the mock provider.

Do not weaken existing project-links provider composition.

---

# 13. Protected Route Integration

Modify:

```text
backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts
```

## 13.1 Route to register

```http
GET /api/my-work/me/adobe-sign/recent-completions
```

Recommended Azure Functions registration name:

```ts
getMyWorkAdobeSignRecentCompletions
```

Use a repo-consistent exact name if adjacent route naming conventions require a small variation, but the route path must remain exact.

## 13.2 Query parsing

Do **not** refactor the existing action-queue route parser in Prompt 04.

Add a dedicated completed-query parse helper that mirrors the focused action-queue route’s current semantics exactly:

- `pageSize`
  - optional
  - if present, integer
  - 1–50 only
- `cursor`
  - optional
  - non-empty
  - <= 256 chars
- invalid query:
  - 400 validation error response
  - same response helper posture as pending route

Do not parse or accept:

- actor;
- user;
- principal;
- status;
- sort;
- date range;
- window days.

## 13.3 Actor derivation

The completed route must derive actor context only from validated auth claims, the same as the pending route.

Do not allow request query or body overrides.

## 13.4 Diagnostics reporter

The completed route must pass the same Adobe runtime diagnostics reporter into provider context that the home and queue routes use.

Preserve unrelated project-links diagnostics work already present in the file; do not remove it.

---

# 14. Required Test Coverage

Use repo truth to extend canonical tests. Avoid duplicate parallel test families.

## 14.1 Completed adapter tests

Cover at minimum:

1. populated completed search result:
   - maps items to `completionState: 'completed'`
   - summary count matches
   - `windowDays: 30`
   - pagination/freshness correct
2. empty completed result;
3. paginated completed result;
4. principal unresolved early return;
5. authorization-required token path;
6. token/source unavailable path;
7. unauthorized search result maps to authorization-required;
8. unreachable search result maps to source-unavailable;
9. sender optional mapping;
10. modifiedAtUtc optional mapping;
11. source URL allowed;
12. source URL omitted warning;
13. source URL rejected warning;
14. telemetry event emitted with:
    - sourceStatus
    - resultStage
    - warningCodes
    - itemCount
    - hasMore
    - windowDays: 30

Do not write tests expecting `completedAtUtc` or `agreementStatus: 'COMPLETED'`.

## 14.2 Live provider tests

Prove:

- completed provider method delegates exactly once to completed adapter;
- action queue method still delegates to action adapter;
- home read model still calls only the action queue adapter and never the completed adapter.

## 14.3 Mock provider tests

Prove:

- default completed query returns available completed fixture;
- cursor query returns available-paged completed fixture;
- simulated backend unavailable returns completed backend-unavailable fixture;
- generatedAt stamping matches existing provider convention.

## 14.4 Resolver tests

Prove:

- live stack composition includes both adapters;
- live provider exposes completed method;
- mock/fallback compositions expose completed method;
- existing project-links/provider behavior remains present.

## 14.5 Route tests

Prove:

- completed route registers the exact path;
- successful GET returns completed envelope;
- provider receives actor derived from auth claims;
- valid `pageSize` and `cursor` pass through;
- invalid pageSize -> 400;
- oversize cursor -> 400;
- backend exception -> bounded 500 response;
- no actor/user/principal override posture exists.

## 14.6 Diagnostics typing/tests

Prove:

- `adobeSign.read.recentCompletions.result` is an allowed event;
- `windowDays` is accepted;
- result-stage typing supports recent completions without breaking pending diagnostics.

---

# 15. Validation Plan

Run the full Prompt 04 validation ledger:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions build
git diff --check
md5 pnpm-lock.yaml
```

Also run targeted formatting/prettier checks on Prompt 04 touched files if that is already repo practice for prior prompt waves.

## 15.1 Known inherited validation drift

Prompt 03 closeout reported unrelated pre-existing validation drift in My Work / project-links surfaces:

- `my-work-read-model-routes.ts`
  - duplicate `correlationId` type error
- `my-work-read-model-routes.test.ts`
  - project-links context expectation drift involving `projectLinksDiagnostics`

Prompt 04 must not remediate those out-of-scope issues unless they directly prevent the completed-route implementation from compiling in an inseparable way. If the same unrelated failures remain after Prompt 04:

- report them as inherited drift;
- prove the Prompt 04 tests added/modified are passing where they can be isolated;
- do not claim a clean global backend validation lane if the known unrelated drift remains.

If Prompt 04 introduces any new error beyond the known inherited drift, fix it before closeout.

## 15.2 Known diff-check drift

Prompt 03 closeout reported pre-existing trailing whitespace in:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/B05.4 - a-s-completed/02_Outside_Research_Summary.md
docs/architecture/plans/MASTER/spfx/my-dashboard/B05.4 - a-s-completed/03_Closed_Decision_Register.md
```

If `git diff --check` continues to report only those pre-existing doc issues, state that clearly.  
Do not edit those docs in Prompt 04.

---

# 16. Final Verification and Staging Discipline

After implementation, run:

```bash
git status --short
git diff --stat
git diff -- backend/functions/src/hosts/my-work-read-model
git diff -- backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign
git diff --cached --stat
md5 pnpm-lock.yaml
```

## 16.1 Staging rules

Stage only Prompt 04 files/hunks.

Never use:

```bash
git add .
```

Because two Prompt 04 files already contained unrelated dirty project-links hunks before Prompt 04:

```text
my-work-read-model-routes.ts
my-work-read-model-provider.ts
```

use hunk-isolated staging where necessary.

Before committing, explicitly prove:

- no out-of-scope project-links hunk is staged;
- no manifests are staged;
- no B05.4 research/decision docs are staged;
- no lockfile is staged;
- no deployment or package files are staged.

If staged diff cannot be made Prompt 04-only, stop and report:

```text
BLOCKED-MIXED-HUNKS
```

---

# 17. Commit Authorization

Prompt 04 is commit-authorized **only if**:

1. Section 6 search-row compatibility gate passes;
2. Prompt 04 code/tests are complete;
3. staged diff contains only Prompt 04 work;
4. no out-of-scope dirty hunk was staged;
5. new Prompt 04 errors are resolved.

## 17.1 Expected commit message

```text
functions(adobe-sign): add recent-completions read-model adapter and route
```

## 17.2 Expected commit body

```text
Implement the backend recent-completions Adobe Sign read-model lane on top of
the bounded Prompt 03 search seam.

- Add a dedicated recent-completions adapter that maps signed agreement search
  results into the committed completed DTO family with completionState:
  'completed' and modifiedAtUtc-only date posture.
- Extend the My Work provider interface, live Adobe provider, mock provider,
  and resolver composition with getAdobeSignRecentCompletions while keeping the
  dashboard home envelope pending-only.
- Register GET /api/my-work/me/adobe-sign/recent-completions with protected,
  actor-bound query validation matching the focused pending route.
- Emit sanitized adobeSign.read.recentCompletions.result telemetry, including
  source status, result stage, row count, pagination posture, warning codes,
  and the fixed 30-day window marker.
- Preserve existing source-open-url policy handling and do not stage unrelated
  project-links, manifest, documentation, lockfile, or deployment drift.

Validation:
- pnpm --filter @hbc/functions check-types
- pnpm --filter @hbc/functions test
- pnpm --filter @hbc/functions build
- git diff --check
- md5 pnpm-lock.yaml unchanged

Known unrelated validation drift, if still present, remains documented in the
closeout and is not included in this commit.
```

---

# 18. Required Closeout Format

Return your closeout in this exact structure:

## 1. Implementation Decision
- `PASS`, `PARTIAL`, or `BLOCKED`

## 2. Preflight Snapshot
- branch
- HEAD
- Prompt 02/03 commit visibility
- original dirty-file list
- original `pnpm-lock.yaml` MD5

## 3. Search-Row Compatibility Gate
- `PASS` or `BLOCKED-RECENT-COMPLETIONS-ROW-SEAM`
- exact conclusion
- supporting file evidence

## 4. Files Inspected

## 5. Files Changed

## 6. Completed Adapter Outcome
- exported symbols
- status translation posture
- item mapping posture
- explicit confirmation:
  - `completionState: 'completed'`
  - `modifiedAtUtc` only
  - no `completedAtUtc`
  - no `agreementStatus: 'COMPLETED'`
- summary/pagination/freshness posture
- source-open-url warning posture

## 7. Provider and Resolver Outcome
- provider method added
- live provider delegation
- mock provider fixture support
- resolver live/mock/fallback support
- home remains pending-only

## 8. Route Outcome
- exact function registration name
- exact route path
- query validation behavior
- actor derivation posture
- exception posture

## 9. Telemetry Outcome
- new event name
- result-stage type
- windowDays field
- emitted safe properties
- non-leak confirmation

## 10. Tests Added or Updated

## 11. Validation Commands and Results
- distinguish:
  - Prompt 04 clean results
  - inherited unrelated drift, if still present

## 12. Lockfile / Out-of-Scope File Integrity
- final MD5
- mixed-hunk preservation result
- staging proof
- confirmation that known out-of-scope dirty files were not staged

## 13. Commit Result
- commit hash
- commit message
- exact staged file/hunk scope

## 14. Residual Risks or Follow-On Notes
- what Prompt 05 should inherit
- no new product decisions

## 15. Prompt 05 Readiness
- `READY` or `NOT READY`
- one-sentence reason

---

# 19. Stop Condition

Stop after Prompt 04 is complete.

Do not proceed to frontend client work, completed-view hooks, card UI/header toggle work, view-model selector work, documentation reconciliation, manifests, deployment, or unrelated My Projects / project-links remediation.
