# Target Architecture — Adobe Sign Embedded Modal

## Architecture Verdict

Implement a hybrid embedded-first Adobe Sign action architecture.

```text
Act Now
→ frontend calls backend action launch resolver
→ backend resolves Adobe signing/action URL
→ backend applies policy and returns embedded-ready or fallback status
→ frontend opens borderless floating modal
→ Adobe action page loads in iframe
→ frontend listens for validated Adobe postMessage events
→ frontend refreshes queue and recent completions
→ fallback external Adobe launch remains available at all times
```

## Target Architecture Components

### 1. Backend Action Launch Resolver

The existing action-link resolver must evolve from a redirect-only resolver into an action launch resolver.

Current behavior:

```text
resolve action link → redirect-ready → window.open
```

Target behavior:

```text
resolve action launch → embedded-ready | external-ready | failure status
```

The backend must remain responsible for:

- actor normalization,
- OAuth token retrieval,
- Adobe signing URL retrieval,
- provider response parsing,
- URL allowlist evaluation,
- scope diagnostics,
- telemetry classification,
- returning a safe frontend launch contract.

### 2. Frontend Embedded Action Modal

The frontend must introduce a dedicated modal host that:

- opens from the Adobe Sign action queue row,
- receives a backend-approved iframe URL,
- renders Adobe Sign in a borderless floating modal,
- visually greys/blurs the My Dashboard page behind the document,
- listens for Adobe embedded UI events,
- handles fallback external launch,
- refreshes the relevant read models after terminal events.

### 3. Feature Flag

Add a feature flag:

```text
MY_DASHBOARD_ADOBE_SIGN_EMBEDDED_ACTIONS_ENABLED
```

Default:

```text
false
```

Behavior:

- `false`: preserve current external launch behavior.
- `true`: attempt embedded modal first; keep external fallback.

### 4. Fallback Model

Fallback must be available when:

- feature flag is disabled,
- backend returns `external-ready`,
- iframe load times out,
- Adobe blocks embedding,
- browser/mobile behavior prevents reliable embedded completion,
- Adobe event origin fails validation,
- user chooses “Open in Adobe Sign”.

### 5. Refresh Model

Use a layered refresh model:

1. Immediate frontend refresh after Adobe terminal event.
2. Polling/backoff after external fallback or uncertain modal close.
3. Future webhook hardening for authoritative lifecycle updates.

## Do Not Implement

- No custom signer.
- No scraping.
- No browser automation.
- No Adobe content proxy.
- No storing Adobe signing URLs beyond the active modal session.
- No iframe URL construction in the browser.
