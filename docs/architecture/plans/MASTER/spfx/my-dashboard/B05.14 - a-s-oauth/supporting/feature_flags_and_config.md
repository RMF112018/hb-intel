# Feature Flags and Configuration

## Feature Flag

Add:

```text
MY_DASHBOARD_ADOBE_SIGN_EMBEDDED_ACTIONS_ENABLED=false
```

Frontend runtime config should expose:

```ts
adobeSignEmbeddedActionsEnabled: boolean
```

## Behavior

### Flag Off

- Existing `Act Now` behavior preserved.
- Backend may still support launch route, but frontend does not use modal.
- External Adobe launch remains default.

### Flag On

- Frontend calls embedded launch resolver.
- If resolver returns `embedded-ready`, open modal.
- If resolver returns `external-ready`, present fallback or open external according to current UX decision.
- If resolver fails, show row-level error.

## OAuth Scope

Target scope must be finalized against Adobe tenant validation.

Recommended starting target:

```text
agreement_read:self agreement_write:self
```

If Adobe requires broader enterprise scopes, document and justify them before use.

## Forced Reconnect

After scope change:

- users with stale grants must reconnect,
- UI should display reconnect guidance,
- backend should classify `scope-insufficient` distinctly.

## CSP / SharePoint

Add only validated Adobe origins.

Candidate domains to validate:

```text
https://*.adobesign.com
https://*.echosign.com
```

Never add wildcard `*`.
