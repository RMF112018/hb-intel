# Proxy Adapter

Azure Functions proxy adapter for the PWA. Routes all data-access calls through an Azure Functions API using MSAL on-behalf-of authentication.

## Status: Stub (Phase 4)

Only typed configs and constants are present. Repository implementations will be added during Phase 4 (PWA).

## Key Exports

| Export | Source | Purpose |
|---|---|---|
| `ProxyConfig` | `types.ts` | Base URL, access token, timeout, retry count |
| `DEFAULT_TIMEOUT_MS` | `constants.ts` | `30_000` (30 seconds) |
| `DEFAULT_RETRY_COUNT` | `constants.ts` | `3` |

## Rules

1. Every request must include the MSAL access token from `ProxyConfig.accessToken`.
2. Honour `DEFAULT_TIMEOUT_MS` and `DEFAULT_RETRY_COUNT` for transient-failure resilience.
3. Do not add repository implementations until Phase 4 begins.
