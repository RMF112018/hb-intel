# B04 Target Contracts and Route Map

## 1. Purpose

This file is the compact contract sheet for B04 implementation. Local prompts may point back to this file when exact literals, route names, status meanings, and DTO boundaries must remain stable.

## 2. Read-model mode vocabulary

```ts
export const MY_WORK_READ_MODEL_MODES = ['fixture', 'backend'] as const;
export type MyWorkReadModelMode = (typeof MY_WORK_READ_MODEL_MODES)[number];
```

## 3. Source-status vocabulary

```ts
export const MY_WORK_READ_MODEL_SOURCE_STATUSES = [
  'available',
  'partial',
  'configuration-required',
  'authorization-required',
  'principal-unresolved',
  'source-unavailable',
  'backend-unavailable',
] as const;
```

## 4. Warning-code vocabulary

```ts
export const MY_WORK_READ_MODEL_WARNING_CODES = [
  'partial-source-data',
  'configuration-required',
  'authorization-required',
  'principal-unresolved',
  'source-unavailable',
  'backend-unavailable',
  'stale-cache-used',
  'result-set-truncated',
  'source-open-url-omitted',
  'unsupported-source-status-filtered',
] as const;
```

## 5. Envelope

```ts
export interface MyWorkReadModelEnvelope<T> {
  readonly mode: 'fixture' | 'backend';
  readonly sourceStatus:
    | 'available'
    | 'partial'
    | 'configuration-required'
    | 'authorization-required'
    | 'principal-unresolved'
    | 'source-unavailable'
    | 'backend-unavailable';
  readonly readOnly: true;
  readonly warnings: readonly MyWorkReadModelWarning[];
  readonly generatedAtUtc: string;
  readonly data: T;
}
```

## 6. Route registry

```ts
export const MY_WORK_READ_MODEL_ROUTE_PATHS = {
  home: 'my-work/me/home',
  'adobe-sign-action-queue': 'my-work/me/adobe-sign/action-queue',
  'adobe-sign-recent-completions': 'my-work/me/adobe-sign/recent-completions',
} as const;
```

## 7. Production HTTP endpoints

```http
GET /api/my-work/me/home
GET /api/my-work/me/adobe-sign/action-queue
GET /api/my-work/me/adobe-sign/recent-completions
```

## 8. Frontend client interface

```ts
export interface IMyWorkReadModelClient {
  getMyWorkHome(): Promise<MyWorkReadModelEnvelope<MyWorkHomeReadModel>>;

  getAdobeSignActionQueue(
    query?: MyWorkAdobeSignActionQueueQuery,
  ): Promise<MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel>>;

  getAdobeSignRecentCompletions(
    query?: MyWorkAdobeSignRecentCompletionsQuery,
  ): Promise<MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel>>;
}
```

## 9. Queue query contract

```ts
export interface MyWorkAdobeSignActionQueueQuery {
  readonly pageSize?: number;
  readonly cursor?: string;
}
```

### Query validation rules

| Field                      | Rule                                             |
| -------------------------- | ------------------------------------------------ |
| `pageSize`                 | integer, default `25`, minimum `1`, maximum `50` |
| `cursor`                   | optional opaque string                           |
| actor/email/user/principal | prohibited                                       |
| filter/sort                | not exposed in B04                               |

## 9.1 Recent completions query contract

```ts
export interface MyWorkAdobeSignRecentCompletionsQuery {
  readonly pageSize?: number;
  readonly cursor?: string;
}
```

### Query validation rules

| Field                      | Rule                                             |
| -------------------------- | ------------------------------------------------ |
| `pageSize`                 | integer, default `25`, minimum `1`, maximum `50` |
| `cursor`                   | optional opaque string, max 256 chars            |
| actor/email/user/principal | prohibited; actor derives from auth claims only  |

## 10. Home read model

```ts
export interface MyWorkHomeReadModel {
  readonly actor: MyWorkActorSummary;
  readonly summary: MyWorkHomeSummary;
  readonly sourceReadiness: readonly MyWorkSourceReadinessItem[];
  readonly adobeSignActionQueue: MyWorkAdobeSignActionQueueHomeProjection;
}
```

## 11. Adobe home projection

```ts
export interface MyWorkAdobeSignActionQueueHomeProjection {
  readonly summary: MyWorkAdobeSignActionQueueSummary;
  readonly previewItems: readonly MyWorkAdobeSignActionQueueItem[];
  readonly previewItemLimit: 5;
}
```

`previewItems` contains at most five queue rows.

## 12. Actionable Adobe recipient statuses

```ts
export const ADOBE_SIGN_ACTIONABLE_RECIPIENT_STATUSES = [
  'WAITING_FOR_MY_SIGNATURE',
  'WAITING_FOR_MY_APPROVAL',
  'WAITING_FOR_MY_ACCEPTANCE',
  'WAITING_FOR_MY_ACKNOWLEDGEMENT',
  'WAITING_FOR_MY_FORM_FILLING',
  'WAITING_FOR_MY_DELEGATION',
] as const;
```

## 13. Normalized required actions

```ts
export const MY_WORK_ADOBE_SIGN_REQUIRED_ACTIONS = [
  'signature',
  'approval',
  'acceptance',
  'acknowledgement',
  'form-filling',
  'delegation',
] as const;
```

## 14. Adobe status mapping

| Adobe recipient status           | Required action   |
| -------------------------------- | ----------------- |
| `WAITING_FOR_MY_SIGNATURE`       | `signature`       |
| `WAITING_FOR_MY_APPROVAL`        | `approval`        |
| `WAITING_FOR_MY_ACCEPTANCE`      | `acceptance`      |
| `WAITING_FOR_MY_ACKNOWLEDGEMENT` | `acknowledgement` |
| `WAITING_FOR_MY_FORM_FILLING`    | `form-filling`    |
| `WAITING_FOR_MY_DELEGATION`      | `delegation`      |

## 15. Queue item DTO

```ts
export interface MyWorkAdobeSignActionQueueItem {
  readonly itemId: string;
  readonly sourceSystem: 'adobe-sign';
  readonly agreementId: string;
  readonly agreementName: string;
  readonly requiredAction:
    | 'signature'
    | 'approval'
    | 'acceptance'
    | 'acknowledgement'
    | 'form-filling'
    | 'delegation';
  readonly adobeRecipientStatus:
    | 'WAITING_FOR_MY_SIGNATURE'
    | 'WAITING_FOR_MY_APPROVAL'
    | 'WAITING_FOR_MY_ACCEPTANCE'
    | 'WAITING_FOR_MY_ACKNOWLEDGEMENT'
    | 'WAITING_FOR_MY_FORM_FILLING'
    | 'WAITING_FOR_MY_DELEGATION';
  readonly sender?: MyWorkAdobeSignSenderSummary;
  readonly createdAtUtc?: string;
  readonly modifiedAtUtc?: string;
  readonly expirationAtUtc?: string;
  readonly sourceOpenUrl?: string;
}
```

## 16. Queue summary DTO

```ts
export interface MyWorkAdobeSignActionQueueSummary {
  readonly countBasis: 'returned-items' | 'provider-total';
  readonly totalActionItemCount: number;
  readonly signatureCount: number;
  readonly approvalCount: number;
  readonly acceptanceCount: number;
  readonly acknowledgementCount: number;
  readonly formFillingCount: number;
  readonly delegationCount: number;
  readonly expiringSoonCount: number;
}
```

## 17. Pagination and freshness DTOs

```ts
export interface MyWorkAdobeSignActionQueuePagination {
  readonly pageSize: number;
  readonly hasMore: boolean;
  readonly nextCursor?: string;
}
```

```ts
export type MyWorkFreshnessState = 'fresh' | 'stale' | 'unknown';

export interface MyWorkAdobeSignActionQueueFreshness {
  readonly state: MyWorkFreshnessState;
  readonly generatedAtUtc: string;
  readonly lastSuccessfulSourceReadAtUtc?: string;
}
```

## 18. Focused queue read model

```ts
export interface MyWorkAdobeSignActionQueueReadModel {
  readonly moduleId: 'adobe-sign-action-queue';
  readonly summary: MyWorkAdobeSignActionQueueSummary;
  readonly items: readonly MyWorkAdobeSignActionQueueItem[];
  readonly pagination: MyWorkAdobeSignActionQueuePagination;
  readonly freshness: MyWorkAdobeSignActionQueueFreshness;
}
```

## 19. HTTP and source-state matrix

| Scenario                            |            HTTP | Envelope status          |
| ----------------------------------- | --------------: | ------------------------ |
| populated queue                     |             200 | `available`              |
| empty healthy queue                 |             200 | `available`              |
| safe partial result                 |             200 | `partial`                |
| config absent                       |             200 | `configuration-required` |
| OAuth/re-auth required              |             200 | `authorization-required` |
| actor cannot map to Adobe principal |             200 | `principal-unresolved`   |
| upstream source unavailable         |             200 | `source-unavailable`     |
| browser cannot consume HB backend   | client fallback | `backend-unavailable`    |
| invalid backend auth                |             401 | no envelope              |
| forbidden backend access            |             403 | no envelope              |
| invalid queue query                 |             400 | no envelope              |
| unhandled backend exception         |             500 | no envelope              |

### Recent completions lane matrix

| Scenario                            |            HTTP | Envelope status          |
| ----------------------------------- | --------------: | ------------------------ |
| completed rows returned             |             200 | `available`              |
| no completed rows in 30-day window  |             200 | `available`              |
| safe partial result                 |             200 | `partial`                |
| config absent                       |             200 | `configuration-required` |
| OAuth/re-auth required              |             200 | `authorization-required` |
| actor cannot map to Adobe principal |             200 | `principal-unresolved`   |
| upstream source unavailable         |             200 | `source-unavailable`     |
| browser cannot consume HB backend   | client fallback | `backend-unavailable`    |
| invalid completed query             |             400 | no envelope              |

## 20. Fixture closure requirements

Fixtures must cover:

- populated available queue,
- empty available queue,
- available paged queue,
- partial queue,
- configuration required,
- authorization required,
- principal unresolved,
- source unavailable,
- backend unavailable,
- deterministic warning and timestamp behavior.

Recent completions fixtures must also cover:

- available populated;
- available empty;
- available paged;
- partial;
- configuration required;
- authorization required;
- principal unresolved;
- source unavailable;
- backend unavailable.

Populated queue fixture must include one item per actionable Adobe status.

## 21. Recent completions DTO family (summary)

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

export interface MyWorkAdobeSignRecentCompletionsSummary {
  readonly countBasis: 'returned-items' | 'provider-total';
  readonly completedAgreementCount: number;
  readonly windowDays: 30;
}

export interface MyWorkAdobeSignRecentCompletionsPagination {
  readonly pageSize: number;
  readonly hasMore: boolean;
  readonly nextCursor?: string;
}

export interface MyWorkAdobeSignRecentCompletionsFreshness {
  readonly state: MyWorkFreshnessState;
  readonly generatedAtUtc: string;
  readonly lastSuccessfulSourceReadAtUtc?: string;
}

export interface MyWorkAdobeSignRecentCompletionsReadModel {
  readonly moduleId: 'adobe-sign-recent-completions';
  readonly summary: MyWorkAdobeSignRecentCompletionsSummary;
  readonly items: readonly MyWorkAdobeSignRecentCompletionsItem[];
  readonly pagination: MyWorkAdobeSignRecentCompletionsPagination;
  readonly freshness: MyWorkAdobeSignRecentCompletionsFreshness;
}
```
