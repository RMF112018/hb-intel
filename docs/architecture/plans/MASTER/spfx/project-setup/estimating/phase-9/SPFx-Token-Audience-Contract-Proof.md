# SPFx Token Audience Contract Proof

**Date:** 2026-04-01
**Scope:** JWT audience validation contract for Project Setup API

## Prior Repo Assumptions

All repo sources consistently assumed the audience value is an **Application ID URI** in `api://<client-id>` format:

| Source | Value |
|--------|-------|
| `validateToken.ts` error message | `api://<app-registration-client-id>` |
| `apiTokenProvider.ts` JSDoc | `api://<client-id>` |
| `mount.tsx` contract comment | "same app registration audience URI (api://\<client-id\>)" |
| IT-Department-Setup-Guide.md §8.2 | Application ID URI format |
| IT-Department-Setup-Guide.md §8.5 | `api://func-hb-intel-staging` |
| `local.settings.example.json` | `api://app-registration-client-id` |
| Test fixtures | `api://test-app-reg-id` |

**No source in the repo implied a different format.** The consistency is good — the gap was that no live token had been captured to prove the assumption.

## Microsoft Guidance: Audience Depends on Token Version

The `aud` claim format in Entra ID tokens is determined by the app registration's `accessTokenAcceptedVersion` manifest property:

| `accessTokenAcceptedVersion` | Token Version | `aud` Claim Format | Example |
|------------------------------|---------------|-------------------|---------|
| `null` (default) or `1` | v1.0 | Application ID URI | `api://func-hb-intel-staging` |
| `2` | v2.0 | Client ID GUID | `abc-123-def-456` |

**Key fact:** Azure portal-created app registrations default to `accessTokenAcceptedVersion: null`, which produces v1 tokens. The IT setup guide instructs admins to create the app registration via the portal with an `api://` Application ID URI. This means the default setup produces v1 tokens with `aud` = Application ID URI — matching the repo assumption.

## Final Contract Decision: Path A — Single Explicit Audience Is Correct

The current single-value `API_AUDIENCE` contract is correct and no changes to the validator logic are needed. The validator correctly:
- Requires `API_AUDIENCE` in production (no implicit fallback)
- Passes it as a single string to `jose`'s `jwtVerify()` audience option
- Accepts both v1 and v2 issuers (dual-issuer array)
- Records `ver` claim for diagnostics but does not enforce a specific version

### Environmental Assumption

The contract depends on one environmental assumption:

> **The app registration's `accessTokenAcceptedVersion` must be `null` or `1`.**

If this property were changed to `2`, Entra would issue v2 tokens with `aud` = bare client ID GUID, and the validator would correctly reject them (because `API_AUDIENCE` is set to `api://...` not the bare GUID). This is the intended fail-safe behavior — the validator enforces the documented deployment posture.

### How to Verify (Proof Mechanism)

Use `tools/inspect-token-claims.sh` to decode and inspect a real SPFx-issued token:

1. Obtain a token:
   - **Browser:** Open SharePoint → load Project Setup webpart → DevTools Network tab → find an `/api/` request → copy the Authorization header value (strip "Bearer " prefix)
   - **az CLI:** `az account get-access-token --resource api://func-hb-intel-staging`
2. Run: `./tools/inspect-token-claims.sh`
3. Paste the token when prompted
4. Verify:
   - `aud` matches `API_AUDIENCE` env var exactly
   - `ver` is `1.0` (v1 token)
   - `iss` contains the tenant ID
   - `scp` contains `access_as_user` (for delegated tokens)

The script validates the audience format and warns if the token shape doesn't match the expected contract.

## Impacted Files

| File | Change |
|------|--------|
| `tools/inspect-token-claims.sh` | New: safe JWT payload decoder for repeatable proof |
| `backend/functions/src/middleware/validateToken.ts` | Added contract assumption documentation |
| `backend/functions/src/middleware/validateToken.test.ts` | Added audience contract tests |
| `docs/how-to/.../IT-Department-Setup-Guide.md` | Updated §8.5 with proof mechanism |

## Remaining Caveats

1. **Live token not yet captured:** This audit establishes the proof mechanism and documents the contract. The actual live-token capture must be performed by an operator with access to the staging/production tenant using `tools/inspect-token-claims.sh`.

2. **Environment-specific:** The contract assumes `accessTokenAcceptedVersion` is null/1. If a different tenant or app registration uses version 2, the audience format will differ. The inspector script detects and warns about this.

3. **Multi-environment:** If staging and production use different app registrations, each must be verified independently. The `API_AUDIENCE` env var is per-environment by design.
