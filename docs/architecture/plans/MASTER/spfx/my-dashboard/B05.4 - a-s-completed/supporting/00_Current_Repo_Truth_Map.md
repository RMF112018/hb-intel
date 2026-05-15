# Supporting 00 — Current Repo-Truth Map

## Current Adobe Sign UI card

```text
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx
```

## Current Adobe card view-model layer

```text
apps/my-dashboard/src/state/myWorkCardViewModel.ts
```

## Current My Dashboard API clients

```text
apps/my-dashboard/src/api/myWorkReadModelClient.ts
apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts
apps/my-dashboard/src/api/myWorkFixtureReadModelClient.ts
```

## Current shared My Work contracts

```text
packages/models/src/myWork/AdobeSignActionQueue.ts
packages/models/src/myWork/MyWorkReadModels.ts
packages/models/src/myWork/index.ts
```

## Current fixtures

```text
packages/models/src/myWork/fixtures/myWorkHomeReadModels.ts
packages/models/src/myWork/fixtures/adobeSignActionQueueReadModels.ts
packages/models/src/myWork/fixtures/index.ts
```

## Current backend provider and routes

```text
backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts
backend/functions/src/hosts/my-work-read-model/read-models/my-work-read-model-provider.ts
backend/functions/src/hosts/my-work-read-model/read-models/my-work-read-model-provider-resolver.ts
backend/functions/src/hosts/my-work-read-model/read-models/my-work-adobe-sign-live-read-model-provider.ts
```

## Current Adobe backend seams

```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-queue-adapter.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-search-request.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-search-client.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-search-client.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-runtime-diagnostics.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-source-handoff-policy.ts
```

## Current docs requiring reconciliation

```text
apps/my-dashboard/README.md
docs/reference/spfx-surfaces/my-dashboard/adobe-sign-authorization-required-flow.md
docs/architecture/plans/MASTER/spfx/my-dashboard/B04/02_B04_Target_Contracts_And_Route_Map.md
docs/architecture/plans/MASTER/spfx/my-dashboard/B05.3 - ui remidiation/docs/05-Target-Module-State-Matrices.md
docs/architecture/plans/MASTER/spfx/my-dashboard/B05.3 - ui remidiation/prompts/Prompt-03-Consolidate-Adobe-Sign-Into-One-Module-Card.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_My_Work_Adobe_Sign_Comprehensive_Development_Plan.md
```
