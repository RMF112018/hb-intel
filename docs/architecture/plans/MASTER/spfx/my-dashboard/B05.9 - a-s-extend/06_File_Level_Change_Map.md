# File-Level Change Map

## Existing files expected to change

### Backend existing
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-queue-adapter.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-recent-completions-adapter.ts` — only if fallback/view behavior requires explicit coordination
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-oauth-service.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-config.ts`
- `backend/functions/src/hosts/my-work-read-model/adobe-sign-oauth-routes.ts` — only if reconnect/scope state integration requires route-level contract changes
- whichever shared route registration / provider factory files the current repo uses to wire My Work read-model routes

### Models existing
- `packages/models/src/myWork/AdobeSignActionQueue.ts`
- `packages/models/src/myWork/index.ts` or equivalent export barrel when required
- `packages/models/src/myWork/fixtures/adobeSignActionQueueReadModels.ts`

### Frontend existing
- `apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx`
- `apps/my-dashboard/src/modules/adobeSign/AdobeSignActivityRow.tsx`
- `apps/my-dashboard/src/modules/adobeSign/AdobeSignActivityList.tsx`
- `apps/my-dashboard/src/state/myWorkCardViewModel.ts`
- `apps/my-dashboard/src/api/myWorkReadModelClient.ts`
- `apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts`

## New files recommended

### Backend
```text
backend/functions/src/hosts/my-work-read-model/adobe-sign-action-link-routes.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-link-client.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-action-link-client.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-handoff-policy.ts
```

### Tests
Add tests adjacent to the owning files, following the repo’s established `*.test.ts` / `*.test.tsx` posture.

## Files that should not be changed unless absolutely necessary

- `packages/models/src/myWork/AdobeSignRecentCompletions.ts`
  - Existing `sourceOpenUrl` behavior should remain sufficient.
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-source-handoff-policy.ts`
  - Preserve durable view-link policy; do not mutate it into a transient action-link policy.
- SPFx package manifests and solution manifests
  - Do not touch unless a prompt explicitly requires and justifies it.
- `pnpm-lock.yaml`
  - Must remain unchanged.
