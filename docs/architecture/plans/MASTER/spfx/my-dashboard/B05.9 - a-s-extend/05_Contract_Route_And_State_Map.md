# Contract, Route, and State Map

## Existing contracts to preserve

### Action Queue
```text
packages/models/src/myWork/AdobeSignActionQueue.ts
```

### Recent Completions
```text
packages/models/src/myWork/AdobeSignRecentCompletions.ts
```

### Existing durable row link field
```ts
sourceOpenUrl?: string
```

This remains a durable **view/open** field only.

## New resolver request contract

Recommended conceptual shape:

```ts
export interface MyWorkAdobeSignActionLinkResolveRequest {
  readonly itemId: string;
  readonly agreementId: string;
  readonly requiredAction:
    | 'signature'
    | 'approval'
    | 'acceptance'
    | 'acknowledgement'
    | 'form-filling'
    | 'delegation';
}
```

## New resolver result contract

The agent may use an internal result union or route response shape, but the normalized semantics are fixed:

```ts
type AdobeSignActionLinkResolveResult =
  | { status: 'redirect-ready'; redirectUrl: string }
  | { status: 'scope-insufficient' }
  | { status: 'authorization-required' }
  | { status: 'principal-unresolved' }
  | { status: 'not-ready' }
  | { status: 'no-action-url' }
  | { status: 'source-unavailable'; reason?: string }
  | { status: 'rate-limited'; retryAfterSeconds?: number }
  | { status: 'policy-rejected'; reason: string }
  | { status: 'invalid-input' };
```

The precise type names should align to current repo conventions, but the closed outcome vocabulary must cover these semantics.

## Backend route behavior

```text
POST /api/my-work/me/adobe-sign/action-link/resolve
```

### 200 / JSON approach
If the implementation uses JSON:

- response contains a **one-time immediate** `redirectUrl` only on success;
- frontend opens the URL immediately;
- no caching.

### 302 redirect approach
If the implementation uses redirect:

- route returns `302 Location: <Adobe action URL>`;
- browser follows the redirect;
- frontend only initiates navigation.

### Package recommendation
Prefer the backend redirect model unless repo integration mechanics strongly favor JSON result. Either is acceptable only if the security rules are preserved.

## Read-model capability field

Recommended semantics:

```ts
actionHandoff?: {
  capability:
    | 'resolve-on-click'
    | 'view-only'
    | 'unavailable';
  reason?:
    | 'resolver-supported'
    | 'scope-insufficient'
    | 'source-unavailable'
    | 'unsupported-provider-state'
    | 'resolver-not-configured';
}
```

## UI state model

### Queue row
| State | CTA |
|---|---|
| resolver-capable | `Act now` |
| resolving | `Opening…` |
| failure but view URL exists | `View` fallback remains available |
| failure and no fallback | explanatory inline error |

### Completed row
| State | CTA |
|---|---|
| sourceOpenUrl exists | `View` |
| absent | no fake button |

## Telemetry state map

| Event | Trigger |
|---|---|
| `adobeSign.actionLink.resolve.attempt` | resolver invoked |
| `adobeSign.actionLink.resolve.success` | redirect-ready path selected |
| `adobeSign.actionLink.resolve.failure` | any normalized non-success outcome |
