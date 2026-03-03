# API Adapter

Direct REST API adapter for future backend integration. Communicates with a dedicated API server using bearer-token authentication.

## Status: Stub (Phase 7+)

Only typed configs and constants are present. Repository implementations will be added during Phase 7 (backend).

## Key Exports

| Export | Source | Purpose |
|---|---|---|
| `ApiConfig` | `types.ts` | Base URL, API version, access token |
| `DEFAULT_API_VERSION` | `constants.ts` | `'v1'` |

## Rules

1. All endpoints must be prefixed with the configured `apiVersion` (default `v1`).
2. Bearer token from `ApiConfig.accessToken` must be included in every request.
3. Do not add repository implementations until Phase 7 begins.
