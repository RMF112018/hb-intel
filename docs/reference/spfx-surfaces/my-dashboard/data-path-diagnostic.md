# My Dashboard — Data-Path Diagnostic

## What this is

The My Dashboard SPFx surface stamps every read-model envelope it returns with a `dataPath` classification, and the shell surfaces it as `data-my-work-data-path="<value>"` on the active surface panel (`<main role="tabpanel">`). The marker makes hosted screenshots and operator triage unambiguous: an operator can tell at a glance whether the rendered queue is real backend data, a fallback fixture, or an explicit UI-review fixture.

## Values

| `data-my-work-data-path`       | Meaning                                                                                                                                           | Production-acceptable?                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `backend-live`                 | The protected My Work backend was reached and returned the rendered envelope.                                                                     | Yes — provided the rows are not known fixture titles (see leakage check below).                            |
| `backend-unavailable-fallback` | Production posture; the backend was unreachable or misconfigured and the SPFx client substituted a fixture envelope.                              | No — investigate backend reachability, app settings, or token-provider wiring before accepting the deploy. |
| `fixture-ui-review`            | Explicit `ui-review` runtime mode; fixture data is intentional (UI/visual review only).                                                           | Never on a production tenant.                                                                              |
| `unknown`                      | The envelope has not resolved yet (loading/error) or arrived without a `dataPath` field. Treat as "in flight" rather than as evidence either way. | —                                                                                                          |

## How the classification is stamped

- The backend client (`apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts`) overwrites the envelope's `dataPath` with `'backend-live'` on every successful response. The overwrite prevents a backend response from spoofing another classification.
- The fixture client (`apps/my-dashboard/src/api/myWorkFixtureReadModelClient.ts`) stamps the `dataPath` value supplied by the factory.
- The factory (`apps/my-dashboard/src/api/myWorkReadModelClientFactory.ts`) supplies:
  - `'fixture-ui-review'` when `runtimeConfig.backendMode === 'ui-review'` or `readModelMode: 'fixture'` is requested explicitly;
  - `'backend-unavailable-fallback'` when production posture (`backendMode === 'production'`) is missing `functionAppUrl` or a token provider, or when the backend's per-request fallback fires.

## Hosted acceptance — what to check on a tenant screenshot

1. Inspect the rendered DOM (browser DevTools) for the shell's active panel:
   ```
   <main id="my-work-active-surface-panel"
         data-my-work-active-surface-panel="my-work-home"
         data-my-work-data-path="backend-live"
         ...>
   ```
2. Confirm the value is `backend-live` on a production tenant.
3. If the value is `backend-unavailable-fallback`, triage:
   - Is `functionAppUrl` set in the runtime config?
   - Is the SPFx wrapper passing a working `getApiToken` callback?
   - Are the Function App routes reachable from the tenant?
     Do not accept the deploy until the marker reads `backend-live`.
4. If the value is `fixture-ui-review` on a production tenant, the `backendMode` runtime config is wrong; halt and triage the build/config pipeline.

## Fixture-title leakage check

Production-targeted acceptance must also confirm that even when `data-my-work-data-path="backend-live"`, the rendered queue does not contain known fixture agreement titles. The set is exported from `apps/my-dashboard/src/api/myWorkReadModelDataPath.ts` and includes the six shipped titles:

- `Master Services Agreement`
- `Subcontract Approval Packet`
- `Vendor Terms Acceptance`
- `Site Safety Acknowledgement`
- `Insurance Disclosure Form`
- `Signature Delegation Request`

Local check (programmatic):

```ts
import { assertNoFixtureTitleLeakageOnBackendLive } from './api/myWorkReadModelDataPath.js';

assertNoFixtureTitleLeakageOnBackendLive({
  dataPath: envelope.dataPath,
  items: envelope.data.items,
});
// Throws when dataPath === 'backend-live' AND the items list overlaps with the known fixture titles.
```

Hosted check (manual): grep the rendered queue rows for any of the six titles. Any match on a `backend-live` panel is a production failure.

## Out of scope

This diagnostic does not run a hosted Playwright probe — none exists for `apps/my-dashboard` today. Operator captures the DOM marker manually as part of the deploy acceptance.
