# File-Level Change Map

## Shared Models

### `packages/models/src/myWork/AdobeSignActionQueue.ts`

Add:

- `AdobeSignActionLaunchResult`
- `AdobeSignActionLaunchStatus`
- launch policy types
- embedded-ready / external-ready contract
- event status vocabulary if shared tests need it

Preserve:

- existing action queue item model
- existing required-action vocabulary
- existing redirect-ready contract only if needed for backward compatibility

## Frontend API

### `apps/my-dashboard/src/api/myWorkReadModelClient.ts`

Add method:

```ts
resolveAdobeSignActionLaunch(input: ResolveAdobeSignActionLinkRequest): Promise<AdobeSignActionLaunchResult>;
```

Keep `resolveAdobeSignActionLink` during transition.

### `apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts`

Add POST call to either:

```text
/api/my-work/me/adobe-sign/action-launch/resolve
```

or keep existing route path if the backend contract is intentionally evolved in place.

Recommendation:

- create new route path for clarity:
  - `my-work/me/adobe-sign/action-launch/resolve`
- keep old route until tests/migration confirm no callers rely on it.

## Frontend Adobe Sign Module

### Existing

- `apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx`
- `apps/my-dashboard/src/modules/adobeSign/AdobeSignActivityList.tsx`
- `apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.module.css`

Modify:

- replace primary `window.open` path when feature flag enabled,
- pass originating row/button ref into modal workflow,
- keep external fallback when feature disabled or resolver returns external-only.

### New Files

Create:

```text
apps/my-dashboard/src/modules/adobeSign/AdobeSignEmbeddedActionModal.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignEmbeddedActionModal.module.css
apps/my-dashboard/src/modules/adobeSign/useAdobeSignEmbeddedAction.ts
apps/my-dashboard/src/modules/adobeSign/useAdobeSignEmbeddedEvents.ts
apps/my-dashboard/src/modules/adobeSign/adobeSignEmbeddedEvents.ts
apps/my-dashboard/src/modules/adobeSign/adobeSignEmbeddedTelemetry.ts
```

## Backend

### Existing

- `backend/functions/src/hosts/my-work-read-model/adobe-sign-action-link-routes.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-action-link-client.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-handoff-policy.ts`

### New Recommended Files

```text
backend/functions/src/hosts/my-work-read-model/adobe-sign-action-launch-routes.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-launch-client.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-launch-policy.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-launch-telemetry.ts
```

Recommendation:

- Keep existing action-link route stable.
- Add action-launch route for embedded behavior.
- Internally reuse signing URL parsing logic.

## Tests

Add/update:

```text
apps/my-dashboard/src/modules/adobeSign/AdobeSignEmbeddedActionModal.test.tsx
apps/my-dashboard/src/modules/adobeSign/useAdobeSignEmbeddedEvents.test.ts
apps/my-dashboard/src/api/myWorkBackendReadModelClient.test.ts
backend/functions/src/hosts/my-work-read-model/adobe-sign-action-launch-routes.test.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-launch-policy.test.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-action-link-client.test.ts
```

## E2E / Playwright

Add tests that mock:

- embedded-ready response,
- iframe load,
- Adobe postMessage completion event,
- invalid-origin message ignored,
- fallback launch,
- iframe timeout,
- focus restoration.
