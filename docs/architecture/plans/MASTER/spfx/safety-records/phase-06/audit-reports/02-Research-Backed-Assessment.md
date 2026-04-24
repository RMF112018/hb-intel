# 02 — Research-Backed Production-Readiness Assessment

## Phase 3 — Research-backed assessment

## A. SPFx / Entra-secured API integration

Microsoft’s SPFx guidance for Entra-secured APIs requires the solution to request API permissions and use SPFx-provided AAD token/client mechanisms for calls to secured APIs. Administrators must approve API permissions. CORS must also be configured for cross-domain Function App calls from SharePoint.

Current posture:
- public-main Safety SPFx wiring bootstraps auth/permissions;
- it does not inject an API audience or backend base URL;
- it does not use an AAD-secured client/token provider for the Safety backend.

Assessment:
- preserve SPFx context bootstrapping;
- add an explicit backend runtime contract;
- fail closed in SharePoint mode when backend config is absent.

Work type: structural redesign at the frontend/backend seam.

## B. Token handling and delegated authorization

Microsoft Entra guidance treats access tokens as sensitive, opaque credentials for the API/resource server to validate. Client code should acquire and attach tokens but should not parse or validate them as authority.

Current posture:
- public-main frontend never acquires a backend token for Safety command routes.

Required correction:
- route all backend commands through a typed backend client that acquires a token for the configured API audience, attaches it, and preserves auth failure classifications.

Work type: structural redesign.

## C. React / async state discipline

React recommends custom hooks / client-side caches for data fetching where possible and warns about race conditions and cleanup requirements. TanStack Query provides cancellation support through `AbortSignal`; browser `AbortController` supports cancelling fetch requests.

Current posture:
- React Query is already present and should remain;
- public-main upload mutation is a one-shot direct submit without bounded cancellation, timeout, preview step, request signature, or stale-response protection.

Required correction:
- preview and commit must be independent mutations with request signatures, abort support, bounded retry, and UI gating.

Work type: structural redesign for upload workflow.

## D. File upload and workbook validation

Production file-upload UX should validate file type, size, state, and outcome before server commit. The backend/parser contract requires the workbook to be treated as a governed input contract.

Current posture:
- public-main upload accepts `.xlsx` and posts directly;
- it does not run backend preview first;
- it does not surface parser contract version, marker state, parser authority, reporting-period mismatch, or duplicate/supersession risk before commit.

Required correction:
- redesign upload as preview-first with template, parser, period, project, duplicate, and metadata-authority diagnostics before commit.

Work type: structural redesign.

## E. Observability / supportability

Azure Monitor/Application Insights supports distributed telemetry correlation and JavaScript telemetry enrichment. A production frontend/backend seam should preserve request IDs and support correlation across browser, Function logs, and user screenshots.

Current posture:
- public-main upload does not generate an `X-Request-Id`;
- it does not preserve backend request IDs;
- it does not show support details.

Required correction:
- generate client request IDs;
- send `X-Request-Id`;
- preserve returned backend request IDs;
- expose bounded support details;
- optionally emit frontend dependency telemetry.

Work type: structural redesign at command client; UI refinement at panels.

## F. Accessibility / async failure states

WCAG 4.1.3 requires status messages to be programmatically determinable so assistive technologies can announce changes without focus movement.

Current posture:
- public-main upload uses generic banners and hidden file input;
- it does not provide a disciplined live-region model for preview running, preview blocked, commit running, commit complete, and fatal errors.

Required correction:
- add polite status and assertive alert regions;
- keep focus stable;
- announce preview and commit state transitions.

Work type: refinement after structural upload redesign.

## G. Azure Functions route/auth behavior

Azure Functions HTTP triggers can be anonymous/function/admin at the function-key layer. Anonymous means no function key is required; application authorization still must be enforced when the route is protected by custom middleware.

Current posture:
- backend routes are anonymous HTTP triggers but wrapped with auth/scope/admin middleware;
- frontend must call them with a valid bearer token and must not assume anonymous means public.

Required correction:
- implement delegated bearer propagation and prove 401/403/422/200 behaviors separately.
