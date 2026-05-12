# B02 — HB Intel My Dashboard Hosting, Packaging, Protected API Authentication, and Runtime Development

**Artifact status:** Batch 02 authoritative development-planning artifact  
**Prepared:** 2026-05-12  
**Target initiative:** HB Intel **My Dashboard** SPFx domain, **My Work** shell, and **Adobe Sign Action Queue** first module  
**Repo anchor:** `2a7bdfe277353666ba81f2e59dd7072656edcb6a`  
**Predecessor:** `B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md`  
**Source outline:** `HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md`  
**Batch scope:** Detailed development of plan Sections **6**, **7**, **8**, **14**, and **19** only. This is a closed-decision planning artifact, not a runtime implementation or local-agent prompt package.

---

# Executive Verdict

## Final verdict

**Proceed with My Dashboard as a new standalone SPFx application domain hosted on the MyDashboard communication-site home page, packaged through the existing HB Intel SPFx orchestrator, and using the existing protected-API token contract already established by Project Setup and Accounting.**

Batch 02 closes the deployment/runtime foundation as follows:

1. **Host page is locked.**  
   The MVP deployment target is:

   ```text
   https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard/SitePages/Home.aspx
   ```

   The web part is intended for a **full-width section** on the MyDashboard communication-site home page. Any later decision to move the product to a dedicated page is a scope amendment, not an implementer discretion item.

2. **Package posture is locked.**  
   My Dashboard should ship as a standalone SPFx package:

   ```text
   hb-intel-my-dashboard.sppkg
   ```

   with:
   - `skipFeatureDeployment: true`
   - `isDomainIsolated: false`
   - `supportedHosts: ["SharePointWebPart"]`
   - `supportsFullBleed: true`
   - `supportsThemeVariants: false`
   - toolbox-visible web part
   - new stable package/feature/web-part GUIDs generated once at implementation time and never reused from PCC, HB Homepage, or any other app.

3. **Packaging-orchestrator integration is locked.**  
   My Dashboard must be added to `tools/build-spfx-package.ts` as a first-class standalone domain with:
   - a new domain registry entry,
   - `packagingModel: 'single'`,
   - `freshBuildRequired: true`,
   - a dedicated runtime marker registration,
   - dedicated critical-runtime-path fingerprints,
   - normal package-truth proof generation under `dist/sppkg/`.

4. **Protected backend API access is locked.**  
   My Dashboard must use:
   - SPFx runtime context bootstrap,
   - `createSpfxApiTokenProvider(...)`,
   - an API-audience-scoped bearer token,
   - `Authorization: Bearer <token>` on protected API requests,
   - backend `withAuth()` + `validateToken()` enforcement,
   - the existing `hb-intel-api-production` / `access_as_user` SharePoint API-permission pattern unless the backend API registration itself is deliberately changed by a separate governance decision.

5. **Runtime configuration is locked to a repo-consistent hybrid pattern.**  
   My Dashboard should combine:
   - **Project Setup / Accounting** runtime injection and protected-auth readiness behavior, and
   - **PCC** fixture/backend read-model architecture.

   The correct implementation posture is:

   | Layer | Contract |
   |---|---|
   | SPFx runtime / deployment mode | `production` or `ui-review` |
   | Internal read-model transport mode | `backend` or `fixture` |
   | Mapping | `production` → `backend`; `ui-review` or production-blocked → `fixture` |

   This avoids creating an incompatible deployment-mode vocabulary while preserving a read-model-first app architecture.

6. **Frontend config remains non-secret and non-authoring.**  
   Backend URLs and API audiences are runtime/deployment contract values, **not** web-part property-pane settings. Adobe OAuth secrets, refresh tokens, provider credentials, and integration enablement authority are **never** browser config.

7. **The outline’s app-specific `MY_DASHBOARD_*` frontend runtime key naming is superseded.**  
   Repo truth strongly favors continuing the existing packaging/runtime injection pattern:
   - shell-build env inputs: `FUNCTION_APP_URL`, `BACKEND_MODE`, `ALLOW_BACKEND_MODE_SWITCH`, `API_AUDIENCE`
   - app dev fallbacks: `VITE_FUNCTION_APP_URL`, `VITE_BACKEND_MODE`, `VITE_ALLOW_BACKEND_MODE_SWITCH`, `VITE_API_AUDIENCE`

   My Dashboard should not invent a parallel public bundle configuration namespace unless the packaging architecture is intentionally redesigned across apps.

---

# 1. Repo-Truth Audit Method

## 1.1 Audit objective

This Batch 02 audit was designed to answer five implementation-foundation questions:

1. **Hosting:** What exact SharePoint page and section posture should My Dashboard target?
2. **Packaging:** How must My Dashboard join the current SPFx packaging orchestrator and package-truth proof system?
3. **Runtime registration:** What mount/global/runtime-marker posture should it follow?
4. **Protected API auth:** Which existing HB Intel app is the correct auth precedent, and how must My Dashboard acquire and pass tokens?
5. **Runtime config:** What configuration shape is already normal in the repo, and how should My Dashboard reconcile that with its read-model-first architecture?

## 1.2 Authority hierarchy

The audit used this authority order:

1. Current source code at commit `2a7bdfe277353666ba81f2e59dd7072656edcb6a`
2. Current repo reference docs that match implementation truth
3. Batch 01 My Dashboard artifact
4. The original comprehensive outline, revised where repo truth or current Microsoft guidance required correction
5. Current Microsoft Learn / Azure documentation for unstable platform details

## 1.3 Core repo inspection lanes

### Lane A — Packaging and package-truth precedent
Focused on:
- `tools/build-spfx-package.ts`
- `tools/spfx-shell/config/package-solution.json`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.manifest.json`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `tools/spfx-shell/gulpfile.js`
- package/manifests for PCC, HB Homepage, Estimating, Accounting, and Safety

### Lane B — Communication-site / full-width precedent
Focused on:
- PCC package + manifest posture
- HB Homepage package + manifest posture
- HB Homepage hosted effectiveness runbook
- Microsoft full-width communication-site guidance

### Lane C — Protected API auth precedent
Focused on:
- `packages/auth/src/spfx/apiTokenProvider.ts`
- `packages/auth/src/spfx/index.ts`
- Estimating mount/runtime/backend context
- Accounting mount/runtime/backend context
- backend auth middleware and JWT validation
- Project Setup auth-contract reference docs

### Lane D — Runtime config and readiness
Focused on:
- Estimating `runtimeConfig.ts`
- Accounting `runtimeConfig.ts`
- shell DefinePlugin injection path
- packaged-shell runtime-config audit docs
- app-level production readiness checks

### Lane E — SharePoint API permission approval
Focused on:
- Estimating and Accounting `webApiPermissionRequests`
- Project Setup API Auth Contract
- Microsoft admin-center API access guidance

---

# 2. Files and Documents Inspected

## 2.1 My Dashboard planning artifacts
| Path | Use |
|---|---|
| `docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md` | Source outline Batch 02 develops |
| `docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md` | Binding Batch 01 foundation, scope, and product-boundary decisions |

## 2.2 Packaging orchestrator and shell staging
| Path | Use |
|---|---|
| `tools/build-spfx-package.ts` | Authoritative SPFx orchestrator, domain registry, package-truth proofs, runtime marker registry |
| `tools/spfx-shell/config/package-solution.json` | Staged shell package solution generated per domain |
| `tools/spfx-shell/src/webparts/shell/ShellWebPart.manifest.json` | Staged shell manifest generated per domain |
| `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` | Generic shell web part, runtime config injection, app-bundle loading |
| `tools/spfx-shell/gulpfile.js` | DefinePlugin injection contract and shell asset packaging |

## 2.3 Standalone app/package precedents
| Path | Use |
|---|---|
| `apps/project-control-center/config/package-solution.json` | Standalone package posture closest to My Dashboard shell |
| `apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json` | Full-bleed SharePoint-only web-part manifest precedent |
| `apps/project-control-center/src/mount.tsx` | Runtime-marker and mount contract precedent |
| `apps/project-control-center/src/api/pccReadModelClientFactory.ts` | Fixture/backend read-model client seam precedent |
| `apps/hb-homepage/config/package-solution.json` | Communication-site standalone package precedent |
| `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` | Full-width communication-site manifest precedent |
| `docs/how-to/verify-hb-intel-homepage-sppkg.md` | Hosted proof and package-effectiveness runbook precedent |

## 2.4 Protected API auth precedents
| Path | Use |
|---|---|
| `packages/auth/src/spfx/apiTokenProvider.ts` | Audience-scoped SPFx API-token provider |
| `packages/auth/src/spfx/index.ts` | Public SPFx auth entrypoint |
| `apps/estimating/src/mount.tsx` | Runtime-config + token-provider wiring |
| `apps/estimating/src/config/runtimeConfig.ts` | Config resolution and production readiness |
| `apps/estimating/src/project-setup/backend/ProjectSetupBackendContext.tsx` | Canonical production/auth mode gate |
| `apps/accounting/src/mount.tsx` | Same token-provider pattern in another protected API caller |
| `apps/accounting/src/config/runtimeConfig.ts` | Runtime-config parity |
| `apps/accounting/src/backend/AccountingBackendContext.tsx` | Simplified protected backend provider without UI-review adapter |
| `backend/functions/src/middleware/auth.ts` | `Authorization: Bearer` extraction and `withAuth()` middleware |
| `backend/functions/src/middleware/validateToken.ts` | Audience, issuer, claim, and token-validation contract |
| `docs/reference/configuration/project-setup-api-auth-contract.md` | Canonical repo reference for API audience, admin approval, scopes, token posture |

## 2.5 API-permission package precedents
| Path | Use |
|---|---|
| `apps/estimating/config/package-solution.json` | `webApiPermissionRequests` for `hb-intel-api-production` / `access_as_user` |
| `apps/accounting/config/package-solution.json` | Same protected API permission posture |
| `apps/safety/config/package-solution.json` | Example of protected API permission request targeting a different resource, confirming the resource/scope pair is explicit per solution |

## 2.6 Packaging-toolchain docs
| Path | Use |
|---|---|
| `docs/reference/developer/spfx-packaging-toolchain.md` | Node 18 packaging prerequisite and orchestrator execution expectations |
| `docs/reference/developer/spfx-baseline.md` | Shell/app SPFx baseline split and build constraints |
| `docs/architecture/reviews/accounting-runtime-config-injection-and-packaged-shell-hardening.md` | Verified shell-injection flow and runtime config parity |

---

# 3. Platform and Deployment Findings

## 3.1 Communication-site full-width posture is mandatory, not cosmetic

The My Dashboard product is intended to be a polished dashboard shell, not a narrow article-column component. Current Microsoft guidance confirms that:

- the **full-width column** is a communication-site layout,
- SPFx web parts must explicitly set `supportsFullBleed: true`,
- full-width placement cannot be fully validated in the local SharePoint workbench,
- host proof must occur on a deployed communication-site page. [W1]

This externally validates the same posture already used by PCC and HB Homepage in repo truth.

### Closed decision
My Dashboard must be authored for:

```json
"supportsFullBleed": true
```

and hosted on:

```text
https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard/SitePages/Home.aspx
```

in a **full-width communication-site section**.

## 3.2 Supported host posture is SharePoint-only for MVP

PCC and HB Homepage both use:

```json
"supportedHosts": ["SharePointWebPart"]
```

Safety demonstrates that some HB Intel SPFx domains intentionally include `TeamsPersonalApp`, but My Dashboard’s MVP scope explicitly defers Teams personal-app packaging. The My Dashboard site is a SharePoint communication-site product first; adding Teams personal-app support would introduce additional host-fit, sizing, auth, and evidence obligations not required for this batch.

### Closed decision
My Dashboard MVP manifest must use:

```json
"supportedHosts": ["SharePointWebPart"]
```

Teams personal-app support is a future product decision, not part of this deployment contract.

## 3.3 Toolbox posture should be visible

Both PCC and HB Homepage are toolbox-visible. My Dashboard is a site-owner/admin-authored communication-site web part, not a hidden system shim.

### Closed decision
My Dashboard manifest must set:

```json
"hiddenFromToolbox": false
```

within the preconfigured entry.

## 3.4 Feature deployment posture should use existing standalone-package standard

PCC, HB Homepage, Estimating, Accounting, and Safety all use:

```json
"skipFeatureDeployment": true
```

This is also consistent with Microsoft’s enterprise API tutorial examples for SPFx solutions intended for tenant-wide deployment and admin-managed permission approval. [W4]

### Closed decision
My Dashboard package solution must use:

```json
"skipFeatureDeployment": true,
"isDomainIsolated": false
```

## 3.5 `supportsThemeVariants` should remain false for the MVP shell

PCC and HB Homepage manifests currently use:

```json
"supportsThemeVariants": false
```

My Dashboard is planned as a premium shell with governed HB Intel visual tokens and no separately designed page-section theme-variant behavior in its MVP scope.

### Closed decision
My Dashboard manifest should use:

```json
"supportsThemeVariants": false
```

If later product work explicitly designs SharePoint section-background adaptation, that would require a separate UI/runtime evidence decision.

---

# 4. Authentication and Runtime Findings

## 4.1 My Dashboard should not reuse PCC’s current unauthenticated preview mount posture

PCC currently remains a fixture/backend read-model surface without SPFx API token acquisition in its mount path. My Dashboard is different because its target backend routes are explicitly:

```http
GET /api/my-work/me/home
GET /api/my-work/me/adobe-sign/action-queue
```

These are **user-specific** protected routes. They must derive actor identity from trusted Entra claims, not from user-entered parameters and not from unauthenticated HTTP.

### Closed decision
My Dashboard must not copy PCC’s current mount/auth behavior wholesale. It may reuse PCC’s read-model architecture, but it must adopt Project Setup / Accounting’s **protected API caller** posture.

## 4.2 Project Setup and Accounting establish the correct frontend auth precedent

The repo already contains a production-ready pattern:

1. SPFx `mount.tsx` receives `WebPartContext`
2. SPFx auth bootstrap runs
3. `getApiAudience()` resolves a configured API audience
4. `createSpfxApiTokenProvider(context, audience)` creates a token callback
5. backend client receives a `getApiToken()` function, not a token string
6. each protected request gets a fresh bearer token
7. production readiness checks determine whether live mode can activate

This is implemented in Estimating and Accounting and documented in the Project Setup API Auth Contract.

### Closed decision
My Dashboard must use the same architectural pattern.

## 4.3 Microsoft guidance confirms the platform-level direction

Microsoft’s current SPFx guidance confirms:

- SPFx solutions connect to Entra-secured APIs using framework token plumbing rather than implementing OAuth manually. [W3]
- Enterprise APIs require explicit permission requests and tenant/admin approval before the client-side solution may use them. [W4] [W5]
- Azure Functions HTTP endpoints should rely on positive authentication rather than distributing shared secrets to public clients. [W6] [W7]

### Closed decision
My Dashboard must use delegated bearer-token authorization to the backend. It must not use:
- public function keys in frontend config,
- anonymous live `/me/...` routes,
- user-supplied email query parameters,
- browser-stored API secrets.

## 4.4 Existing backend middleware already provides the contract My Dashboard should target

`backend/functions/src/middleware/auth.ts` and `validateToken.ts` establish:

- `Authorization: Bearer <token>` extraction
- JWT validation
- issuer checks
- audience checks against `API_AUDIENCE`
- claim extraction
- telemetry around auth success/failure

### Closed decision
My Dashboard backend route design must be built to run behind this middleware contract. The planning artifact should treat this as the default, not an optional security enhancement.

## 4.5 API-permission package posture should match the existing HB Intel protected API caller

Estimating and Accounting request:

```json
"webApiPermissionRequests": [
  {
    "resource": "hb-intel-api-production",
    "scope": "access_as_user"
  }
]
```

Given that My Dashboard’s backend host is planned under the existing `backend/functions` architecture and that the target routes are user-delegated, the correct default is to request the same protected API resource/scope pair.

### Closed decision
My Dashboard `package-solution.json` should include:

```json
"webApiPermissionRequests": [
  {
    "resource": "hb-intel-api-production",
    "scope": "access_as_user"
  }
]
```

If a later deployment decision creates a distinct My Dashboard API registration, that would supersede this contract through a formal environment/auth amendment. It is not an implementer-level choice.

---

# 5. Web Research Findings with Citations

## 5.1 Research source legend

| ID | Source |
|---|---|
| **W1** | Microsoft Learn — *Use web parts with the full-width column* |
| **W2** | Microsoft Learn — *Manage access to Microsoft Entra ID-secured APIs* |
| **W3** | Microsoft Learn — *Connect to Entra ID-secured APIs in SharePoint Framework solutions* |
| **W4** | Microsoft Learn — *Consume enterprise APIs secured with Azure AD in SharePoint Framework* |
| **W5** | Microsoft Learn — *AadHttpClientFactory class* |
| **W6** | Microsoft Learn — *Securing Azure Functions* |
| **W7** | Microsoft Learn — *Work with access keys in Azure Functions* |

## 5.2 Research synthesis

### Finding A — Full-width SharePoint hosting must be enabled in the manifest and validated on a real communication site
Microsoft states that communication sites support full-width sections, that SPFx web parts must explicitly opt in with `supportsFullBleed: true`, and that the SharePoint workbench cannot validate the full-width host posture. [W1]

**Implication for My Dashboard:**  
The target web part must be full-bleed capable, and final acceptance must include hosted validation on the MyDashboard communication-site home page.

### Finding B — SPFx enterprise API access is an explicit tenant-governed permission contract
Microsoft states that SPFx solutions can declare needed Entra-secured API permissions and administrators manage those requests in the SharePoint admin center’s API access page. [W2] [W4]

**Implication for My Dashboard:**  
The `.sppkg` deployment checklist must include:
1. upload package,
2. review pending API permission,
3. approve `hb-intel-api-production` / `access_as_user`,
4. only then validate live protected route behavior.

### Finding C — SPFx token acquisition should remain framework-mediated
Microsoft’s SPFx guidance describes `AadHttpClient` as the framework-provided path for connecting to Entra-secured APIs without implementing OAuth manually. [W3] [W5]

**Implication for My Dashboard:**  
The repo’s existing `createSpfxApiTokenProvider(...)` abstraction remains valid because it is built on SPFx’s token-provider mechanism and preserves a more explicit HB Intel backend-client seam. My Dashboard should follow repo truth while staying platform-aligned.

### Finding D — Azure Functions function keys are not the right frontend auth mechanism for a public client
Microsoft warns that function access keys provide some protection but shared secrets should not be distributed in public apps; stronger production security should use positive authentication such as App Service Authentication/Authorization, APIM, or equivalent identity controls. [W6] [W7]

**Implication for My Dashboard:**  
Do not put function keys, Adobe tokens, app secrets, or API secrets in SPFx runtime config, property pane, or app bundle.

### Finding E — Layered backend security remains appropriate even when the frontend obtains delegated tokens
Azure guidance recommends defense in depth for HTTP endpoints, including HTTPS, authentication, logging/monitoring, CORS restriction, and optionally gateway/network controls. [W6]

**Implication for My Dashboard:**  
Batch 02 should not over-design backend hosting, but it should explicitly require:
- bearer-token protected routes,
- no wildcard CORS,
- app logging without token leakage,
- production secrets managed server-side,
- admin/config docs for function-app environment readiness.

---

# 6. Fully Developed Plan Section 6 — Communication Site Hosting and SharePoint Deployment Contract

## 6.1 Target site and final target page

### Closed deployment target
```text
Site: https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard
Page: https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard/SitePages/Home.aspx
```

### Rationale
The product is named **My Dashboard** and is intended to be the primary personal operating layer within that communications site. Hosting the shell on the home page:
- matches the product meaning,
- keeps the first user path direct,
- avoids burying the personal command surface behind secondary navigation,
- allows the hosted evidence suite to target a single canonical page URL.

### Change-control rule
If future site-governance decisions reserve the home page for a different portal experience, this deployment contract must be amended before implementation prompts are created. The implementer should not independently relocate the app to a new page.

## 6.2 Required page layout

### Closed decision
The My Dashboard web part must be placed in:
- a **modern communication-site full-width section**,
- on the site home page,
- with one canonical instance of the My Dashboard web part for the MVP page.

### Page composition rule
The MVP page should not host:
- duplicate My Dashboard instances,
- a separate competing shell web part,
- standalone duplicate queue cards outside the shell.

The web part itself owns the My Work shell and initial module surfacing.

## 6.3 Full-width support requirement

### Manifest requirement
```json
"supportsFullBleed": true
```

### Acceptance requirement
Hosted validation must prove:
- the web part is selectable in a full-width section,
- the shell renders without horizontal overflow,
- container-aware dashboard choreography remains correct at communication-site full-width sizes,
- ultra-wide and laptop widths do not break hero/tab/card composition.

## 6.4 Supported host declaration

### Manifest requirement
```json
"supportedHosts": ["SharePointWebPart"]
```

### MVP host policy
| Host | MVP status | Reason |
|---|---|---|
| SharePoint modern page | Supported | Target product host |
| Teams personal app | Deferred | Not part of first release; requires separate host/evidence work |
| Teams tab | Deferred | Not in product target |
| Classic pages | Not supported | Modern SPFx communication-site page is the target |

## 6.5 Deployment model

### Package posture
```json
"skipFeatureDeployment": true,
"isDomainIsolated": false
```

### Deployment sequence
1. Build `hb-intel-my-dashboard.sppkg` through the shared orchestrator.
2. Upload `.sppkg` to the tenant app catalog or the approved deployment catalog.
3. Confirm app-catalog version metadata matches the package version produced by the build.
4. Review generated SharePoint API access permission request.
5. Approve the required enterprise API permission.
6. Navigate to `SitePages/Home.aspx`.
7. Add **HB Intel My Dashboard** web part to a full-width section.
8. Publish or republish the page.
9. Execute hosted validation and evidence capture.

## 6.6 Hosted validation posture

### Required hosted validation lane
A later implementation/evidence batch should create:

```text
e2e/my-dashboard-live/
```

### Minimum hosted assertions
- My Dashboard web part exists on the canonical home page.
- One shell root exists.
- Hero / command-surface / active-panel selectors exist.
- No horizontal overflow occurs at agreed viewport matrix.
- Adobe Sign Action Queue preview state is reachable in fixture or authorized backend mode.
- Non-ready protected API state is communicated cleanly when permission/config is not ready.
- Runtime marker proof matches the packaged web-part identity.

## 6.7 Page authoring evidence requirements

The deployment/runbook should require screenshots or equivalent hosted evidence showing:
1. app catalog version,
2. API permission approval state or operator proof,
3. web part placed on `SitePages/Home.aspx`,
4. full-width shell render,
5. no duplicate shell/web-part instances,
6. page behavior at desktop and constrained responsive widths.

---

# 7. Fully Developed Plan Section 7 — Repository Structure and File Placement

## 7.1 New app domain

### Closed decision
Create:

```text
apps/my-dashboard/
```

This app is a sibling standalone SPFx-targeted domain, not a PCC submodule and not a clone of HB Homepage.

## 7.2 Required top-level app structure for Batch 02 concerns

```text
apps/my-dashboard/
├── config/
│   └── package-solution.json
├── src/
│   ├── MyDashboardApp.tsx
│   ├── mount.tsx
│   ├── config/
│   │   ├── runtimeConfig.ts
│   │   └── productionReadiness.ts
│   ├── api/
│   │   ├── myWorkReadModelClient.ts
│   │   ├── myWorkReadModelClientFactory.ts
│   │   ├── myWorkBackendReadModelClient.ts
│   │   └── myWorkFixtureReadModelClient.ts
│   └── webparts/
│       └── myDashboard/
│           └── MyDashboardWebPart.manifest.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 7.3 Structural authority boundary

### Batch 02 closes
- app/domain root,
- package solution path,
- web-part manifest path,
- mount entry path,
- runtime-config module placement,
- API client seam location.

### Batch 02 does not preempt
- final shell component tree,
- final read-model type package,
- final Adobe module card structure,
- final route host implementation details.

Those remain in later batches, but Batch 02 establishes the repo placement they must build around.

## 7.4 Required mount entry

### Path
```text
apps/my-dashboard/src/mount.tsx
```

### Required responsibilities
- accept `HTMLElement`, optional `WebPartContext`, and runtime config object,
- call `setRuntimeConfig(config)` before React render,
- bootstrap SPFx auth when context is present,
- resolve `apiAudience`,
- create `getApiToken` with `createSpfxApiTokenProvider(...)`,
- pass token-provider capability to the app/provider boundary,
- publish a global runtime API under:
  ```text
  __hbIntel_myDashboard
  ```
- expose:
  - `mount`
  - `unmount`
  - `runtimeMarkerId`

### Prohibited responsibilities
- no token persistence,
- no secret handling,
- no direct Adobe API calls,
- no in-mount network fetch to protected backend routes,
- no app-shell business logic.

## 7.5 Required runtime-config modules

### Paths
```text
apps/my-dashboard/src/config/runtimeConfig.ts
apps/my-dashboard/src/config/productionReadiness.ts
```

### Rationale
Project Setup and Accounting already establish the value of separating:
- config resolution,
- production readiness assessment,
- provider/client activation.

My Dashboard should follow that split rather than scattering config checks across cards or shell components.

## 7.6 Required API client seam

### Paths
```text
apps/my-dashboard/src/api/myWorkReadModelClient.ts
apps/my-dashboard/src/api/myWorkReadModelClientFactory.ts
apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts
apps/my-dashboard/src/api/myWorkFixtureReadModelClient.ts
```

### Architecture rule
The app should depend on a client interface and a factory, not directly on:
- raw `fetch` calls in React cards,
- backend URL handling in UI components,
- API permission logic in UI components.

## 7.7 Read-model architecture placement constraint for later batches

Batch 01 established that My Dashboard must not accidentally create a competing personal-work platform primitive beside `@hbc/my-work-feed`.

### Batch 02 constraint
Any later batch that introduces new My Work read-model types must:
- either reuse/bridge to `@hbc/my-work-feed`,
- or explicitly justify a narrower SPFx read-model envelope that does not conflict with it.

The app structure above reserves local API/client seams but does not grant blanket approval for a new competing global personal-work package.

## 7.8 Web-part manifest path and naming

### Path
```text
apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json
```

### Canonical manifest naming
| Field | Value |
|---|---|
| Alias | `MyDashboardWebPart` |
| Toolbox title | `HB Intel My Dashboard` |
| Toolbox group | `HB Intel` |
| Description | `Personal operating layer for My Dashboard, surfacing work requiring the authenticated user's attention.` |

Copy may be refined later, but the product identity should not drift from the approved taxonomy.

---

# 8. Fully Developed Plan Section 8 — Packaging and Runtime Registration Contract

## 8.1 Package identity

### Closed package filename
```text
hb-intel-my-dashboard.sppkg
```

### Closed solution name
```text
hb-intel-my-dashboard
```

### Closed feature title
```text
HB Intel My Dashboard
```

### Closed web-part title
```text
HB Intel My Dashboard
```

## 8.2 Package-solution baseline

The My Dashboard package solution should follow this posture:

```json
{
  "solution": {
    "name": "hb-intel-my-dashboard",
    "includeClientSideAssets": true,
    "skipFeatureDeployment": true,
    "isDomainIsolated": false,
    "webApiPermissionRequests": [
      {
        "resource": "hb-intel-api-production",
        "scope": "access_as_user"
      }
    ]
  },
  "paths": {
    "zippedPackage": "solution/hb-intel-my-dashboard.sppkg"
  }
}
```

### Notes
- New solution and feature GUIDs should be generated once during implementation.
- Versioning must follow the repo’s standard package/feature/manifest alignment posture.
- `webApiPermissionRequests` is required because the live backend routes are protected user-context routes.

## 8.3 Manifest baseline

The My Dashboard manifest should include:

```json
{
  "alias": "MyDashboardWebPart",
  "componentType": "WebPart",
  "requiresCustomScript": false,
  "supportedHosts": ["SharePointWebPart"],
  "supportsFullBleed": true,
  "supportsThemeVariants": false
}
```

Preconfigured entry must remain toolbox-visible and user-facing.

## 8.4 Build orchestrator integration

### Required change
Add My Dashboard to:

```text
tools/build-spfx-package.ts
```

### Required domain registry entry
```ts
{
  dir: 'my-dashboard',
  camel: 'myDashboard',
  pascal: 'MyDashboard',
  packagingModel: 'single',
  freshBuildRequired: true,
}
```

## 8.5 Runtime marker contract

### Required global
```text
__hbIntel_myDashboard
```

### Required runtime-marker posture
The mounted global should expose:
```ts
{
  mount,
  unmount,
  runtimeMarkerId
}
```

where `runtimeMarkerId` is the new My Dashboard web-part GUID.

### Rationale
PCC package truth already proves runtime linkage through a runtime-marker contract. My Dashboard should inherit that evidence posture from its first implementation wave.

## 8.6 Runtime marker registry addition

Add a domain marker in:

```text
RUNTIME_MARKERS_BY_DOMAIN
```

for:

```ts
'my-dashboard': {
  id: MY_DASHBOARD_WEBPART_ID,
  label: 'My Dashboard webpart',
}
```

The exact GUID constant is implementation-time generated, but the registry contract is closed.

## 8.7 Critical runtime path fingerprints

### Required new list
```ts
const MY_DASHBOARD_CRITICAL_RUNTIME_PATHS: readonly string[] = [
  'apps/my-dashboard/src/mount.tsx',
  'apps/my-dashboard/src/MyDashboardApp.tsx',
  'apps/my-dashboard/src/config/runtimeConfig.ts',
  'apps/my-dashboard/src/config/productionReadiness.ts',
  'apps/my-dashboard/src/api/myWorkReadModelClientFactory.ts',
  'apps/my-dashboard/src/api/myWorkReadModelClient.ts',
  'apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts',
  'apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json',
  'apps/my-dashboard/vite.config.ts',
  'apps/my-dashboard/package.json',
];
```

### Required mapping
Add:
```ts
'my-dashboard': MY_DASHBOARD_CRITICAL_RUNTIME_PATHS
```

to:
```ts
CRITICAL_RUNTIME_PATHS_BY_DOMAIN
```

### Rationale
The proof should cover:
- mount/bootstrap,
- app identity,
- runtime config,
- production-readiness gate,
- API client transport seam,
- manifest identity,
- build/runtime bundle contract.

## 8.8 Fresh-build requirement

### Closed decision
Use:
```ts
freshBuildRequired: true
```

### Rationale
My Dashboard is:
- a new standalone SPFx domain,
- an audited workstream,
- a user-context live-data surface,
- dependent on package/runtime correctness.

It should begin under stricter package-truth posture rather than adding that discipline after bugs appear.

## 8.9 Expected build command

```text
npx tsx tools/build-spfx-package.ts --domain my-dashboard
```

## 8.10 Expected outputs

```text
dist/sppkg/hb-intel-my-dashboard.sppkg
dist/sppkg/my-dashboard-package-truth-proof.json
```

If the orchestrator’s proof naming pattern produces additional shim/proof files, they should be retained as generated outputs consistent with existing domains.

## 8.11 Node/runtime prerequisite

The build operator must satisfy the repo’s existing packaging toolchain requirement:
- Node 20+ for the root orchestrator process,
- Node 18.17.x to `<19` available for the isolated SPFx gulp packaging toolchain.

No My Dashboard-specific exception should be introduced.

## 8.12 Version-alignment gate

At package time, the following must align:
- `apps/my-dashboard/config/package-solution.json :: solution.version`
- `solution.features[0].version`
- `apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json :: version`
- staged shell package/manifest values produced by orchestrator.

No hosted validation should proceed if version fields drift.

---

# 9. Closed Decision Tables

## 9.1 Hosting and deployment decisions

| Decision | Resolution |
|---|---|
| Host site | `https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard` |
| Host page | `/sites/MyDashboard/SitePages/Home.aspx` |
| Page section | Full-width communication-site section |
| Duplicate web parts | Prohibited on MVP page |
| Workbench acceptance | Insufficient; hosted proof required |
| Teams host | Deferred |
| Toolbox visibility | Visible |

## 9.2 Package and manifest decisions

| Decision | Resolution |
|---|---|
| Package filename | `hb-intel-my-dashboard.sppkg` |
| Solution name | `hb-intel-my-dashboard` |
| Feature title | `HB Intel My Dashboard` |
| Web-part title | `HB Intel My Dashboard` |
| `skipFeatureDeployment` | `true` |
| `isDomainIsolated` | `false` |
| `supportedHosts` | `["SharePointWebPart"]` |
| `supportsFullBleed` | `true` |
| `supportsThemeVariants` | `false` |
| `hiddenFromToolbox` | `false` |
| `webApiPermissionRequests` | `hb-intel-api-production` / `access_as_user` |

## 9.3 Packaging-orchestrator decisions

| Decision | Resolution |
|---|---|
| Domain folder | `apps/my-dashboard` |
| Domain registry camel | `myDashboard` |
| Domain registry pascal | `MyDashboard` |
| Packaging model | `single` |
| Fresh build | `true` |
| Runtime global | `__hbIntel_myDashboard` |
| Package proof | Required |
| Critical runtime path fingerprints | Required |

## 9.4 Auth/runtime decisions

| Decision | Resolution |
|---|---|
| SPFx token provider | `createSpfxApiTokenProvider(...)` |
| Token injection | Callback passed to app/provider layer |
| API request auth | `Authorization: Bearer <token>` |
| Token persistence | Prohibited |
| Backend auth middleware | `withAuth()` + `validateToken()` |
| Audience format | Existing backend `API_AUDIENCE` contract |
| Browser-exposed secrets | Prohibited |
| User query email override | Prohibited |
| Expected production failure posture | production-blocked safe state / fixture fallback for preview surface, not silent fake-live |

---

# 10. Recommended Runtime Configuration Key Matrix

## 10.1 Key naming verdict

The original outline proposed My Dashboard-specific public runtime keys such as:

```text
MY_DASHBOARD_BACKEND_MODE
MY_DASHBOARD_FUNCTION_APP_URL
MY_DASHBOARD_API_AUDIENCE
```

### Closed correction
Do **not** introduce those as the primary shell-packaging/runtime keys. Repo truth establishes a shared injection contract already used across protected SPFx apps.

## 10.2 Runtime/build key matrix

| Purpose | Shell build env | Vite/local env | Mount config field | Required in production | Notes |
|---|---|---|---|---|---|
| Function app URL | `FUNCTION_APP_URL` | `VITE_FUNCTION_APP_URL` | `functionAppUrl` | Yes | Non-secret service base URL |
| Runtime app mode | `BACKEND_MODE` | `VITE_BACKEND_MODE` | `backendMode` | Recommended explicit | My Dashboard normalizes `production` / `ui-review` |
| Mode-switch allowance | `ALLOW_BACKEND_MODE_SWITCH` | `VITE_ALLOW_BACKEND_MODE_SWITCH` | `allowBackendModeSwitch` | No | Defaults false; no production UX exposure |
| API audience | `API_AUDIENCE` | `VITE_API_AUDIENCE` | `apiAudience` | Yes | Must match backend `API_AUDIENCE` contract |

## 10.3 My Dashboard mode normalization

### Public runtime/deployment mode
```ts
type MyDashboardBackendMode = 'production' | 'ui-review';
```

### Internal transport/read-model mode
```ts
type MyWorkReadModelMode = 'backend' | 'fixture';
```

### Required mapping
| Requested backend mode | Readiness | Effective read-model mode | UI posture |
|---|---|---|---|
| `production` | ready | `backend` | live read model |
| `production` | blocked | `fixture` or safe blocked state, per later client-provider design | explicit degraded/readiness state |
| `ui-review` | n/a | `fixture` | deterministic fixture preview |

### Why this is the correct reconciliation
- `production/ui-review` already exists in Project Setup and Accounting runtime config.
- `backend/fixture` already exists in PCC-style read-model architecture.
- My Dashboard needs both concepts, but at different layers.

## 10.4 `allowBackendModeSwitch` decision

### Closed decision
The runtime-config contract may include:

```text
allowBackendModeSwitch
```

for parity with current packaging behavior, but:
- it defaults to `false`,
- it is not exposed in the SharePoint property pane,
- it is not a production-facing user control,
- any local/reviewer diagnostic use must be intentionally implemented later.

## 10.5 Property-pane exposure posture

### Closed decision
Do **not** expose any of the following in the web-part property pane:
- Function App URL
- API audience
- backend mode
- backend-mode switch
- Adobe connection enablement
- OAuth endpoint values
- token or secret material

### Rationale
These are deployment-governed platform values, not page-author knobs. Surface-level misconfiguration would be both fragile and security-poor.

## 10.6 Adobe integration flag correction

The outline proposed:
```text
MY_DASHBOARD_ADOBE_SIGN_INTEGRATION_ENABLED
```

### Closed correction
Do not add an Adobe Sign integration-enable flag to frontend SPFx runtime config in Batch 02.

### Correct posture
Integration availability should be determined by:
- backend provider readiness,
- server-side configuration,
- returned read-model source state such as `configuration-required`.

This keeps integration authority server-side and prevents a public bundle flag from pretending to govern a security/integration state.

---

# 11. Fully Developed Plan Section 14 — SPFx → Backend Authentication Contract

## 14.1 Contract purpose

My Dashboard backend routes are user-specific. They must serve the authenticated actor’s own My Work read model and Adobe Sign queue, not a browser-selected identity.

This contract exists to ensure:
- actor identity is derived from trusted bearer-token claims,
- browser UI cannot override user identity,
- backend routes are protected consistently with HB Intel’s existing production APIs.

## 14.2 Required frontend token acquisition

### Required import seam
```ts
import {
  bootstrapSpfxAuth,
  resolveSpfxPermissions,
  createSpfxApiTokenProvider,
} from '@hbc/auth/spfx';
```

### Required mount flow
1. receive `WebPartContext`,
2. call permission resolution / bootstrap,
3. resolve `apiAudience`,
4. create `getApiToken` callback,
5. pass the callback downward.

### Target pattern
```ts
const apiAudience = getApiAudience();
if (apiAudience) {
  getApiToken = createSpfxApiTokenProvider(spfxContext, apiAudience);
}
```

## 14.3 Token-provider injection boundary

### Closed boundary
`mount.tsx` may construct the token provider. The provider/client layer may consume it. UI cards should never know about it.

| Layer | May receive token provider? |
|---|---|
| `mount.tsx` | Creates |
| app root / backend provider | Receives |
| read-model backend client | Uses |
| shell components | No |
| Adobe queue UI cards | No |

## 14.4 Backend client behavior

### Required
`myWorkBackendReadModelClient.ts` must:
- call `getApiToken()` per request or per framework-correct refresh cycle,
- attach:
  ```http
  Authorization: Bearer <token>
  ```
- set appropriate JSON `Accept` headers,
- normalize route errors into safe read-model/business states where applicable,
- never log bearer token values.

### Prohibited
- localStorage token storage,
- sessionStorage token storage,
- query-string token usage,
- token rendering in diagnostics,
- token propagation beyond the API client seam.

## 14.5 Backend route protection

### Required middleware
My Dashboard routes must be wrapped by:
```text
withAuth()
```

and rely on:
```text
validateToken()
```

### Required route family
```http
GET /api/my-work/me/home
GET /api/my-work/me/adobe-sign/action-queue
```

### Prohibited route forms
```http
GET /api/my-work/users/{email}/...
GET /api/my-work/me/... ?email=user@...
GET /api/my-work/impersonate/...
```

Cross-user or manager/proxy access is out of MVP scope.

## 14.6 API audience contract

### Closed default
My Dashboard should align to the existing protected backend API audience posture already used by Project Setup and Accounting.

### Package declaration
```json
"webApiPermissionRequests": [
  {
    "resource": "hb-intel-api-production",
    "scope": "access_as_user"
  }
]
```

### Backend env
```text
API_AUDIENCE=api://<app-registration-client-id>
AZURE_TENANT_ID=<tenant-guid>
```

### Exact audience rule
Frontend `apiAudience` and backend `API_AUDIENCE` must resolve to the same audience contract. A mismatch is a deployment defect, not an application bug.

## 14.7 Production readiness gate

### Minimum readiness inputs
- Function App URL configured
- API audience configured
- SPFx token provider available
- backend mode normalized
- app permitted to use backend mode

### Recommended readiness output
```ts
interface IMyDashboardProductionReadiness {
  readonly ready: boolean;
  readonly issues: readonly string[];
}
```

### Required behavior when production prerequisites are absent
The app must:
- avoid pretending backend mode is live,
- report a production-blocked state into the provider/read-model layer,
- render safe end-user state according to later UX decisions,
- preserve diagnostic detail for development/operator logs without leaking secrets.

## 14.8 Expected HTTP/business state boundary

Use the existing project-wide pattern:
- **401/403** for HB API auth/authorization failures,
- **business-state envelopes** for expected source/integration conditions when the caller is authenticated.

Examples:

| Scenario | HTTP posture | UI/business posture |
|---|---:|---|
| Missing bearer token | 401 | protected API auth failure |
| Invalid audience | 401 | protected API auth failure |
| Scope denied | 403 | access denied |
| Adobe integration not configured | 200 + read-model state | configuration required |
| Adobe user authorization required | 200 + read-model state | authorization required |
| Adobe source unavailable | 200 or controlled provider failure per later backend contract | source unavailable |

Batch 02 closes the auth boundary; the exact Adobe provider-state matrix is completed in the backend/integration batch.

## 14.9 Telemetry and logging constraints

### Allowed
- route name,
- correlation ID,
- success/failure class,
- readiness blocked reason codes,
- request timing,
- high-level queue counts if approved later.

### Prohibited
- access tokens,
- refresh tokens,
- raw OAuth authorization codes,
- raw Adobe API payloads,
- agreement titles in auth logs,
- sender emails in auth telemetry.

## 14.10 Direct Adobe calls from SPFx remain prohibited

The browser may:
- call HB backend protected routes,
- open validated source links provided by the backend.

The browser may **not**:
- call Adobe APIs directly,
- store Adobe credentials,
- manage Adobe OAuth token refresh,
- synthesize privileged source URLs.

---

# 12. Fully Developed Plan Section 19 — Runtime Configuration and Production Readiness Contract

## 19.1 Runtime config authority

My Dashboard runtime config should follow existing repo hierarchy:

1. **SPFx shell runtime injection** from packaged build constants
2. **Vite/local environment fallback**
3. **safe defaults or config/readiness defect**

This mirrors Estimating and Accounting and avoids creating a bespoke config system.

## 19.2 Runtime config interface

Recommended My Dashboard app-level config:

```ts
export interface IMyDashboardRuntimeConfig {
  readonly functionAppUrl?: string;
  readonly backendMode?: 'production' | 'ui-review';
  readonly allowBackendModeSwitch?: boolean;
  readonly apiAudience?: string;
}
```

## 19.3 Runtime resolution behavior

### `getBackendMode()`
- runtime injected value first,
- `VITE_BACKEND_MODE` second,
- default to `production`.

### `getFunctionAppUrl()`
- in `ui-review`, return empty string or no-live-backend posture,
- in production, resolve:
  1. injected runtime config,
  2. `VITE_FUNCTION_APP_URL`,
  3. throw or return readiness defect.

### `getApiAudience()`
- runtime injected first,
- `VITE_API_AUDIENCE` second,
- otherwise undefined.

### `getAllowBackendModeSwitch()`
- runtime injected first,
- `VITE_ALLOW_BACKEND_MODE_SWITCH` second,
- otherwise false.

## 19.4 Production readiness contract

### Required checks
A production-ready My Dashboard backend mode requires:

| Check | Requirement |
|---|---|
| Function App URL | Non-empty and normalized |
| API audience | Non-empty |
| Token provider | Created from SPFx context |
| Backend mode | `production` requested |
| Browser config | No secret leakage |
| API permission approval | Operationally approved before hosted live validation |

### Recommended function
```ts
checkMyDashboardProductionReadiness(hasTokenProvider: boolean)
```

### Recommended output
```ts
{
  ready: boolean;
  issues: string[];
}
```

## 19.5 Effective mode resolver

The app provider/client factory should compute:

```ts
requestedBackendMode
productionReadiness
productionBlocked
effectiveBackendMode
effectiveReadModelMode
```

### Recommended logic
| Requested mode | Readiness | Effective backend mode | Read-model transport |
|---|---|---|---|
| `ui-review` | n/a | `ui-review` | `fixture` |
| `production` | ready | `production` | `backend` |
| `production` | blocked | safe blocked posture | `fixture` or blocked wrapper |

The final implementation batch should select whether blocked production uses:
- fixture data with an explicit blocked banner,
- or a fully non-data blocked state.

Batch 02’s platform decision is that it must **not** silently appear live.

## 19.6 Runtime configuration must stay out of the property pane

The web-part property pane must not contain operational runtime settings.

### Prohibited property-pane entries
- backend URL
- audience URI
- API resource
- token-provider choice
- integration enabled flag
- OAuth callback URLs
- debug production override

### Rationale
Property pane is page-author config. These are deployment/infrastructure config. Mixing them would create drift, invalid admin assumptions, and insecure copy-paste patterns.

## 19.7 Packaged runtime injection path

The existing shell packaging path already supports:

| Build env | Shell constant | Runtime config field |
|---|---|---|
| `FUNCTION_APP_URL` | `__FUNCTION_APP_URL__` | `functionAppUrl` |
| `BACKEND_MODE` | `__BACKEND_MODE__` | `backendMode` |
| `ALLOW_BACKEND_MODE_SWITCH` | `__ALLOW_BACKEND_MODE_SWITCH__` | `allowBackendModeSwitch` |
| `API_AUDIENCE` | `__API_AUDIENCE__` | `apiAudience` |

My Dashboard should consume this pipeline rather than create a duplicate injection path.

## 19.8 CORS and endpoint readiness note

Microsoft’s Azure Functions guidance emphasizes restricting CORS rather than using wildcards. [W6]

### Deployment guidance
The backend environment should explicitly allow the SharePoint tenant origin required for the MyDashboard site if cross-origin browser API calls require it, and should not broadly wildcard origins.

## 19.9 Backend environment readiness values

The Batch 02 plan should expect documentation for at least:
```text
AZURE_TENANT_ID
API_AUDIENCE
```

as already required by backend token validation, plus the Function App host URL used by frontend runtime config.

Adobe-specific provider secrets and OAuth storage configuration are intentionally deferred to the Adobe integration batch and must remain backend-only.

---

# 13. Recommended SPFx Package / Property / Manifest Posture

## 13.1 Package solution posture

| Field | Value |
|---|---|
| `solution.name` | `hb-intel-my-dashboard` |
| `solution.version` | aligned implementation version |
| `includeClientSideAssets` | `true` |
| `skipFeatureDeployment` | `true` |
| `isDomainIsolated` | `false` |
| `webApiPermissionRequests` | `hb-intel-api-production` / `access_as_user` |
| `.sppkg` filename | `hb-intel-my-dashboard.sppkg` |

## 13.2 Web-part manifest posture

| Field | Value |
|---|---|
| Alias | `MyDashboardWebPart` |
| Component | `WebPart` |
| Supported hosts | SharePoint only |
| Full bleed | true |
| Theme variants | false |
| Custom script | false |
| Toolbox visible | true |
| Group | HB Intel |
| Title | HB Intel My Dashboard |

## 13.3 Property pane posture

| Category | MVP stance |
|---|---|
| Operational config | No property pane |
| Runtime mode | No property pane |
| Backend URL | No property pane |
| Auth audience | No property pane |
| Adobe configuration | No property pane |
| End-user content toggles | None needed in Batch 02 |

---

# 14. Recommended Permission-Approval Deployment Checklist

## 14.1 Pre-build readiness
- Confirm target commit/worktree is correct.
- Confirm My Dashboard package version fields are aligned.
- Confirm build env values:
  - `FUNCTION_APP_URL`
  - `BACKEND_MODE`
  - `API_AUDIENCE`
- Confirm Node packaging prerequisites are satisfied.
- Confirm no app secrets are in frontend config.

## 14.2 Build and package
```text
npx tsx tools/build-spfx-package.ts --domain my-dashboard
```

Expected outcomes:
- `.sppkg` created,
- package-truth proof created,
- runtime marker proof passes,
- no version drift.

## 14.3 App catalog deployment
- Upload `hb-intel-my-dashboard.sppkg`.
- Confirm package metadata is correct.
- Confirm tenant-wide deployment posture if desired under the approved admin model.
- Confirm the package creates a pending API permission request if not already approved.

## 14.4 API access approval
In SharePoint admin center API access:
- locate the pending request,
- approve:
  ```text
  resource: hb-intel-api-production
  scope: access_as_user
  ```
- record approval proof for hosted validation.

## 14.5 Host-page authoring
- Open:
  ```text
  /sites/MyDashboard/SitePages/Home.aspx
  ```
- edit the page,
- add a full-width section if absent,
- place one **HB Intel My Dashboard** web part,
- publish the page.

## 14.6 Hosted smoke validation
- load the page as an authenticated HB user,
- confirm the My Dashboard shell renders,
- confirm no duplicate runtime instance,
- confirm live backend route posture or expected authorization/configuration state,
- validate browser console for absence of token leakage/errors that indicate mispackaging.

## 14.7 Evidence capture
Capture:
- app catalog version,
- package-truth proof file,
- API approval proof,
- hosted full-width page screenshot,
- runtime marker proof,
- responsive no-overflow evidence.

---

# 15. Risks and Downstream Constraints for Batches 03–08

## 15.1 Batch 03 — Shell architecture and My Work domain alignment
### Constraint
Do not create a visual shell that disregards:
- full-width communication-site host behavior,
- standalone app package posture,
- existing My Work / `@hbc/my-work-feed` product doctrine from Batch 01.

### Risk
Shell work could accidentally become either:
- a PCC clone with project-context assumptions, or
- an HB Homepage clone with the wrong navigation grammar.

## 15.2 Batch 04 — Read-model contracts and client seams
### Constraint
The read-model client factory must honor:
- production/ui-review runtime mode,
- backend/fixture transport mapping,
- token-provider injection into backend client only.

### Risk
A developer may collapse runtime mode and transport mode into one vocabulary, producing configuration confusion.

## 15.3 Batch 05 — Adobe Sign Action Queue UI
### Constraint
UI must never call Adobe directly and must treat authorization/configuration/source states as read-model outcomes.

### Risk
UI implementation could accidentally assume live Adobe availability or render misleading CTA states.

## 15.4 Batch 06 — Backend My Work host
### Constraint
Routes must use:
- `/api/my-work/me/...`,
- `withAuth()`,
- validated actor claims,
- no email query overrides.

### Risk
The backend could weaken the user-specific queue contract through convenience parameters or mock-first shortcuts.

## 15.5 Batch 07 — Adobe OAuth and live integration
### Constraint
All OAuth secrets/tokens remain backend-only. Adobe integration enablement must not move into frontend SPFx config.

### Risk
Provider configuration and token storage design can drift if this Batch 02 boundary is not treated as binding.

## 15.6 Batch 08 — Hosted SharePoint evidence
### Constraint
No final sign-off from local workbench. Hosted communication-site proof is mandatory.

### Risk
Dashboard choreography may appear correct in local development but fail in full-width SharePoint host.

---

# 16. Developer-Ready Implementation Requirements Derived from Batch 02

## 16.1 Must implement
- `apps/my-dashboard`
- package solution and web-part manifest
- package-orchestrator domain registry entry
- My Dashboard runtime marker/proof entries
- mount runtime/config/auth bootstrap
- runtime config and readiness modules
- package API permission request
- host-page deployment runbook updates later

## 16.2 Must not implement in Batch 02
- Adobe OAuth machinery
- Adobe provider credentials
- final backend route implementation
- My Work shell UI
- final Action Queue cards
- page evidence Playwright lane
- end-user copy beyond package/manifest identity needs

## 16.3 Must preserve
- standalone domain independence from PCC,
- compatibility with current packaging toolchain,
- protected API caller posture,
- future My Work feed alignment.

---

# 17. Source Citations

## Web research sources
- **[W1]** Microsoft Learn — *Use web parts with the full-width column*.
- **[W2]** Microsoft Learn — *Manage access to Microsoft Entra ID-secured APIs*.
- **[W3]** Microsoft Learn — *Connect to Entra ID-secured APIs in SharePoint Framework solutions*.
- **[W4]** Microsoft Learn — *Consume enterprise APIs secured with Azure AD in SharePoint Framework*.
- **[W5]** Microsoft Learn — *AadHttpClientFactory class*.
- **[W6]** Microsoft Learn — *Securing Azure Functions*.
- **[W7]** Microsoft Learn — *Work with access keys in Azure Functions*.

## Repo-truth sources
- `tools/build-spfx-package.ts`
- `tools/spfx-shell/gulpfile.js`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `apps/project-control-center/config/package-solution.json`
- `apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json`
- `apps/project-control-center/src/mount.tsx`
- `apps/project-control-center/src/api/pccReadModelClientFactory.ts`
- `apps/hb-homepage/config/package-solution.json`
- `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json`
- `apps/estimating/config/package-solution.json`
- `apps/estimating/src/mount.tsx`
- `apps/estimating/src/config/runtimeConfig.ts`
- `apps/estimating/src/project-setup/backend/ProjectSetupBackendContext.tsx`
- `apps/accounting/config/package-solution.json`
- `apps/accounting/src/mount.tsx`
- `apps/accounting/src/config/runtimeConfig.ts`
- `apps/accounting/src/backend/AccountingBackendContext.tsx`
- `packages/auth/src/spfx/apiTokenProvider.ts`
- `backend/functions/src/middleware/auth.ts`
- `backend/functions/src/middleware/validateToken.ts`
- `docs/reference/configuration/project-setup-api-auth-contract.md`
- `docs/reference/developer/spfx-packaging-toolchain.md`
- `docs/reference/developer/spfx-baseline.md`
- `docs/architecture/reviews/accounting-runtime-config-injection-and-packaged-shell-hardening.md`

---

# 18. Final Batch 02 Closure Statement

Batch 02 is complete when the comprehensive development plan incorporates these closed decisions:

1. My Dashboard hosts on the MyDashboard communication-site home page in a full-width section.
2. My Dashboard ships as `hb-intel-my-dashboard.sppkg`.
3. The web part is SharePoint-only for MVP, full-bleed capable, toolbox-visible, and tenant-deployable.
4. Packaging uses the existing orchestrator with a new single-package domain, strict fresh-build posture, runtime marker, and package-truth proof.
5. Protected API calls use SPFx token-provider acquisition and bearer-token backend calls.
6. The package requests `hb-intel-api-production` / `access_as_user` unless a separately governed API-registration change is approved.
7. Runtime configuration follows the existing generic shell-injection pattern, not a new My Dashboard-specific public bundle namespace.
8. Deployment uses production/ui-review runtime mode while internal read-model transport remains backend/fixture.
9. Property pane remains free of operational backend/auth values.
10. Hosted SharePoint validation is mandatory before acceptance.

These decisions are sufficiently resolved for later batches to design the shell, read models, backend routes, Adobe Sign integration, and hosted evidence without improvising foundational deployment or auth architecture.
