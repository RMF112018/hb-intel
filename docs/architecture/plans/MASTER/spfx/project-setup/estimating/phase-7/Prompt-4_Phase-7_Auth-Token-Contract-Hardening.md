# Prompt 4 — Phase 7 Auth and Token Contract Hardening

## Title
Phase 7 — Standardize and harden the Entra token validation contract for Project Setup backend access

## Objective
Refine the backend auth/token-validation model so that it is internally consistent, aligned with the chosen frontend calling pattern, and supportable in production. Remove ambiguity around issuer, audience, token version handling, and environment contract.

## Critical instructions
- Use current Microsoft guidance as the governing external standard.
- Prefer official Microsoft documentation over secondary sources.
- The final token contract must be explicit in code and docs.
- Do not preserve “supports both v1 and v2” claims unless the implementation truly, explicitly, and testably supports both.
- Do not leave audience handling in a state that depends on assumptions about tenant quirks.

## Required work
1. Audit the current backend auth middleware and token validator against the chosen production SPFx/API calling pattern.
2. Decide the authoritative inbound token contract for Project Setup production access, including:
   - token version expectation,
   - audience expectation,
   - issuer expectation,
   - required claims,
   - and any acceptable alternate forms.
3. Update the token validation implementation so that repo truth and docs match exactly.
4. Review `API_AUDIENCE` handling and eliminate any misleading or weak fallback behavior that is not appropriate for production.
5. Update environment/config docs and sample settings so they reflect the true production contract.
6. Add or update tests for:
   - valid token acceptance,
   - invalid audience rejection,
   - invalid issuer rejection,
   - missing required claims rejection,
   - and any intentionally supported alternate token form.
7. Update the cumulative Phase 7 report with exact decisions and evidence.

## Deliverables
- Hardened auth/token-validation code.
- Updated config samples and token-contract docs.
- Tests proving the final behavior.
- Updated cumulative report.

## Required report content for this prompt
Add a section named:
`Prompt 4 completion notes`

Include:
- the final authoritative token contract,
- code/files changed,
- removed assumptions or fallbacks,
- test evidence,
- and any operational setup prerequisites that remain external.

## Acceptance criteria
- The backend token-validation contract is explicit and coherent.
- Repo truth no longer overstates unsupported token-version flexibility.
- Config samples and docs match runtime behavior.
- The result is suitable for production deployment review.
