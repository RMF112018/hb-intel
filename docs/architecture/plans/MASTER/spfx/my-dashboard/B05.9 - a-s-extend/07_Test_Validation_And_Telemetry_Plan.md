# Test, Validation, and Telemetry Plan

## Required backend unit coverage

### Signing URL client
- valid single-url response;
- valid multiple-url response;
- recipient match selection;
- no recipient match;
- malformed response;
- HTTP 401 / 403;
- HTTP 404 not-ready;
- HTTP 429 rate-limited with retry hint;
- HTTP 5xx;
- network / timeout failure.

### Resolver route
- rejects malformed body;
- rejects missing required row identity;
- rejects unauthorized principal;
- maps token acquisition failure correctly;
- maps provider outcomes to closed resolver outcomes;
- never exposes raw URL in failure payloads.

### Policy
- accepted Adobe transient action host;
- blocked non-HTTPS;
- blocked unapproved host;
- no logging/persisting of raw URL;
- proper handling of query-bearing action URLs inside transient path only.

## Required model / fixture coverage

- action queue DTO supports non-sensitive handoff capability metadata;
- fixtures include resolver-capable rows;
- fixtures do not include `esignUrl`;
- completed fixtures keep durable view-link examples only.

## Required frontend coverage

- `Act now` renders for resolver-capable queue row;
- `Opening…` state appears while resolving;
- failure state appears without crashes;
- durable view fallback remains available when present;
- completed rows use `View`;
- unsupported / unavailable rows do not show misleading CTAs.

## Telemetry proof

### Required events
```text
adobeSign.actionLink.resolve.attempt
adobeSign.actionLink.resolve.success
adobeSign.actionLink.resolve.failure
```

### Required safe fields
- `correlationId`
- `requiredAction`
- `outcome`
- `providerStatusCode` when appropriate
- `failureReason`
- `retryAfterPresent`
- `matchedRecipient` or equivalent boolean-only signal

### Forbidden telemetry fields
- raw URL
- URL query string
- Adobe response body
- OAuth code
- access token
- refresh token
- agreement document payload

## Suggested validation command matrix

The prompts should choose the exact repo-local validation commands from current scripts, but this package expects at minimum:

```text
git diff --check
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
```

When backend-specific package scripts exist, the agent should use the current authoritative commands and record them exactly.

## Lockfile proof

Every prompt must record:

```text
md5 pnpm-lock.yaml
```

before and after changes, proving no lockfile mutation occurred unless explicitly authorized.

## Hosted validation minimum

1. pending signature action resolves successfully;
2. one pending non-signature action is attempted and classified truthfully;
3. completed agreement row remains viewable when durable view URL exists;
4. resolver not-ready / no-url case degrades safely;
5. telemetry exists without sensitive material.
