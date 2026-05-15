# 04 — Full and Absolute Implementation Plan

## Objective

Implement the Adobe Sign completed-agreements enhancement end to end in the My Dashboard application with no unresolved product or architecture decisions.

## Current baseline

The application currently has a production-shaped, now-working Adobe Sign **pending action queue** that:

- resolves the authenticated Adobe principal;
- acquires or refreshes tokens;
- calls Adobe `/v6/search`;
- parses the confirmed live response envelope;
- maps supported actionable queue statuses;
- renders a single consolidated Adobe Sign card on My Dashboard.

This plan preserves all of that.

## Target future state

The same single Adobe Sign card will expose two internal views through a dynamic header toggle:

```text
Adobe Sign
Action Queue    Completed
```

### `Action Queue` view

Unchanged pending behavior.

### `Completed` view

A lazy-loaded, read-only list of recently completed Adobe Sign agreements, defined as:

```text
terminal-completed Adobe Sign agreements visible to the authenticated Adobe principal,
bounded to the last 30 days, ordered most recent first.
```

## Architecture

### 1. Shared model layer

Add:

```text
packages/models/src/myWork/AdobeSignRecentCompletions.ts
```

Export from:

```text
packages/models/src/myWork/index.ts
```

Extend route registry in:

```text
packages/models/src/myWork/MyWorkReadModels.ts
```

with:

```ts
'adobe-sign-recent-completions': 'my-work/me/adobe-sign/recent-completions'
```

Add the completed response type to `MyWorkReadModelResponseMap`.

Add deterministic fixtures in:

```text
packages/models/src/myWork/fixtures/adobeSignRecentCompletionsReadModels.ts
```

Required scenario fixtures:

- available populated;
- available empty;
- available paged;
- partial;
- configuration required;
- authorization required;
- principal unresolved;
- source unavailable;
- backend unavailable.

### 2. Completed DTO family

Define:

```ts
MyWorkAdobeSignRecentCompletionsQuery
MyWorkAdobeSignRecentCompletionsItem
MyWorkAdobeSignRecentCompletionsSummary
MyWorkAdobeSignRecentCompletionsPagination
MyWorkAdobeSignRecentCompletionsFreshness
MyWorkAdobeSignRecentCompletionsReadModel
```

#### Query

```ts
interface MyWorkAdobeSignRecentCompletionsQuery {
  readonly pageSize?: number;
  readonly cursor?: string;
}
```

Do not expose user-configurable status/date/sort filters.

#### Summary

```ts
interface MyWorkAdobeSignRecentCompletionsSummary {
  readonly countBasis: 'returned-items' | 'provider-total';
  readonly completedAgreementCount: number;
  readonly windowDays: 30;
}
```

#### Item

```ts
interface MyWorkAdobeSignRecentCompletionsItem {
  readonly itemId: string;
  readonly sourceSystem: 'adobe-sign';
  readonly agreementId: string;
  readonly agreementName: string;
  readonly agreementStatus: 'COMPLETED';
  readonly sender?: MyWorkAdobeSignSenderSummary;
  readonly completedAtUtc?: string;
  readonly modifiedAtUtc?: string;
  readonly sourceOpenUrl?: string;
}
```

### 3. Backend search intent layer

Extend the search seam to carry bounded query intent:

```ts
type AdobeSignSearchIntent =
  | 'action-queue'
  | 'recent-completions';
```

Do not create a duplicate low-level HTTP client.

The low-level live search client remains the sole transport seam.

### 4. Completed request builder

Add:

```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-recent-completions-request.ts
```

Responsibilities:

- fixed intent = `recent-completions`;
- page-size clamp;
- cursor pass-through;
- fixed 30-day window metadata;
- request semantics for completed status, recent-window date bound, descending order.

Prompt 01 must determine the exact current Adobe wire-body serialization to use.

### 5. Search client translation

Update:

```text
adobe-sign-search-client.ts
adobe-sign-live-search-client.ts
```

so that the search input can distinguish:

- `action-queue`
- `recent-completions`

and build the correct Adobe HTTP body for each intent.

#### Pending lane

Must remain behaviorally unchanged.

#### Completed lane

Must emit a bounded provider-side query with:

- agreement asset scope;
- completed terminal-status semantics;
- 30-day window;
- descending recency sort.

### 6. Completed adapter

Add:

```text
adobe-sign-recent-completions-adapter.ts
```

Responsibilities:

1. principal resolution;
2. token acquisition;
3. completed request builder invocation;
4. search client call;
5. source-status translation;
6. mapping rows to completed DTOs;
7. source-open-url policy evaluation;
8. summary construction;
9. pagination/freshness;
10. diagnostics.

Do not reuse the pending action adapter for completed rows. It encodes action-specific status and metrics that are wrong for completed history.

### 7. Provider integration

Update:

```text
my-work-read-model-provider.ts
my-work-adobe-sign-live-read-model-provider.ts
my-work-read-model-provider-resolver.ts
```

Add:

```ts
getAdobeSignRecentCompletions(...)
```

Do not change `getMyWorkHome(...)` beyond any type-interface adjustments required to compile.

### 8. Route integration

Update:

```text
my-work-read-model-routes.ts
```

Add:

```http
GET /api/my-work/me/adobe-sign/recent-completions
```

Validation rules must match the focused queue route posture:

- `pageSize`: integer 1–50;
- `cursor`: bounded opaque string, max 256 chars;
- no actor/user/principal override;
- actor derived from auth claims.

### 9. Diagnostics and telemetry

Update:

```text
adobe-sign-runtime-diagnostics.ts
```

Add event:

```text
adobeSign.read.recentCompletions.result
```

Add search telemetry discriminant:

```ts
queryIntent: 'action-queue' | 'recent-completions'
```

Add completed request-shape booleans proving:

- completed-status filter field emitted;
- date-range filter field emitted;
- sort field emitted.

Telemetry must remain bounded and sanitized.

### 10. Frontend client layer

Update:

```text
apps/my-dashboard/src/api/myWorkReadModelClient.ts
apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts
apps/my-dashboard/src/api/myWorkFixtureReadModelClient.ts
```

Add:

```ts
getAdobeSignRecentCompletions(
  query?: MyWorkAdobeSignRecentCompletionsQuery
): Promise<MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel>>
```

### 11. Frontend completed view state

Add:

```text
apps/my-dashboard/src/modules/adobeSign/useAdobeSignRecentCompletionsReadModel.ts
```

Responsibilities:

- lazy-fetch only on first `Completed` selection;
- maintain request state:
  - idle
  - loading
  - ready
  - error/fallback envelope as already normalized by client layer
- retain fetched envelope in memory while page remains mounted;
- do not refetch merely due to toggling back and forth.

### 12. Frontend view-model layer

Update:

```text
apps/my-dashboard/src/state/myWorkCardViewModel.ts
```

Add completed selectors:

```ts
selectAdobeRecentCompletionsSummaryVmFromSummary
selectAdobeRecentCompletionsListVmFromItems
selectAdobeSignCompletedViewStateCopy
```

The completed selectors must not reuse required-action labels.

### 13. Card header toggle

Update:

```text
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx
```

Replace static card title with a dynamic title control.

#### UI behavior

Default:

```text
Action Queue = selected
Completed = deselected
```

Selected completed:

```text
Action Queue = deselected
Completed = selected
```

#### Semantics

Use an accessible, two-state view selector. The implementation must satisfy:

- keyboard activation;
- visible focus;
- selected/deselected state exposure for tests;
- no nested interactive invalidity;
- no layout breakage.

The preferred implementation is a compact tab-like control because the selected state conditionally swaps panel content.

### 14. Toggle visibility

Render the header toggle only when the overall Adobe source is data-capable:

```text
available
partial
```

Do not render toggle when the entire card is in:

```text
loading
authorization-required
configuration-required
principal-unresolved
source-unavailable
backend-unavailable
```

### 15. Completed body rendering

#### Loading

Show compact completed-panel loading posture.

#### Empty

```text
No completed Adobe Sign agreements were found in the last 30 days.
```

#### Populated

Show:

- compact metric:
  - `Completed in last 30 days`
- up to 5 completed agreement rows;
- each row:
  - agreement name;
  - `Completed {date}` only if `completedAtUtc` exists;
  - otherwise `Updated {date}` if `modifiedAtUtc` exists;
  - sender if available;
  - `Open in Adobe Sign` only when `sourceOpenUrl` exists.

#### Degraded

Scoped completed-panel unavailable copy:

```text
Recently completed Adobe Sign agreements are temporarily unavailable.
```

Do not collapse a healthy pending action queue because a lazy completed route fails.

### 16. Cross-view state matrix

#### Healthy available pending + completed not fetched

- action queue visible;
- header toggle visible;
- no completed request made.

#### Healthy available pending + completed loading

- completed header selected;
- completed panel skeleton/loading rendered.

#### Healthy available pending + completed populated

- completed header selected;
- completed metric/list rendered.

#### Healthy available pending + completed empty

- completed empty copy rendered.

#### Healthy available pending + completed degraded

- completed scoped unavailable copy rendered;
- toggling back restores pending content unchanged.

#### Entire Adobe card unavailable/auth/config/principal

- no toggle;
- existing whole-card state copy remains.

### 17. Documentation reconciliation

Update:

- app README;
- authorization-required reference;
- B04 route/contract map;
- B05.3 module state matrices;
- B05.3 single-card prompt authority;
- comprehensive My Dashboard Adobe Sign development plan.

### 18. Final acceptance criteria

The implementation is complete only when:

1. pending card behavior is unchanged;
2. current static title is replaced by the dynamic header toggle;
3. `Completed` is lazy-loaded on first selection only;
4. completed route, DTO family, adapter, provider, client, view-model, UI, telemetry, and docs exist;
5. provider-side completed/date/sort query syntax is verified and implemented;
6. no completed scan fallback ships without provider-side bounded filtering;
7. all tests, check-types, builds, format checks, and diff checks pass;
8. no lockfile, manifest, CI/CD, deployment, or unrelated scope changes are staged.
