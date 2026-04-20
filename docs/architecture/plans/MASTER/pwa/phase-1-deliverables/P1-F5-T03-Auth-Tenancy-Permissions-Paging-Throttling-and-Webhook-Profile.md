# P1-F5-T03: Procore Auth, Tenancy, Permissions, Paging, Throttling, and Webhook Profile

## Verified Posture

- Tenant and company/account isolation must be preserved per HB tenant and connector configuration boundary.
- The supplied official source set is insufficient to lock exact auth grant flow, paging contract, throttling limits, or webhook signatures.

## Governing Rule

- Procore `v1` runs as batch-led sync by default.
- Event or webhook assist is permitted only after official Procore webhook contract evidence is captured.
- Permission propagation into published read models must remain least-privilege and consumer-scoped.
