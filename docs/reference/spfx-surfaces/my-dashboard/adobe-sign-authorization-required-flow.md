# My Dashboard — Adobe Sign Authorization-Required Flow

## What this is

The end-to-end chain that proves a no-grant Adobe Sign user reaches a
working **Connect Adobe Sign** CTA on the My Dashboard home page. Use
this reference for hosted-tenant acceptance: the DOM markers and
test-coverage map below are the single source of truth for "the
auth-required branch is reachable inline on the home page and not
masked by a fixture-ready render."

There is no focused Adobe module route. The auth-required UI renders
**inside** the consolidated `AdobeSignActionQueueCard` directly on the
home page.

## The chain

```
Backend principal-resolver
  → backend action-queue-adapter
  → envelope { sourceStatus: 'authorization-required', mode: 'backend', data: emptyReadModel(...) }
  → SPFx backend client (stamps dataPath: 'backend-live')
  → useMyWorkHomeEnvelope → MyWorkHomeEnvelopeProvider
  → MyWorkSurfaceRouter → MyWorkHomeSurface
  → AdobeSignActionQueueCard
      (renders with data-adobe-sign-action-queue-state="authorization-required",
       state copy 'Connect required',
       CTA mounted iff onConnectAdobeSign is wired by the shell)
  → <button data-adobe-sign-connect-action="start" data-adobe-sign-connect-state="idle">Connect Adobe Sign</button>
  → click → MyWorkShell.onConnectAdobeSign → backendClient.startAdobeSignOAuth({ returnPath })
  → POST /api/my-work/me/adobe-sign/oauth/start (bearer)
  → response.authorizationUrl → window.location.assign(authorizationUrl)
  → Adobe consent → callback redirect with adobeSignAuthorization query param
  → useAdobeSignCallbackResult parses + cleans URL
  → AdobeSignCallbackBanner surfaces result via data-my-work-adobe-sign-callback
```

## File-by-file references

| Concern | File | Notes |
| --- | --- | --- |
| No-grant → `authorization-required` | `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-principal-resolver.ts` | All no-grant branches (no-grant-found, grant-revoked, grant-requires-reauth, pending) emit `authorization-required`. |
| `authorization-required` envelope assembly | `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-queue-adapter.ts` | Principal, token, and search-client unauthorized paths produce the same `sourceStatus`. |
| SPFx backend client stamps `dataPath: 'backend-live'` | `apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts` | Envelope passes through unchanged otherwise. |
| Home-route envelope context | `apps/my-dashboard/src/shell/MyWorkActiveEnvelopeContext.tsx` | `MyWorkHomeEnvelopeProvider`, `useMyWorkHomeEnvelopeContext`. Focused-module envelope providers have been retired. |
| Surface composition | `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx` | Renders exactly two cards in static order: My Projects, then Adobe Sign Action Queue. Threads `sourceStatus`, `homeEnvelope`, and `onConnectAdobeSign` into the consolidated card. |
| Consolidated card (owns the auth-required UI) | `apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx` | Card emits `data-adobe-sign-action-queue-state` and renders the Connect CTA only when `sourceStatus === 'authorization-required'` AND `onConnect` is supplied. |
| State copy contract | `apps/my-dashboard/src/state/myWorkCardViewModel.ts` | `selectAdobeSignActionQueueStateCopy('authorization-required', hasOnConnect)` returns badge `Connect required`, body copy locked to the target copy library, `ctaVisible: hasOnConnect`. |
| OAuth start POST | `apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts` | `startAdobeSignOAuth(...)`. |
| Shell-level click handler | `apps/my-dashboard/src/shell/MyWorkShell.tsx` | `onConnectAdobeSign` constructs a backend-mode client, calls `startAdobeSignOAuth`, then `window.location.assign(authorizationUrl)`. |
| Callback banner | `apps/my-dashboard/src/shell/AdobeSignCallbackBanner.tsx` + `apps/my-dashboard/src/runtime/useAdobeSignCallbackResult.ts` | Reads `adobeSignAuthorization` from `location.search`, cleans URL, renders status. |

## DOM markers — what a hosted screenshot must show

On the My Dashboard home page, with no Adobe Sign grant, the DOM beneath
`<main data-my-work-active-surface-panel="my-work-home">` must contain:

| Marker | Expected value | Where it lives |
| --- | --- | --- |
| `data-my-work-source-status` | `authorization-required` | hidden `<span>` emitted by `MyWorkHomeSurface` |
| `data-my-work-data-path` | `backend-live` | on `<main role="main">` (set by the runtime stamping in `MyWorkShell`) |
| `data-my-work-card-role` | `adobe-sign-action-queue` | consolidated card root (via `MyWorkCard`) |
| `data-adobe-sign-action-queue-state` | `authorization-required` | consolidated card root |
| `data-adobe-sign-action-queue-badge` | `Connect required` | consolidated card root |
| `data-adobe-sign-connect-action` | `start` | the Connect button |
| `data-adobe-sign-connect-state` | `idle` (→ `connecting` on click → `idle` / `error` after POST) | the Connect button |

After the consent return:

| Marker | Possible values |
| --- | --- |
| `data-my-work-adobe-sign-callback` | `success`, `retryable-failure`, `operator-action-required`, `transient-failure`, `unknown` |
| `data-my-work-adobe-sign-callback-status` | `success`, `invalid-state`, `expired-state`, `consumed-state`, `configuration-required`, `source-unavailable`, …other backend statuses |

### Retired markers (must NOT appear on the home page)

These markers were emitted by the retired focused-module architecture
and must not appear under the current consolidated card:

- `data-my-work-card-role="adobe-sign-action-queue-home"`
- `data-my-work-card-role="adobe-sign-queue-state"`
- `data-my-work-card-role="adobe-sign-connection-guidance"`
- `data-my-work-card-role="adobe-sign-queue-summary"`
- `data-adobe-sign-connection-guidance`
- `data-adobe-sign-guidance-status`

`MyWorkShell.test.tsx`, `MyWorkSurfaceRouter.test.tsx`, and
`MyWorkHomeSurface.test.tsx` carry regression assertions for the absence
of these markers.

## Negative — when the CTA must NOT appear

The `Connect Adobe Sign` button is suppressed by the consolidated card
in all of these cases. Use these as the inverse acceptance criteria:

| `sourceStatus` | `readinessVariant` | CTA visible? | Why |
| --- | --- | --- | --- |
| `available` / `partial` | `ready` | No | The card renders its agreement list + summary; auth-required state is not active. |
| `configuration-required` | `non-ready` | No | Admin-side fix; `selectAdobeSignActionQueueStateCopy` returns `ctaVisible: false`. |
| `principal-unresolved` | `non-ready` | No | Administrator-side resolution required; `ctaVisible: false`. |
| `source-unavailable` | `non-ready` | No | Wait for source recovery; `ctaVisible: false`. |
| `backend-unavailable` | `non-ready` | No | Backend transport issue, not consent; `ctaVisible: false`. |
| any | `loading` | No | The Adobe card renders its loading state (no CTA). |
| any | `error` | No | The Adobe card renders its backend-unavailable state (no CTA). |
| `authorization-required` | `non-ready`, but `onConnectAdobeSign` absent | No | The card guards the CTA against a silent no-op; the surface tests both branches explicitly. |

## Test-coverage map

| File | Layer | What it proves |
| --- | --- | --- |
| `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-principal-resolver.test.ts` | Backend | Every no-grant branch emits `authorization-required`. |
| `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-queue-adapter.test.ts` | Backend | `authorization-required` envelopes carry `sourceStatus: 'authorization-required'`, `mode: 'backend'`, empty data, expected warning code (principal / token / search-client unauthorized paths). |
| `apps/my-dashboard/src/api/myWorkBackendReadModelClient.test.ts` | SPFx client | Successful backend responses stamp `dataPath: 'backend-live'`; failure modes delegate to the fallback. |
| `apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.test.tsx` | Card unit | The full state matrix including `authorization-required` with/without `onConnect`: badge copy, body copy, CTA visibility, idle button marker. |
| `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.test.tsx` | Surface integration | Connect CTA presence on `authorization-required` + `onConnectAdobeSign` supplied; CTA suppression when `onConnectAdobeSign` absent; two-card composition; locked bento spans. |
| `apps/my-dashboard/src/shell/MyWorkShell.adobeOAuth.test.tsx` | Shell E2E | Authorization-required envelope → consolidated card → idle Connect button → click → POST to `/api/my-work/me/adobe-sign/oauth/start` with bearer + returnPath → navigate to `authorizationUrl`. Negative: no `getApiToken` → no Connect button. |
| `apps/my-dashboard/src/shell/AdobeSignCallbackBanner.test.tsx` | Shell post-return | All callback-result kinds and statuses surface with the documented markers; URL cleaning + secret denylist. |

## Hosted acceptance — operator checklist

1. Confirm the user has no Adobe Sign grant (or that the grant has been
   revoked / requires re-auth).
2. Open the My Dashboard home page on the target tenant. The Adobe Sign
   Action Queue card is visible inline beneath the personalized
   greeting header; no module navigation is required.
3. In DevTools, locate `<main data-my-work-active-surface-panel="my-work-home">`
   and confirm:
   - `data-my-work-data-path="backend-live"`
   - inside the panel:
     `<span hidden data-my-work-source-status="authorization-required"></span>`
   - the Adobe card root:
     `<… data-my-work-card-role="adobe-sign-action-queue"
        data-adobe-sign-action-queue-state="authorization-required"
        data-adobe-sign-action-queue-badge="Connect required" …>`
   - inside the card:
     `<button data-adobe-sign-connect-action="start" data-adobe-sign-connect-state="idle">Connect Adobe Sign</button>`
4. Open the Network tab; click **Connect Adobe Sign**. Confirm:
   - `POST /api/my-work/me/adobe-sign/oauth/start` with
     `Authorization: Bearer …` and JSON body containing `returnPath`.
   - Response: `{ data: { authorizationUrl, stateExpiresAtUtc } }`.
   - The browser navigates to `authorizationUrl`.
5. Complete consent in Adobe Sign. Confirm the callback returns to the
   recorded `returnPath` and that `<div data-my-work-adobe-sign-callback="success">`
   mounts on the dashboard.
6. With consent granted, reload the home page and confirm the Adobe Sign
   card transitions away from `authorization-required` (typically to
   `available` with an agreement list) inline on the same page — no
   focused module navigation or reload is required.

## Callback redirect origin configuration

`completeAdobeSignOAuthCallback` emits absolute redirects built as:

`MY_DASHBOARD_PUBLIC_ORIGIN + validated returnPath + adobeSignAuthorization`

Required backend setting:

- `MY_DASHBOARD_PUBLIC_ORIGIN` = HTTPS origin only (no path/query/fragment),
  for example `https://hedrickbrotherscom.sharepoint.com`

Security posture:

- caller-supplied `returnPath` remains path-only and allowlisted by
  `validateAdobeSignReturnPath`;
- absolute caller return URLs are still rejected;
- when `MY_DASHBOARD_PUBLIC_ORIGIN` is missing/invalid, callback returns
  `503 CONFIGURATION_REQUIRED` instead of a relative redirect to the
  Function App host.

## Callback endpoint-shape compatibility

The callback route supports both observed Adobe redirect shapes:

- shape A: `code + state + api_access_point + web_access_point`
- shape B: `code + state` (no callback access-point params)

Endpoint resolution precedence:

1. use callback access points when both are present and valid;
2. when callback access points are absent, exchange the code using the
   documented fallback token endpoint and resolve access points from
   the token response;
3. persist only validated Adobe-host access points to the grant record.

Security constraints remain unchanged:

- callback values are never trusted blindly;
- endpoint validation requires absolute `https` URLs with Adobe-host
  allowlist suffixes;
- partial callback endpoint shape (only one of the two access points)
  is rejected;
- raw callback query values (`code`, `state`) and token material are
  never logged.

If any marker is missing or has the wrong value, the corresponding row
in the **Test-coverage map** is the first place to triage.
