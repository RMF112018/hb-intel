# Health Ready Non-Admin Browser-Auth Proof

Date: 2026-04-24

## A) Decision

**Partial closure**.

- Browser-first proof seam is now implemented and test-covered.
- Verifier repeatability support for non-admin bearer is now implemented and test-covered.
- Full live closure is still blocked in this execution environment because hosted browser-path execution could not be run end-to-end here.

This is **not** claimed as full closure.

## B) Repo-Truth Seams Confirmed

Primary browser/SPFx auth seams used as authority:

- `apps/safety/src/mount.tsx`
  - hosted entrypoint, auth bootstrap (`resolveSpfxPermissions`, `bootstrapSpfxAuth`).
- `packages/auth/src/spfx/index.ts`
  - exports `createSpfxApiTokenProvider`.
- `packages/auth/src/spfx/apiTokenProvider.ts`
  - canonical token path: `aadTokenProviderFactory.getTokenProvider().getToken(apiAudience)`.

Backend auth semantics confirmed and preserved:

- `backend/functions/src/middleware/auth.ts` -> missing/malformed/invalid bearer => `401`.
- `backend/functions/src/middleware/authorization.ts` + `backend/functions/src/functions/health/ready.ts`
  - valid bearer without `Admin`/`HBIntelAdmin` => `403`.

## C) Files Changed

- `apps/safety/src/runtime/healthReadyProof.ts`
  - Added narrow, query-gated hosted proof action:
    - gate: `?hbSafetyProof=healthReadyNonAdmin`
    - token acquisition via SPFx `AadTokenProviderFactory`
    - safe claim classification (no raw JWT persistence)
    - browser-originated `GET /api/health/ready` probe
    - redacted proof payload emission (`window.__hbIntel_safetyProof`, console info)
- `apps/safety/src/App.tsx`
  - Added one `useEffect` proof trigger using the new runtime helper.
  - No product UI changes.
- `apps/safety/src/runtime/healthReadyProof.test.ts`
  - Added behavior tests for proof gate + token classification + `403` probe handling.
- `scripts/verify-functions-live-parity.ts`
  - Added optional `--non-admin-token`.
  - Added `readinessAuthTruth.nonAdminBearer` evidence block with strict `403` expectation.
- `scripts/verify-functions-live-parity.test.ts`
  - Added non-admin probe assertions.

## D) Commands Executed

- `pnpm --filter @hbc/spfx-safety test -- src/runtime/healthReadyProof.test.ts`
- `pnpm exec vitest run --config scripts/vitest.config.ts scripts/verify-functions-live-parity.test.ts`
- `pnpm --filter @hbc/functions check-types`
- `/tmp/safety-e2e-context.sh > /tmp/safety-e2e-evidence/healthready-parity/context-refresh-nonadmin.out.json`
- `curl -sS -H "Authorization: Bearer $GRAPH_TOKEN" "https://graph.microsoft.com/v1.0/sites/$SAFETY_SITE_ID?%24select=webUrl,displayName,id" | tee /tmp/safety-e2e-evidence/healthready-parity/safety-site.json`
- `curl -sS -H "Authorization: Bearer $GRAPH_TOKEN" "https://graph.microsoft.com/v1.0/sites/$SAFETY_SITE_ID/pages/microsoft.graph.sitePage?%24select=id,name,title,webUrl&%24top=50" | tee /tmp/safety-e2e-evidence/healthready-parity/safety-pages.json`

## E) Browser-Path Execution Status

Hosted page discovered:

- `https://hedrickbrotherscom.sharepoint.com/sites/Safety/SitePages/Job-Site-Safety-Scores.aspx`

Brave browser-path execution was attempted directly:

1. Added local compatibility symlinks so Playwright chrome lookup resolves to Brave binaries:
   - `/Applications/Google Chrome.app -> /Applications/Brave Browser.app`
   - `/Applications/Brave Browser.app/Contents/MacOS/Google Chrome -> .../Brave Browser`
2. Navigation to hosted Safety URL succeeded under Brave binary path, but landed at Entra sign-in:
   - `https://login.microsoftonline.com/.../oauth2/authorize?...`
3. Headed Brave proof run with copied profile timed out waiting for `window.__hbIntel_safetyProof`:
   - `page.waitForFunction: Timeout 30000ms exceeded.`

Because the hosted page did not reach an authenticated Safety runtime in this automation context, in-browser SPFx token acquisition could not be completed in this run.

## F) Token Classification Contract (Implemented)

The hosted proof seam now enforces machine-checkable, safe classification outputs:

1. audience match (`aud === apiAudience`)
2. validity window (`nbf` satisfied and `exp` not expired)
3. delegated/user shape (`idtyp` + user-hint claims)
4. non-admin role set (no `Admin` / `HBIntelAdmin`)
5. readiness expected outcome (`403`)

No raw JWT is persisted in markdown or proof artifacts.

## G) Closure Outcome Matrix

### Full closure criteria (not met in this run)

All required:
1. hosted/browser SPFx token acquisition executes successfully
2. token classification passes (audience, validity, delegated shape, non-admin)
3. browser-originated `/api/health/ready` returns `403`
4. proof artifacts captured

### Partial closure status (met)

- Backend/verification framework now supports strict non-admin proof.
- Hosted-browser execution in this environment is blocked (browser runtime unavailable).

Required explicit statement:

- **backend authz proof framework closed**
- **frontend/browser hosted-path live proof remains open**
- blocker class: **browser execution environment/tooling dependency**

## H) Artifact Paths

- `/tmp/safety-e2e-evidence/healthready-parity/context-refresh-nonadmin.out.json`
- `/tmp/safety-e2e-evidence/healthready-parity/safety-site.json`
- `/tmp/safety-e2e-evidence/healthready-parity/safety-pages.json`
- `/tmp/safety-e2e-evidence/healthready-parity/nonadmin/brave-proof-run.meta.json`
- `/tmp/safety-e2e-evidence/healthready-parity/nonadmin/browser-proof-error.json`

## I) Residual Gap

Remaining open item:

- Execute the hosted Safety page with the query-gated proof action under a real non-admin tenant session and capture:
  - safe token classification payload
  - `/api/health/ready` response status `403`
  - headers/body/request correlation artifacts

Until that live browser-path execution occurs, the non-admin auth-depth closure remains partial.
