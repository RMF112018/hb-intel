# 01 — Repo-Truth Audit Summary

## Continuation anchor

The package assumes implementation begins from repo truth that includes:

```text
0926216b3dbfc603af05a8c87e547db20be52406
```

This is the commit that accepted the confirmed Adobe v6 search response path:

```text
agreementAssetsResults.agreementAssetsResultList
```

## Current Adobe card truth

File:

```text
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx
```

Current state:

- card eyebrow: `Adobe Sign`
- static card title: `Action Queue`
- module id: `adobe-sign-action-queue`
- preview cap: `5`
- current body states:
  - loading
  - authorization required
  - configuration required
  - principal unresolved
  - source unavailable
  - backend unavailable
  - partial
  - available empty
  - available items
- current metrics:
  - Pending agreements
  - Signature actions
  - Review actions
- current action row content:
  - agreement name
  - required-action label
  - sender if available
  - expiration if available
  - `Open in Adobe Sign` when backend-approved `sourceOpenUrl` exists

## Current frontend view-model truth

File:

```text
apps/my-dashboard/src/state/myWorkCardViewModel.ts
```

Current selectors and copy are action-queue specific:

- `selectAdobeSignSourceStatus`
- `selectAdobeQueueSummaryVmFromSummary`
- `selectAdobeAgreementListVmFromItems`
- `selectAdobeSignActionQueueStateCopy`
- `ADOBE_SIGN_ACTION_QUEUE_READY_EMPTY_BODY`

There is no completed-agreements view-model family.

## Current shared contract truth

Files:

```text
packages/models/src/myWork/AdobeSignActionQueue.ts
packages/models/src/myWork/MyWorkReadModels.ts
```

The current contract family is intentionally specific to pending actions:

- `ADOBE_SIGN_ACTIONABLE_RECIPIENT_STATUSES`
- `MY_WORK_ADOBE_SIGN_REQUIRED_ACTIONS`
- `MyWorkAdobeSignActionQueueItem`
- `MyWorkAdobeSignActionQueueSummary`
- `MyWorkAdobeSignActionQueueReadModel`

Current route registry:

```ts
home: 'my-work/me/home'
'adobe-sign-action-queue': 'my-work/me/adobe-sign/action-queue'
'project-links': 'my-work/me/project-links'
```

There is no recent-completions route or contract.

## Current backend provider truth

File:

```text
backend/functions/src/hosts/my-work-read-model/read-models/my-work-adobe-sign-live-read-model-provider.ts
```

Current provider behavior:

- `getAdobeSignActionQueue(...)` delegates to the action-queue adapter.
- `getMyWorkHome(...)` calls the adapter exactly once with `pageSize: 5`.
- Home projection remains pending-only.
- Source readiness/warnings are propagated from the pending queue envelope.

The implementation package preserves this posture.

## Current backend adapter/search truth

Files:

```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-queue-adapter.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-search-request.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-search-client.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-search-client.ts
```

Current flow:

1. resolve Adobe principal;
2. acquire access token;
3. build bounded search request;
4. perform Adobe `/v6/search`;
5. accept confirmed current response envelope;
6. map rows;
7. filter supported actionable statuses;
8. evaluate source-open-url policy;
9. return typed envelope;
10. emit diagnostics.

## Current route truth

File:

```text
backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts
```

Existing protected routes:

```text
GET /api/my-work/me/home
GET /api/my-work/me/adobe-sign/action-queue
GET /api/my-work/me/project-links
```

There is no completed route.

## Current docs that require reconciliation

- `apps/my-dashboard/README.md`
- `docs/reference/spfx-surfaces/my-dashboard/adobe-sign-authorization-required-flow.md`
- `docs/architecture/plans/MASTER/spfx/my-dashboard/B04/02_B04_Target_Contracts_And_Route_Map.md`
- `docs/architecture/plans/MASTER/spfx/my-dashboard/B05.3 - ui remidiation/docs/05-Target-Module-State-Matrices.md`
- `docs/architecture/plans/MASTER/spfx/my-dashboard/B05.3 - ui remidiation/prompts/Prompt-03-Consolidate-Adobe-Sign-Into-One-Module-Card.md`
- `docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_My_Work_Adobe_Sign_Comprehensive_Development_Plan.md`

## Why the completed enhancement cannot be UI-only

The current card has no completed-data source, no route, no DTO, and no backend provider seam. A UI-only toggle would be fake or misleading. The enhancement requires a full sibling read-model lane.
