# P1-F9-T03: Unanet CRM Auth, Tenancy, Permissions, Paging, Throttling, and Webhook Profile

## Verified Posture

- Tenant isolation and connector credentials must remain per HB tenant and per external CRM binding.
- Exact auth flow, paging, throttling, and event/webhook contracts were not verifiable from the accessible official source surface.

## Governing Rule

- Unanet CRM stays batch-led by default.
- No event-assist behavior may be assumed until official event contracts are verified.
