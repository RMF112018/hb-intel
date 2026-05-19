# Proposed Implementation Plan

## Phase 0 — Repo-Truth Reverification

Objective:

Confirm the exact current state before editing.

Actions:

1. Inspect current Adobe Sign module files.
2. Inspect current backend resolver and route registration.
3. Inspect current shared models and API clients.
4. Inspect runtime config/feature flag patterns.
5. Inspect modal/popover/shell primitives already available.
6. Confirm current tests and naming conventions.

Exit criteria:

- Current file map confirmed.
- No duplicate or stale route assumptions.
- Feature flag insertion point identified.
- Modal primitive reuse decision made.

## Phase 1 — Shared Contract and Backend Resolver

Objective:

Add embedded-ready launch contract and backend route.

Actions:

1. Add shared launch DTO.
2. Add backend route:
   - recommended path: `my-work/me/adobe-sign/action-launch/resolve`.
3. Reuse existing token and actor logic.
4. Reuse signing URL retrieval logic.
5. Add action launch policy.
6. Return:
   - `embedded-ready` when URL is Adobe-approved and feature/config allows iframe.
   - `external-ready` when embedding is not available but external launch is safe.
   - failure statuses matching existing conventions.
7. Add telemetry.

Exit criteria:

- Backend route compiles.
- Unit tests cover all status branches.
- Existing action-link route remains passing.

## Phase 2 — Frontend Client and Feature Flag

Objective:

Expose launch resolver to React.

Actions:

1. Add client method.
2. Add backend client POST.
3. Add fixture implementation.
4. Add runtime flag:
   - `MY_DASHBOARD_ADOBE_SIGN_EMBEDDED_ACTIONS_ENABLED`.
5. Default flag off.
6. Ensure old `window.open` behavior remains when disabled.

Exit criteria:

- Existing UI behavior unchanged with flag off.
- Embedded path available with flag on and mocked backend response.

## Phase 3 — Modal Foundation

Objective:

Build borderless floating modal shell.

Actions:

1. Create modal component.
2. Add CSS module with full-window backdrop.
3. Add translucent gray / blur effect.
4. Add borderless floating iframe container.
5. Add minimal header.
6. Add fallback external launch button.
7. Add close confirmation.
8. Add focus trap/focus restore/body scroll lock.

Exit criteria:

- Modal opens with mocked URL.
- My Dashboard page remains visible, greyed, and blurred behind modal.
- No visible border/card chrome.
- Keyboard behavior works.

## Phase 4 — Embedded Event Handling and Refresh

Objective:

Detect Adobe terminal events and refresh read models.

Actions:

1. Create `postMessage` listener hook.
2. Validate origins.
3. Normalize Adobe event payloads.
4. Handle known terminal and non-terminal events.
5. Refresh action queue after terminal events.
6. Refresh completed view when applicable.
7. Add polling/backoff for uncertain states.

Exit criteria:

- Mock postMessage completion removes item after refetch.
- Invalid origin ignored.
- Unknown event logged but non-breaking.
- Timeout presents fallback.

## Phase 5 — Security, CSP, Telemetry, and Tests

Objective:

Harden implementation.

Actions:

1. Add launch policy tests.
2. Add frontend modal tests.
3. Add event hook tests.
4. Add Playwright mocked-flow tests.
5. Add telemetry event assertions where existing test patterns allow.
6. Document CSP updates.
7. Confirm no signing URL/token logging.

Exit criteria:

- Unit tests pass.
- Existing tests pass.
- New e2e mocked tests pass.
- Security checklist complete.

## Phase 6 — Live Tenant Validation

Objective:

Validate with real Adobe Sign tenant.

Actions:

1. Enable feature flag in a controlled environment.
2. Reconnect Adobe Sign after scope update.
3. Create test agreement assigned to authenticated user.
4. Confirm pending queue item appears.
5. Click Act Now.
6. Confirm iframe loads.
7. Complete action.
8. Confirm terminal event or fallback path.
9. Confirm pending queue refresh.
10. Confirm recent completion appears.

Exit criteria:

- If iframe works: enable embedded-first for pilot users.
- If iframe blocked: keep external fallback and document Adobe tenant enablement requirement.
