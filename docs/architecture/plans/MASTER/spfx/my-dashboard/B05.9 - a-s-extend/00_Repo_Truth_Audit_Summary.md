# Repo-Truth Audit Summary — Adobe Sign Actionability

## Ref inspected

```text
Repository: RMF112018/hb-intel
Ref: 06e5fff21c5a3e9ef541f8a86c0e6b9f0f5ac1e1
Audit basis: GitHub-connected repository truth
```

## Current implementation seams confirmed

### Backend
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-search-client.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-search-client.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-source-handoff-policy.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-queue-adapter.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-recent-completions-adapter.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-search-request.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-oauth-service.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-config.ts`
- `backend/functions/src/hosts/my-work-read-model/adobe-sign-oauth-routes.ts`

### Models
- `packages/models/src/myWork/AdobeSignActionQueue.ts`
- `packages/models/src/myWork/AdobeSignRecentCompletions.ts`
- `packages/models/src/myWork/fixtures/adobeSignActionQueueReadModels.ts`
- `packages/models/src/myWork/fixtures/adobeSignRecentCompletionsReadModels.ts`

### Frontend
- `apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx`
- `apps/my-dashboard/src/modules/adobeSign/AdobeSignActivityList.tsx`
- `apps/my-dashboard/src/modules/adobeSign/AdobeSignActivityRow.tsx`
- `apps/my-dashboard/src/state/myWorkCardViewModel.ts`
- `apps/my-dashboard/src/api/myWorkReadModelClient.ts`
- `apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts`

## What already works

| Capability | Current state |
|---|---|
| Read-model row URL field | Present: `sourceOpenUrl` |
| Backend candidate field | Present: `sourceOpenUrlCandidate` |
| Policy evaluation | Present |
| Frontend row-link rendering | Present |
| Completed item view link | Supported when URL exists |
| User-specific OAuth grant storage | Present |
| Adobe callback / token flow | Present |

## Current functional limit

The deployed feature is currently limited by a combination of:

1. **Candidate URL availability**
   - The live search client reads only `viewURL` or `agreementViewUrl`.
   - If Adobe search rows do not provide one of those exact fields, no row URL survives into the read model.

2. **Policy scope**
   - The existing source-handoff policy explicitly states that signing-endpoint URLs are not eligible durable row targets.
   - Therefore even a perfect view-link path would not satisfy the user’s stronger requirement for direct action execution.

## Current likely root cause of missing row links

Most likely:

```text
Adobe live search results do not provide the exact row URL candidate fields expected by the live search adapter, so sourceOpenUrlCandidate is omitted, sourceOpenUrl never appears, and the frontend correctly renders no Open link.
```

## Architectural conclusion

The repo already supports a safe view-link pipeline. The missing flagship capability is a **separate transient direct-action path**, not merely another round of row URL extraction tweaks.
