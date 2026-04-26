# 02 — Foleon Developer Docs and Current Best-Practice Research

## Foleon API

Foleon publishes a REST API reference. The API documentation identifies EU and US API clusters:

- EU cluster: `https://api.foleon.com`
- US cluster: `https://api.us.foleon.com`

The API documentation states that authentication is performed by creating a bearer token from API credentials. The authentication endpoint is `/oauth`. The Foleon API includes Docs endpoints for editions and Projects endpoints for titles.

Relevant endpoint families from public documentation:

- Docs:
  - `GET /v2/magazine/edition/{doc_id}`
  - `PATCH /v2/magazine/edition/{doc_id}`
  - `DELETE /v2/magazine/edition/{doc_id}`
  - `GET /v2/magazine/edition`
  - `POST /v2/magazine/edition`
  - `POST /v3/magazine/edition/{doc_id}/copy`
  - `POST /magazine/edition/{doc_id}/publish`
- Projects:
  - `GET /v2/magazine/title/{project_id}`
  - `PATCH /v2/magazine/title/{project_id}`
  - `DELETE /v2/magazine/title/{project_id}`
  - `GET /v2/magazine/title`
  - `POST /v2/magazine/title`

## Foleon Credentials and Secret Handling

The current backend code is directionally correct because Foleon API credentials are backend-only. Client-side SharePoint code should not store or request Foleon `client_secret` values. The Manager should surface only safe status:

- `Foleon API configured: true/false`
- token URL present
- docs URL present
- projects URL present
- last sync status
- last successful Foleon API validation

Do not expose:
- Foleon client secret
- raw token
- backend app-only Graph token
- Key Vault secret values

## Foleon Viewer / Embed Behavior

Foleon embed behavior should be treated as governed external content. The Manager should preserve:

- production-only viewer URL enforcement by default;
- accepted-origin exact matching;
- preview URL allowance only in admin-review context;
- explicit `allowPreview` status;
- blocked state when a URL is preview-only and production mode is active;
- blocked state when the origin is not allowlisted;
- external-open fallback where embed is not eligible.

The current repo already has this direction through accepted origins, `allowPreview`, origin policy, and reader-gate concepts.

## SPFx AAD Token Provider

Microsoft documents `AadTokenProvider` as the SPFx mechanism for obtaining OAuth2 tokens from Microsoft Entra ID to authenticate a SharePoint page against other secured services. The `getToken(resourceEndpoint)` method returns a promise for a token and Microsoft notes that callers should not cache the token because the provider already caches it.

Implication for this app:

- `foleonApiResource` should be the Entra Application ID URI / resource for the Azure Functions API.
- The SharePoint tenant must have API access approval for that resource.
- The SPFx mount path must expose readiness when token acquisition fails.
- Errors should not be silently swallowed into a generic blocked state; diagnostics should distinguish:
  - resource missing;
  - token provider unavailable;
  - token acquisition denied;
  - API returned 401/403;
  - backend route not reachable.

## SPFx Property Pane

Microsoft’s SPFx property pane is suitable for webpart configuration but is page-instance scoped. It is not appropriate as the only long-term configuration authority for tenant-wide platform values such as API base URLs, list GUIDs, manifest IDs, accepted origins, and package governance values.

Use the property pane for:

- minimal bootstrap values;
- page-specific route overrides;
- emergency/break-glass overrides;
- webpart-specific display settings.

Move shared tenant/platform configuration into a registry.

## Microsoft Graph / SharePoint List Best Practices

Microsoft Graph supports listing SharePoint list items via:

- `/sites/{site-id}/lists/{list-id}/items`
- `/sites/{site-id}/lists/{list-id}/items?expand=fields`
- `/sites/{site-id}/lists/{list-id}/items?expand=fields(select=Column1,Column2)`

Graph supports `$filter` and `$expand`, but filtering works best on indexed columns and filtering on indexed fields can only filter one indexed field at a time. SharePoint large-list guidance likewise emphasizes creating indexes and filtered views to avoid threshold problems.

Implication:

- Foleon list schemas should maintain required indexes.
- Manager list queries should avoid non-indexed filters.
- Backend should prefer deterministic list ID access and safe select/expand patterns.
- Avoid relying on `HonorNonIndexedQueriesWarningMayFailRandomly` as a production strategy.

## Azure App Configuration and Key Vault

Azure App Configuration is appropriate for centralized application configuration and auditability across releases. Azure Key Vault references are appropriate for secrets used by Azure Functions and App Service. App Service / Azure Functions can resolve Key Vault references from app settings, letting application code read the setting as normal while the secret remains in Key Vault.

Recommended posture:

- SharePoint registry for non-secret, admin-manageable platform config and proof.
- Azure App Configuration optional for backend/runtime feature flags and advanced environment rollout.
- Azure Key Vault for secrets and sensitive values.
- Registry stores only secret references, never secret values.

{common_sources}
