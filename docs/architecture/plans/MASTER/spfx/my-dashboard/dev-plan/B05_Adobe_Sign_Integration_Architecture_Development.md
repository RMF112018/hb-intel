# B05 — HB Intel My Dashboard Adobe Sign Integration Architecture, Identity Mapping, OAuth, Agreement Search, and Source Handoff Development

**Artifact status:** Batch 05 authoritative development-planning artifact  
**Prepared:** 2026-05-12  
**Target initiative:** HB Intel **My Dashboard** SPFx domain, **My Work shell**, and **Adobe Sign Action Queue** first module  
**Repo continuation anchor:** `4514a4fda765a0ac40801006374f277beddd7c5a`  
**Immediate predecessor:** `B04_My_Work_Read_Models_Routes_And_Fixtures_Development.md`  
**Binding predecessors:**  
- `B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md`
- `B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md`
- `B03_My_Work_Shell_Navigation_And_UX_Development.md`
- `B04_My_Work_Read_Models_Routes_And_Fixtures_Development.md`

**Source outline:** `HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md`  
**Batch scope:** Detailed development of plan Sections **15**, **16**, **17**, and **20** only. This is a closed-decision architecture and integration-planning artifact, not runtime implementation and not a local code-agent prompt package.

---

# Executive Verdict

## Final verdict

**Proceed with the Adobe Sign Action Queue as a backend-mediated, authenticated-user, delegated-OAuth integration that resolves the current HB actor from validated Entra claims, binds Adobe authorization to that actor through a backend-only grant record, queries Adobe through a bounded `POST v6/search` contract, and exposes source handoff only through validated backend-supplied URLs.**

Batch 05 closes the integration architecture as follows:

1. **The live Adobe authentication baseline is delegated Adobe OAuth, not a shared account token and not backend service impersonation.**  
   The product promise is “agreements requiring **my** action.” That promise is not defensible if the backend reads a shared Adobe principal or an admin-authorized account-wide queue. Adobe’s current migration guidance recommends end users authenticate directly with Adobe for unique access tokens, and Adobe’s `self` scope modifier exists precisely for authorizing actions on behalf of the authorizing user. [A1] [A2] [A9]

2. **The Acrobat Sign app posture should be `CUSTOMER` for this HB internal deployment, unless HB later decides to commercialize or multi-tenant the integration.**  
   Adobe defines `CUSTOMER` apps as apps that access the organization’s own Acrobat Sign account or support internal use/testing. `PARTNER` is for apps accessing other Acrobat Sign accounts and requires certification for full access. My Dashboard is an internal HB feature, so Batch 05 locks the `CUSTOMER` posture as the implementation baseline. [A1]

3. **The actor-to-Adobe principal contract must be keyed by stable Entra identity, not by mutable username/email claims.**  
   Live repo truth exposes `claims.oid` and normalized `claims.upn` through `IValidatedClaims`; it does not expose a separate validated `email` field. Microsoft recommends using immutable identifiers such as `tid` + `oid` for application data and warns against using `email`, `preferred_username`, or `unique_name` for authorization decisions. Because the current backend validates a single configured tenant but does not surface `tid`, Batch 05 recommends either:
   - storing the grant key as `{ configuredTenantId, claims.oid }`, or
   - explicitly extending `IValidatedClaims` to surface `tid` before implementation if future multi-tenant/guest posture is anticipated.  
   `claims.upn` remains useful for display, diagnostics, and consent UI copy only. [MS1] [MS2] [R9]

4. **The `/my-work/me/...` routes must reject app-only identities for Adobe queue retrieval.**  
   The current token validator supports app-only tokens in the broader backend. That is appropriate for some system integrations, but the Adobe queue’s promise is actor-specific and requires a delegated user identity. A My Work Adobe provider must treat `idtyp === 'app'` or missing delegated-user identity as `principal-unresolved` or an equivalent contract-safe non-ready state, not as a basis for querying Adobe. [R9]

5. **Adobe principal resolution should be grant-record based, not ad hoc email matching.**  
   A successful Adobe OAuth callback should create or update a backend-only authorization record keyed to the stable HB actor key and carrying the Adobe access-point context plus encrypted refresh token metadata. Runtime queue reads resolve:
   - authenticated HB actor,
   - actor’s Adobe OAuth grant record,
   - token refreshability,
   - Adobe search readiness.  
   The provider must not search Adobe accounts by UPN/email as a fallback and must never substitute a shared principal when a grant is missing. [A2] [A3] [MS2]

6. **The OAuth implementation boundary is now explicit.**  
   The architecture must support:
   - authorization initiation,
   - redirect/callback validation,
   - code exchange,
   - grant persistence,
   - refresh-token rotation/update,
   - revocation/reauthorization handling,
   - source-state mapping.  
   If the Adobe app registration, OAuth redirect URI, and secure token store are unavailable when implementation begins, the route/read-model/module states may still ship in fixture/configuration mode, but the production-live provider must remain gated until those dependencies are satisfied. [A1] [A2] [A7]

7. **Token storage is backend-only and must be treated as credential storage.**  
   Adobe access tokens expire in one hour; Adobe refresh tokens expire after 60 days of inactivity and can remain usable if refreshed within that inactivity window. Microsoft also classifies access tokens as sensitive credentials and states refresh tokens should be stored safely like access tokens or application credentials. Batch 05 therefore requires:
   - no Adobe token storage in SPFx,
   - no token logging,
   - encrypted refresh-token persistence in a server-side store,
   - transient access-token caching only in backend memory/cache where appropriate,
   - refresh failure mapping to `authorization-required`. [A2] [MS3] [MS4]

8. **The Adobe Action Queue query contract should use `POST v6/search` as the primary live retrieval endpoint.**  
   Adobe distinguishes:
   - `GET v6/agreements` for paginated agreement listing with limited filtering, and
   - `POST v6/search` for advanced criteria, including ownership, role, status, participant email, date filters, and sorting.  
   The queue requires actor-relevant action filtering, so `POST v6/search` is the correct baseline. Broad list retrieval followed by local filtering is inferior and should not be the MVP architecture. [A4]

9. **The queue status filter remains the six-status MVP union already locked by Batch 04.**  
   The live Adobe query must target:
   - `WAITING_FOR_MY_SIGNATURE`
   - `WAITING_FOR_MY_APPROVAL`
   - `WAITING_FOR_MY_ACCEPTANCE`
   - `WAITING_FOR_MY_ACKNOWLEDGEMENT`
   - `WAITING_FOR_MY_FORM_FILLING`
   - `WAITING_FOR_MY_DELEGATION`  
   Adobe documents other statuses such as `WAITING_FOR_MY_VERIFICATION` and `WAITING_FOR_PREFILL`, but they are not part of the current B04 My Work action queue contract and must not be silently added in Batch 05. [A5] [R5]

10. **The source handoff contract must prohibit guessed or SPFx-synthesized row URLs.**  
    Adobe’s `GET /agreements/{agreementId}/signingUrls` endpoint returns signing URLs useful for hosted/in-person signing scenarios and current best-practice guidance associates it with a write-oriented signing workflow and timing constraints. It is not a general-purpose, durable queue-row “open my agreement” URL. Therefore:
    - the MVP DTO may retain optional `sourceOpenUrl`,
    - a row CTA may render only when the backend returns a validated URL,
    - guessed Acrobat Sign portal URLs are prohibited,
    - source URL validation must follow HB’s existing allow/deny URL policy posture,
    - a general module-level “Open Adobe Sign” launch may be acceptable when derived from Adobe’s returned `web_access_point` plus a vetted product route. [A6] [A7] [R4]

11. **The integration dependency checklist is now closed.**  
    A production-live implementation requires:
    - Acrobat Sign `CUSTOMER` application registration,
    - OAuth client ID and client secret in backend secret management,
    - approved redirect URI,
    - authorization initiation/callback public route pair,
    - `agreement_read:self` as the core queue-read scope,
    - optional additional Adobe scopes only if specifically required by a future verified onboarding/identity path,
    - secure grant/token store,
    - configured HB backend API auth already locked in Batch 02,
    - sandbox/test Adobe account posture before production enablement. [A1] [A2] [A4] [R2]

---

# 1. Governing Predecessor Decisions Carried Forward

## 1.1 Batch 01 decisions inherited

| Decision area | Binding carry-forward |
|---|---|
| Product boundary | My Dashboard is a **standalone SPFx app/domain**, not a PCC extension. |
| User context | My Dashboard is **authenticated-user contextual**, not project-contextual. |
| Adobe module identity | `adobe-sign-action-queue` remains distinct from PCC’s project-contextual `adobe-sign`. |
| Existing My Work architecture | My Dashboard must not create a competing personal-work primitive beside `@hbc/my-work-feed`. |
| Integration posture | Backend-mediated external-system access; direct Adobe calls from SPFx prohibited. |

## 1.2 Batch 02 decisions inherited

| Decision area | Binding carry-forward |
|---|---|
| Host page | `https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard/SitePages/Home.aspx` |
| Protected API posture | SPFx API token provider + backend `withAuth()` enforcement. |
| Browser configuration | No Adobe secrets, token data, or live integration authority in the property pane. |
| Runtime transport | `production/ui-review` app posture with `backend/fixture` read-model transport. |
| Deployment dependency | SharePoint API permission approval remains required for live protected route validation. |

## 1.3 Batch 03 decisions inherited

| Decision area | Binding carry-forward |
|---|---|
| Shell states | `home` and `focused-module` only. |
| Module focus | Adobe queue renders inside the active My Work shell panel; no new page-routing model. |
| Source-state UX | Adobe non-ready states render intentionally rather than disappearing. |
| Shell/module ownership | Module owns queue behavior, row rendering, and source-specific CTA visibility. |

## 1.4 Batch 04 decisions inherited

| Decision area | Binding carry-forward |
|---|---|
| Route family | `GET /api/my-work/me/home` and `GET /api/my-work/me/adobe-sign/action-queue`. |
| Envelope states | `available`, `partial`, `configuration-required`, `authorization-required`, `principal-unresolved`, `source-unavailable`, `backend-unavailable`. |
| Exact Adobe queue status union | Six actionable current-user statuses only. |
| No actor override | No user email, user ID, or cross-user query/path override. |
| Optional source URL seam | `sourceOpenUrl` is nullable/optional and may be omitted safely. |
| Query pagination | `pageSize` and `cursor` are the only approved query controls at the My Work route boundary. |

## 1.5 Batch 05 refinements that supersede outline-level draft suggestions

| Older outline posture | Batch 05 final decision |
|---|---|
| Claim precedence suggested `preferred_username`, then `upn`, then `email` | **Corrected:** use stable Entra actor key from `oid` plus configured tenant context for authorization/grant lookup. Current repo surface exposes normalized `upn` for display/diagnostics but not a separate validated `email` field. |
| Possible shared-principal fallback remained implicit | **Prohibited:** no shared Adobe principal, no admin impersonation, no cross-user fallback for queue reads. |
| OAuth live-provider boundary was not fully closed | **Closed:** delegated Adobe OAuth authorization-code flow, backend-only token persistence, grant record keyed to HB actor, refresh/revoke/reauthorize lifecycle. |
| Queue retrieval strategy was directionally described | **Closed:** primary live retrieval endpoint is `POST v6/search`. |
| Source CTA language implied row-level source links might be generically available | **Closed:** row CTA renders only from backend-supplied validated URL; no guessed URL construction in SPFx. |

---

# 2. Audit and Research Method

## 2.1 Batch 05 objective

This Batch 05 audit was designed to answer eleven implementation-grade architecture questions:

1. What exact HB-authenticated actor identity is available in current backend repo truth?
2. What stable actor key should bind an HB user to an Adobe authorization record?
3. What Adobe OAuth model supports “my Adobe action queue” without weakening source authority?
4. What OAuth app domain posture fits an internal HB deployment?
5. What scopes are minimally required for queue reads?
6. What token lifecycle and storage posture is required for a real delegated Adobe provider?
7. Which backend architecture seams should be reused from repo patterns, and which are genuinely new?
8. Which Acrobat Sign endpoint is most appropriate for queue retrieval?
9. Which Adobe statuses belong in the MVP queue, and which do not?
10. What source-open/deep-link behavior is safe and truthful?
11. What dependencies and downstream risks must later implementation/security/testing batches inherit?

## 2.2 Authority hierarchy

The audit used this order of authority:

1. **Live repository truth at commit `4514a4fda765a0ac40801006374f277beddd7c5a`**
2. **Committed My Dashboard Batch 01–04 artifacts**
3. **The current umbrella outline**
4. **Current official Adobe Acrobat Sign developer documentation**
5. **Current official Microsoft Entra / identity platform documentation**
6. **Inference where necessary, clearly labeled as implementation guidance rather than sourced fact**

## 2.3 Repo audit lanes

### Lane A — External-system and source-governance precedents
Inspected:
- PCC External Systems Launch Pad read-model/view-model contracts
- PCC external URL policy helper
- Procore source-state/sync-health doctrine
- External launch-link/read-only source-handoff posture

### Lane B — Existing backend external-service patterns
Inspected:
- Foleon backend service implementation
- Foleon security/auth planning artifact where relevant
- managed identity/token usage patterns
- backend configuration and “safe config” posture

### Lane C — Authenticated actor claims and route protection
Inspected:
- `backend/functions/src/middleware/auth.ts`
- `backend/functions/src/middleware/validateToken.ts`
- the current `IValidatedClaims` contract and app-only/delegated detection logic

### Lane D — My Dashboard predecessor decisions
Inspected:
- B01 foundation/scope artifact
- B02 hosting/auth/runtime artifact
- B03 shell/UX artifact
- B04 read models/routes/error taxonomy/fixtures artifact
- umbrella outline section labels and older draft assumptions

### Lane E — Current official Adobe and Microsoft research
Confirmed:
- Acrobat Sign `CUSTOMER` vs. `PARTNER` app types
- OAuth redirect/code/token/refresh posture
- self/group/account modifier implications
- access-point and shard/base-URI handling
- `POST v6/search` vs. `GET v6/agreements`
- queue status semantics
- signing URL limits and purpose
- throttling and retry expectations
- Microsoft stable identity claim guidance
- token/refresh token credential treatment

---

# 3. Files and Documents Inspected

## 3.1 My Dashboard governing artifacts

| Path | Batch 05 use |
|---|---|
| `docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md` | Product boundary, Adobe module distinction, My Work non-duplication guardrail |
| `docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md` | SPFx protected API posture and runtime/config boundaries |
| `docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B03_My_Work_Shell_Navigation_And_UX_Development.md` | Shell/module state ownership and source-state UX posture |
| `docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B04_My_Work_Read_Models_Routes_And_Fixtures_Development.md` | Locked route/envelope/query/status/source-handoff DTO decisions |
| `docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md` | Umbrella section mapping and older draft assumptions corrected by Batch 05 |

## 3.2 Backend auth and identity files

| Path | Batch 05 use |
|---|---|
| `backend/functions/src/middleware/auth.ts` | `withAuth()` posture and `AuthContext` |
| `backend/functions/src/middleware/validateToken.ts` | `IValidatedClaims`, `oid`, normalized `upn`, app-only detection, bearer-token validation |

## 3.3 PCC external-system/source-governance references

| Path | Batch 05 use |
|---|---|
| `apps/project-control-center/src/surfaces/externalSystems/launchPadViewModel.ts` | External-source UI/view-model boundary and launch-policy posture |
| `packages/models/src/pcc/ExternalSystemsLaunchPad.ts` | Registry/source-health/degraded-state vocabulary, reference-only/no-write posture |
| `packages/models/src/pcc/ExternalSystemsUrlPolicy.ts` | Allow/deny URL validation rules and credential-like query-parameter blocking |
| `packages/models/src/pcc/PccProcoreDataLayer.ts` | Source-state mapping, sync health, redacted provider-error posture, no write-back doctrine |

## 3.4 Backend external-service pattern references

| Path | Batch 05 use |
|---|---|
| `backend/functions/src/services/foleon-service.ts` | Backend-only external service config, OAuth/client credentials flow example, error normalization, safe config posture |
| `docs/architecture/plans/MASTER/spfx/foleon-manage/dev-plan/06-security-auth-and-permissions.md` | Supporting security/auth planning precedent where applicable |

## 3.5 Search results with negative findings

| Search lane | Finding |
|---|---|
| Delegated-user OAuth callback/token store in current backend | **No exact reusable implementation located** |
| Refresh-token persistence abstraction | **No direct production-ready pattern located** |
| Generic authenticated-actor normalization helper | **No dedicated helper located beyond current claims validation contract** |

These negative findings matter. Batch 05 should not imply the delegated Adobe OAuth provider can be implemented by copy/paste from an existing module. The architecture is aligned with repo patterns, but the grant store and OAuth callback/token lifecycle require new backend implementation.

---

# 4. Repo-Truth Findings

## 4.1 Repo truth supports backend-mediated source integration, not browser-owned third-party tokens

B02 already prohibits Adobe secrets and tokens in SPFx config/property panes. The backend auth middleware validates HB bearer tokens server-side and passes validated claims to protected route handlers. This leaves the browser responsible only for acquiring an HB backend bearer token, not for directly holding Adobe refresh tokens or calling Adobe APIs. [R2] [R8] [R9]

**Batch 05 decision:**  
The Adobe Sign integration remains backend-mediated. Adobe OAuth grant records, refresh tokens, access-point context, and search requests belong strictly behind `backend/functions`.

## 4.2 Repo truth exposes `oid` and normalized `upn`; it does not expose a separate validated `email` field

`validateToken.ts` currently returns:

```ts
export interface IValidatedClaims {
  upn: string;
  oid: string;
  roles: string[];
  displayName?: string;
  jobTitle?: string;
  tokenVersion?: string;
  scp?: string;
  idtyp?: string;
}
```

The validator resolves:

```ts
const upn = (claims.upn ?? claims.preferred_username) ?? '';
```

and treats app-only tokens separately when `idtyp === 'app'` or when user identity fields are absent. [R9]

**Batch 05 decision:**  
The principal-resolution contract must align to the **actual repo claims surface**:
- stable grant lookup key: configured tenant identity + `claims.oid`,
- display/diagnostic identity: `claims.upn`, `displayName`,
- delegated-user guard: reject/apply non-ready state for `idtyp === 'app'`.

The old outline claim priority chain must not survive unchanged.

## 4.3 No general actor-normalization helper currently exists

The audit did not locate a generic shared helper that turns backend `AuthContext` into a stable application actor record. `validateToken.ts` performs token-level normalization, but the Adobe integration still needs a domain-specific adapter that converts validated claims into an `AuthenticatedMyWorkActor` contract.

**Batch 05 decision:**  
Introduce an Adobe/My Work actor-normalization helper inside the My Work backend integration boundary rather than inventing ad hoc identity logic in multiple route handlers.

## 4.4 PCC URL policy is a direct source-handoff precedent

`ExternalSystemsUrlPolicy.ts` establishes a reusable posture:
- `https` only,
- local/private hosts blocked,
- credential-like query parameter names blocked,
- per-system or per-link-type host policy support,
- no throwing on malformed input,
- structured reason codes. [R4]

**Batch 05 decision:**  
Every Adobe-provided `sourceOpenUrl` or general launch URL must be evaluated through a My Work adaptation of this policy or a deliberately shared helper. The provider must not pass raw URLs straight into the SPFx DTO.

## 4.5 PCC external-system contracts prove that “source available” and “launchable” are separate decisions

PCC External Systems Launch Pad separately models:
- system presence/read posture,
- source health,
- mapping states,
- URL policy states,
- launch availability,
- disabled-reason copy. [R3] [R4]

**Batch 05 decision:**  
Adobe queue rows can be valid work items even when no row-level CTA is safe. The read model should preserve:
- work-item availability,
- handoff URL availability,
- source-health state,
as separate concerns.

## 4.6 Foleon provides a backend-service pattern, but not the delegated-user OAuth pattern required here

`foleon-service.ts` demonstrates:
- backend-only configuration reads,
- OAuth token acquisition in a service layer,
- safe config reporting,
- normalized errors,
- operational run/status records,
- no token leakage to frontend. [R7]

However, Foleon uses a backend application/client-credentials style pattern; it is not a one-to-one precedent for delegated Adobe end-user grants.

**Batch 05 decision:**  
Reuse the **service-layer discipline**, not the exact auth model:
- backend service abstraction,
- configuration checker,
- normalized service errors,
- no secret leakage,
- testable mock/live provider seams.

The Adobe provider still requires new:
- OAuth authorization initiation,
- callback validation,
- per-user grant storage,
- refresh-token lifecycle handling.

## 4.7 Procore source-state doctrine is a useful degraded-state precedent

`PccProcoreDataLayer.ts` includes:
- explicit source states,
- safe mapping to read-model source statuses,
- redaction of provider error strings,
- clear no-write-back posture. [R5]

**Batch 05 decision:**  
Adobe provider failures must map into My Work’s already-locked source states and warnings rather than leaking raw provider strings or inventing route-specific ad hoc error semantics.

---

# 5. Official Adobe and Microsoft Research Findings

## 5.1 Source register

### Adobe sources
| ID | Source |
|---|---|
| **A1** | Adobe Acrobat Sign Developer Guide — *Create an Application Quickstart* |
| **A2** | Adobe Acrobat Sign Developer Guide — *Managing OAuth Tokens* |
| **A3** | Adobe Acrobat Sign Developer Guide — *Hello World App / Getting the Access Token* |
| **A4** | Adobe Acrobat Sign Developer Guide — *API Best Practices: Retrieving List of Agreements and Details* |
| **A5** | Adobe Acrobat Sign Developer — *API Agreement Statuses, Recipient Statuses, Agreement Events, and Webhook Events* |
| **A6** | Adobe Acrobat Sign Developer Guide — *API Usage: Get the Signing URL* |
| **A7** | Adobe Acrobat Sign Developer Guide — *API Best Practices: Signing URL / Base URI / Retry* |
| **A8** | Adobe Acrobat Sign Developer Guide — *API Usage: API Throttling* |
| **A9** | Adobe Acrobat Sign Developer Guide — *Migrating and Updating Apps: Updating API Authentication Methods* |

### Microsoft sources
| ID | Source |
|---|---|
| **MS1** | Microsoft Learn — *ID token claims reference* |
| **MS2** | Microsoft Learn — *Secure applications and APIs by validating claims* |
| **MS3** | Microsoft Learn — *Access tokens in the Microsoft identity platform* |
| **MS4** | Microsoft Learn — *Refresh tokens in the Microsoft identity platform* |

### Repo references
| ID | Source |
|---|---|
| **R1** | B01 My Dashboard Foundation Scope and Repo-Truth artifact |
| **R2** | B02 My Dashboard Hosting, Packaging, Auth, and Runtime artifact |
| **R3** | PCC External Systems Launch Pad view-model and models |
| **R4** | PCC External Systems URL Policy helper |
| **R5** | PCC Procore Data Layer models |
| **R6** | B04 My Work Read Models, Routes, and Fixtures artifact |
| **R7** | Foleon backend service |
| **R8** | backend `auth.ts` |
| **R9** | backend `validateToken.ts` |

## 5.2 Adobe app domain posture: `CUSTOMER` is correct for internal HB deployment

Adobe defines:
- `CUSTOMER` apps for apps that access the organization’s own account or are used for internal use/testing,
- `PARTNER` apps for apps that access other Acrobat Sign accounts,
- partner apps require certification to gain full cross-account access. [A1]

**Batch 05 conclusion:**  
My Dashboard’s Adobe Sign integration is an internal HB feature and should be designed as a **CUSTOMER** Acrobat Sign app unless the product scope later changes materially.

## 5.3 Adobe OAuth should be user-consented and delegated

Adobe’s current migration guidance states that the recommended secure model is REST APIs plus OAuth, and that end users should directly authenticate with Adobe so unique access tokens are issued for each user. [A9]

Adobe’s scope modifiers also matter:
- `self` = act on behalf of the authorizing user,
- `group` = act on behalf of users in the same group, requiring group admin approval,
- `account` = act on behalf of users in the account, requiring account admin approval. [A1]

**Batch 05 conclusion:**  
The MVP queue must use a **self-scoped delegated** model because:
- it is the least-privilege posture consistent with “my queue,”
- it avoids admin/group impersonation semantics,
- it avoids product drift into manager/proxy queue behavior already out of scope.

## 5.4 Adobe OAuth callback returns access-point context that must be stored

Adobe documents that the OAuth redirect returns:
- `code`,
- `api_access_point`,
- `state`,
- `web_access_point`. [A1]

The access-token response also includes:
- `access_token`,
- `refresh_token`,
- `expires_in`,
- `api_access_point`,
- `web_access_point`. [A3]

Adobe further documents that Acrobat Sign is multi-sharded and that API requests must use the correct access point. If an API returns `INVALID_API_ACCESS_POINT`, the integration should re-resolve base URI/access point rather than hardcoding a single region. [A7]

**Batch 05 conclusion:**  
The Adobe grant record must store:
- API access point,
- web access point,
- refresh-token metadata,
- granted scopes,
- timestamps needed for lifecycle monitoring.

## 5.5 Adobe refresh-token lifecycle is a production dependency, not an implementation detail

Adobe states:
- access tokens expire in one hour,
- refresh tokens expire after 60 days of inactivity,
- refresh-token use resets the inactivity expiration,
- slow/no activity may justify a periodic refresh job. [A2]

**Batch 05 conclusion:**  
At minimum:
- queue reads refresh on demand when needed,
- refresh failure maps to `authorization-required`,
- the security/resilience batch must decide whether a periodic token-keepalive job is justified or whether explicit reauthorization after inactivity is acceptable for HB’s expected usage pattern.

## 5.6 Agreement queue retrieval should use `POST v6/search`

Adobe’s best practices distinguish:
- `GET v6/agreements` for paginated agreement listing with limited filtering,
- `POST v6/search` for advanced filtering by criteria including status, role, ownership, dates, participant email, and sorting. [A4]

Adobe’s best practices explicitly recommend using `POST v6/search` when clients need filtered agreement results rather than retrieving lists and filtering downstream. [A4]

**Batch 05 conclusion:**  
`POST v6/search` is the live queue retrieval contract.

## 5.7 The six B04 statuses are strongly supported, and extra Adobe statuses should remain out of MVP

Adobe documents current-user action statuses including:
- `WAITING_FOR_MY_SIGNATURE`
- `WAITING_FOR_MY_APPROVAL`
- `WAITING_FOR_MY_ACKNOWLEDGEMENT`
- `WAITING_FOR_MY_ACCEPTANCE`
- `WAITING_FOR_MY_FORM_FILLING`
- `WAITING_FOR_MY_DELEGATION`
as well as statuses not in B04 such as `WAITING_FOR_MY_VERIFICATION` and `WAITING_FOR_PREFILL`. [A5]

**Batch 05 conclusion:**  
Batch 05 preserves the six-status B04 contract. Adding verification/prefill later requires:
- product decision,
- DTO revision,
- UX copy review,
- updated fixtures/tests.

## 5.8 Signing URLs are not a safe default row-level source handoff for this queue

Adobe documents `GET /agreements/{agreementId}/signingUrls` as useful for hosted signing / in-person signing scenarios. It returns signer-specific signing URLs, and Adobe warns that invoking it before agreement processing completes may return `DOCUMENT_NOT_YET_AVAILABLE`; Adobe best practices recommend waiting for readiness and polling status carefully in that flow. [A6] [A7]

**Batch 05 conclusion:**  
The Adobe Action Queue should not treat signing URLs as generic “Open Agreement” URLs for queue rows. Using them would:
- create a workflow mismatch,
- expand scope toward direct signing orchestration,
- likely require broader scopes and additional timing logic,
- undermine the queue’s simpler “surface and hand off to source” premise.

## 5.9 Rate limiting and retry behavior must be honored

Adobe states that Acrobat Sign APIs enforce throttling limits and may return HTTP `429` with a `Retry-After` header. Current guidance says clients should pause invocation until the wait time has elapsed. [A7] [A8]

**Batch 05 conclusion:**  
The provider must:
- honor `Retry-After`,
- avoid hammering Adobe from repeated card refreshes,
- use the My Work source-state taxonomy for throttled/degraded results,
- not hide throttling behind false “empty queue” responses.

## 5.10 Microsoft stable-identity guidance materially changes principal mapping

Microsoft states:
- `oid` is an immutable identifier for the user/object,
- `tid` + `oid` are suitable combined keys for application data,
- `email`, `preferred_username`, and `unique_name` should not be used for access-control decisions because they are mutable or not guaranteed unique. [MS1] [MS2]

**Batch 05 conclusion:**  
The Adobe grant binding must use stable Entra identity, not email-style identifiers. This is both better security design and better alignment with current repo truth.

---

# 6. Fully Developed Section 15 — Authenticated Actor → Adobe Principal Resolution Contract

## 15.1 Objective

Section 15 defines how the protected HB backend route resolves:

```text
validated Entra-authenticated actor
        ↓
stable HB actor key
        ↓
Adobe OAuth grant record
        ↓
Adobe provider context for "my action queue"
```

This contract exists to prevent four failure modes:

1. **False personalization:** showing a queue that belongs to a shared/admin Adobe principal.
2. **Weak principal matching:** using mutable UPN/email values as authorization keys.
3. **Cross-user leakage:** allowing a request or query parameter to override the actor.
4. **Silent degradation:** treating missing authorization or mismatched principal state as a blank queue.

## 15.2 Final actor-resolution rule

### Closed decision

**The Adobe principal-resolution contract must begin with the validated backend `AuthContext` and must use stable Entra identity for grant lookup.**

### Required input

```ts
interface AuthenticatedMyWorkActorInput {
  readonly claims: IValidatedClaims;
  readonly validatedTenantId: string; // server/config-derived unless tid is added to IValidatedClaims
}
```

### Required gate

```ts
function assertDelegatedMyWorkActor(input: AuthenticatedMyWorkActorInput): DelegatedMyWorkActorResolution;
```

This gate must reject or return a non-ready result for:
- app-only tokens,
- missing `oid`,
- missing usable delegated user identity,
- backend auth configuration faults.

## 15.3 Final actor key

### Recommended implementation contract

```ts
interface MyWorkActorKey {
  readonly tenantId: string;
  readonly entraObjectId: string; // claims.oid
}
```

### Closed lookup rule

```text
AdobeGrantLookupKey = tenantId + ":" + entraObjectId
```

### Current repo alignment

- `claims.oid` exists today.
- `tid` is not presently exposed in `IValidatedClaims`.
- The validator already enforces a configured tenant for accepted JWTs.
- Therefore, the immediate implementation may derive `tenantId` from trusted backend configuration.
- If future work anticipates multi-tenant or guest authorization variation, extend `IValidatedClaims` to expose validated `tid` before building the persistence schema. [R9] [MS2]

## 15.4 Display identity vs. authorization identity

| Field | Allowed purpose | Prohibited purpose |
|---|---|---|
| `claims.oid` | Stable grant lookup; persistent authorization mapping | User-facing copy without friendly label |
| Configured tenant ID / validated `tid` | Compound identity key | Display copy |
| `claims.upn` | Display, audit summary, diagnostics, reauthorization copy | Authorization key, token store primary key, source-principal substitution |
| `displayName` | User-facing display only | Authorization |
| Email-like values from Adobe or Entra | Informational cross-check where provided | Sole basis for grant lookup |

## 15.5 Final actor-normalization contract

```ts
export interface MyWorkAuthenticatedActor {
  readonly actorKey: {
    readonly tenantId: string;
    readonly entraObjectId: string;
  };
  readonly delegated: true;
  readonly upn: string;
  readonly displayName?: string;
  readonly tokenVersion?: string;
  readonly scopes?: readonly string[];
}
```

### Normalization rules

1. Trim `upn`.
2. Preserve canonical `oid` exactly as validated.
3. Do not rewrite `oid`.
4. Lowercase UPN only for comparison/display normalization where product copy does not require original case.
5. Do not parse email domain to authorize or deny unless a later HB policy explicitly adds such a gate.
6. Do not infer Adobe identity from UPN alone.

## 15.6 Final principal-resolution interface

```ts
export interface IAdobeSignPrincipalResolver {
  resolveForActor(
    actor: MyWorkAuthenticatedActor,
  ): Promise<AdobeSignPrincipalResolution>;
}
```

## 15.7 Final principal-resolution outcomes

```ts
export type AdobeSignPrincipalResolution =
  | {
      readonly status: 'resolved';
      readonly actor: MyWorkAuthenticatedActor;
      readonly grant: AdobeSignDelegatedGrantRecord;
      readonly providerContext: AdobeSignProviderContext;
    }
  | {
      readonly status: 'authorization-required';
      readonly actor: MyWorkAuthenticatedActor;
      readonly reason:
        | 'no-grant-record'
        | 'refresh-token-expired'
        | 'refresh-token-revoked'
        | 'reauthorization-required';
    }
  | {
      readonly status: 'principal-unresolved';
      readonly reason:
        | 'app-only-token-not-eligible'
        | 'missing-delegated-actor'
        | 'missing-stable-actor-key'
        | 'grant-record-ambiguous'
        | 'actor-grant-mismatch';
    }
  | {
      readonly status: 'configuration-required';
      readonly reason:
        | 'adobe-oauth-client-not-configured'
        | 'adobe-token-store-not-configured'
        | 'adobe-redirect-uri-not-configured';
    }
  | {
      readonly status: 'source-unavailable';
      readonly reason:
        | 'grant-store-read-failed'
        | 'token-refresh-source-unavailable'
        | 'adobe-access-point-resolution-failed';
    };
```

## 15.8 Grant-record binding contract

### Required persistence shape

```ts
export interface AdobeSignDelegatedGrantRecord {
  readonly grantId: string;
  readonly actorTenantId: string;
  readonly actorEntraObjectId: string;
  readonly actorUpnSnapshot?: string;
  readonly actorDisplayNameSnapshot?: string;

  readonly adobeApiAccessPoint: string;
  readonly adobeWebAccessPoint: string;

  readonly encryptedRefreshToken: string;
  readonly refreshTokenStoredAtUtc: string;
  readonly refreshTokenLastUsedAtUtc?: string;
  readonly refreshTokenExpectedInactiveExpiryAtUtc?: string;

  readonly grantedScopes: readonly string[];
  readonly authorizationCompletedAtUtc: string;
  readonly authorizationLastValidatedAtUtc?: string;

  readonly state: 'active' | 'reauthorization-required' | 'revoked' | 'disabled';
  readonly lastFailureCode?: string;
  readonly lastFailureAtUtc?: string;
}
```

### Strong recommendation

The persistence layer should enforce a uniqueness constraint on:

```text
(actorTenantId, actorEntraObjectId)
```

unless the architecture deliberately supports multiple independent Adobe account grants per HB actor. That is **not** part of MVP and should be prohibited by default.

## 15.9 Principal-resolution execution flow

```text
1. Protected My Work route enters with AuthContext.
2. Actor normalizer validates delegated user posture.
3. Actor key is built from trusted tenant context + claims.oid.
4. Adobe grant store is queried by actor key.
5. If no grant exists:
      → authorization-required
6. If grant is disabled/revoked/reauthorization-required:
      → authorization-required
7. If grant exists and token metadata is usable:
      → resolved grant/provider context
8. If grant store or refresh/token preparation fails at infrastructure layer:
      → source-unavailable or configuration-required, depending on root cause
```

## 15.10 Prohibited fallback behaviors

The implementation must not:
- accept `?userEmail=` or `?adobeUser=` route parameters,
- search a generic grant store by raw UPN when stable actor key lookup fails,
- use a shared service principal to “fill in” a missing user grant,
- silently return an empty queue when grant resolution fails,
- disclose another principal’s Adobe grant state to the current actor.

## 15.11 Mapping to B04 envelope statuses

| Principal-resolution outcome | B04 `sourceStatus` |
|---|---|
| `resolved` and search succeeds | `available` or `partial` |
| `authorization-required` | `authorization-required` |
| `principal-unresolved` | `principal-unresolved` |
| `configuration-required` | `configuration-required` |
| Provider infrastructure unavailable | `source-unavailable` |

---

# 7. Fully Developed Section 16 — Adobe Authentication Architecture Gate

## 16.1 Objective

Section 16 defines:
- the final Adobe authentication model,
- the backend-only OAuth architecture,
- what must exist before production-live queue reads are permitted,
- what can ship in fixture/configuration mode before Adobe production dependencies are ready.

## 16.2 Final live-auth posture

### Closed decision

**Use Acrobat Sign delegated OAuth authorization-code flow for the authorizing HB user, implemented entirely through backend-controlled initiation/callback/token services.**

### Why this is final

| Candidate auth posture | Verdict | Reason |
|---|---|---|
| Delegated OAuth, self-scoped | **Approved baseline** | Matches “my queue,” aligns with Adobe guidance, least privilege |
| Shared Adobe account token | **Rejected** | Breaks user-specific semantics and source accountability |
| Account/group impersonation | **Rejected for MVP** | Expands scope beyond personal queue; requires elevated admin semantics |
| SPFx direct OAuth/token handling | **Rejected** | Violates backend-mediated external-system posture |
| Service-to-service or app-only Adobe principal | **Rejected for queue reads** | Cannot truthfully represent the authenticated employee’s required actions |

## 16.3 Final Acrobat Sign application domain

### Closed decision

```text
Adobe Acrobat Sign app domain: CUSTOMER
```

### Rationale

The integration is:
- internal to HB,
- intended for HB’s own Acrobat Sign environment,
- not a cross-customer commercial integration. [A1]

### Future amendment only

Switching to `PARTNER` would require a separate product/governance decision, Adobe certification implications, revised tenant/account onboarding, and a different operating model. It is not an implementation discretion item.

## 16.4 OAuth scopes

### Core MVP scope

```text
agreement_read:self
```

Adobe states `agreement_read` is required to retrieve agreements for the user, and the `self` modifier limits the action to the authorizing user. [A1] [A4]

### Explicit scope rule

**Do not request broader `:group` or `:account` agreement-read scope for MVP.**

### Additional scopes

Batch 05 does **not** approve additional Adobe scopes by default. If the implementation later needs an Adobe user-profile read to display or verify Adobe-side account metadata, that scope must be:
- explicitly researched against the API endpoint selected,
- added to the dependency checklist,
- justified as necessary,
- isolated from the queue-read permission.

The queue search itself should be planned around `agreement_read:self`.

## 16.5 OAuth initiation contract

### Recommended backend route family

The live implementation should provide a backend-controlled route pair such as:

```http
POST /api/my-work/me/adobe-sign/authorization/start
GET  /api/my-work/adobe-sign/oauth/callback
```

The exact path naming can be finalized during implementation prompt generation, but the functional boundary is closed:
- initiation must be authenticated to the HB user,
- callback must be public enough for Adobe redirect,
- callback must validate `state`,
- callback must bind the grant to the actor who initiated it.

### Required OAuth state semantics

The `state` value must:
- be cryptographically unpredictable,
- be one-time use,
- expire,
- bind to the actor key,
- bind to the intended return flow/page,
- prevent mix-up or CSRF-style grant binding attacks.

## 16.6 OAuth callback contract

### Callback responsibilities

1. Validate `state`.
2. Confirm callback belongs to an outstanding authorization request.
3. Read `code`, `api_access_point`, and `web_access_point`.
4. Exchange the authorization code for tokens at the Adobe token endpoint.
5. Persist/rotate the Adobe grant record backend-side.
6. Mark the authorization attempt success/failure.
7. Redirect the user to a safe My Dashboard return location with a non-secret UX state indicator.
8. Never place tokens in redirect URLs, query strings, logs, or rendered browser content.

Adobe documents that the OAuth authorization code is short-lived and that the token exchange returns access token, refresh token, and access-point values. [A1] [A3]

## 16.7 Token storage and token lifecycle requirements

### Closed decision

**Refresh tokens must be persisted backend-only in an encrypted server-side store.**

### Required storage properties

| Requirement | Decision |
|---|---|
| Browser storage | Prohibited |
| SPFx state/props | Prohibited |
| Plaintext logging | Prohibited |
| Durable backend persistence | Required |
| Encryption at rest | Required |
| Key management | Must be backed by an approved HB secret-management/KMS pattern |
| Access scope | Provider/service code only; not route serializers or frontend DTOs |

### Refresh lifecycle

Adobe states:
- access token lifetime: one hour,
- refresh token inactivity expiry: 60 days,
- refresh token use extends inactivity window,
- revoke endpoint exists for token revocation. [A2]

### Required provider behavior

```text
If usable access token exists:
    use it
Else:
    refresh using encrypted refresh token
If refresh succeeds:
    update access-token cache and refresh-token lifecycle metadata
If refresh fails because token is expired/revoked/invalid:
    transition grant to reauthorization-required
    return authorization-required source state
If refresh fails because Adobe/source is unavailable:
    return source-unavailable state
```

## 16.8 Access-token caching posture

Because access tokens are short-lived and refreshing on every request is unnecessary, a backend access-token cache is acceptable. The implementation should define:
- cache key: grant ID or actor key,
- cache TTL: less than actual Adobe token expiry,
- no token persistence in frontend,
- no token echo in errors.

A durable database should persist refresh-token grants; access-token caching can remain transient where practical.

## 16.9 Adobe access-point/base URI posture

### Required stored values

```ts
adobeApiAccessPoint
adobeWebAccessPoint
```

### Required behavior

1. Persist access-point values returned by Adobe authorization/token flow.
2. Use `api_access_point` for API calls.
3. Use `web_access_point` only for validated general Adobe web handoff behavior when product-approved.
4. If Adobe responds with `INVALID_API_ACCESS_POINT`, re-resolve using the documented base-URI flow and update stored provider context. [A7]

## 16.10 Configuration gates

### Production-live provider must remain disabled until all are present

- Adobe `CUSTOMER` app created.
- OAuth client ID available to backend.
- OAuth client secret available to backend secret management.
- Redirect URI configured in Adobe and deployed backend callback matches exactly.
- Grant store provisioned.
- Refresh-token encryption strategy approved and implemented.
- My Dashboard backend protected route infrastructure from Batch 02 is live.
- Test account available for authorized smoke validation.

### Mapping to B04 states

| Missing dependency | Route/module state |
|---|---|
| Client ID/secret absent | `configuration-required` |
| Redirect URI absent/mismatched | `configuration-required` |
| Token store absent | `configuration-required` |
| User has not authorized Adobe | `authorization-required` |
| User authorization revoked/expired | `authorization-required` |
| Grant store/read failure | `source-unavailable` |

## 16.11 MVP implementation boundary

### Closed implementation posture

Batch 05 recommends a **two-lane implementation gate**:

#### Lane A — Always implement in the feature architecture
- B04 route/read-model states
- authorization-required UX state
- provider interfaces
- configuration-state mapping
- fixture coverage
- tests preventing shared-principal fallback
- source-handoff omission handling

#### Lane B — Implement live Adobe OAuth/search provider only when dependencies are ready
- OAuth start/callback routes
- token store
- code exchange
- refresh
- live search client
- hosted/live evidence

This prevents a weak shortcut from being introduced just to make a demo appear live.

---

# 8. Fully Developed Section 17 — Adobe Sign API Query Contract

## 17.1 Objective

Section 17 defines the exact Adobe search posture required to populate:

```http
GET /api/my-work/me/adobe-sign/action-queue
```

without:
- broad unfiltered searches,
- iterative per-agreement detail polling,
- weak status inference,
- owner/proxy ambiguity,
- DTO overreach.

## 17.2 Final live retrieval endpoint

### Closed decision

```http
POST {adobeApiAccessPoint}/api/rest/v6/search
```

### Why `POST v6/search`

Adobe’s best practices state:
- `GET v6/agreements` is paginated but comparatively limited,
- `POST v6/search` supports advanced criteria such as status, role, ownership, date ranges, and sorting,
- clients that need filtered result sets should use `POST v6/search` instead of retrieving and locally filtering agreement lists. [A4]

The Action Queue needs filtered “action required by current user” semantics, so `POST v6/search` is the correct live endpoint.

## 17.3 Required OAuth scope for queue search

```text
agreement_read:self
```

Adobe’s best-practice guidance identifies `agreement_read` as the retrieval scope for agreements, and the `self` modifier confines access to the authorizing user. [A1] [A4]

## 17.4 Approved search criteria

The search client should target:

```text
asset type: AGREEMENT
status: six B04 current-user action statuses
role: only where Adobe search behavior requires/benefits from current-user action relevance
ownership: only where needed to avoid non-actionable assets and if verified during implementation testing
pagination: bounded
sorting: deterministic and documented
```

Because Adobe’s documentation confirms search can filter by ownership, role, status, participant email, workflow ID, and dates, implementation should select the narrowest criteria that empirically return the intended queue without excluding legitimate items. [A4]

## 17.5 Exact MVP status list

```ts
const ADOBE_SIGN_ACTION_QUEUE_STATUSES = [
  'WAITING_FOR_MY_SIGNATURE',
  'WAITING_FOR_MY_APPROVAL',
  'WAITING_FOR_MY_ACCEPTANCE',
  'WAITING_FOR_MY_ACKNOWLEDGEMENT',
  'WAITING_FOR_MY_FORM_FILLING',
  'WAITING_FOR_MY_DELEGATION',
] as const;
```

### Status mapping table

| Adobe status | My Work `requiredAction` | User-facing meaning |
|---|---|---|
| `WAITING_FOR_MY_SIGNATURE` | `signature` | Awaiting your signature |
| `WAITING_FOR_MY_APPROVAL` | `approval` | Awaiting your approval |
| `WAITING_FOR_MY_ACCEPTANCE` | `acceptance` | Awaiting your acceptance |
| `WAITING_FOR_MY_ACKNOWLEDGEMENT` | `acknowledgement` | Awaiting your acknowledgement |
| `WAITING_FOR_MY_FORM_FILLING` | `form-filling` | Awaiting your form input |
| `WAITING_FOR_MY_DELEGATION` | `delegation` | Awaiting your delegation decision |

This preserves B04’s locked DTO/status semantics. [R6] [A5]

## 17.6 Explicitly excluded statuses for MVP

| Adobe status | MVP treatment | Rationale |
|---|---|---|
| `WAITING_FOR_MY_VERIFICATION` | Excluded | Not included in B04 union; may require different user journey |
| `WAITING_FOR_PREFILL` | Excluded | Not included in B04 union; sender-authoring/pre-fill semantics differ |
| `OUT_FOR_SIGNATURE` | Excluded | Agreement-level status, not necessarily current authenticated user’s immediate action |
| `OUT_FOR_APPROVAL` | Excluded | Agreement-level status, not equivalent to current user action |
| Terminal statuses | Excluded | Not queue action items |

Adding these later requires a deliberate contract amendment. [A5] [R6]

## 17.7 My Work route query boundary

B04 already locks the My Work route query to:

```ts
interface AdobeSignActionQueueRouteQuery {
  readonly pageSize?: number;
  readonly cursor?: string;
}
```

### Closed route-query rules

- No actor/user override.
- No source email override.
- No raw Adobe status override from SPFx.
- No raw Adobe search query pass-through.
- `pageSize` must be backend-clamped.
- `cursor` must be treated as opaque and source/provider-specific.

## 17.8 Recommended page-size posture

### Backend default
```text
25 items
```

### Minimum/maximum clamp
```text
minimum: 1
maximum: 100
```

### Home-preview projection
```text
top 5 normalized items
```

These values are implementation recommendations, not sourced Adobe limits. They are selected to align with B04’s preview projection and to keep the route bounded. If implementation validation against Adobe’s live API confirms different practical constraints, update the numeric clamp deliberately without changing the architectural principle.

## 17.9 Pagination contract

### My Work DTO contract

```ts
readonly pagination: {
  readonly hasMore: boolean;
  readonly nextCursor?: string;
};
```

### Provider behavior

- If Adobe returns a continuation cursor, map it to `nextCursor`.
- If no continuation exists, `hasMore = false`.
- Never fabricate a cursor.
- Never expose raw unvalidated pagination metadata beyond the DTO field.
- Treat `cursor` as opaque; do not parse it in SPFx.

## 17.10 Sorting policy

Adobe search supports sorted results. [A4]

### Recommended final sort policy

1. **Primary sort:** Adobe-supported sort field selected for consistent operational recency or deadline relevance after implementation verification.
2. **Application normalization:** if expiration date exists, the frontend/view-model may present urgency badges without claiming Adobe sorted by urgency unless the search actually sorts that way.
3. **Fallback product order:** when the upstream sort cannot encode business urgency directly, prefer deterministic backend normalization documented in tests.

### Important constraint

Do **not** claim “expiration soon first” unless the live Adobe search request and validation prove that order is actually implemented. The B05 contract distinguishes:
- **source-supported sort**, and
- **UI urgency presentation**.

## 17.11 Required normalized source fields

The Adobe adapter must supply enough information to populate the B04 item DTO:

```ts
interface AdobeQueueSourceProjection {
  readonly agreementId: string;
  readonly agreementName: string;
  readonly senderName?: string;
  readonly senderEmail?: string;
  readonly adobeStatus: AdobeActionQueueStatus;
  readonly createdAtUtc?: string;
  readonly modifiedAtUtc?: string;
  readonly expirationAtUtc?: string;
  readonly safeSourceOpenUrl?: string;
}
```

### Mapping rule

Only fields Adobe actually returns or fields obtained through approved bounded follow-up retrieval may populate the DTO. Missing optional fields remain absent; they must not be fabricated.

## 17.12 Follow-up detail retrieval posture

Adobe warns against iterative detail retrieval when search/list filters can do the job. [A4]

### Closed MVP rule

The provider should not perform an unbounded:
```text
search → one GET /agreements/{id} per row
```
loop.

### Permitted only if later justified

A **bounded enrichment** strategy may be added if:
- a specific DTO field cannot be obtained from search results,
- the field is genuinely required for user value,
- the maximum enrichment fan-out is explicitly capped,
- throttling/backoff is implemented,
- degraded partial results map cleanly to `partial`.

## 17.13 Throttling and retry mapping

Adobe documents `429` throttling and `Retry-After` handling. [A7] [A8]

### Provider requirements

| Upstream behavior | My Work translation |
|---|---|
| `429` with no cached/partial safe data | `source-unavailable` + warning |
| `429` with safe partial/cached data | `partial` + warning |
| Retry-After present | Respect before background retry; no immediate retry loop |
| Repeated user UI refresh | No tight retry loop; manual refresh only or bounded backoff |
| 5xx transient source error | `source-unavailable` or `partial` depending on usable data |

## 17.14 Search-contract pseudocode

```ts
async function getAdobeSignActionQueue(
  actor: MyWorkAuthenticatedActor,
  query: { pageSize?: number; cursor?: string },
): Promise<MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel>> {
  const principal = await principalResolver.resolveForActor(actor);

  if (principal.status !== 'resolved') {
    return mapPrincipalResolutionToEnvelope(principal);
  }

  const accessToken = await tokenService.getUsableAccessToken(principal.grant);

  const searchRequest = buildAdobeActionQueueSearchRequest({
    statuses: ADOBE_SIGN_ACTION_QUEUE_STATUSES,
    cursor: query.cursor,
    pageSize: clampPageSize(query.pageSize),
  });

  const response = await adobeSearchClient.searchAgreements({
    apiAccessPoint: principal.providerContext.apiAccessPoint,
    accessToken,
    request: searchRequest,
  });

  return mapAdobeSearchResponseToMyWorkEnvelope(response);
}
```

---

# 9. Fully Developed Section 20 — Adobe Sign Source Handoff Contract

## 20.1 Objective

Section 20 defines how My Dashboard:
- surfaces a queue item requiring action,
- tells the user Adobe remains the system of action,
- safely provides a source handoff only when the URL is trustworthy,
- avoids misleading affordances when row-level handoff is unavailable.

## 20.2 Source authority rule

### Closed decision

**Adobe Sign remains the source/action system. My Dashboard is a read-only surfaced work queue and source handoff layer.**

The UI must never imply that:
- signing occurs inside My Dashboard,
- approvals are completed inside HB Intel,
- Adobe status changes are written back by My Dashboard in MVP.

This preserves B01/B03/B04 doctrine.

## 20.3 Final row-level CTA rule

### Closed decision

A row-level CTA such as:

```text
Open in Adobe Sign
```

may render **only** when:

1. the backend provider returns a non-empty `sourceOpenUrl`,
2. that URL has passed the approved URL policy evaluator,
3. the DTO marks the row handoff as permitted,
4. the source state is not one that should suppress live launch affordances.

### Required DTO implication

The existing optional `sourceOpenUrl?: string` seam remains correct, but Batch 05 recommends an implementation-facing enrichment shape such as:

```ts
interface SourceOpenState {
  readonly sourceOpenUrl?: string;
  readonly sourceOpenDisposition:
    | 'available'
    | 'omitted-not-provided'
    | 'omitted-policy-blocked'
    | 'omitted-unsupported'
    | 'omitted-source-unavailable';
}
```

The final public DTO can remain B04-compatible if the warning/status layer carries the omitted reason; the provider implementation should nevertheless maintain a reason code internally for testability and observability.

## 20.4 Prohibited URL behavior

The implementation must not:
- guess a portal URL from `agreementId`,
- string-build a purported Acrobat Sign agreement page path without vendor-confirmed durability,
- expose raw URLs returned from Adobe without policy evaluation,
- allow a user-controlled redirect or source URL query parameter,
- append tokens, access codes, or credentials to source URLs rendered in SPFx,
- use a Signing URL merely to make every queue row appear clickable.

## 20.5 Why Adobe signing URLs are not the MVP row-link contract

Adobe’s Signing URL API:
- returns a signing URL for hosted/in-person signing scenarios,
- is tied to agreement readiness timing,
- can return `DOCUMENT_NOT_YET_AVAILABLE`,
- belongs to a different workflow than “read-only queue surfaced in My Dashboard.” [A6] [A7]

**Batch 05 conclusion:**  
Do not use `GET /agreements/{agreementId}/signingUrls` as the default source-open mechanism for queue rows.

## 20.6 General Adobe Sign launch fallback

Adobe OAuth responses include `web_access_point`, documented as the Adobe Sign web login/access point. [A1] [A3]

### Approved product fallback

A module-level general action such as:

```text
Open Adobe Sign
```

may be acceptable if:
- the URL is formed only from backend-stored `web_access_point`,
- the route/path appended is reviewed and durable,
- the final URL is passed through URL policy evaluation,
- the CTA is clearly described as a general Adobe Sign launch, not a row-specific agreement action.

### Safe fallback hierarchy

| Handoff level | CTA treatment |
|---|---|
| Valid row-specific backend-supplied source URL | Show row CTA |
| No row-specific URL, but validated general Adobe Sign launch exists | Show module-level general CTA only |
| No validated URL available | Suppress external CTA; keep queue row informational/action-descriptive |

## 20.7 URL policy contract

PCC’s existing policy helper blocks:
- non-HTTPS schemes,
- loopback/private hosts,
- credential-like query parameter names,
- unapproved hosts where host policy is provided. [R4]

### Required Adobe URL policy adaptation

The Adobe handoff evaluator must:
1. allow only HTTPS,
2. approve only expected Acrobat Sign web domains for the relevant access point,
3. reject credential-like query parameters,
4. reject local/private hosts,
5. record structured policy reason codes,
6. not throw raw parser errors upstream.

## 20.8 Handoff mapping examples

| Scenario | Queue row | CTA |
|---|---|---|
| Adobe provider returns verified durable row URL | Item visible | Row CTA shown |
| Adobe item exists, no row URL available | Item visible | Row CTA suppressed |
| URL contains credential-like query parameter | Item visible | CTA suppressed; warning reason recorded |
| URL host not approved | Item visible | CTA suppressed; policy warning recorded |
| Provider source unavailable | Queue state card/degraded state | No row CTA |

## 20.9 UX copy guardrails

### Allowed copy ideas
- “Open this item in Adobe Sign” — only when row CTA is valid.
- “This action remains in Adobe Sign.” — helpful authority microcopy.
- “Open Adobe Sign” — only for general portal launch.

### Prohibited copy
- “Sign now” if HB Intel does not truly invoke a source-proven signing action.
- “Approve in HB Intel.”
- “Complete agreement here.”
- “Launch source” without naming Adobe when clarity matters.

## 20.10 Security and telemetry considerations

When a source handoff CTA is rendered or suppressed, telemetry may record:
- provider handoff disposition,
- URL policy reason code,
- module/route context,
- correlation ID.

Telemetry must not record:
- full URL query strings if they may contain sensitive values,
- tokens,
- authorization codes,
- refresh tokens,
- Adobe access tokens.

## 20.11 Mapping to B04 warning codes

Batch 04 already includes:
- `source-open-url-omitted`

Batch 05 recommends the warning be emitted when:
- the item is otherwise actionable,
- but row-specific handoff is omitted due to unavailable/unsupported/policy-blocked source URL.

---

# 10. Final Adobe Auth Architecture

## 10.1 Architecture diagram

```text
SPFx My Dashboard
    |
    | HB backend bearer token
    v
My Work protected read-model route
    |
    | AuthContext + validated delegated Entra actor
    v
Actor normalizer / Adobe principal resolver
    |
    | actor key = tenant + oid
    v
Adobe delegated grant store
    |
    | refresh token -> access token if needed
    v
Adobe OAuth/token service
    |
    | api_access_point
    v
Adobe Sign search client
    |
    | POST v6/search
    v
Adobe queue adapter / B04 DTO mapper
    |
    v
My Work read-model envelope
    |
    v
SPFx queue card / focused module
```

## 10.2 Final backend components

```text
backend/functions/src/hosts/my-work-read-model/
├── ...
└── read-models/adobe-sign/
    ├── adobe-sign-actor-normalizer.ts
    ├── adobe-sign-principal-resolver.ts
    ├── adobe-sign-grant-store.ts
    ├── adobe-sign-oauth-service.ts
    ├── adobe-sign-token-service.ts
    ├── adobe-sign-search-client.ts
    ├── adobe-sign-search-request-builder.ts
    ├── adobe-sign-action-queue-adapter.ts
    ├── adobe-sign-source-handoff-policy.ts
    └── adobe-sign-types.ts
```

This is a target architecture recommendation, not a requirement to use these exact filenames. The important closure is the seam separation.

## 10.3 Final division of responsibility

| Component | Owns |
|---|---|
| Route handler | Request validation, auth wrapping, success/error response |
| Actor normalizer | Convert `AuthContext` into delegated actor contract |
| Principal resolver | Grant lookup and readiness outcome |
| Grant store | Durable authorization record CRUD |
| OAuth service | Authorization start/callback/code exchange/revoke |
| Token service | Refresh lifecycle and usable access token |
| Search client | Adobe HTTP call to `POST v6/search` |
| Adapter | Adobe response → B04 queue DTO |
| Handoff policy | URL allow/deny and CTA availability |

---

# 11. Final Token Lifecycle and Storage Requirements

## 11.1 Storage posture

### Required durable grant store

The architecture requires a server-side store capable of persisting:
- actor key,
- encrypted refresh token,
- access-point values,
- grant metadata,
- authorization lifecycle state,
- failure/audit metadata.

The storage technology is not selected by Batch 05, but the contract is non-negotiable.

## 11.2 Refresh-token encryption

The refresh token is functionally equivalent to a long-lived delegated credential. It must:
- be encrypted at rest,
- be decryptable only by the backend service responsible for refresh,
- never cross the SPFx boundary,
- never appear in logs, warnings, telemetry, or test snapshots.

## 11.3 Refresh-state transitions

| Event | Grant state | My Work state |
|---|---|---|
| OAuth success | `active` | queue may become `available` |
| Access token expired; refresh succeeds | `active` | queue remains usable |
| Refresh token expired/revoked | `reauthorization-required` | `authorization-required` |
| Grant manually disabled | `disabled` | `authorization-required` or approved disabled-state copy |
| Token store unavailable | no state mutation unless safe | `source-unavailable` |
| Adobe app config missing | no live refresh attempt | `configuration-required` |

## 11.4 Optional keepalive job

Adobe notes a refresh token expires after 60 days of inactivity and suggests a periodic refresh job if low activity is a concern. [A2]

### Batch 05 position

A keepalive job is **not automatically required** to satisfy the architecture, but it is a valid downstream resilience decision. The operational-resilience batch should choose between:

1. **On-demand only**  
   Simpler; inactive users may need to reauthorize after 60 days.

2. **Scheduled grant maintenance**  
   More operational complexity; reduces user reauthorization frequency.

This is intentionally left as a downstream operations decision, not an arbitrary implementation detail.

---

# 12. Final Agreement Search Query Contract

## 12.1 Contract summary

| Contract item | Decision |
|---|---|
| Endpoint | `POST v6/search` |
| Access point | Adobe `api_access_point` from OAuth/access-point context |
| Scope | `agreement_read:self` |
| Status filter | Exact six-status B04 union |
| Route query | `pageSize`, `cursor` only |
| Actor filter | Derived from grant/token, never user supplied |
| Sort | Source-supported deterministic sort selected and validated during implementation |
| Pagination | Preserve Adobe cursor semantics through opaque DTO field |
| Rate limits | Honor `Retry-After`; no tight retry loops |
| Detail fan-out | No unbounded per-row agreement fetch loops |

## 12.2 Search request implementation note

The final implementation must consult the live Adobe REST reference/API explorer for exact request-object casing and schema when coding. Batch 05 closes the **architecture and criteria**, not the literal JSON property spelling inside Adobe’s evolving reference schema.

This distinction is intentional: the artifact prevents architectural drift without freezing an unverified JSON sample that could go stale.

---

# 13. Final Status Mapping and Source-Field Mapping

## 13.1 Status mapping

| Adobe status | DTO `requiredAction` | Summary bucket |
|---|---|---|
| `WAITING_FOR_MY_SIGNATURE` | `signature` | `awaitingSignature` |
| `WAITING_FOR_MY_APPROVAL` | `approval` | `awaitingApproval` |
| `WAITING_FOR_MY_ACCEPTANCE` | `acceptance` | `awaitingOtherAction` |
| `WAITING_FOR_MY_ACKNOWLEDGEMENT` | `acknowledgement` | `awaitingOtherAction` |
| `WAITING_FOR_MY_FORM_FILLING` | `form-filling` | `awaitingOtherAction` |
| `WAITING_FOR_MY_DELEGATION` | `delegation` | `awaitingOtherAction` |

## 13.2 Field mapping

| Adobe/provider field category | My Work field | Mapping rule |
|---|---|---|
| Agreement identifier | `agreementId` | Required |
| Agreement display name | `agreementName` | Required; fallback copy only if source genuinely lacks, not invented |
| Sender identity | `senderName`, `senderEmail` | Optional |
| Action status | `rawAdobeStatus`, `requiredAction` | Required; must be in approved status union |
| Created timestamp | `createdAtUtc` | Optional |
| Modified timestamp | `modifiedAtUtc` | Optional |
| Expiration timestamp | `expirationAtUtc` | Optional; urgency signal only |
| Source handoff | `sourceOpenUrl` | Optional; only after policy validation |

## 13.3 Unsupported upstream status handling

If Adobe returns an unexpected status:
- do not crash,
- do not coerce it into an incorrect action type,
- omit the item from the actionable queue unless a safe “unsupported source status filtered” warning is emitted,
- maintain tests proving unsupported statuses do not leak into normalized MVP unions.

This aligns with B04’s warning vocabulary and preserves contract purity.

---

# 14. Final Deep-Link / Source-Handoff Contract

## 14.1 Closed source-handoff decisions

| Decision | Final posture |
|---|---|
| Row-level source CTA | Optional and backend-validated only |
| Guessing URLs | Prohibited |
| Using signing URLs as default | Prohibited |
| General Adobe Sign launch | Acceptable only as validated module-level fallback |
| URL policy evaluation | Required |
| CTA absence | Must be an intentional state, not a broken blank |

## 14.2 Source-open CTA decision matrix

| Work item present | Valid row URL | General Adobe launch | UI |
|---|---:|---:|---|
| Yes | Yes | Irrelevant | Show row CTA |
| Yes | No | Yes | Show no row CTA; show module-level general CTA |
| Yes | No | No | Show no external CTA |
| No queue items | N/A | Optional | Empty state may show general launch only if useful and validated |

---

# 15. Integration Dependency Checklist

## 15.1 Adobe platform dependencies

- Acrobat Sign account/environment identified for development and test.
- Acrobat Sign `CUSTOMER` app created.
- Client ID available backend-side.
- Client secret available backend-side.
- Redirect URI configured in Adobe.
- `agreement_read:self` enabled/requested.
- Test user(s) available for OAuth authorization and action-queue validation.
- Production account/shard/access-point behavior validated through live authorization flow.

## 15.2 HB backend dependencies

- Batch 02 protected API auth contract available.
- My Work read-model host present or scheduled in implementation sequence.
- Grant store selected and provisioned.
- Refresh-token encryption approach approved.
- Secret/config injection method approved.
- OAuth start/callback routes planned.
- Source-state/warning mapping implemented.
- Telemetry redaction rules defined.

## 15.3 SPFx/My Dashboard dependencies

- B04 route client contract remains unchanged.
- Module authorization-required state exists.
- Module can render with `sourceOpenUrl` omitted.
- No direct Adobe APIs in browser.
- No Adobe token/secrets in web-part properties or public bundle config.

## 15.4 Hosted validation dependencies

- MyDashboard page host deployed.
- App catalog/API permission state ready.
- Authorized Adobe test user available.
- At least one Adobe agreement in a supported current-user action state for live positive-path evidence.
- At least one authorization-required scenario preserved for UX proof.

---

# 16. Known Constraints and Implementation Risks

## 16.1 Current repo claim surface omits `tid`

The validated claims interface exposes `oid` and normalized `upn`, not `tid`. Because token validation is currently tenant-configured, the architecture can derive trusted tenant context from server configuration. If the backend later becomes multi-tenant or guest posture becomes relevant, `tid` should be surfaced explicitly before grant persistence is finalized. [R9] [MS2]

## 16.2 Delegated OAuth store is a genuinely new backend subsystem

No exact delegated-user refresh-token persistence implementation was found in the audited repo. Implementation prompts must not present the work as routine adaptation of an existing token store.

## 16.3 Adobe documentation mixes longstanding OAuth docs and more recently updated best-practice pages

Some Adobe OAuth pages last update in 2024, while best-practice/query pages were updated in late 2025. The architecture is stable across those pages, but implementation should still verify exact endpoint/request schema in the live API reference at coding time.

## 16.4 Search criteria may require empirical tuning

Adobe documents that search supports status, role, ownership, and more. The final implementation must test the narrowest criteria that accurately return the intended queue. The architecture requires bounded `POST v6/search`; the exact request criteria composition should be validated against real responses rather than guessed.

## 16.5 Row-level deep link availability is not proven

Batch 05 intentionally treats row-level source-open URLs as optional. The UI cannot require them for the queue to be valid. This is a critical product/UX constraint.

## 16.6 Refresh-token inactivity may create reauthorization friction

Adobe’s 60-day inactivity expiration can cause dormant users to need reauthorization. Whether HB accepts that or operates a refresh-maintenance job is a downstream resilience/operations decision.

---

# 17. Downstream Constraints for Operational Resilience, Security, and Testing Batches

## 17.1 Constraints for security batch

The security batch must preserve:
- stable actor-key binding,
- no mutable claim authorization,
- no shared-principal fallback,
- encrypted refresh-token storage,
- OAuth state anti-CSRF/mix-up behavior,
- no token leakage in logs/redirects/errors,
- source URL policy evaluation.

## 17.2 Constraints for resilience batch

The resilience batch must address:
- Adobe `Retry-After`,
- refresh-token lifecycle and optional maintenance job,
- access-point invalidation recovery,
- provider timeout/backoff behavior,
- grant store outage behavior,
- partial vs unavailable state mapping,
- manual refresh policy in UI.

## 17.3 Constraints for test/evidence batch

The testing batch must prove:
- app-only HB token does not drive a user queue,
- missing grant maps to `authorization-required`,
- expired/revoked refresh grant maps to `authorization-required`,
- token-store/config absence maps to `configuration-required`,
- search client uses bounded criteria,
- unsupported Adobe statuses are filtered safely,
- `sourceOpenUrl` omission does not break the UI,
- policy-blocked URLs never render external anchors,
- no actor override query/path can be introduced.

## 17.4 Fixture scenarios required downstream

The existing B04 fixture matrix should be extended with integration-relevant cases:

1. Resolved actor + active grant + available queue
2. Resolved actor + active grant + empty queue
3. Missing grant
4. Refresh-token expired/revoked
5. Token store missing
6. Adobe throttle with no usable data
7. Adobe partial/degraded retrieval
8. Access-point invalid and re-resolved path
9. Row item with validated source URL
10. Row item with source URL omitted
11. Row item with policy-blocked source URL
12. Unsupported Adobe status filtered with warning

---

# 18. Decisions Closed by Batch 05

| Decision | Final closure |
|---|---|
| Adobe live auth posture | Delegated OAuth authorization-code flow |
| App domain | Acrobat Sign `CUSTOMER` app |
| Principal lookup key | Stable HB actor key using tenant context + `oid` |
| UPN/email role | Display/diagnostic only, not authorization key |
| App-only HB identity | Not eligible for user queue reads |
| Shared Adobe principal fallback | Prohibited |
| OAuth storage | Backend-only, encrypted refresh-token persistence |
| Token refresh | Backend-side, refresh failure → `authorization-required` |
| Search endpoint | `POST v6/search` |
| MVP status union | Six B04 statuses only |
| Row deep link | Optional, backend-validated only |
| Guessed URLs | Prohibited |
| Signing URL default row CTA | Prohibited |
| General Adobe launch | Optional validated module-level fallback |
| Rate limiting | Honor `Retry-After`; no tight retry loops |

---

# 19. Recommended Implementation Sequencing Implications

Batch 05 is not an implementation prompt package, but it materially affects prompt sequencing. A future implementation package should separate the work into focused prompts such as:

1. **Actor normalization and principal-resolution contracts**
2. **Grant-store and OAuth configuration abstractions**
3. **Authorization start/callback flow**
4. **Refresh-token/token-service lifecycle**
5. **Adobe search-client request builder**
6. **Adobe response adapter into B04 DTOs**
7. **Source-handoff validation policy**
8. **State mapping, warnings, and fixture expansion**
9. **Security/resilience/test closure**

This sequencing reduces the risk that a code agent implements a UI-first shortcut that later violates the closed architecture.

---

# 20. Final Architecture Quality Gate

An implementation is **not aligned** with Batch 05 if it does any of the following:

- Uses a shared Adobe token to produce the queue.
- Uses `email`, `preferred_username`, or `upn` as the sole grant authorization key.
- Allows a user or email route/query override.
- Treats app-only HB tokens as a valid user queue actor.
- Stores Adobe refresh tokens in SPFx or browser state.
- Uses `GET v6/agreements` plus local filtering as the primary architecture without a formal plan amendment.
- Adds Adobe statuses outside the B04 six-status union without contract revision.
- Emits a row CTA from a guessed URL.
- Uses Adobe Signing URLs as the ordinary queue-row open mechanism.
- Returns an empty queue when the correct state is authorization-required, principal-unresolved, configuration-required, or source-unavailable.
- Leaks tokens, codes, URLs with credential-like parameters, or raw upstream error bodies into the frontend.

---

# 21. Source Register

## Adobe Acrobat Sign sources
- **A1** — Adobe Acrobat Sign Developer Guide, *Create an Application Quickstart*
- **A2** — Adobe Acrobat Sign Developer Guide, *Managing OAuth Tokens*
- **A3** — Adobe Acrobat Sign Developer Guide, *Hello World App / Getting the Access Token*
- **A4** — Adobe Acrobat Sign Developer Guide, *API Best Practices: Retrieving List of Agreements and Details*
- **A5** — Adobe Acrobat Sign Developer, *API Agreement Statuses, Recipient Statuses, Agreement Events, and Webhook Events*
- **A6** — Adobe Acrobat Sign Developer Guide, *API Usage: Get the Signing URL*
- **A7** — Adobe Acrobat Sign Developer Guide, *API Best Practices: Base URI, Signing URL, and Rate-Limit Retry*
- **A8** — Adobe Acrobat Sign Developer Guide, *API Usage: API Throttling*
- **A9** — Adobe Acrobat Sign Developer Guide, *Migrating and Updating Apps: Updating API Authentication Methods*

## Microsoft identity sources
- **MS1** — Microsoft Learn, *ID token claims reference*
- **MS2** — Microsoft Learn, *Secure applications and APIs by validating claims*
- **MS3** — Microsoft Learn, *Access tokens in the Microsoft identity platform*
- **MS4** — Microsoft Learn, *Refresh tokens in the Microsoft identity platform*

## Repository sources
- **R1** — `B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md`
- **R2** — `B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md`
- **R3** — `apps/project-control-center/src/surfaces/externalSystems/launchPadViewModel.ts`; `packages/models/src/pcc/ExternalSystemsLaunchPad.ts`
- **R4** — `packages/models/src/pcc/ExternalSystemsUrlPolicy.ts`
- **R5** — `packages/models/src/pcc/PccProcoreDataLayer.ts`
- **R6** — `B04_My_Work_Read_Models_Routes_And_Fixtures_Development.md`
- **R7** — `backend/functions/src/services/foleon-service.ts`
- **R8** — `backend/functions/src/middleware/auth.ts`
- **R9** — `backend/functions/src/middleware/validateToken.ts`

---

# 22. Closing Statement

Batch 05 closes the Adobe Sign integration architecture at a sufficiently detailed level for later implementation planning. The key posture is intentionally strict:

> **My Dashboard may surface Adobe agreements requiring the authenticated user’s action, but it must do so through a delegated, backend-mediated, identity-stable, source-truthful integration that never substitutes a shared principal, never guesses handoff URLs, and never weakens the “my queue” promise for implementation convenience.**
