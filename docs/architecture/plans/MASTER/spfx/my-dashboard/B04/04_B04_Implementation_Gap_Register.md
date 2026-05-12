# B04 Implementation Gap Register

## Purpose

This register translates the B04 planning artifact into concrete repo gaps, required target conditions, remediation actions, and prompt ownership.

| ID | Current repo condition | B04 target condition | Required remediation | Severity | Prompt |
|---|---|---|---|---|---|
| G-01 | No `packages/models/src/myWork/` folder exists | My Work read-model contract namespace exists | Create My Work DTO files, tests, index, and root export | Critical | 01 |
| G-02 | No My Work envelope/status/warning vocabulary exists | Exact B04 envelope/status/warning literals exist | Implement `MyWorkReadModels.ts` and tests | Critical | 01 |
| G-03 | No Adobe Sign Action Queue shared DTOs exist | Exact status/action/item/summary/pagination/freshness DTOs exist | Implement `AdobeSignActionQueue.ts` and tests | Critical | 01 |
| G-04 | No B04 deterministic fixture package exists | Scenario-based fixture matrix covers all B04 states | Create fixture files and exports | Critical | 02 |
| G-05 | No fixture proof for one item per six Adobe actionable statuses | Populated fixture includes exactly one status/action row for each MVP actionable status | Build six-row populated fixture + tests | High | 02 |
| G-06 | No My Work frontend read-model client seam exists | App has typed client interface/factory/fixture/backend client | Create app API files where B02 scaffold exists | Critical | 03 |
| G-07 | No protected backend-client bearer token support for My Work | Backend client accepts `getApiToken()` and emits Authorization header | Implement and test token callback usage | Critical | 03 |
| G-08 | No frontend safe fallback envelopes for My Work route failure | Browser-side backend failures map to deterministic `backend-unavailable` fixture envelopes | Implement fallback behavior and tests | High | 03 |
| G-09 | No `my-work-read-model` backend host exists | Backend host/provider namespace exists | Create host/provider folder and imports | Critical | 04 |
| G-10 | No `/api/my-work/me/...` production route registrations exist | Exactly two GET protected route registrations exist | Implement `my-work-read-model-routes.ts` | Critical | 04 |
| G-11 | No backend query validation for queue route | `pageSize` and `cursor` have explicit validation; invalid page size returns HTTP 400 | Implement route/query parsing + tests | High | 04 |
| G-12 | Actor override posture not yet enforced because route does not exist | No path/query actor override exists | Hard-code `/me/` routes and test absence of email/user/principal overrides | Critical | 04 / 05 |
| G-13 | Cross-layer route IDs/paths cannot currently be reconciled | Models/app/backend route-family agreement is tested | Add route consistency tests/search guards | High | 05 |
| G-14 | No source-state/HTTP-error matrix proof exists | Business/source states vs true HTTP failures are enforced | Tests and implementation comments align to B04 matrix | High | 05 |
| G-15 | No explicit non-duplication proof vs `@hbc/my-work-feed` | My Work DTOs remain narrow route contracts only | Review comments/tests/docs; block platform-model drift | High | 05 |
| G-16 | No closeout evidence package exists | Final execution summary captures commands, files, blockers, and scope confirmation | Perform validation and produce closeout | Medium | 06 |
