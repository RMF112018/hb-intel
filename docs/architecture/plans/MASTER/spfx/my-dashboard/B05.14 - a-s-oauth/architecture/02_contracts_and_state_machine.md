# Contracts and State Machine

## Backend Launch Result Contract

Replace or extend the existing `AdobeSignActionLinkResolveResult` contract with the following explicit launch contract.

```ts
export type AdobeSignActionLaunchStatus =
  | 'embedded-ready'
  | 'external-ready'
  | 'invalid-input'
  | 'authorization-required'
  | 'principal-unresolved'
  | 'scope-insufficient'
  | 'source-unavailable'
  | 'not-ready'
  | 'no-action-url'
  | 'rate-limited'
  | 'policy-rejected'
  | 'embed-not-supported';

export type AdobeSignActionLaunchResult =
  | {
      readonly status: 'embedded-ready';
      readonly agreementId: string;
      readonly itemId: string;
      readonly requiredAction: MyWorkAdobeSignRequiredAction;
      readonly embedUrl: string;
      readonly externalUrl: string;
      readonly allowedFrameOrigin: string;
      readonly allowedMessageOrigins: readonly string[];
      readonly launchMode: 'embedded-preferred';
      readonly expiresAtUtc?: string;
      readonly policy: {
        readonly iframeAllowed: true;
        readonly externalFallbackAllowed: true;
        readonly urlKind: 'signing-url';
        readonly source: 'adobe-sign-signing-urls';
      };
    }
  | {
      readonly status: 'external-ready';
      readonly agreementId: string;
      readonly itemId: string;
      readonly requiredAction: MyWorkAdobeSignRequiredAction;
      readonly externalUrl: string;
      readonly launchMode: 'external-only';
      readonly reason:
        | 'feature-disabled'
        | 'embed-policy-disabled'
        | 'embed-not-supported'
        | 'mobile-fallback'
        | 'provider-url-not-embeddable';
      readonly policy: {
        readonly iframeAllowed: false;
        readonly externalFallbackAllowed: true;
        readonly urlKind: 'signing-url';
        readonly source: 'adobe-sign-signing-urls';
      };
    }
  | {
      readonly status:
        | 'invalid-input'
        | 'authorization-required'
        | 'principal-unresolved'
        | 'scope-insufficient'
        | 'source-unavailable'
        | 'not-ready'
        | 'no-action-url'
        | 'rate-limited'
        | 'policy-rejected'
        | 'embed-not-supported';
      readonly reason?: string;
    };
```

## Compatibility Adapter

During migration, keep compatibility with the existing redirect-ready contract if tests or callers require it.

Preferred final frontend path:

```ts
readModelClient.resolveAdobeSignActionLaunch(input)
```

Acceptable transitional path:

```ts
readModelClient.resolveAdobeSignActionLink(input)
```

but the returned model must carry embedded metadata when the feature flag is enabled.

## Modal State Machine

Implement the frontend state machine explicitly.

```ts
type AdobeSignEmbeddedModalState =
  | 'closed'
  | 'resolving'
  | 'resolve-failed'
  | 'opening'
  | 'loading-frame'
  | 'active'
  | 'completed'
  | 'rejected'
  | 'cancelled'
  | 'delegated'
  | 'expired'
  | 'session-timeout'
  | 'embed-failed'
  | 'fallback-ready'
  | 'fallback-opened'
  | 'refreshing'
  | 'refresh-complete'
  | 'refresh-failed';
```

## Modal State Transitions

```text
closed
→ resolving
→ embedded-ready
→ opening
→ loading-frame
→ active
→ completed / rejected / delegated / session-timeout / embed-failed
→ refreshing
→ refresh-complete
→ closed
```

Fallback path:

```text
resolving
→ external-ready
→ fallback-ready
→ fallback-opened
→ polling-refresh
```

Iframe failure path:

```text
loading-frame
→ embed-failed
→ fallback-ready
```

## Adobe Event Handling Contract

Create an event-normalization seam rather than wiring raw event strings into UI logic.

```ts
type AdobeSignEmbeddedEventKind =
  | 'loaded'
  | 'esign'
  | 'reject'
  | 'cancel'
  | 'delegation'
  | 'session-timeout'
  | 'error'
  | 'unknown';

interface AdobeSignEmbeddedEvent {
  readonly kind: AdobeSignEmbeddedEventKind;
  readonly rawType?: string;
  readonly origin: string;
  readonly receivedAtUtc: string;
  readonly agreementId?: string;
}
```

The handler must:

- validate `event.origin`,
- ignore unknown origins,
- tolerate unknown Adobe event shapes,
- log unknown event types without breaking UX,
- treat terminal events as refresh triggers.

## Terminal Events

Terminal events that should refresh the queue:

- signing completed,
- approval completed,
- acceptance completed,
- acknowledgement completed,
- form filling completed,
- rejection,
- delegation,
- cancellation,
- session timeout.

Session timeout should not assume completion, but should still refresh after user closes or chooses fallback.
