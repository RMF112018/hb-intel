# Security, CSP, and Telemetry

## Security Posture

### Required

- Direct browser-to-Adobe iframe.
- Backend resolves and validates Adobe URL.
- Browser never constructs Adobe signing URLs.
- Browser never receives Adobe access token.
- No content proxying.
- No scraping.
- No DOM access attempts against Adobe iframe.
- Strict `postMessage` origin validation.

### Forbidden

- `*` origin acceptance.
- Logging full signing URLs.
- Persisting signing URLs in durable storage.
- Proxying Adobe signing pages through Azure Functions.
- Recreating signing actions manually in HB Intel.

## URL Policy

Current policy must be expanded from redirect-only to launch classification.

Policy outputs:

```ts
type AdobeSignLaunchPolicy =
  | {
      status: 'allowed';
      iframeAllowed: boolean;
      externalFallbackAllowed: true;
      urlKind: 'signing-url';
      allowedOrigin: string;
      allowedMessageOrigins: readonly string[];
    }
  | {
      status: 'rejected';
      reason: 'invalid-url' | 'scheme-blocked' | 'host-not-approved' | 'iframe-not-approved';
    };
```

## CSP Requirements

Validate in SPFx / SharePoint deployment context.

Likely additions:

```text
frame-src https://*.adobesign.com https://*.echosign.com;
connect-src existing-backend existing-sharepoint https://*.adobesign.com https://*.echosign.com;
```

Do not loosen:

```text
frame-src *
script-src *
connect-src *
```

Only add the minimum validated Adobe origins.

## postMessage Validation

The event listener must:

- verify `event.origin` is included in `allowedMessageOrigins`,
- verify modal session is active,
- verify agreement/session if Adobe payload includes an identifier,
- ignore but telemetry-track unknown valid-origin event types,
- reject and telemetry-track invalid-origin messages without payload logging.

## Telemetry Events

Add these frontend events:

```text
adobeSign.embedded.resolve.started
adobeSign.embedded.resolve.result
adobeSign.embedded.modal.opened
adobeSign.embedded.frame.load.started
adobeSign.embedded.frame.loaded
adobeSign.embedded.frame.timeout
adobeSign.embedded.message.received
adobeSign.embedded.message.ignored
adobeSign.embedded.terminal.detected
adobeSign.embedded.fallback.presented
adobeSign.embedded.fallback.opened
adobeSign.embedded.refresh.started
adobeSign.embedded.refresh.result
adobeSign.embedded.modal.closed
```

Add/extend backend events:

```text
adobeSign.actionLaunch.resolve.attempt
adobeSign.actionLaunch.resolve.result
adobeSign.actionLaunch.policy.result
adobeSign.actionLaunch.provider.result
adobeSign.actionLaunch.scope.result
```

## Telemetry Properties

Required properties:

- domain,
- operation,
- status,
- resultStage,
- requiredAction,
- hasAgreementId,
- hasItemId,
- launchMode,
- iframeAllowed,
- fallbackAllowed,
- providerStatusCode where applicable,
- urlCandidateCount where applicable,
- selectedBy where applicable,
- durationMs.

Do not log:

- full signing URL,
- access token,
- refresh token,
- raw Adobe payload containing PII,
- agreement document content.
