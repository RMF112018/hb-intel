# P1-F6-T03: Sage Intacct Auth, Tenancy, Permissions, Paging, Throttling, and Webhook Profile

## Verified Posture

- Tenant isolation must be enforced per HB tenant and Intacct environment binding.
- The supplied official source URLs are authoritative for auth and operation details, but exact auth flow, pagination, throttling, and event contracts were not directly inspectable in this pass.

## Governing Rule

- Sage Intacct `v1` runs as batch-led sync unless official event contracts are later captured from the vendor source.
- Published read models must reflect downstream permissions without exposing raw ERP credentials or broad raw-custody access.
