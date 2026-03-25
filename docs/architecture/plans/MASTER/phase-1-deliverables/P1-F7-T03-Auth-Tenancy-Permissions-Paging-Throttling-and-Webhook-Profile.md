# P1-F7-T03: BambooHR Auth, Tenancy, Permissions, Paging, Throttling, and Webhook Profile

## Verified Posture

- BambooHR documents OAuth application setup and token exchange for developer-portal applications.
- BambooHR also documents single-customer API-key access over HTTP Basic Authentication.
- API requests inherit the permissions of the associated BambooHR user account.

## Webhook and Recovery Posture

- BambooHR documents global and permissioned webhooks, HMAC signature headers, HTTPS-only delivery, batched employee payloads, and up to five retries with jitter.
- Exact paging and throttling details were not locked from the supplied source set and must remain implementation-level verification items.
