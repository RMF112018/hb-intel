# 05 — Production-Readiness Gap Register

## Phase 6 — Gap register

Severity:
- **Blocker** — must close before production
- **High** — close in same hardening program
- **Medium** — needed for maintainability/accessibility/support
- **Low** — follow-on refinement

| ID | Severity | Area | Gap | Required correction |
|---|---|---|---|---|
| G-01 | Blocker | Source truth / release integrity | Public raw `main` and connected-tool evidence disagree; advanced frontend files are not reliably proven as deployed source. | Establish one repo/source/artifact truth; run clean local build; verify package contents; document exact commit. |
| G-02 | Blocker | Backend binding | Public-main `App.tsx` only configures SharePoint REST client; no backend base URL/API audience/token seam. | Add Safety runtime contract and backend command client initialization. |
| G-03 | Blocker | SPFx props/config | Public-main `SafetyWebPart` exposes only `description`; no `functionAppUrl`, `apiAudience`, or host-mode validation. | Add governed SPFx property/runtime config injection with fail-closed behavior. |
| G-04 | Blocker | Auth | Frontend does not acquire or send delegated Entra bearer token for backend routes. | Use SPFx AAD token/client seam; send `Authorization: Bearer`; prove 401/403/success behavior. |
| G-05 | Blocker | Route contract | Frontend does not call `/api/safety-records/ingest/preview`; public package export does not prove preview hook/client. | Implement typed preview/ingest/replay backend command client and hooks. |
| G-06 | Blocker | Workflow truth | Upload page directly submits; no preview-before-commit gate. | Redesign upload into preview → confirm → commit state machine. |
| G-07 | Blocker | Request payload | Public upload omits project context, inspection number, and inspection date required for target backend workflow. | Add project picker and inspection metadata intake; construct full `UploadContext`. |
| G-08 | High | Parser authority | UI does not expose parser authority, parser contract, metadata authority, or mismatch semantics before commit. | Surface metadata authority and warnings/blockers from preview. |
| G-09 | High | Failure truthfulness | Generic period/upload errors collapse config, auth, route, parser, period, duplicate, and commit failures. | Add typed error taxonomy and support details with request IDs/failure classes. |
| G-10 | High | Observability | No frontend request ID propagation or dependency telemetry. | Generate `X-Request-Id`, preserve backend IDs, expose support reference, add telemetry hook. |
| G-11 | High | Async resilience | No cancellation/timeout/retry policy on public direct submit. | Use AbortController/timeout, bounded retry only for transient failures. |
| G-12 | High | Config drift | GUID overlay is runtime/browser-injected, not verified against release environment. | Fail closed on missing GUIDs and add release proof against HBCentral lists/libraries. |
| G-13 | High | Backend readiness | No frontend-visible/release proof for backend route availability/auth/readiness. | Add release verification for base URL, API audience, token acquisition, preview route, CORS, response envelopes. |
| G-14 | Medium | Accessibility | Public upload lacks robust live-region state transitions and governed file input. | Add polite/assertive live regions, accessible file primitive, and focus-stable errors. |
| G-15 | Medium | Security | Browser-side direct SharePoint writes conflict with graph-native backend authority and create inconsistent permission model. | Move write commands behind backend; use browser SharePoint reads only where intentionally delegated. |
| G-16 | Medium | Maintainability | Shared adapter boundary mixes legacy REST data-plane assumptions with target backend command authority. | Split read repository from backend command client or clearly segregate command methods. |
| G-17 | Medium | Mock/test truth | Mock mode can hide missing backend command config and does not prove production route contracts. | Add contract tests using backend-like envelopes and SPFx-hosted command tests. |
| G-18 | Medium | Provisioning/admin route | Provisioning route requires admin; frontend must not expose it in normal upload UX. | Keep provisioning in admin-only tooling with explicit admin proof and confirmation. |
