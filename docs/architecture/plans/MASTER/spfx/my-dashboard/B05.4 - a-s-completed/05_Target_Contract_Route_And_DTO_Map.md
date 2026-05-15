# 05 — Target Contract, Route, and DTO Map

## Route map

### Existing routes retained

```text
GET /api/my-work/me/home
GET /api/my-work/me/adobe-sign/action-queue
GET /api/my-work/me/project-links
```

### New route

```text
GET /api/my-work/me/adobe-sign/recent-completions
```

## Shared route registry

Add:

```ts
export const MY_WORK_READ_MODEL_ROUTE_PATHS = {
  home: 'my-work/me/home',
  'adobe-sign-action-queue': 'my-work/me/adobe-sign/action-queue',
  'adobe-sign-recent-completions': 'my-work/me/adobe-sign/recent-completions',
  'project-links': 'my-work/me/project-links',
} as const;
```

## Frontend read-model client

Add:

```ts
getAdobeSignRecentCompletions(
  query?: MyWorkAdobeSignRecentCompletionsQuery,
): Promise<MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel>>;
```

## Query DTO

```ts
export interface MyWorkAdobeSignRecentCompletionsQuery {
  readonly pageSize?: number;
  readonly cursor?: string;
}
```

## Summary DTO

```ts
export interface MyWorkAdobeSignRecentCompletionsSummary {
  readonly countBasis: 'returned-items' | 'provider-total';
  readonly completedAgreementCount: number;
  readonly windowDays: 30;
}
```

## Item DTO

```ts
export interface MyWorkAdobeSignRecentCompletionsItem {
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

## Pagination DTO

```ts
export interface MyWorkAdobeSignRecentCompletionsPagination {
  readonly pageSize: number;
  readonly hasMore: boolean;
  readonly nextCursor?: string;
}
```

## Freshness DTO

```ts
export interface MyWorkAdobeSignRecentCompletionsFreshness {
  readonly state: MyWorkFreshnessState;
  readonly generatedAtUtc: string;
  readonly lastSuccessfulSourceReadAtUtc?: string;
}
```

## Read-model DTO

```ts
export interface MyWorkAdobeSignRecentCompletionsReadModel {
  readonly moduleId: 'adobe-sign-recent-completions';
  readonly summary: MyWorkAdobeSignRecentCompletionsSummary;
  readonly items: readonly MyWorkAdobeSignRecentCompletionsItem[];
  readonly pagination: MyWorkAdobeSignRecentCompletionsPagination;
  readonly freshness: MyWorkAdobeSignRecentCompletionsFreshness;
}
```

## Search seam intent

```ts
export type AdobeSignSearchIntent =
  | 'action-queue'
  | 'recent-completions';
```

## Telemetry events

### Existing retained

```text
adobeSign.read.search.result
adobeSign.read.actionQueue.result
```

### New

```text
adobeSign.read.recentCompletions.result
```

## Provider method

```ts
getAdobeSignRecentCompletions(
  context: MyWorkReadContext,
  query: MyWorkAdobeSignRecentCompletionsQuery,
): Promise<MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel>>;
```

## Adapter factory

```ts
createAdobeSignRecentCompletionsAdapter(...)
```

## Request builder

```ts
buildAdobeSignRecentCompletionsRequest(...)
```

## Symbol names that must remain untouched

Do not rename or generalize:

```text
AdobeSignActionQueueCard
MyWorkAdobeSignActionQueueReadModel
MyWorkAdobeSignActionQueueItem
MyWorkAdobeSignActionQueueSummary
getAdobeSignActionQueue
createAdobeSignActionQueueAdapter
buildAdobeSignSearchRequest
```

Pending and completed are sibling lanes, not a single generalized lane.
