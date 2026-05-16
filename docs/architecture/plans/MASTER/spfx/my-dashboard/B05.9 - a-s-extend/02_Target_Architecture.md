# Target Architecture — Adobe Sign Direct Handoff

## Architecture verdict

Implement a **hybrid direct-handoff model**.

### Queue-side target

```text
Action Queue row
  → non-sensitive resolver capability metadata
  → frontend `Act now` button
  → protected backend resolve route
  → live Adobe Signing URL lookup
  → transient URL safety evaluation
  → safe redirect / handoff result
```

### Completed-side target

```text
Completed row
  → durable `sourceOpenUrl` if already policy-approved
  → frontend `View` CTA
```

## New backend route

### Recommended route constant

```text
POST /api/my-work/me/adobe-sign/action-link/resolve
```

### Suggested route module

```text
backend/functions/src/hosts/my-work-read-model/adobe-sign-action-link-routes.ts
```

### Route obligations

- protected by the same auth posture as other `/me/...` My Work routes;
- resolve the current actor;
- acquire the actor’s Adobe token using existing token service seams;
- validate agreement and resolver eligibility;
- call the signing URL client;
- apply transient-action URL policy;
- return a safe redirect or closed resolver envelope;
- never log the target URL.

## New backend client seams

### Contract/client files

```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-link-client.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-action-link-client.ts
```

### Client responsibilities

- signing URL retrieval;
- optional agreement status retrieval when needed;
- normalized closed-enum error posture;
- safe parse of Adobe response structures;
- no raw vendor body leakage.

## New transient URL policy seam

### Recommended file

```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-handoff-policy.ts
```

### Distinction from existing policy

Existing:
- `adobe-sign-source-handoff-policy.ts`
- evaluates durable source/view link candidates suitable for read-model carriage.

New:
- `adobe-sign-action-handoff-policy.ts`
- evaluates **transient action URLs** solely inside the resolver path;
- supports query-bearing Adobe signing URLs without persisting or logging them;
- must remain strictly bounded to approved Adobe hosts and HTTPS.

## Contract additions

### Read-model item addition

Add a non-sensitive field to Action Queue items:

```ts
readonly actionHandoff?: {
  readonly capability: 'resolve-on-click' | 'view-only' | 'unavailable';
  readonly reason?:
    | 'resolver-supported'
    | 'scope-insufficient'
    | 'source-unavailable'
    | 'unsupported-provider-state'
    | 'resolver-not-configured';
};
```

The exact shape may be refined to fit repo naming patterns, but the semantic decision is fixed:

- read models carry capability metadata;
- read models do **not** carry direct signing URLs.

## Frontend behavior

### Action Queue row

When `actionHandoff.capability === 'resolve-on-click'`:

- render `Act now`;
- on click:
  - disable that row button;
  - show `Opening…`;
  - call resolver;
  - redirect/open as instructed by resolver result.

On failure:
- show truthful inline or localized failure state;
- if `sourceOpenUrl` exists, optionally expose `View` fallback.

### Completed row

- render `View` when `sourceOpenUrl` exists;
- do not show `Act now`.

## OAuth/scope posture

The architecture assumes scope verification against deployed `ADOBE_SIGN_OAUTH_SCOPES`.

If the signing URL route requires scope not in the governed set:

- update scope config in source-governed references where applicable;
- implement reconnect / reauthorization detection;
- do not silently assume old grants are sufficient.

## Telemetry architecture

Required telemetry classes:

```text
adobeSign.actionLink.resolve.attempt
adobeSign.actionLink.resolve.success
adobeSign.actionLink.resolve.failure
```

Telemetry may include:

- correlation ID;
- requiredAction;
- resolver path;
- provider status code;
- normalized error reason;
- whether retry guidance was present.

Telemetry must not include:

- target URL;
- query string;
- recipient URL;
- raw provider body;
- OAuth code;
- token strings.

## Rejected alternatives

1. **Search-row URL extraction as primary solution**
   - insufficiently reliable and does not deliver direct action.

2. **Persisted signing URLs**
   - sensitive, stale, fanout-heavy, and contrary to safe read-model posture.

3. **Embedded signing experience**
   - out of scope for this dashboard implementation and overbuilt for the stated need.
