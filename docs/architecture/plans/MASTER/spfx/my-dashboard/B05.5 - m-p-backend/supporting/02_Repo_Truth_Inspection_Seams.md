# Supporting 02 — Repo-Truth Inspection Seams

## Purpose

This file lists the exact seams the local agent must inspect before editing. The objective is to make the implementation precise and prevent drift into unrelated modules.

---

# 1. Current Graph Access Path

Inspect:

```text
backend/functions/src/services/legacy-fallback/graph-list-client.ts
```

Current known runtime issue:

```ts
new DefaultAzureCredential()
```

is used directly for Microsoft Graph token acquisition. That must be replaced or abstracted so Graph list/site/item access executes under the federated HB SharePoint Creator app path.

---

# 2. My Projects Runtime Diagnostics

Inspect and preserve:

```text
backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-runtime-diagnostics.ts
backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts
backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts
```

The telemetry contract currently emits:

```text
projects-loader.failed
registry-loader.failed
```

with stage classification:

```text
token | site | list | items | other
```

The implementation must preserve or intentionally update the classifier/tests so federation-token failures still classify as:

```text
token
```

---

# 3. Existing Hosting / Identity Configuration

Inspect:

```text
backend/functions/src/services/legacy-fallback/hosting-config.ts
infra/legacy-fallback-hosting.bicep
```

Known app settings already present in this configuration lane:

```text
AZURE_TENANT_ID
AZURE_CLIENT_ID
HBC_LEGACY_FALLBACK_MANAGED_APP_CLIENT_ID
HBC_LEGACY_FALLBACK_GRAPH_SCOPE
```

Known values / semantics:

```text
AZURE_CLIENT_ID
  = Function App UAMI client ID
```

```text
HBC_LEGACY_FALLBACK_MANAGED_APP_CLIENT_ID
  = HB SharePoint Creator app/client ID
```

```text
HBC_LEGACY_FALLBACK_GRAPH_SCOPE
  = https://graph.microsoft.com/.default
```

Prefer reusing these settings. Do not invent new environment variable names unless repo truth proves the existing posture cannot be used safely.

---

# 4. Current GraphListClient Consumers

At minimum inspect:

```text
backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts
backend/functions/src/services/graph-list-discovery-service.ts
backend/functions/src/services/legacy-fallback/project-index-provider.ts
backend/functions/src/services/legacy-fallback/discovery-repository.ts
```

Target implementation principle:

> Rewire the shared `GraphListClient` credential path so all existing backend GraphListClient consumers inherit the HB SharePoint Creator federated token posture unless repo truth proves a deliberate exception.

Do not hard-patch only the My Projects provider while leaving the underlying shared client direct-UAMI.

---

# 5. Adobe Sign Seams to Avoid Changing

Only inspect if necessary to verify no accidental overlap. Do not alter these files for this implementation:

```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/*
backend/functions/src/hosts/my-work-read-model/adobe-sign-oauth-routes.ts
backend/functions/src/utils/table-client-factory.ts
```

Adobe Sign OAuth behavior, durable grant/token storage, and Function App UAMI-based Azure Table access must remain unchanged.

---

# 6. Package / Dependency Posture

Inspect:

```text
backend/functions/package.json
```

Current dependency set already includes:

```text
@azure/identity
```

Avoid adding dependencies unless absolutely required. The managed-identity federation flow should be implemented with the existing Azure Identity package.
