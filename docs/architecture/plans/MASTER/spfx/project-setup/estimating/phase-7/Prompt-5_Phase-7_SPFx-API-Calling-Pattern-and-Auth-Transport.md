# Prompt 5 — Phase 7 SPFx API Calling Pattern and Auth Transport

## Title
Phase 7 — Align the Project Setup frontend auth transport with backend expectations and Microsoft-recommended SPFx API access patterns

## Objective
Ensure the Project Setup frontend uses a production-appropriate auth transport to call the backend. Eliminate any mismatch between how the frontend sends requests and how the backend expects to authenticate them.

## Critical instructions
- Follow the contract frozen in Prompt 1 and the token/auth decisions from Prompt 4.
- Use current Microsoft guidance for SPFx-to-Entra-secured-API access as the governing standard unless repo-truth constraints require a clearly documented exception.
- Do not leave fetch patterns that rely on `credentials: 'include'` if the backend requires bearer tokens, unless there is a deliberate platform-layer auth strategy that is explicitly implemented and documented.
- Keep the Project Setup frontend path simple and supportable.

## Required work
1. Audit the Project Setup frontend and any shared packages it consumes for backend HTTP calling patterns.
2. Identify every place where calls rely on implicit cookie/session behavior, `credentials: 'include'`, or other transport assumptions that conflict with the chosen backend auth model.
3. Refactor the frontend to the authoritative calling pattern.
   Examples may include:
   - `AadHttpClient` for SPFx-to-Entra-secured API calls,
   - a centralized authenticated API client abstraction,
   - or another clearly justified and documented production pattern.
4. Ensure route callers required by Project Setup consistently use the same auth transport.
5. If shared packages currently assume `/api/users/me/*` plus cookie-style transport, reconcile or isolate them so the Project Setup package is production-safe.
6. Add or update tests where practical for authenticated client behavior, token acquisition wiring, and failure handling.
7. Update docs that define how the SPFx package calls the backend, including any permission approval requirements.
8. Update the cumulative Phase 7 report.

## Deliverables
- Frontend API client/auth-transport refactor.
- Updated docs for SPFx API access and required permissions.
- Tests or other repo-truth evidence supporting the new pattern.
- Updated cumulative report.

## Required report content for this prompt
Add a section named:
`Prompt 5 completion notes`

Include:
- the final frontend auth transport pattern,
- files changed,
- shared packages reconciled or isolated,
- admin/API permission implications,
- and remaining operational items.

## Acceptance criteria
- The Project Setup frontend sends backend requests using a transport that matches backend auth expectations.
- Cookie/session-style assumptions no longer conflict with bearer-token validation.
- Repo truth and docs communicate one supportable SPFx backend-access pattern.
