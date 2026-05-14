# My Dashboard — Adobe Sign Authorization-Required Flow

## What this is

The end-to-end chain that proves a no-grant Adobe Sign user reaches a working **Connect Adobe Sign** CTA on the focused module. Use this reference for hosted-tenant acceptance: the DOM markers and test-coverage map below are the single source of truth for "the auth-required branch is reachable and not masked by a fixture-ready render."

## The chain

```
Backend principal-resolver
  → backend action-queue-adapter
  → envelope { sourceStatus: 'authorization-required', mode: 'backend', data: emptyReadModel(...) }
  → SPFx backend client (stamps dataPath: 'backend-live')
  → useAdobeSignActionQueueEnvelope → MyWorkFocusedAdobeEnvelopeProvider
  → MyWorkSurfaceRouter ⇒ AdobeSignActionQueueModuleRoute
  → AdobeSignActionQueueModuleSurface (readinessVariant: 'non-ready', sourceStatus: 'authorization-required')
  → AdobeSignConnectionGuidanceCard (vm.ctaVisible: true, onConnect: handleConnectAdobeSign)
  → <button data-adobe-sign-connect-action="start" data-adobe-sign-connect-state="idle">Connect Adobe Sign</button>
  → click → MyWorkShell.onConnectAdobeSign → backendClient.startAdobeSignOAuth({ returnPath })
  → POST /api/my-work/me/adobe-sign/oauth/start (bearer)
  → response.authorizationUrl → window.location.assign(authorizationUrl)
  → Adobe consent → callback redirect with adobeSignAuthorization query param
  → useAdobeSignCallbackResult parses + cleans URL
  → AdobeSignCallbackBanner surfaces result via data-my-work-adobe-sign-callback
```

## File-by-file references

| Concern                                               | File                                                                                                                      | Key lines                                                                                                                           |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| No-grant → `authorization-required`                   | `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-principal-resolver.ts`                  | `118–128` (no-grant-found, grant-revoked, grant-requires-reauth, pending)                                                           |
| `authorization-required` envelope assembly            | `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-queue-adapter.ts`                | `200–206` (principal), `214–220` (token), `245–255` (search-client unauthorized)                                                    |
| SPFx backend client stamps `dataPath: 'backend-live'` | `apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts`                                                               | success path; envelope passed through unchanged otherwise                                                                           |
| Active-route envelope context                         | `apps/my-dashboard/src/shell/MyWorkActiveEnvelopeContext.tsx`                                                             | `MyWorkFocusedAdobeEnvelopeProvider`, `useMyWorkFocusedAdobeEnvelopeContext`                                                        |
| Surface variant dispatch                              | `apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueModuleSurface.tsx`                                           | non-ready branch renders `AdobeSignQueueStateCard` + `AdobeSignConnectionGuidanceCard`                                              |
| CTA gating                                            | `apps/my-dashboard/src/modules/adobeSign/AdobeSignConnectionGuidanceCard.tsx`                                             | `ctaVisible = vm ? vm.ctaVisible && Boolean(onConnect) : Boolean(onConnect)`                                                        |
| CTA-applicable closed-set                             | `apps/my-dashboard/src/state/myWorkCardViewModel.ts`                                                                      | `SOURCE_STATUS_COPY['authorization-required'].ctaApplicable === true` (every other entry is `false`)                                |
| OAuth start POST                                      | `apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts`                                                               | `startAdobeSignOAuth(...)`                                                                                                          |
| Shell-level click handler                             | `apps/my-dashboard/src/shell/MyWorkShell.tsx`                                                                             | `onConnectAdobeSign` constructs a backend-mode client, calls `startAdobeSignOAuth`, then `window.location.assign(authorizationUrl)` |
| Callback banner                                       | `apps/my-dashboard/src/shell/AdobeSignCallbackBanner.tsx` + `apps/my-dashboard/src/runtime/useAdobeSignCallbackResult.ts` | reads `adobeSignAuthorization` from `location.search`, cleans URL, renders status                                                   |

## DOM markers — what a hosted screenshot must show

On the focused Adobe surface, with no grant, the DOM beneath `<main data-my-work-active-surface-panel="my-work-home">` must contain:

| Marker                            | Expected value                                               | Where it lives                             |
| --------------------------------- | ------------------------------------------------------------ | ------------------------------------------ |
| `data-my-work-source-status`      | `authorization-required`                                     | hidden `<span>` inside the focused surface |
| `data-my-work-data-path`          | `backend-live`                                               | on `<main role="tabpanel">` (Prompt 02)    |
| `data-my-work-card-role`          | `adobe-sign-connection-guidance`                             | guidance-card root                         |
| `data-adobe-sign-guidance-status` | `authorization-required`                                     | guidance-card root                         |
| `data-adobe-sign-connect-action`  | `start`                                                      | the Connect button                         |
| `data-adobe-sign-connect-state`   | `idle` (→ `connecting` on click → `idle`/`error` after POST) | the Connect button                         |

After the consent return:

| Marker                                    | Possible values                                                                                                                        |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `data-my-work-adobe-sign-callback`        | `success`, `retryable-failure`, `operator-action-required`, `transient-failure`, `unknown`                                             |
| `data-my-work-adobe-sign-callback-status` | `success`, `invalid-state`, `expired-state`, `consumed-state`, `configuration-required`, `source-unavailable`, …other backend statuses |

## Negative — when the CTA must NOT appear

The `Connect Adobe Sign` button is suppressed by the surface in all of these cases. Use these as the inverse acceptance criteria:

| `sourceStatus`           | `readinessVariant`                                        | CTA visible? | Why                                                                                  |
| ------------------------ | --------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------ |
| `available` / `partial`  | `ready`                                                   | No           | Guidance card is not rendered at all — only the queue summary + agreement list mount |
| `configuration-required` | `non-ready`                                               | No           | `ctaApplicable: false` — fix is admin-side, not user-side                            |
| `principal-unresolved`   | `non-ready`                                               | No           | `ctaApplicable: false` — administrator-side resolution required                      |
| `source-unavailable`     | `non-ready`                                               | No           | `ctaApplicable: false` — wait for source recovery                                    |
| `backend-unavailable`    | `non-ready`                                               | No           | `ctaApplicable: false` — backend transport issue, not consent                        |
| any                      | `loading`                                                 | No           | guidance card not yet mounted                                                        |
| any                      | `error`                                                   | No           | error marker shown instead of cards                                                  |
| `authorization-required` | `non-ready`, but `onConnect` absent (fixture / no bearer) | No           | Local card guard prevents a silent no-op button                                      |

## Test-coverage map

| File                                                                                                            | Layer               | What it proves                                                                                                                                                                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-principal-resolver.test.ts`   | Backend             | Every no-grant branch (`no-grant-found`, `grant-revoked`, `grant-requires-reauth`, pending) emits `authorization-required`                                                                                                                                                                   |
| `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-queue-adapter.test.ts` | Backend             | `authorization-required` envelopes have `sourceStatus: 'authorization-required'`, `mode: 'backend'`, empty data, expected warning code (across principal, token, and search-client paths)                                                                                                    |
| `apps/my-dashboard/src/api/myWorkBackendReadModelClient.test.ts`                                                | SPFx client         | Successful backend responses stamp `dataPath: 'backend-live'`; every failure mode delegates to the fallback                                                                                                                                                                                  |
| `apps/my-dashboard/src/modules/adobeSign/AdobeSignConnectionGuidanceCard.test.tsx`                              | Card unit           | Local CTA gating: `vm.ctaVisible: true && onConnect` → button visible; `vm.ctaVisible: false` → button suppressed for every non-auth status, even with `onConnect` supplied                                                                                                                  |
| `apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueModuleSurface.test.tsx`                            | Surface integration | `authorization-required` mounts guidance card with status marker and idle Connect button; `principal-unresolved` / `source-unavailable` / `backend-unavailable` all mount the guidance card with status marker but no CTA; `available` ready variant does not mount the guidance card at all |
| `apps/my-dashboard/src/shell/MyWorkShell.adobeOAuth.test.tsx`                                                   | Shell E2E           | Authorization-required envelope → focused module → guidance marker present → click → POST to `/api/my-work/me/adobe-sign/oauth/start` with bearer + returnPath → navigate to `authorizationUrl`; negative: no `getApiToken` → no Connect button                                              |
| `apps/my-dashboard/src/shell/AdobeSignCallbackBanner.test.tsx`                                                  | Shell post-return   | All callback-result kinds and statuses surface with the documented markers; URL cleaning + secret denylist                                                                                                                                                                                   |

## Hosted acceptance — operator checklist

1. Confirm the user has no Adobe Sign grant (or that the grant has been revoked / requires re-auth).
2. Navigate to the My Dashboard SharePoint surface and open the **Adobe Sign Action Queue** module.
3. In DevTools, locate `<main id="my-work-active-surface-panel">` and confirm:
   - `data-my-work-data-path="backend-live"`
   - inside the panel: `<span hidden data-my-work-source-status="authorization-required"></span>`
   - `<div data-my-work-card-role="adobe-sign-connection-guidance" data-adobe-sign-guidance-status="authorization-required">`
   - inside the guidance card: `<button data-adobe-sign-connect-action="start" data-adobe-sign-connect-state="idle">Connect Adobe Sign</button>`
4. Open the Network tab; click **Connect Adobe Sign**. Confirm:
   - `POST /api/my-work/me/adobe-sign/oauth/start` with `Authorization: Bearer …` and JSON body containing `returnPath`.
   - Response: `{ data: { authorizationUrl, stateExpiresAtUtc } }`.
   - The browser navigates to `authorizationUrl`.
5. Complete consent in Adobe Sign. Confirm the callback returns to the recorded `returnPath` and that `<div data-my-work-adobe-sign-callback="success">` mounts on the dashboard.
6. Reload the focused module and confirm the guidance card is gone (status flipped to `available`) and the agreement list renders.

## Callback redirect origin configuration

`completeAdobeSignOAuthCallback` now emits absolute redirects built as:

`MY_DASHBOARD_PUBLIC_ORIGIN + validated returnPath + adobeSignAuthorization`

Required backend setting:

- `MY_DASHBOARD_PUBLIC_ORIGIN` = HTTPS origin only (no path/query/fragment), for example `https://hedrickbrotherscom.sharepoint.com`

Security posture:

- caller-supplied `returnPath` remains path-only and allowlisted by `validateAdobeSignReturnPath`;
- absolute caller return URLs are still rejected;
- when `MY_DASHBOARD_PUBLIC_ORIGIN` is missing/invalid, callback returns `503 CONFIGURATION_REQUIRED` instead of a relative redirect to the Function App host.

## Callback endpoint-shape compatibility

The callback route supports both observed Adobe redirect shapes:

- shape A: `code + state + api_access_point + web_access_point`
- shape B: `code + state` (no callback access-point params)

Endpoint resolution precedence:

1. use callback access points when both are present and valid;
2. when callback access points are absent, exchange the code using the documented fallback token endpoint and resolve access points from the token response;
3. persist only validated Adobe-host access points to the grant record.

Security constraints remain unchanged:

- callback values are never trusted blindly;
- endpoint validation requires absolute `https` URLs with Adobe-host allowlist suffixes;
- partial callback endpoint shape (only one of the two access points) is rejected;
- raw callback query values (`code`, `state`) and token material are never logged.

If any marker is missing or has the wrong value, the corresponding row in the **Test-coverage map** is the first place to triage.
