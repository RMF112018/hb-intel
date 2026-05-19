# Acceptance Criteria

## Functional

- User can click `Act Now` on an actionable pending agreement.
- Backend resolves an Adobe-approved action launch URL.
- With feature flag enabled, modal opens in embedded-first mode.
- With feature flag disabled, existing external launch behavior remains intact.
- User can complete action in modal when Adobe allows iframe flow.
- User can launch external Adobe flow if iframe fails or user chooses fallback.
- Queue refreshes after terminal event or modal close with uncertainty.
- Recent completions refresh after completion.

## UI

- Modal is borderless.
- Modal overlays the entire window.
- My Dashboard page remains visible behind modal.
- Background is greyed and subtly blurred.
- Adobe document appears to float above page.
- Header is minimal and does not read as a card or drawer.
- No heavy border or panel chrome.
- Close/fallback controls are visible and accessible.

## Security

- No Adobe access tokens exposed to browser.
- No full signing URLs logged.
- No signing URL durable persistence.
- Strict iframe URL allowlist.
- Strict postMessage origin validation.
- No wildcard CSP.
- No Adobe content proxying.

## Accessibility

- Focus trap active while modal open.
- Focus restored to originating button.
- Escape behavior requires confirmation when active.
- iframe has descriptive title.
- status changes announced politely.
- fallback action keyboard accessible.

## Testing

- Backend unit tests pass.
- Frontend unit tests pass.
- Existing regression suite passes.
- New mocked Playwright flow passes.
- Manual live-tenant validation checklist completed.
