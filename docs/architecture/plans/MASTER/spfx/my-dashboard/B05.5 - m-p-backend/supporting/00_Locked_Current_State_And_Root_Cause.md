# Supporting 00 — Locked Current State and Root Cause

## Purpose

This file records the already-established runtime truth that must anchor the implementation. The local agent must not reopen or re-litigate these conclusions unless repo truth directly contradicts them.

---

# 1. Function App and Dashboard Runtime Truth

## Frontend / SPFx runtime activation is closed

The My Dashboard hosted page has already been proven to render:

```html
data-my-work-data-path="backend-live"
```

The frontend is calling the live backend read-model route.

## Project-links route is live

The dashboard invokes:

```text
GET /api/my-work/me/project-links
```

The backend responds with a valid envelope, not a transport failure.

## Principal resolution is healthy

The project-links response currently proves:

```text
principalResolution = resolved
```

The current issue is not actor identification.

---

# 2. Current Failure Classification

The project-links provider currently returns:

```text
classification = source-unavailable
projectsSourceStatus = source-unavailable
legacyFallbackRegistrySourceStatus = source-unavailable
```

The card visibly degrades to the expected source-unavailable banner.

---

# 3. Telemetry-Proven Failing Layer

A Tier 1 backend telemetry patch has already landed and been deployed.

Hosted telemetry proves:

```text
projects-loader.failed
  stage = site

registry-loader.failed
  stage = site
```

Both failures occur on the same upstream Graph request:

```text
GET /sites/hedrickbrotherscom.sharepoint.com:/sites/HBCentral
```

and Microsoft Graph responds with `401`.

---

# 4. Why Both Loaders Fail Together

The two loaders are not independently failing at two separate lists.

They both depend on:

```text
GraphListClient
→ resolveSiteId(HBCentral)
→ Microsoft Graph site-resolution call
```

When HBCentral site resolution fails, neither loader reaches:

- list lookup;
- list item query;
- field selection;
- assignment matching;
- backfill-derived row reconciliation.

---

# 5. Root Cause Established

The SharePoint / Microsoft Graph permission-bearing application principal is:

```text
HB SharePoint Creator
App/client ID: 08c399eb-a394-4087-b859-659d493f8dc7
```

The currently deployed Function App Graph path directly resolves credentials under:

```text
Function App UAMI
AZURE_CLIENT_ID=77ad3593-5414-4122-a649-74916f8c0d7a
```

The current `GraphListClient` requests a Graph token directly through `DefaultAzureCredential`, which resolves under the Function App UAMI. That identity does not carry the HBCentral Graph permissions held by HB SharePoint Creator.

That identity mismatch is the source of the HBCentral Graph `401`.

---

# 6. Target Runtime Posture

The target state is:

```text
Function App UAMI 77ad...
→ federated assertion source
→ HB SharePoint Creator app registration 08c...
→ Microsoft Graph token
→ SharePoint / HBCentral Graph access as HB SharePoint Creator
```

The Function App UAMI must remain in place because Adobe Sign and Azure-resource access rely on that workload identity posture.

---

# 7. Explicit Non-Root-Causes

Do not spend implementation time on these lanes unless a newly edited file directly requires it:

- frontend/SPFx runtime config;
- `.sppkg` packaging;
- dashboard card rendering;
- My Projects route activation;
- principal resolution;
- Adobe Sign action queue behavior;
- Projects / Registry list data itself;
- role backfill completeness;
- list-title mismatch as the immediate cause;
- field `$select` shape as the immediate cause.

The current blocked layer is earlier: Graph HBCentral site resolution under the wrong effective application principal.
