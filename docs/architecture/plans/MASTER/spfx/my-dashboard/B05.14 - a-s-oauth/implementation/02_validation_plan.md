# Validation Plan

## Unit Tests — Backend

Cover:

- invalid request body,
- unresolved principal,
- missing grant,
- insufficient scope,
- Adobe 401/403,
- Adobe 404 not ready,
- Adobe 429 rate limit,
- Adobe 5xx source unavailable,
- malformed provider response,
- no signing URLs,
- multiple signing URLs with actor match,
- multiple signing URLs with no actor match,
- policy rejected,
- embedded-ready,
- external-ready fallback.

## Unit Tests — Frontend API Client

Cover:

- `embedded-ready` response parsing,
- `external-ready` response parsing,
- known failure status parsing,
- malformed response fallback,
- 401/403 authorization-required,
- 5xx source-unavailable.

## React Tests — Modal

Cover:

- modal opens from Act Now,
- backdrop renders,
- iframe title is present,
- fallback button renders,
- Escape opens confirmation when active,
- close returns focus,
- frame timeout presents fallback,
- terminal event triggers refresh callback.

## Event Hook Tests

Cover:

- valid Adobe origin accepted,
- invalid origin ignored,
- known event mapped to terminal state,
- unknown valid-origin event logged and ignored,
- malformed event tolerated.

## Playwright Tests

Mock backend:

- action queue item with eligible action,
- action launch returns embedded-ready,
- iframe shell appears,
- simulated postMessage completes action,
- queue refresh called.

Mock fallback:

- action launch returns external-ready,
- fallback external link opens via stubbed `window.open`.

## Manual Live Validation

Run in controlled environment:

1. Confirm feature flag disabled preserves current external behavior.
2. Enable feature flag for test page/environment.
3. Confirm Adobe Sign OAuth reconnect prompts for updated scopes.
4. Create agreement requiring signature from test user.
5. Confirm pending queue item appears.
6. Click Act Now.
7. Confirm modal loads.
8. Complete signing.
9. Confirm queue updates.
10. Confirm recent completion updates.
11. Repeat for approval/acknowledgement if available.
12. Test mobile/tablet fallback.
13. Test session timeout.
14. Test user closes modal before completing.

## Evidence Required

- screenshots:
  - pending queue before,
  - modal open,
  - completion state,
  - refreshed queue,
  - recent completions.
- telemetry:
  - resolve result,
  - modal opened,
  - frame loaded or timeout,
  - event received,
  - refresh result.
- test output:
  - backend unit,
  - frontend unit,
  - Playwright mocked flow.
