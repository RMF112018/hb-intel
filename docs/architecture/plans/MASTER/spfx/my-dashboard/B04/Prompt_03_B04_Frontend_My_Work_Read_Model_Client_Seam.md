# Prompt 03 — B04 Frontend My Work Read-Model Client Seam

## 1. Objective

Implement the My Dashboard frontend read-model client interface, factory, fixture client, and protected backend client that consume the B04 shared contracts.

## 2. Why this work exists

B02 reserved an app-local API seam so React cards/surfaces do not own backend URL, token, fetch, or fallback behavior. B04 now defines the exact route/client contract that must occupy that seam.

## 3. Current repo-truth problem or gap

The current repo may still lack `apps/my-dashboard/` until B02/B03 prompts are executed. If the app scaffold exists, there is no B04 My Work read-model client layer yet. If the app scaffold does not exist, stop this prompt and report that B02/B03 are prerequisite for Prompt 03.

## 4. Attached B04 authority / plan basis

Use the attached **B04 — My Work Read Models, Routes, Error Taxonomy, and Fixture Architecture Development** artifact as the authoritative batch plan. Preserve these closed decisions:

- Frontend client methods:
  - `getMyWorkHome()`
  - `getAdobeSignActionQueue(query?)`
- Route paths:
  - `my-work/me/home`
  - `my-work/me/adobe-sign/action-queue`
- Queue query fields:
  - `pageSize`
  - `cursor`
- Backend client must use injected `getApiToken()` and send Bearer auth
- Fallback on backend consumption failure returns deterministic `backend-unavailable` fixture envelopes
- No actor/user/principal override path/query.

## 5. Exact files, folders, docs, and symbols to inspect

First confirm:
- `apps/my-dashboard/` exists.

Then inspect:
- B02-created runtime/config/client seam files if present,
- `apps/project-control-center/src/api/pccReadModelClient.ts`
- `apps/project-control-center/src/api/pccReadModelClientFactory.ts`
- `apps/project-control-center/src/api/pccBackendReadModelClient.ts`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.ts`
- Prompt 01–02 outputs under `@hbc/models/myWork`.

## 6. Required implementation outcome

Create:
```text
apps/my-dashboard/src/api/
├── myWorkReadModelClient.ts
├── myWorkReadModelClientFactory.ts
├── myWorkFixtureReadModelClient.ts
├── myWorkBackendReadModelClient.ts
└── tests aligned to repo convention
```

## 7. Detailed change instructions

1. In `myWorkReadModelClient.ts`, define:
   - namespace/route ID constants,
   - route path map,
   - `MyWorkReadModelRouteId`,
   - `IMyWorkReadModelClient` with exactly two methods.

2. In `myWorkReadModelClientFactory.ts`, implement:
   - read-model mode resolution,
   - default fixture posture,
   - backend mode selection when prerequisites are available,
   - deterministic backend-unavailable fixture fallback when backend prerequisites are missing, aligned to B04/B02 runtime policy.

3. In `myWorkFixtureReadModelClient.ts`, implement:
   - exact client interface,
   - fixture envelope returns from shared fixture package,
   - optional deterministic clock / backend unavailable simulation if B04 support docs direct it,
   - no HTTP logic.

4. In `myWorkBackendReadModelClient.ts`, implement:
   - normalized `/api` base URL handling,
   - route path construction from the route map,
   - query serialization only for `pageSize` and `cursor`,
   - fresh token acquisition from injected `getApiToken()`,
   - `Authorization: Bearer ...`,
   - response parsing for `{ data: envelope }`,
   - safe fallback on:
     - fetch reject,
     - non-2xx,
     - malformed JSON,
     - missing/invalid wrapper,
     - unavailable token callback failure if that is the repo-consistent defensive posture.

5. Add tests proving:
   - exact route URL formation,
   - no duplicate `/api/api`,
   - `pageSize` and `cursor` serialize correctly,
   - no actor/user/principal query fields appear,
   - bearer auth header is set,
   - every failure mode returns backend-unavailable fixture envelope,
   - fixture mode uses shared fixture scenarios.

6. If B02 runtime-config files define a client configuration surface, integrate the factory only through those existing seams. Do not invent card-level or component-level fetch wiring.

## 8. What done looks like

Done means:
- My Dashboard app has a typed My Work API client seam,
- no React UI component needs raw fetch or token logic,
- protected backend route calls are bearer-token capable,
- failures collapse to deterministic, type-valid fallback envelopes,
- tests lock URL/query/auth/fallback behavior.

## 9. Strict constraints / prohibitions

- Do not execute this prompt if `apps/my-dashboard/` is absent; report predecessor dependency.
- Do not call Adobe APIs from the app.
- Do not add actor override query parameters.
- Do not create alternate routes.
- Do not implement B05 UI consumption beyond the app client seam.
- Do not weaken B02 auth posture by omitting the token callback/header.

## 10. Validation requirements

When app scaffold exists, run:
```text
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
```

If the package name differs, use the actual package name in `apps/my-dashboard/package.json` and state that exact command in the closeout.

## 11. Proof of closure

Provide:
- route map summary,
- backend URL normalization examples covered by tests,
- bearer-token behavior confirmation,
- fallback scenario list,
- test command results.

## 12. Commit / closeout expectations

Do not commit unless asked. If blocked by absent B02/B03 app scaffold, stop and return a precise blocker statement rather than creating speculative folders.

## 13. Do not re-read files already in active context unless needed to confirm drift

Do not re-read files that are still available in your active context or memory unless you need to confirm repo drift, resolve a conflict, or verify an implementation detail that cannot be trusted from the current context.
